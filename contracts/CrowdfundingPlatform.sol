// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CrowdfundingPlatform
 * @notice Trustless Web3 crowdfunding platform with milestone-based governance,
 *         all-or-nothing/flexible funding models, and automated 100% refund protection.
 */
contract CrowdfundingPlatform {
    enum FundingType { AllOrNothing, Flexible }
    enum CampaignState { Active, Succeeded, Failed, Cancelled }
    enum MilestoneState { Pending, Voting, Approved, Rejected, PaidOut }

    struct Milestone {
        string description;
        uint256 percentage; // e.g., 30 for 30%
        MilestoneState state;
        uint256 votingDeadline;
        uint256 votesFor;
        uint256 votesAgainst;
    }

    struct Campaign {
        uint256 id;
        address payable creator;
        uint256 goal;
        uint256 deadline;
        uint256 totalRaised;
        uint256 claimedAmount;
        FundingType fundingType;
        CampaignState state;
        string metadataURI;
        uint256 milestoneCount;
        bool exists;
    }

    uint256 public campaignCounter;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(uint256 => Milestone)) public campaignMilestones;
    mapping(uint256 => mapping(address => uint256)) public contributions;
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public hasVotedOnMilestone;
    mapping(uint256 => mapping(address => bool)) public hasClaimedRefund;

    // Reentrancy protection
    uint256 private _status;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    // Events
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        uint256 goal,
        uint256 deadline,
        FundingType fundingType,
        string metadataURI,
        uint256 milestoneCount
    );

    event Contributed(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amount,
        uint256 totalRaised
    );

    event MilestoneUnlockRequested(
        uint256 indexed campaignId,
        uint256 indexed milestoneIndex,
        uint256 votingDeadline
    );

    event MilestoneVoted(
        uint256 indexed campaignId,
        uint256 indexed milestoneIndex,
        address indexed voter,
        bool approve,
        uint256 weight
    );

    event MilestoneFinalized(
        uint256 indexed campaignId,
        uint256 indexed milestoneIndex,
        MilestoneState state,
        uint256 amountPaid
    );

    event RefundClaimed(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amount
    );

    event FundsWithdrawn(
        uint256 indexed campaignId,
        address indexed creator,
        uint256 amount
    );

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @notice Create a new crowdfunding campaign
     * @param goal Amount in wei required to meet the funding goal
     * @param durationInDays Number of days the campaign will be active
     * @param fundingType AllOrNothing (0) or Flexible (1)
     * @param metadataURI Off-chain metadata URI (IPFS / JSON API URL)
     * @param milestoneDescriptions Array of descriptions for milestone phases
     * @param milestonePercentages Array of percentage allocations (must sum to 100)
     */
    function createCampaign(
        uint256 goal,
        uint256 durationInDays,
        FundingType fundingType,
        string calldata metadataURI,
        string[] calldata milestoneDescriptions,
        uint256[] calldata milestonePercentages
    ) external returns (uint256) {
        require(goal > 0, "Goal must be greater than zero");
        require(durationInDays >= 1 && durationInDays <= 365, "Duration must be between 1 and 365 days");
        require(
            milestoneDescriptions.length == milestonePercentages.length,
            "Milestone descriptions and percentages length mismatch"
        );

        if (milestonePercentages.length > 0) {
            uint256 totalPercent = 0;
            for (uint256 i = 0; i < milestonePercentages.length; i++) {
                require(milestonePercentages[i] > 0, "Milestone percentage must be > 0");
                totalPercent += milestonePercentages[i];
            }
            require(totalPercent == 100, "Milestone percentages must sum to 100");
        }

        campaignCounter++;
        uint256 newId = campaignCounter;

        campaigns[newId] = Campaign({
            id: newId,
            creator: payable(msg.sender),
            goal: goal,
            deadline: block.timestamp + (durationInDays * 1 days),
            totalRaised: 0,
            claimedAmount: 0,
            fundingType: fundingType,
            state: CampaignState.Active,
            metadataURI: metadataURI,
            milestoneCount: milestonePercentages.length,
            exists: true
        });

        for (uint256 i = 0; i < milestonePercentages.length; i++) {
            campaignMilestones[newId][i] = Milestone({
                description: milestoneDescriptions[i],
                percentage: milestonePercentages[i],
                state: MilestoneState.Pending,
                votingDeadline: 0,
                votesFor: 0,
                votesAgainst: 0
            });
        }

        emit CampaignCreated(
            newId,
            msg.sender,
            goal,
            campaigns[newId].deadline,
            fundingType,
            metadataURI,
            milestonePercentages.length
        );

        return newId;
    }

    /**
     * @notice Contribute ETH to an active campaign
     * @param campaignId Campaign identifier
     */
    function contribute(uint256 campaignId) external payable nonReentrant {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.exists, "Campaign does not exist");
        require(block.timestamp < campaign.deadline, "Campaign funding period has ended");
        require(campaign.state == CampaignState.Active, "Campaign is not active");
        require(msg.value > 0, "Contribution must be > 0");

        campaign.totalRaised += msg.value;
        contributions[campaignId][msg.sender] += msg.value;

        emit Contributed(campaignId, msg.sender, msg.value, campaign.totalRaised);
    }

    /**
     * @notice Creator requests fund unlock for a milestone
     * @param campaignId Campaign identifier
     * @param milestoneIndex Index of the milestone
     * @param votingDurationDays Duration in days for backer voting (minimum 1 day)
     */
    function requestMilestoneUnlock(
        uint256 campaignId,
        uint256 milestoneIndex,
        uint256 votingDurationDays
    ) external {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.exists, "Campaign does not exist");
        require(msg.sender == campaign.creator, "Only campaign creator can request milestone unlock");
        require(milestoneIndex < campaign.milestoneCount, "Invalid milestone index");

        _updateCampaignState(campaignId);
        require(campaign.state == CampaignState.Succeeded, "Campaign not succeeded");

        Milestone storage milestone = campaignMilestones[campaignId][milestoneIndex];
        require(milestone.state == MilestoneState.Pending || milestone.state == MilestoneState.Rejected, "Milestone not pending or rejected");

        if (milestoneIndex > 0) {
            Milestone storage prevMilestone = campaignMilestones[campaignId][milestoneIndex - 1];
            require(prevMilestone.state == MilestoneState.PaidOut, "Previous milestone not completed");
        }

        uint256 duration = votingDurationDays >= 1 ? votingDurationDays * 1 days : 3 days;
        milestone.votingDeadline = block.timestamp + duration;
        milestone.state = MilestoneState.Voting;
        milestone.votesFor = 0;
        milestone.votesAgainst = 0;

        emit MilestoneUnlockRequested(campaignId, milestoneIndex, milestone.votingDeadline);
    }

    /**
     * @notice Backer votes to approve or reject a milestone fund unlock
     * @param campaignId Campaign identifier
     * @param milestoneIndex Milestone index
     * @param approve True for yes, False for no
     */
    function voteOnMilestone(
        uint256 campaignId,
        uint256 milestoneIndex,
        bool approve
    ) external {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.exists, "Campaign does not exist");
        Milestone storage milestone = campaignMilestones[campaignId][milestoneIndex];

        require(milestone.state == MilestoneState.Voting, "Milestone is not currently in voting phase");
        require(block.timestamp <= milestone.votingDeadline, "Voting period has expired");

        uint256 weight = contributions[campaignId][msg.sender];
        require(weight > 0, "Only contributors can vote");
        require(!hasVotedOnMilestone[campaignId][milestoneIndex][msg.sender], "Already voted on this milestone");

        hasVotedOnMilestone[campaignId][milestoneIndex][msg.sender] = true;

        if (approve) {
            milestone.votesFor += weight;
        } else {
            milestone.votesAgainst += weight;
        }

        emit MilestoneVoted(campaignId, milestoneIndex, msg.sender, approve, weight);
    }

    /**
     * @notice Finalizes milestone voting outcome and releases funds if approved
     * @param campaignId Campaign identifier
     * @param milestoneIndex Milestone index
     */
    function finalizeMilestone(uint256 campaignId, uint256 milestoneIndex) external nonReentrant {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.exists, "Campaign does not exist");
        Milestone storage milestone = campaignMilestones[campaignId][milestoneIndex];

        require(milestone.state == MilestoneState.Voting, "Milestone is not in voting phase");
        require(block.timestamp > milestone.votingDeadline, "Voting deadline has not passed yet");

        if (milestone.votesFor > milestone.votesAgainst) {
            milestone.state = MilestoneState.Approved;
            uint256 payoutAmount = (campaign.totalRaised * milestone.percentage) / 100;
            
            milestone.state = MilestoneState.PaidOut;
            campaign.claimedAmount += payoutAmount;

            (bool sent, ) = campaign.creator.call{value: payoutAmount}("");
            require(sent, "Failed to send milestone funds to creator");

            emit MilestoneFinalized(campaignId, milestoneIndex, MilestoneState.PaidOut, payoutAmount);
        } else {
            milestone.state = MilestoneState.Rejected;
            emit MilestoneFinalized(campaignId, milestoneIndex, MilestoneState.Rejected, 0);
        }
    }

    /**
     * @notice Withdraw funds for campaigns with NO milestones once succeeded
     * @param campaignId Campaign identifier
     */
    function withdrawCampaignFunds(uint256 campaignId) external nonReentrant {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.exists, "Campaign does not exist");
        require(msg.sender == campaign.creator, "Only creator can withdraw funds");
        require(campaign.milestoneCount == 0, "Campaign uses milestone escrow; use finalizeMilestone");

        _updateCampaignState(campaignId);
        require(campaign.state == CampaignState.Succeeded, "Campaign is not marked Succeeded");

        uint256 unwithdrawn = campaign.totalRaised - campaign.claimedAmount;
        require(unwithdrawn > 0, "No funds available to withdraw");

        campaign.claimedAmount += unwithdrawn;
        (bool sent, ) = campaign.creator.call{value: unwithdrawn}("");
        require(sent, "ETH transfer failed");

        emit FundsWithdrawn(campaignId, campaign.creator, unwithdrawn);
    }

    /**
     * @notice Claim a 100% refund for failed campaigns
     * @param campaignId Campaign identifier
     */
    function claimRefund(uint256 campaignId) external nonReentrant {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.exists, "Campaign does not exist");

        _updateCampaignState(campaignId);
        require(campaign.state == CampaignState.Failed, "Campaign is not in Failed state");

        uint256 contributed = contributions[campaignId][msg.sender];
        require(contributed > 0, "No contribution recorded for this address");
        require(!hasClaimedRefund[campaignId][msg.sender], "Refund already claimed");

        hasClaimedRefund[campaignId][msg.sender] = true;
        contributions[campaignId][msg.sender] = 0;

        (bool sent, ) = payable(msg.sender).call{value: contributed}("");
        require(sent, "Refund transfer failed");

        emit RefundClaimed(campaignId, msg.sender, contributed);
    }

    /**
     * @notice Refresh internal campaign status based on deadlines and goals
     */
    function _updateCampaignState(uint256 campaignId) internal {
        Campaign storage campaign = campaigns[campaignId];
        if (campaign.state != CampaignState.Active) {
            return;
        }

        if (campaign.fundingType == FundingType.AllOrNothing) {
            if (campaign.totalRaised >= campaign.goal) {
                campaign.state = CampaignState.Succeeded;
            } else if (block.timestamp >= campaign.deadline) {
                campaign.state = CampaignState.Failed;
            }
        } else {
            // Flexible funding
            if (block.timestamp >= campaign.deadline || campaign.totalRaised >= campaign.goal) {
                campaign.state = CampaignState.Succeeded;
            }
        }
    }

    /**
     * @notice Public helper to query campaign details
     */
    function getCampaign(uint256 campaignId) external view returns (Campaign memory) {
        require(campaigns[campaignId].exists, "Campaign does not exist");
        return campaigns[campaignId];
    }

    /**
     * @notice Public helper to query milestone details
     */
    function getMilestone(uint256 campaignId, uint256 milestoneIndex) external view returns (Milestone memory) {
        require(campaigns[campaignId].exists, "Campaign does not exist");
        require(milestoneIndex < campaigns[campaignId].milestoneCount, "Milestone index out of bounds");
        return campaignMilestones[campaignId][milestoneIndex];
    }

    /**
     * @notice Public helper to query user contribution
     */
    function getContribution(uint256 campaignId, address backer) external view returns (uint256) {
        return contributions[campaignId][backer];
    }
}
