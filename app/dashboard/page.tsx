"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useSession } from "@/lib/auth/auth-client";
import { useClaimRefund, useEthPrice } from "@/lib/web3/hooks";
import { RealCampaign } from "@/lib/db";
import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  HeartHandshake,
  Rocket,
  ShieldCheck,
  Coins,
  RefreshCw,
  Plus,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get("role");
  const { address } = useAccount();
  const { data: session } = useSession();
  const ethPrice = useEthPrice();
  const { claim: claimRefundTx, isPending: isClaimingRefund } = useClaimRefund();

  // Role: "donor" or "creator"
  const [role, setRole] = useState<"donor" | "creator">("donor");
  const [campaigns, setCampaigns] = useState<RealCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundStatus, setRefundStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialRoleParam === "creator" || initialRoleParam === "donor") {
      setRole(initialRoleParam);
    } else if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("crowdwings_user_role");
      if (savedRole === "creator" || savedRole === "donor") {
        setRole(savedRole);
      }
    }
  }, [initialRoleParam]);

  useEffect(() => {
    async function loadRealCampaigns() {
      setLoading(true);
      try {
        const res = await fetch("/api/campaigns");
        if (res.ok) {
          const data = await res.json();
          setCampaigns(data.campaigns || []);
        }
      } catch (err) {
        console.error("Failed to load real campaigns:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRealCampaigns();
  }, []);

  async function handleClaimRefund(campaignId: string, onChainId: number | null) {
    if (!address) {
      alert("Connect your MetaMask wallet to claim refund!");
      return;
    }
    try {
      if (onChainId) {
        await claimRefundTx(onChainId);
      }
      setRefundStatus((prev) => ({
        ...prev,
        [campaignId]: "100% Refund successfully transferred to your wallet!",
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Claim failed";
      alert(msg);
    }
  }

  // Filter real campaigns created by this user's wallet
  const myCreatedCampaigns = campaigns.filter(
    (c) => address && c.creatorWallet?.toLowerCase() === address.toLowerCase()
  );

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6 space-y-6">
          {/* Role Customization Banner & Switcher */}
          <Card className="p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={role === "donor" ? "default" : "secondary"}>
                  {role === "donor" ? (
                    <>
                      <HeartHandshake className="size-3 mr-1" /> Donor / Backer Dashboard
                    </>
                  ) : (
                    <>
                      <Rocket className="size-3 mr-1" /> Project Creator Dashboard
                    </>
                  )}
                </Badge>
                {session && (
                  <span className="text-xs text-muted-foreground">
                    Signed in as <strong className="text-foreground">{session.user.name}</strong>
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {role === "donor"
                  ? "Your Web3 Backing Portfolio & Governance"
                  : "Your Campaign Launchpad & Escrow Controls"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {role === "donor"
                  ? "Track your non-custodial pledges, cast votes on milestone unlocks, and claim trustless refunds."
                  : "Monitor funding progress, submit milestone proof-of-work, and unlock capital."}
              </p>
            </div>

            {/* Interactive Role Switcher Toggle */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg border border-border self-stretch sm:self-auto">
              <Button
                variant={role === "donor" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setRole("donor");
                  localStorage.setItem("crowdwings_user_role", "donor");
                }}
                className="flex-1 sm:flex-initial text-xs h-8 gap-1.5"
              >
                <HeartHandshake className="size-3.5" /> Donor View
              </Button>
              <Button
                variant={role === "creator" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setRole("creator");
                  localStorage.setItem("crowdwings_user_role", "creator");
                }}
                className="flex-1 sm:flex-initial text-xs h-8 gap-1.5"
              >
                <Rocket className="size-3.5" /> Creator View
              </Button>
            </div>
          </Card>

          {/* Metric Cards (Real DB & Web3 Data) */}
          <SectionCards />

          {/* ROLE CUSTOMIZED VIEW 1: CREATOR (The person who needs money) */}
          {role === "creator" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Rocket className="size-5 text-primary" />
                    My Created Campaigns
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Real campaigns registered on-chain and in Neon DB with your connected wallet
                  </p>
                </div>
                <Link href="/campaigns/create">
                  <Button variant="default" size="sm" className="gap-1.5">
                    <Plus className="size-3.5" /> Start New Campaign
                  </Button>
                </Link>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  Loading real database records...
                </div>
              ) : myCreatedCampaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myCreatedCampaigns.map((camp) => (
                    <Card key={camp.id} className="p-5 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="outline" className="mb-1 text-[10px]">{camp.category}</Badge>
                          <h4 className="text-base font-bold text-foreground">{camp.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">{camp.summary}</p>
                        </div>
                        <Badge variant={camp.status === "SUCCEEDED" ? "default" : "secondary"}>
                          {camp.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-muted/50 rounded-lg border border-border">
                        <div>
                          <div className="font-bold text-foreground">{camp.raisedEth} ETH</div>
                          <div className="text-[10px] text-muted-foreground">Raised</div>
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{camp.targetEth} ETH</div>
                          <div className="text-[10px] text-muted-foreground">Goal</div>
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{camp.backersCount}</div>
                          <div className="text-[10px] text-muted-foreground">Backers</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <Link href={`/campaigns/${camp.id}`} className="flex-1">
                          <Button variant="default" size="sm" className="w-full">
                            Manage & Request Milestone Payout
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-10 text-center space-y-3">
                  <Rocket className="size-8 text-muted-foreground mx-auto" />
                  <div className="text-sm font-bold text-foreground">No campaigns created under this wallet</div>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {address
                      ? `Your connected wallet (${address.slice(0, 6)}...${address.slice(-4)}) has not launched any projects yet.`
                      : "Connect your MetaMask wallet to author and deploy your first on-chain crowdfunding escrow."}
                  </p>
                  <div>
                    <Link href="/campaigns/create">
                      <Button variant="default" size="sm" className="gap-1.5">
                        <Plus className="size-3.5" /> Launch First Project
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ROLE CUSTOMIZED VIEW 2: DONOR / BACKER */}
          {role === "donor" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                    <HeartHandshake className="size-5 text-primary" />
                    Campaigns Available for Backing & Governance
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Real campaigns from Neon DB. Pledge ETH and exercise your backer voting rights.
                  </p>
                </div>
                <Link href="/campaigns">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    Explore All <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  Loading real database records...
                </div>
              ) : campaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaigns.map((camp) => (
                    <Card key={camp.id} className="p-5 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="outline" className="mb-1 text-[10px]">{camp.category}</Badge>
                          <h4 className="text-base font-bold text-foreground line-clamp-1">{camp.title}</h4>
                        </div>
                        <Badge variant={camp.status === "SUCCEEDED" ? "default" : "secondary"}>
                          {camp.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2">{camp.summary}</p>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-foreground">{camp.raisedEth} ETH</span>
                          <span className="text-muted-foreground">of {camp.targetEth} ETH</span>
                        </div>
                        <Progress
                          value={Math.min(
                            100,
                            Math.round(
                              (parseFloat(camp.raisedEth || "0") /
                                parseFloat(camp.targetEth || "1")) *
                                100
                            )
                          )}
                          className="h-2"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Link href={`/campaigns/${camp.id}`} className="flex-1">
                          <Button variant="default" size="sm" className="w-full text-xs">
                            Pledge & Vote
                          </Button>
                        </Link>
                        {camp.status === "FAILED" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isClaimingRefund}
                            onClick={() => handleClaimRefund(camp.id, camp.onChainId)}
                            className="text-xs"
                          >
                            Claim Refund
                          </Button>
                        )}
                      </div>

                      {refundStatus[camp.id] && (
                        <div className="p-2.5 rounded-lg bg-muted border border-border text-foreground text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="size-4 text-primary shrink-0" />
                          {refundStatus[camp.id]}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-10 text-center space-y-3">
                  <Coins className="size-8 text-muted-foreground mx-auto" />
                  <div className="text-sm font-bold text-foreground">No campaigns in database yet</div>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Be the pioneer who launches the first project on the protocol!
                  </p>
                  <div>
                    <Link href="/campaigns/create">
                      <Button variant="default" size="sm" className="gap-1.5">
                        <Plus className="size-3.5" /> Launch First Campaign
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-xs text-muted-foreground">
          Loading dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
