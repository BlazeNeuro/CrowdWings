import React from "react";
import { MarketingLayout } from "@/components/MarketingLayout";

export default function CampaignsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketingLayout>{children}</MarketingLayout>;
}
