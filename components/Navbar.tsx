"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAccount, useDisconnect } from "wagmi";
import { useSession, signOut } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Sparkles,
  Rocket,
  Compass,
  LayoutDashboard,
  Wallet,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export function Navbar() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLoggedIn = isConnected || !!session;
  const displayName = session?.user?.name
    ? session.user.name
    : address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                CrowdWings
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link href="/campaigns">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                  <Compass className="size-4" />
                  Explore
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Button>
              </Link>
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/campaigns/create">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Rocket className="size-3.5" />
                Start a Campaign
              </Button>
            </Link>

            {/* Clear, Sorted Single Auth Action */}
            <ModeToggle />
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard">
                  <Button size="sm" variant="secondary" className="gap-2 font-mono text-xs">
                    <Wallet className="size-3.5 text-primary" />
                    <span>{displayName}</span>
                  </Button>
                </Link>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  title="Disconnect / Sign Out"
                  onClick={async () => {
                    if (isConnected) disconnect();
                    if (session) await signOut();
                  }}
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm" className="gap-1.5">
                  <Wallet className="size-3.5" />
                  Connect / Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ModeToggle />
            {!isLoggedIn ? (
              <Link href="/login">
                <Button size="sm">Connect</Button>
              </Link>
            ) : (
              <Link href="/dashboard">
                <Button size="sm" variant="secondary" className="font-mono text-xs">
                  {displayName}
                </Button>
              </Link>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground"
            >
              {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pt-3 pb-5 space-y-2">
          <Link
            href="/campaigns"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground rounded-lg hover:bg-muted"
          >
            <Compass className="size-4" />
            Explore Campaigns
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground rounded-lg hover:bg-muted"
          >
            <LayoutDashboard className="size-4" />
            Dashboard
          </Link>
          <Link
            href="/campaigns/create"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block pt-1"
          >
            <Button className="w-full gap-2">
              <Rocket className="size-4" />
              Start a Campaign
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
