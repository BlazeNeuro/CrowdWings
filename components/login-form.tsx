"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { signIn, signUp } from "@/lib/auth/auth-client";
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
  Sparkles,
  TrendingUp,
  Building2,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<"investor" | "organization">("investor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Restore saved role preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("crowdwings_user_role");
      if (saved === "investor" || saved === "organization") {
        setRole(saved);
      } else if (saved === "donor") {
        setRole("investor");
      } else if (saved === "creator") {
        setRole("organization");
      }
    }
  }, []);

  const handleSelectRole = (selectedRole: "investor" | "organization") => {
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
        const result = await signUp.email({
          email,
          password,
          name: name.trim() || (role === "organization" ? "Organization" : "Investor"),
          role,
        } as any);

        if (result && "error" in result && result.error) {
          throw new Error(result.error.message || "Failed to create account");
        }
      } else {
        const result = await signIn.email({
          email,
          password,
        });

        if (result && "error" in result && result.error) {
          throw new Error(result.error.message || "Invalid email or password");
        }
      }

      // Smoothly redirect to dashboard
      router.push(`/dashboard?role=${role}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setErrorMsg("");
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("crowdwings_user_role", role);
      }
      const result = await signIn.social({
        provider: "google",
        callbackURL: `/dashboard?role=${role}`,
      });
      if (result && "error" in result && result.error) {
        throw new Error(result.error.message || "Google OAuth failed");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Google sign-in requires GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET configured in .env.local";
      setErrorMsg(
        msg.includes("not found") || msg.includes("provider") || msg.includes("OAuth")
          ? "Google OAuth requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local. You can test immediately using Email & Password below!"
          : msg
      );
    } finally {
      setGoogleLoading(false);
    }
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
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="size-5" />
              </div>
              <span className="sr-only">CrowdWings</span>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isSignUp ? "Create your account" : "Welcome to CrowdWings"}
            </h1>
            <FieldDescription>
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setErrorMsg("");
                    }}
                    className="font-semibold text-foreground underline underline-offset-4 hover:text-primary transition"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setErrorMsg("");
                    }}
                    className="font-semibold text-foreground underline underline-offset-4 hover:text-primary transition"
                  >
                    Sign up
                  </button>
                </>
              )}
            </FieldDescription>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Role Selection (in Sign Up mode or switchable) */}
          <div className="flex flex-col gap-2">
            <FieldLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isSignUp ? "Select your role" : "Account Role Perspective"}
            </FieldLabel>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectRole("investor")}
                className={cn(
                  "relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all",
                  role === "investor"
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {role === "investor" && (
                  <span className="absolute top-2.5 right-2.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-2.5" />
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <TrendingUp className="size-3.5 text-primary" />
                  Investor
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Back projects, vote on milestone escrow & track ROI
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole("organization")}
                className={cn(
                  "relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all",
                  role === "organization"
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {role === "organization" && (
                  <span className="absolute top-2.5 right-2.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-2.5" />
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Building2 className="size-3.5 text-primary" />
                  Organization
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Launch verified campaigns & deploy milestone escrows
                </p>
              </button>
            </div>
          </div>

          {/* Sign Up Name Field */}
          {isSignUp && (
            <Field>
              <FieldLabel htmlFor="name">
                {role === "organization" ? "Organization / Project Name" : "Full Name"}
              </FieldLabel>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === "organization" ? "Ethereum Foundation" : "Vitalik Buterin"}
                required
              />
            </Field>
          )}

          {/* Email Field */}
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </Field>

          {/* Password Field */}
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

          {/* Submit Action */}
          <Field>
            <Button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full h-9 font-medium"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  {isSignUp ? "Creating account in Neon DB..." : "Signing in..."}
                </span>
              ) : isSignUp ? (
                `Sign Up as ${role === "organization" ? "Organization" : "Investor"}`
              ) : (
                "Sign In"
              )}
            </Button>
          </Field>

          <FieldSeparator>Or continue with</FieldSeparator>

          {/* Google OAuth Button */}
          <Field>
            <Button
              variant="outline"
              type="button"
              disabled={loading || googleLoading}
              onClick={handleGoogleSignIn}
              className="w-full h-9 gap-2.5 font-medium border-border hover:bg-muted"
            >
              {googleLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Continue with Google
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <FieldDescription className="px-6 text-center text-xs text-muted-foreground">
        By continuing, you agree to the CrowdWings{" "}
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
