import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, Cpu, Database } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card text-muted-foreground mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-3.5" />
              </div>
              <span className="text-base font-bold text-foreground tracking-tight">
                CrowdWings
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Decentralized crowdfunding protocol powered by Ethereum smart contracts, milestone escrow voting, and serverless Postgres.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="size-2 rounded-full bg-foreground animate-pulse"></span>
              Smart Contracts Live (Local/Sepolia)
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-foreground mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/campaigns" className="hover:text-foreground transition">
                  Explore Campaigns
                </Link>
              </li>
              <li>
                <Link href="/campaigns/create" className="hover:text-foreground transition">
                  Create a Campaign
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Web3 Architecture */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-foreground mb-3">
              Web3 Stack
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <Cpu className="size-3.5 text-primary" />
                Solidity 0.8.24 & Hardhat
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" />
                Better-Auth & SIWE
              </li>
              <li className="flex items-center gap-1.5">
                <Database className="size-3.5 text-primary" />
                Neon Serverless Postgres
              </li>
            </ul>
          </div>

          {/* Smart Contract Info */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-foreground mb-3">
              Escrow Contract
            </h4>
            <p className="text-xs text-muted-foreground mb-2">
              Verified milestone vault address:
            </p>
            <div className="p-2.5 rounded-lg bg-muted border border-border font-mono text-[11px] text-foreground break-all select-all">
              0x5FbDB2315678afecb367f032d93F642f64180aa3
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© 2026 CrowdWings Protocol. Built for decentralized innovation.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-foreground cursor-pointer">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer">Terms of Service</span>
            <span className="hover:text-foreground cursor-pointer">Security Audits</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
