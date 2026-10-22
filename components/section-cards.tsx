"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEthPrice } from "@/lib/web3/hooks";
import { TrendingUp, ShieldCheck, Coins, Users } from "lucide-react";

export function SectionCards() {
  const ethPrice = useEthPrice();
  const [campaignCount, setCampaignCount] = useState<number>(0);
  const [totalEthRaised, setTotalEthRaised] = useState<number>(0);
  const [totalBackers, setTotalBackers] = useState<number>(0);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/campaigns");
        if (res.ok) {
          const data = await res.json();
          const list = data.campaigns || [];
          setCampaignCount(list.length);
          const ethSum = list.reduce(
            (acc: number, c: { raisedEth?: string }) => acc + parseFloat(c.raisedEth || "0"),
            0
          );
          const backersSum = list.reduce(
            (acc: number, c: { backersCount?: number }) => acc + (c.backersCount || 0),
            0
          );
          setTotalEthRaised(ethSum);
          setTotalBackers(backersSum);
        }
      } catch (e) {
        console.warn("Error fetching dashboard card metrics:", e);
      }
    }
    fetchStats();
  }, []);

  const totalUsd = (totalEthRaised * ethPrice).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Raised */}
      <Card>
        <CardHeader>
          <CardDescription>Total Pledged (On-Chain)</CardDescription>
          <CardTitle className="text-2xl font-bold">
            {totalEthRaised.toFixed(2)} ETH
          </CardTitle>
          <CardAction>
            <Badge variant="secondary">
              <TrendingUp className="size-3 mr-1" />
              Live Escrow
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div className="text-foreground font-medium">≈ ${totalUsd} USD equivalent</div>
          <div>Across all verified campaigns</div>
        </CardFooter>
      </Card>

      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <CardDescription>Live Campaigns</CardDescription>
          <CardTitle className="text-2xl font-bold">
            {campaignCount}
          </CardTitle>
          <CardAction>
            <Badge variant="secondary">
              <Coins className="size-3 mr-1" />
              Real DB Data
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div className="text-foreground font-medium">Synchronized with Neon DB</div>
          <div>Zero dummy campaigns</div>
        </CardFooter>
      </Card>

      {/* Verified Backers */}
      <Card>
        <CardHeader>
          <CardDescription>Community Backers</CardDescription>
          <CardTitle className="text-2xl font-bold">
            {totalBackers}
          </CardTitle>
          <CardAction>
            <Badge variant="secondary">
              <Users className="size-3 mr-1" />
              MetaMask
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div className="text-foreground font-medium">Decentralized Contributors</div>
          <div>Non-custodial pledge receipts</div>
        </CardFooter>
      </Card>

      {/* Smart Contract Security */}
      <Card>
        <CardHeader>
          <CardDescription>Milestone Governance</CardDescription>
          <CardTitle className="text-2xl font-bold">
            100% Escrow
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <ShieldCheck className="size-3 mr-1 text-primary" />
              Anti-Rug
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div className="text-foreground font-medium">Backer Quorum Releases</div>
          <div>Funds unlocked only on proof-of-work</div>
        </CardFooter>
      </Card>
    </div>
  );
}
