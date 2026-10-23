"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { RealCampaign } from "@/lib/db";
import { CampaignCard } from "@/components/CampaignCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Rocket,
  ShieldCheck,
  RefreshCw,
  Coins,
  ArrowRight,
  TrendingUp,
  Cpu,
  Award,
} from "lucide-react";
import { MarketingLayout } from "@/components/MarketingLayout";

function HomeContent() {
  const [campaigns, setCampaigns] = useState<RealCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const res = await fetch("/api/campaigns");
        if (res.ok) {
          const data = await res.json();
          setCampaigns(data.campaigns || []);
        }
      } catch (err) {
        console.warn("Error fetching campaigns:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCampaigns();
  }, []);

  const featuredCampaign = campaigns.find((c) => c.featured) || campaigns[0];
  const otherCampaigns = campaigns.slice(0, 6);

  return (
    <div className="relative overflow-hidden bg-background text-foreground">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-24 sm:pb-16 text-center">
        <Badge variant="secondary" className="mb-6 px-3.5 py-1 text-xs font-medium">
          <Sparkles className="size-3.5 mr-1.5 text-primary" />
          Next-Generation Web3 Crowdfunding Protocol
        </Badge>

        <h1 className="text-4xl sm:text-6xl font-black text-foreground tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
          Fund Breakthrough Ideas with{" "}
          <span className="text-primary underline decoration-muted underline-offset-8">
            Smart Contract Trust
          </span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
          Decentralized crowdfunding powered by Ethereum. Funds are locked in verifiable milestone escrow vaults — released only when backers vote to verify progress.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="default" size="lg" className="w-full sm:w-auto gap-2">
              <TrendingUp className="size-4" />
              Explore Campaigns
            </Button>
          </Link>
          <Link href="/campaigns/create" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
              <Rocket className="size-4" />
              Start a Campaign
            </Button>
          </Link>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Card className="p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">
              {campaigns.reduce((acc, c) => acc + parseFloat(c.raisedEth || "0"), 0).toFixed(1)} <span className="text-muted-foreground text-sm font-normal">ETH</span>
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Total Raised
            </div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">
              100%
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Smart Contract Escrow
            </div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">
              {campaigns.length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Active Campaigns
            </div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-primary mb-1">
              Anti-Rug
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Milestone Voting
            </div>
          </Card>
        </div>
      </section>

      {/* Featured Campaign Spotlight */}
      {featuredCampaign && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Award className="size-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Featured Spotlight
              </h2>
            </div>
            <Link
              href={`/campaigns/${featuredCampaign.id}`}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View Campaign <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <Card className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 overflow-hidden rounded-xl relative h-72 sm:h-96 bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredCampaign.bannerUrl}
                alt={featuredCampaign.title}
                className="w-full h-full object-cover rounded-xl hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="backdrop-blur-md bg-background/80 text-foreground">
                  {featuredCampaign.category}
                </Badge>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span>Created by</span>
                  <span className="font-semibold text-foreground">{featuredCampaign.creatorName}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                  {featuredCampaign.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {featuredCampaign.summary}
                </p>
              </div>

              <div>
                {/* Progress bar */}
                <Progress
                  value={Math.min(
                    100,
                    Math.round(
                      (parseFloat(featuredCampaign.raisedEth) /
                        parseFloat(featuredCampaign.targetEth)) *
                        100
                    )
                  )}
                  className="h-2.5 mb-4"
                />

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-border text-center">
                  <div>
                    <div className="text-lg font-bold text-foreground">
                      {featuredCampaign.raisedEth} ETH
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium">Raised</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">
                      {featuredCampaign.targetEth} ETH
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium">Goal</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">
                      {featuredCampaign.backersCount}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium">Backers</div>
                  </div>
                </div>

                <div className="pt-6">
                  <Link href={`/campaigns/${featuredCampaign.id}`} className="block">
                    <Button variant="default" className="w-full h-11 text-sm font-semibold gap-2">
                      Back this Project with MetaMask
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Trending Campaigns Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs uppercase font-semibold tracking-wider text-muted-foreground mb-1">
              Active Escrow Pools
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Trending Campaigns
            </h2>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5"
          >
            Explore all {campaigns.length} campaigns <ArrowRight className="size-4 text-primary" />
          </Link>
        </div>

        {otherCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherCampaigns.map((camp) => (
              <CampaignCard key={camp.id} campaign={camp} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center space-y-3">
            <Coins className="size-10 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-bold text-foreground">No campaigns in database yet</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Real database synchronization is active with zero dummy data. Be the first pioneer to deploy a project escrow on-chain!
            </p>
            <div className="pt-2">
              <Link href="/campaigns/create">
                <Button variant="default" size="sm" className="gap-1.5">
                  <Rocket className="size-3.5" /> Start First Campaign
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </section>

      {/* Why Web3 Crowdfunding Pillar Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="outline" className="mb-3">
            <Cpu className="size-3.5 mr-1 text-primary" />
            Built on Ethereum Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Why Web3 Crowdfunding Outperforms Legacy Platforms
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Eliminating centralized custodians, arbitrary payment holds, and investor rugpulls with programmable cryptography.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Milestone Escrow Governance
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Founders don’t get 100% of the funds upfront. The smart contract holds funds in escrow and unlocks capital in tranches only when backers verify project deliverables.
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <RefreshCw className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Guaranteed 100% Refunds
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If an All-or-Nothing campaign does not achieve its target goal by the deadline, backers can trigger trustless refunds with one click. Zero middleman permission needed.
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Coins className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Non-Custodial Direct Settlement
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every pledge transfers directly into the audited smart contract. No third-party payment processors taking days to settle or freezing accounts arbitrarily.
            </p>
          </Card>
        </div>
      </section>

      {/* Creator Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="p-8 sm:p-14 text-center bg-card border-border">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Ready to launch your project on-chain?
            </h2>
            <p className="text-muted-foreground text-sm sm:base leading-relaxed">
              Create your campaign, define milestone stages, connect your MetaMask wallet, and access a global network of decentralized backers.
            </p>
            <div className="pt-2">
              <Link href="/campaigns/create">
                <Button variant="default" size="lg" className="font-semibold gap-2">
                  <Rocket className="size-4" />
                  Launch Campaign Wizard
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <MarketingLayout>
      <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">Loading protocol...</div>}>
        <HomeContent />
      </Suspense>
    </MarketingLayout>
  );
}
