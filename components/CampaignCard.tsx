"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RealCampaign } from "@/lib/db";
import { useEthPrice } from "@/lib/web3/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Users, ShieldCheck } from "lucide-react";

interface CampaignCardProps {
  campaign: RealCampaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const ethPrice = useEthPrice();
  const [diffDays, setDiffDays] = useState<number>(14);

  const raised = parseFloat(campaign.raisedEth || "0");
  const target = parseFloat(campaign.targetEth || "1");
  const percentFunded = Math.min(Math.round((raised / target) * 100), 100);

  useEffect(() => {
    if (campaign.deadline) {
      const deadlineDate = new Date(campaign.deadline);
      const remaining = Math.max(0, Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      setDiffDays(remaining);
    }
  }, [campaign.deadline]);

  const raisedUsd = (raised * ethPrice).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });

  return (
    <Link href={`/campaigns/${campaign.id}`} className="block group">
      <Card className="h-full flex flex-col overflow-hidden border-border bg-card text-card-foreground hover:shadow-md transition-all duration-200">
        {/* Banner Media */}
        <div className="relative w-full h-48 bg-muted overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={campaign.bannerUrl}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="backdrop-blur-md bg-background/80 text-foreground">
              {campaign.category}
            </Badge>
          </div>

          {/* Milestone Badge */}
          {campaign.milestoneCount > 0 && (
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="backdrop-blur-md bg-background/80 text-foreground">
                <ShieldCheck className="size-3 mr-1 text-primary" />
                {campaign.milestoneCount} Milestones
              </Badge>
            </div>
          )}

          {/* Status Badge */}
          {campaign.status === "SUCCEEDED" && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="default">
                Funded
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            {/* Creator */}
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="size-5">
                <AvatarImage src={campaign.creatorAvatar} alt={campaign.creatorName} />
                <AvatarFallback className="text-[10px]">{campaign.creatorName?.[0] || "C"}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground font-medium truncate">
                {campaign.creatorName || "Verified Creator"}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1.5">
              {campaign.title}
            </h3>

            {/* Summary */}
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {campaign.summary}
            </p>
          </div>

          <div>
            {/* shadcn Progress Bar */}
            <Progress value={percentFunded} className="h-2 mb-3" />

            {/* Metrics */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
              <div>
                <div className="text-sm font-bold text-foreground">
                  {campaign.raisedEth} ETH
                </div>
                <div className="text-[11px] text-muted-foreground">
                  ${raisedUsd} ({percentFunded}%)
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-semibold text-foreground flex items-center justify-end gap-1">
                  <Clock className="size-3.5 text-muted-foreground" />
                  <span>{diffDays} days left</span>
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center justify-end gap-1">
                  <Users className="size-3" />
                  <span>{campaign.backersCount} backers</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
