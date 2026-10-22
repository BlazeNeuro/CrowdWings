"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { signIn, signUp } from "@/lib/auth/auth-client";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  GalleryVerticalEndIcon,
  HeartHandshake,
  Rocket,
  ArrowRight,
  Wallet,
  CheckCircle2,
} from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const [role, setRole] = useState<"donor" | "creator">("donor");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Store role whenever it changes or wallet connects
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("crowdwings_user_role");
      if (saved === "creator" || saved === "donor") {
        setRole(saved);
      }
    }
  }, []);

  const handleSelectRole = (selectedRole: "donor" | "creator") => {
    setRole(selectedRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("crowdwings_user_role", selectedRole);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("crowdwings_user_role", role);
      }

      if (isSignUp) {
        await signUp.email({
          email,
          password,
          name: name || "Web3 User",
        });
      } else {
        await signIn.email({
          email,
          password,
        });
      }
      router.push(`/dashboard?role=${role}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleContinueWithWallet() {
    if (typeof window !== "undefined") {
      localStorage.setItem("crowdwings_user_role", role);
    }
    router.push(`/dashboard?role=${role}`);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          {/* Header */}
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
                <GalleryVerticalEndIcon className="size-5" />
              </div>
              <span className="sr-only">CrowdWings</span>
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Welcome to CrowdWings
            </h1>
            <FieldDescription>
              Decentralized Web3 crowdfunding protocol
            </FieldDescription>
          </div>

          {errorMsg && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive text-center">
              {errorMsg}
            </div>
          )}

          {/* Role Selection */}
          <div className="flex flex-col gap-2">
            <FieldLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Step 1: Are you a donor or need funding?
            </FieldLabel>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectRole("donor")}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all",
                  role === "donor"
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <HeartHandshake className="size-3.5 text-primary" />
                  Donor / Backer
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  I want to fund campaigns & vote on milestones
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole("creator")}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all",
                  role === "creator"
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Rocket className="size-3.5 text-primary" />
                  Need Funding
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  I want to create a project & raise capital
                </p>
              </button>
            </div>
          </div>

          {/* Primary Action: Web3 Connect */}
          <div className="flex flex-col gap-2">
            <FieldLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Step 2: Connect Wallet (Recommended)
            </FieldLabel>
            
            <div className="rounded-lg border border-border bg-card p-3.5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <Wallet className="size-3.5 text-primary" />
                  MetaMask / Web3 Wallet
                </span>
                {isConnected ? (
                  <span className="text-foreground font-medium flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="size-3" /> Connected
                  </span>
                ) : (
                  <span className="text-muted-foreground text-[11px]">1-Click Login</span>
                )}
              </div>

              <div className="flex justify-center pt-0.5">
                <ConnectButton showBalance={false} />
              </div>

              {isConnected && (
                <Button
                  type="button"
                  onClick={handleContinueWithWallet}
                  className="w-full gap-2 text-xs"
                >
                  Enter {role === "donor" ? "Donor" : "Creator"} Dashboard
                  <ArrowRight className="size-3.5" />
                </Button>
              )}
            </div>
          </div>

          <FieldSeparator>Or with email</FieldSeparator>

          {/* Email form */}
          {isSignUp && (
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vitalik Buterin"
                required
              />
            </Field>
          )}

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="m@example.com"
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
          </Field>

          <Field>
            <Button type="submit" disabled={loading} className="w-full">
              {loading
                ? "Processing..."
                : isSignUp
                ? `Sign Up as ${role === "donor" ? "Donor" : "Creator"}`
                : "Sign In"}
            </Button>
          </Field>

          <FieldDescription className="text-center text-xs">
            {isSignUp ? "Already have an account?" : "Don't have an email account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg("");
              }}
              className="text-foreground underline underline-offset-4 font-semibold ml-1 hover:text-primary"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </FieldDescription>
        </FieldGroup>
      </form>

      <FieldDescription className="px-6 text-center text-xs text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-foreground">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-foreground">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  );
}
