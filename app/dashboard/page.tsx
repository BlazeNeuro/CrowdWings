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
import { WalletConnectDialog } from "@/components/wallet-connect-dialog";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Building2,
  ShieldCheck,
  Coins,
  RefreshCw,
  Plus,
  ArrowRight,
  CheckCircle2,
  Wallet,
  Compass,
  Sparkles,
  Users,
  Layers,
  Search,
} from "lucide-react";

const CATEGORIES = ["All", "Reforestation", "Agroforestry", "Planet Rescue", "Biodiversity", "Clean Cities"];

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get("role");
  const { address, isConnected } = useAccount();
  const { data: session } = useSession();
  const ethPrice = useEthPrice();
  const { claim: claimRefundTx, isPending: isClaimingRefund } = useClaimRefund();

  // Role: "investor" or "organization" (supports legacy "donor" and "creator")
  const [role, setRole] = useState<"investor" | "organization">("investor");
  const [campaigns, setCampaigns] = useState<RealCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [refundStatus, setRefundStatus] = useState<Record<string, string>>({});
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);

  // Initialize role from URL query, session, or localStorage
  useEffect(() => {
    const userRole = (session?.user as Record<string, any> | undefined)?.role;
    if (initialRoleParam === "organization" || initialRoleParam === "creator") {
      setRole("organization");
    } else if (initialRoleParam === "investor" || initialRoleParam === "donor") {
      setRole("investor");
    } else if (userRole === "organization" || userRole === "investor") {
      setRole(userRole as "investor" | "organization");
    } else if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("crowdwings_user_role");
      if (savedRole === "organization" || savedRole === "creator") {
        setRole("organization");
      } else if (savedRole === "investor" || savedRole === "donor") {
        setRole("investor");
      }
    }
  }, [initialRoleParam, session]);

  // Check if wallet is connected on landing, if not open shadcn wallet dialog
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isConnected) {
        if (typeof window !== "undefined") {
          const dismissedInSession = sessionStorage.getItem("crowdwings_wallet_dialog_dismissed");
          if (!dismissedInSession) {
            setWalletDialogOpen(true);
          }
        }
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [isConnected]);

  // Load live running campaigns from Neon DB
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
        console.error("Failed to load real campaigns from Neon DB:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRealCampaigns();
  }, []);

  async function handleClaimRefund(campaignId: string, onChainId: number | null) {
    if (!address) {
      setWalletDialogOpen(true);
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

  // Filter running campaigns
  const activeRunningCampaigns = campaigns.filter((c) => {
    const matchesCategory =
      selectedCategory === "All" || c.category.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      c.title.toLowerCase().includes(query) ||
      c.summary.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // Filter campaigns created by current user's wallet
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
        
        {/* Wallet Connection Dialog */}
        <WalletConnectDialog
          open={walletDialogOpen}
          onOpenChange={setWalletDialogOpen}
          role={role}
        />

        <div className="flex flex-1 flex-col p-4 md:p-6 space-y-6">
          {/* Metric Cards (Synchronized with Neon DB) */}
          <SectionCards />

          {/* VIEW FOR ORGANIZATIONS */}
          {role === "organization" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Building2 className="size-5 text-primary" />
                    Your Organization&apos;s Campaigns
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Campaigns created by your connected wallet ({address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Wallet not connected"})
                  </p>
                </div>
                <Link href="/campaigns/create">
                  <Button variant="default" size="sm" className="gap-1.5">
                    <Plus className="size-3.5" /> Launch New Campaign
                  </Button>
                </Link>
              </div>

              {loading ? (
                <div className="p-12 text-center text-xs text-muted-foreground rounded-xl border border-border bg-card">
                  Loading campaigns from Neon DB...
                </div>
              ) : myCreatedCampaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myCreatedCampaigns.map((camp) => (
                    <Card key={camp.id} className="p-5 space-y-4 border-border bg-card">
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

                      <div className="grid grid-cols-3 gap-2 text-center text-xs py-2.5 bg-muted/50 rounded-xl border border-border">
                        <div>
                          <div className="font-bold text-foreground">{camp.raisedEth} ETH</div>
                          <div className="text-[10px] text-muted-foreground">Raised</div>
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{camp.targetEth} ETH</div>
                          <div className="text-[10px] text-muted-foreground">Target</div>
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{camp.backersCount}</div>
                          <div className="text-[10px] text-muted-foreground">Backers</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <Link href={`/campaigns/${camp.id}`} className="flex-1">
                          <Button variant="default" size="sm" className="w-full text-xs">
                            Manage Milestone Escrow & Proofs
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 sm:p-10 text-center space-y-3.5 border-dashed border-border bg-card">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
                    <Building2 className="size-6" />
                  </div>
                  <div className="text-base font-bold text-foreground">No campaigns launched yet</div>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    {address
                      ? "You haven't launched a project under your connected address. Create your milestone escrow to start raising funds."
                      : "Connect your MetaMask wallet or deploy your first milestone-driven crowdfunding campaign to get funded."}
                  </p>
                  <div className="pt-2 flex justify-center gap-3">
                    {!isConnected && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setWalletDialogOpen(true)}
                        className="gap-1.5"
                      >
                        <Wallet className="size-3.5" /> Connect Wallet
                      </Button>
                    )}
                    <Link href="/campaigns/create">
                      <Button variant="default" size="sm" className="gap-1.5">
                        <Plus className="size-3.5" /> Start New Campaign
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* RUNNING CAMPAIGNS SECTION (SHOWN PROMINENTLY FOR INVESTORS & ORGANIZATIONS) */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Sparkles className="size-5 text-primary" />
                  Running Campaigns on Protocol
                </h3>
                <p className="text-xs text-muted-foreground">
                  Active plant growing, ecological restoration, and planetary conservation campaigns loaded from Neon DB.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search campaigns by title, keywords, or species..."
                    className="pl-9 h-9 text-xs rounded-xl bg-card border-border"
                  />
                </div>

                {/* Category Filter Chips */}
                <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {CATEGORIES.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      size="xs"
                      onClick={() => setSelectedCategory(cat)}
                      className="h-8 text-xs rounded-lg font-medium"
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-muted-foreground rounded-xl border border-border bg-card">
                Fetching running campaigns from Neon DB...
              </div>
            ) : activeRunningCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeRunningCampaigns.map((camp) => {
                  const raised = parseFloat(camp.raisedEth || "0");
                  const target = parseFloat(camp.targetEth || "1");
                  const percent = Math.min(100, Math.round((raised / target) * 100));

                  return (
                    <Card
                      key={camp.id}
                      className="group flex flex-col justify-between overflow-hidden border-border bg-card hover:border-primary/40 transition-all shadow-xs !pt-0 [padding-top:0!important] [padding-block-start:0!important]"
                    >
                      {/* Banner Image */}
                      {camp.bannerUrl && (
                        <div data-slot="card-media" className="card-media card-banner relative aspect-video w-full overflow-hidden bg-muted rounded-t-xl -mt-px">
                          <img
                            src={camp.bannerUrl}
                            alt={camp.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <Badge variant="secondary" className="bg-background/90 backdrop-blur-md text-[10px] font-bold">
                              {camp.category}
                            </Badge>
                          </div>
                          <div className="absolute top-3 right-3">
                            <Badge
                              variant={camp.status === "ACTIVE" ? "default" : "secondary"}
                              className="text-[10px] font-bold backdrop-blur-md"
                            >
                              {camp.status}
                            </Badge>
                          </div>
                        </div>
                      )}

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h4 className="text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {camp.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                            {camp.summary}
                          </p>
                        </div>

                        {/* Funding Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-foreground">{camp.raisedEth} ETH raised</span>
                            <span className="text-muted-foreground font-mono">{percent}% of {camp.targetEth} ETH</span>
                          </div>
                          <Progress value={percent} className="h-2" />
                        </div>

                        {/* Backer and Milestone Stats */}
                        <div className="grid grid-cols-2 gap-2 text-center text-xs py-2 bg-muted/40 rounded-lg border border-border/60">
                          <div className="flex items-center justify-center gap-1.5">
                            <Users className="size-3 text-muted-foreground" />
                            <span className="font-bold text-foreground">{camp.backersCount}</span>
                            <span className="text-[11px] text-muted-foreground">backers</span>
                          </div>
                          <div className="flex items-center justify-center gap-1.5">
                            <Layers className="size-3 text-muted-foreground" />
                            <span className="font-bold text-foreground">{camp.milestoneCount}</span>
                            <span className="text-[11px] text-muted-foreground">milestones</span>
                          </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex items-center gap-2 pt-1">
                          <Link href={`/campaigns/${camp.id}`} className="flex-1">
                            <Button variant="default" size="sm" className="w-full text-xs font-medium gap-1.5">
                              {role === "investor" ? "Invest & Vote" : "View Campaign"}
                              <ArrowRight className="size-3.5" />
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
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-10 text-center space-y-3 border-dashed border-border bg-card">
                <Coins className="size-8 text-muted-foreground mx-auto" />
                <div className="text-sm font-bold text-foreground">No active campaigns in this category</div>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Try selecting &quot;All&quot; or be the first to launch a new project in this category!
                </p>
                <div>
                  <Link href="/campaigns/create">
                    <Button variant="default" size="sm" className="gap-1.5">
                      <Plus className="size-3.5" /> Launch Campaign
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
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
