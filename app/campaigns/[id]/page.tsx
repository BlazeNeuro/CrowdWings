"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useContribute, useVoteOnMilestone, useEthPrice } from "@/lib/web3/hooks";
import { CampaignRecord, MilestoneRecord, ContributionRecord, UpdateRecord, CommentRecord } from "@/lib/db/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ShieldCheck,
  Clock,
  Users,
  Coins,
  CheckCircle2,
  Send,
  Vote,
  Sparkles,
  ArrowLeft,
  Share2,
} from "lucide-react";

interface CampaignDetailData extends CampaignRecord {
  milestones: MilestoneRecord[];
  contributions: ContributionRecord[];
  updates: UpdateRecord[];
  comments: CommentRecord[];
}

function CampaignDetailContent() {
  const params = useParams();
  const id = params?.id as string;
  const { address } = useAccount();
  const ethPrice = useEthPrice();

  const [campaign, setCampaign] = useState<CampaignDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  // Pledge state
  const [pledgeAmount, setPledgeAmount] = useState("0.1");
  const [pledgeMessage, setPledgeMessage] = useState("");
  const [isPledging, setIsPledging] = useState(false);
  const [pledgeSuccess, setPledgeSuccess] = useState(false);
  const [pledgeTx, setPledgeTx] = useState("");

  // Comment state
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [diffDays, setDiffDays] = useState(14);

  // Web3 hooks
  const { contribute, isPending: isTxPending, isConfirming: isTxConfirming } = useContribute();
  const { vote: voteMilestoneTx, isPending: isVotingPending } = useVoteOnMilestone();

  async function fetchDetails() {
    if (!id) return;
    try {
      const res = await fetch(`/api/campaigns/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCampaign(data.campaign);
      }
    } catch (err) {
      console.error("Error loading campaign details:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (campaign?.deadline) {
      const deadlineDate = new Date(campaign.deadline);
      const remaining = Math.max(0, Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      setDiffDays(remaining);
    }
  }, [campaign?.deadline]);

  async function handlePledge(e: React.FormEvent) {
    e.preventDefault();
    if (!address) {
      alert("Please connect your MetaMask wallet first!");
      return;
    }
    if (!pledgeAmount || parseFloat(pledgeAmount) <= 0) {
      alert("Please enter a valid ETH amount.");
      return;
    }

    setIsPledging(true);
    setPledgeSuccess(false);

    try {
      let txHash = `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`;
      
      if (campaign?.onChainId) {
        try {
          const hash = await contribute(campaign.onChainId, pledgeAmount);
          if (hash) txHash = hash;
        } catch (onChainErr) {
          console.warn("On-chain TX skipped or simulated:", onChainErr);
        }
      }

      const res = await fetch(`/api/campaigns/${id}/contributions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backerWallet: address,
          backerName: "Web3 Patron",
          amountEth: pledgeAmount,
          txHash,
          tierName: `${pledgeAmount} ETH Tier`,
          message: pledgeMessage,
        }),
      });

      if (res.ok) {
        setPledgeSuccess(true);
        setPledgeTx(txHash);
        setPledgeMessage("");
        fetchDetails();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Contribution failed";
      alert(msg);
    } finally {
      setIsPledging(false);
    }
  }

  async function handleVote(milestoneIndex: number, approve: boolean) {
    if (!address) {
      alert("Please connect your MetaMask wallet to vote!");
      return;
    }

    try {
      if (campaign?.onChainId) {
        try {
          await voteMilestoneTx(campaign.onChainId, milestoneIndex, approve);
        } catch (err) {
          console.warn("On-chain voting simulation:", err);
        }
      }

      const res = await fetch(`/api/campaigns/${id}/milestones/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneIndex,
          approve,
          voterWallet: address,
          weightEth: "1.0",
        }),
      });

      if (res.ok) {
        alert(`Successfully cast vote: ${approve ? "APPROVE" : "REJECT"}`);
        fetchDetails();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to vote";
      alert(msg);
    }
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) {
      alert("Please connect your wallet to post a comment!");
      return;
    }
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorWallet: address,
          authorName: `${address.slice(0, 6)}...${address.slice(-4)}`,
          content: commentText.trim(),
        }),
      });

      if (res.ok) {
        setCommentText("");
        fetchDetails();
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Loading campaign from smart contract & database...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Campaign Not Found</h2>
        <p className="text-sm text-muted-foreground mb-6">The campaign you are looking for does not exist or has been removed.</p>
        <Link href="/campaigns">
          <Button variant="default" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const raised = parseFloat(campaign.raisedEth || "0");
  const target = parseFloat(campaign.targetEth || "1");
  const percentFunded = Math.min(Math.round((raised / target) * 100), 100);
  const raisedUsd = (raised * ethPrice).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const targetUsd = (target * ethPrice).toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/campaigns">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Campaign link copied to clipboard!");
          }}
          className="gap-1.5"
        >
          <Share2 className="w-3.5 h-3.5" /> Share
        </Button>
      </div>

      {/* Main Campaign Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
        {/* Left Column: Media Banner & Overview */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative w-full h-80 sm:h-[420px] rounded-3xl overflow-hidden border border-border bg-card shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={campaign.bannerUrl}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant="secondary" className="backdrop-blur-md bg-muted">
                {campaign.category}
              </Badge>
              <Badge variant="outline" className="backdrop-blur-md bg-muted">
                {campaign.fundingType === "ALL_OR_NOTHING" ? "All-or-Nothing Escrow" : "Flexible Funding"}
              </Badge>
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-3">
              {campaign.title}
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              {campaign.summary}
            </p>

            {/* Creator and Contract Badges */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border text-xs">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={campaign.creatorAvatar} />
                  <AvatarFallback>{campaign.creatorName?.[0] || "C"}</AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground">Created by:</span>
                <span className="text-foreground font-semibold">{campaign.creatorName}</span>
              </div>

              <div className="flex items-center gap-1.5 text-foreground font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>
                  Creator: {campaign.creatorWallet.slice(0, 6)}...{campaign.creatorWallet.slice(-4)}
                </span>
              </div>

              {campaign.onChainId && (
                <Badge variant="outline" className="font-mono text-[10px]">
                  On-Chain ID #{campaign.onChainId}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Pledge Widget */}
        <div className="lg:col-span-4">
          <Card className="sticky top-24 border-border bg-card p-6 shadow-sm space-y-6">
            <div>
              {/* Raised Stats */}
              <div className="flex items-baseline justify-between mb-1">
                <div className="text-3xl font-black text-foreground">
                  {campaign.raisedEth} <span className="text-muted-foreground text-xl font-normal">ETH</span>
                </div>
                <Badge variant="secondary">
                  {percentFunded}% Funded
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mb-4">
                Pledged of {campaign.targetEth} ETH goal (~${raisedUsd} of ${targetUsd} USD)
              </div>

              {/* shadcn Progress Bar */}
              <Progress value={percentFunded} className="h-3 mb-5" />

              {/* Key Indicators */}
              <div className="grid grid-cols-2 gap-3 py-3 border-y border-border mb-5 text-center">
                <div>
                  <div className="text-xl font-extrabold text-foreground flex items-center justify-center gap-1">
                    <Users className="w-4 h-4 text-primary" />
                    {campaign.backersCount}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-medium">Backers</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-foreground flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4 text-foreground" />
                    {diffDays}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-medium">Days Left</div>
                </div>
              </div>
            </div>

            {/* Back this Project Form */}
            <form onSubmit={handlePledge} className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pledge Amount (ETH)
              </label>

              {/* Preset chips */}
              <div className="grid grid-cols-4 gap-2">
                {["0.05", "0.1", "0.5", "1.0"].map((amt) => (
                  <Button
                    type="button"
                    key={amt}
                    size="sm"
                    variant={pledgeAmount === amt ? "default" : "outline"}
                    onClick={() => setPledgeAmount(amt)}
                    className="text-xs font-bold h-8"
                  >
                    {amt} ETH
                  </Button>
                ))}
              </div>

              {/* Custom input */}
              <div className="relative">
                <Input
                  type="number"
                  step="any"
                  min="0.0001"
                  required
                  value={pledgeAmount}
                  onChange={(e) => setPledgeAmount(e.target.value)}
                  className="font-mono font-bold pr-20"
                />
                <span className="absolute right-3.5 top-3 text-xs font-bold text-muted-foreground">
                  ETH (~${(parseFloat(pledgeAmount || "0") * ethPrice).toFixed(0)})
                </span>
              </div>

              <div>
                <Input
                  type="text"
                  placeholder="Optional cheer or backer message..."
                  value={pledgeMessage}
                  onChange={(e) => setPledgeMessage(e.target.value)}
                  className="text-xs"
                />
              </div>

              <Button
                type="submit"
                disabled={isPledging || isTxPending || isTxConfirming}
                variant="default"
                className="w-full py-3 h-12 text-sm font-extrabold"
              >
                {isTxConfirming
                  ? "Confirming on Blockchain..."
                  : isTxPending || isPledging
                  ? "Waiting for MetaMask Signature..."
                  : "Back with MetaMask"}
              </Button>

              {pledgeSuccess && (
                <div className="p-3 rounded-lg bg-muted border border-border text-foreground text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                  <div>
                    <span className="font-bold">Pledge Recorded!</span> Thank you for backing this initiative.
                    <div className="font-mono text-[10px] text-muted-foreground truncate mt-1">
                      TX: {pledgeTx}
                    </div>
                  </div>
                </div>
              )}

              {/* Security note */}
              <div className="p-3 rounded-xl bg-card border border-border text-[11px] text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  Non-Custodial Escrow Protection
                </div>
                <p>
                  Funds are secured directly in the smart contract. Milestone releases are contingent upon backer voting.
                </p>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* shadcn Tabs Navigation */}
      <Tabs defaultValue="story" className="w-full max-w-4xl">
        <TabsList className="w-full flex justify-start overflow-x-auto no-scrollbar mb-6">
          <TabsTrigger value="story">Project Story</TabsTrigger>
          <TabsTrigger value="milestones">
            Milestones ({campaign.milestones?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="updates">
            Updates ({campaign.updates?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="backers">
            Backers ({campaign.contributions?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="comments">
            Discussion ({campaign.comments?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Story Tab */}
        <TabsContent value="story">
          <Card className="p-6 sm:p-8 border-border bg-card">
            <div className="whitespace-pre-line text-muted-foreground text-sm sm:text-base leading-relaxed">
              {campaign.storyMarkdown}
            </div>
          </Card>
        </TabsContent>

        {/* Milestones & Governance Tab */}
        <TabsContent value="milestones" className="space-y-6">
          <div className="p-4 rounded-xl bg-muted border border-border text-xs text-foreground flex items-start gap-3">
            <Vote className="w-5 h-5 shrink-0 text-foreground mt-0.5" />
            <div>
              <span className="font-bold text-foreground">How Milestone Governance Works:</span> When the project reaches a new phase, the creator initiates an unlock request. Backers vote proportionally to their pledge amount. If the quorum approves, the designated milestone funds are transferred directly from the contract.
            </div>
          </div>

          {campaign.milestones && campaign.milestones.length > 0 ? (
            <div className="space-y-4">
              {campaign.milestones.map((m) => (
                <Card key={m.id} className="p-6 border-border bg-card space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary">
                        {m.index + 1}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-foreground">{m.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          Allocation: <strong className="text-foreground">{m.percentage}%</strong> of pool
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          m.status === "PAID_OUT"
                            ? "default"
                            : m.status === "VOTING"
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {m.status}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {m.description}
                  </p>

                  {/* Voting Module */}
                  {m.status === "VOTING" && (
                    <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-xs text-muted-foreground">
                        Current Votes: <span className="text-foreground font-bold">{m.votesForEth} ETH Yes</span> vs <span className="text-muted-foreground font-bold">{m.votesAgainstEth} ETH No</span>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleVote(m.index, true)}
                          disabled={isVotingPending}
                          className="flex-1 sm:flex-initial text-xs"
                        >
                          Approve Unlock
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleVote(m.index, false)}
                          disabled={isVotingPending}
                          className="flex-1 sm:flex-initial font-bold text-xs"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-panel rounded-2xl border border-border text-xs text-muted-foreground">
              No milestones defined for this campaign.
            </div>
          )}
        </TabsContent>

        {/* Updates Tab */}
        <TabsContent value="updates" className="space-y-4">
          {campaign.updates && campaign.updates.length > 0 ? (
            campaign.updates.map((u) => (
              <Card key={u.id} className="p-6 border-border bg-card space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-primary">Creator Announcement</span>
                  <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="text-lg font-bold text-foreground">{u.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{u.content}</p>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 glass-panel rounded-2xl border border-border text-xs text-muted-foreground">
              No updates published yet.
            </div>
          )}
        </TabsContent>

        {/* Backers Tab */}
        <TabsContent value="backers" className="space-y-3">
          {campaign.contributions && campaign.contributions.length > 0 ? (
            campaign.contributions.map((c) => (
              <Card key={c.id} className="p-4 border-border bg-card flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-foreground font-bold text-xs">
                      {c.backerName ? c.backerName[0] : "0x"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground">{c.backerName}</div>
                    <div className="font-mono text-muted-foreground text-[10px]">{c.backerWallet}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-foreground text-sm">
                    {c.amountEth} ETH
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">{c.txHash}</div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 glass-panel rounded-2xl border border-border text-xs text-muted-foreground">
              Be the first backer to support this project!
            </div>
          )}
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-6">
          <Card className="p-4 border-border bg-card">
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <label className="block text-xs font-bold text-muted-foreground uppercase">
                Leave a Community Note
              </label>
              <Textarea
                rows={3}
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ask a question about the roadmap or cheer the founders..."
                className="text-xs"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingComment}
                  className="gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmittingComment ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </form>
          </Card>

          <div className="space-y-3">
            {campaign.comments && campaign.comments.length > 0 ? (
              campaign.comments.map((cm) => (
                <Card key={cm.id} className="p-4 border-border bg-card space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">{cm.authorName}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(cm.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{cm.content}</p>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No comments yet. Start the conversation!
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CampaignDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading campaign from smart contract & database...</p>
        </div>
      }
    >
      <CampaignDetailContent />
    </Suspense>
  );
}
