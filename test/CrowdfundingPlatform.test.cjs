const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CrowdfundingPlatform Smart Contract", function () {
  let CrowdfundingPlatform;
  let contract;
  let owner;
  let creator;
  let backer1;
  let backer2;

  beforeEach(async function () {
    [owner, creator, backer1, backer2] = await ethers.getSigners();
    CrowdfundingPlatform = await ethers.getContractFactory("CrowdfundingPlatform");
    contract = await CrowdfundingPlatform.deploy();
    await contract.waitForDeployment();
  });

  it("should deploy successfully and start with 0 campaigns", async function () {
    expect(await contract.campaignCounter()).to.equal(0);
  });

  it("should create a new campaign with milestones", async function () {
    const goal = ethers.parseEther("10");
    const duration = 30; // 30 days
    const fundingType = 0; // AllOrNothing
    const metadata = "ipfs://QmSampleHash";
    const descriptions = ["Phase 1: Alpha prototype", "Phase 2: Mainnet launch"];
    const percentages = [40, 60];

    const tx = await contract.connect(creator).createCampaign(
      goal,
      duration,
      fundingType,
      metadata,
      descriptions,
      percentages
    );
    await tx.wait();

    expect(await contract.campaignCounter()).to.equal(1);
    const campaign = await contract.getCampaign(1);
    expect(campaign.creator).to.equal(creator.address);
    expect(campaign.goal).to.equal(goal);
    expect(campaign.milestoneCount).to.equal(2);

    const m0 = await contract.getMilestone(1, 0);
    expect(m0.percentage).to.equal(40);
    expect(m0.description).to.equal("Phase 1: Alpha prototype");
  });

  it("should accept contributions and track backer balances", async function () {
    const goal = ethers.parseEther("5");
    await contract.connect(creator).createCampaign(
      goal,
      14,
      0,
      "ipfs://meta",
      [],
      []
    );

    const pledgeAmount = ethers.parseEther("1.5");
    await contract.connect(backer1).contribute(1, { value: pledgeAmount });

    const campaign = await contract.getCampaign(1);
    expect(campaign.totalRaised).to.equal(pledgeAmount);

    const userContribution = await contract.getContribution(1, backer1.address);
    expect(userContribution).to.equal(pledgeAmount);
  });

  it("should allow refunds if campaign deadline passes and goal was not met", async function () {
    const goal = ethers.parseEther("10");
    await contract.connect(creator).createCampaign(
      goal,
      7, // 7 days
      0, // AllOrNothing
      "ipfs://meta",
      [],
      []
    );

    const pledgeAmount = ethers.parseEther("3");
    await contract.connect(backer1).contribute(1, { value: pledgeAmount });

    // Advance time beyond 7 days
    await time.increase(8 * 24 * 60 * 60);

    const balanceBefore = await ethers.provider.getBalance(backer1.address);
    const tx = await contract.connect(backer1).claimRefund(1);
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;

    const balanceAfter = await ethers.provider.getBalance(backer1.address);
    expect(balanceAfter).to.equal(balanceBefore + pledgeAmount - gasUsed);

    const remainingContribution = await contract.getContribution(1, backer1.address);
    expect(remainingContribution).to.equal(0);
  });

  it("should support milestone unlock voting and payout", async function () {
    const goal = ethers.parseEther("2");
    await contract.connect(creator).createCampaign(
      goal,
      10,
      0,
      "ipfs://meta",
      ["Milestone 1", "Milestone 2"],
      [50, 50]
    );

    // Goal reached
    await contract.connect(backer1).contribute(1, { value: ethers.parseEther("1.2") });
    await contract.connect(backer2).contribute(1, { value: ethers.parseEther("0.8") });

    // Request milestone 0 unlock (1 day voting)
    await contract.connect(creator).requestMilestoneUnlock(1, 0, 1);

    // Backers vote
    await contract.connect(backer1).voteOnMilestone(1, 0, true);
    await contract.connect(backer2).voteOnMilestone(1, 0, false);

    // Fast-forward past voting deadline
    await time.increase(2 * 24 * 60 * 60);

    const creatorBalBefore = await ethers.provider.getBalance(creator.address);
    // Finalize milestone
    await contract.finalizeMilestone(1, 0);

    const creatorBalAfter = await ethers.provider.getBalance(creator.address);
    expect(creatorBalAfter).to.be.gt(creatorBalBefore);

    const m0 = await contract.getMilestone(1, 0);
    expect(m0.state).to.equal(4); // PaidOut
  });
});
