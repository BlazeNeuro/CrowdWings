"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth/auth-client";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/mode-toggle";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Sparkles, Rocket, UserCheck, LogIn } from "lucide-react";

export function SiteHeader() {
  const { data: session } = useSession();
  return (
    <header className="flex h-(--header-height) shrink-0 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1.5 font-bold text-foreground text-sm">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-3.5" />
            </div>
            <span>CrowdWings</span>
          </Link>
          <Badge variant="secondary" className="hidden sm:inline-flex text-[10px]">
            Dashboard
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Link href="/campaigns/create" className="hidden md:block">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            <Rocket className="size-3.5" />
            Launch Campaign
          </Button>
        </Link>

        <ModeToggle />

        {!session && (
          <Link href="/login">
            <Button size="sm" variant="secondary" className="gap-1.5 text-xs">
              <LogIn className="size-3.5" />
              Sign In
            </Button>
          </Link>
        )}

        {/* RainbowKit Connect Button */}
        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "full",
          }}
        />
      </div>
    </header>
  );
}
