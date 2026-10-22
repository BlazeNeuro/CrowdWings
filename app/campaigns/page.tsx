"use client";

import React, { useState, useEffect, Suspense } from "react";
import { CampaignRecord } from "@/lib/db/mock-data";
import { CampaignCard } from "@/components/CampaignCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, Compass, Sparkles } from "lucide-react";

const CATEGORIES = ["All", "Tech", "Climate", "Gaming", "DeFi", "Community"];
const STATUSES = ["All", "ACTIVE", "SUCCEEDED"];

function CampaignsCatalogContent() {
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    async function loadCampaigns() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== "All") params.set("category", selectedCategory);
        if (selectedStatus !== "All") params.set("status", selectedStatus);
        if (search.trim()) params.set("search", search.trim());

        const res = await fetch(`/api/campaigns?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setCampaigns(data.campaigns || []);
        }
      } catch (err) {
        console.error("Failed to load campaigns:", err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(loadCampaigns, 200);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedStatus, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <Badge variant="secondary" className="mb-3">
          <Compass className="w-3.5 h-3.5 mr-1" />
          Decentralized Escrow Catalog
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-3">
          Explore Web3 Campaigns
        </h1>
        <p className="text-sm text-muted-foreground">
          Discover vetted initiatives seeking community funding on Ethereum. Back campaigns directly with MetaMask and verify milestone deliverables.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4 border-border bg-card backdrop-blur-xl mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground z-10" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, technology, or keywords..."
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 self-start md:self-auto text-xs">
            <span className="text-muted-foreground font-medium">Status:</span>
            <div className="flex bg-muted p-1 rounded-xl border border-border">
              {STATUSES.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    selectedStatus === st
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st === "All" ? "All" : st === "ACTIVE" ? "Active" : "Funded"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <span className="text-xs text-muted-foreground font-medium mr-1 hidden sm:inline">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className="h-8 rounded-xl text-xs font-semibold"
            >
              {cat}
            </Button>
          ))}
        </div>
      </Card>

      {/* Campaigns Listing Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-96 rounded-3xl bg-card border border-border animate-pulse"
            />
          ))}
        </div>
      ) : campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <CampaignCard key={camp.id} campaign={camp} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-20 border-border bg-card">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground mb-1">No campaigns found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
            Try adjusting your search query or switching categories.
          </p>
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
              setSelectedStatus("All");
            }}
          >
            Clear all filters
          </Button>
        </Card>
      )}
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading catalog...</p>
        </div>
      }
    >
      <CampaignsCatalogContent />
    </Suspense>
  );
}
