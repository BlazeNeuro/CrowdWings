"use client";

import React from "react";
import { useAccount } from "wagmi";
import { useConnectModal, ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  ShieldCheck,
  Vote,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface WalletConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: "investor" | "organization" | "donor" | "creator";
}

export function WalletConnectDialog({
  open,
  onOpenChange,
  role = "investor",
}: WalletConnectDialogProps) {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();

  // If connected, close dialog
  React.useEffect(() => {
    if (isConnected && open) {
      const timeout = setTimeout(() => {
        onOpenChange(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isConnected, open, onOpenChange]);

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("crowdwings_wallet_dialog_dismissed", "true");
    }
    onOpenChange(false);
  };

  const isOrg = role === "organization" || role === "creator";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 border-border bg-card shadow-2xl">
        <DialogHeader className="flex flex-col items-center text-center space-y-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
            <Wallet className="size-7" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                {isOrg ? "Organization Escrow" : "Investor Portfolio"}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                Web3 Protocol
              </Badge>
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              Connect Your Web3 Wallet
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {isOrg
                ? "Connect your MetaMask or Ethereum wallet to deploy smart contract escrows and receive milestone capital."
                : "Connect your MetaMask or Ethereum wallet to pledge non-custodial ETH and exercise your backer voting rights."}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Benefits breakdown */}
        <div className="space-y-2.5 my-2 rounded-xl bg-muted/50 p-3.5 border border-border text-xs">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-semibold text-foreground">Non-Custodial Escrow:</span> Funds remain protected by immutable Ethereum smart contracts until milestones are achieved.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Vote className="size-4 text-primary shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-semibold text-foreground">Milestone Governance:</span> Backers vote cryptographically before escrowed funds unlock.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-semibold text-foreground">Autonomous Refunds:</span> If a campaign fails to reach its goal, you can reclaim 100% of your pledge.
            </div>
          </div>
        </div>

        {/* Status & Connect Buttons */}
        <div className="space-y-3 pt-2">
          {isConnected ? (
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 text-foreground text-xs font-medium">
              <CheckCircle2 className="size-4 text-primary" />
              <span>Wallet Connected: </span>
              <span className="font-mono font-bold">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {openConnectModal ? (
                <Button
                  onClick={openConnectModal}
                  size="default"
                  className="w-full gap-2 h-10 font-medium"
                >
                  <Wallet className="size-4" />
                  Connect MetaMask / Web3 Wallet
                </Button>
              ) : (
                <div className="flex justify-center">
                  <ConnectButton showBalance={false} />
                </div>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Browse dashboard without connecting
                <ArrowRight className="size-3.5 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
