"use client";

import React, { useState } from "react";
import { signIn, signUp, signOut, useSession } from "@/lib/auth/auth-client";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Lock, Mail, User, ShieldCheck, LogOut } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { data: session } = useSession();
  const { address } = useAccount();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isSignUp) {
        await signUp.email({
          email,
          password,
          name,
        });
      } else {
        await signIn.email({
          email,
          password,
        });
      }
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-card p-6 sm:p-8 shadow-2xl border border-border text-foreground">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted-foreground hover:text-foreground p-1 rounded-xl hover:bg-card transition"
        >
          <X className="w-5 h-5" />
        </button>

        {session ? (
          <div className="text-center py-4 space-y-4">
            <Avatar className="w-16 h-16 mx-auto border border-border shadow-sm">
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {session.user.name ? session.user.name[0].toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold text-foreground">{session.user.name}</h3>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
            </div>

            {address && (
              <div className="bg-card rounded-2xl p-3.5 border border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Connected Wallet:</span>
                <span className="font-mono text-foreground font-semibold">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
            )}

            <Button
              variant="destructive"
              onClick={async () => {
                await signOut();
                onClose();
              }}
              className="w-full mt-4 gap-2 rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs uppercase tracking-wider font-bold">Better-Auth Secure Access</span>
            </div>
            <h2 className="text-2xl font-extrabold text-foreground mb-1">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              Sign in to manage your Web3 projects and back campaigns.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground z-10" />
                    <Input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Vitalik Buterin"
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground z-10" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="builder@ethereum.org"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground z-10" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="default"
                className="w-full py-3 h-11 text-sm font-bold mt-2"
              >
                {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <div className="mt-5 text-center text-xs text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account yet?"}{" "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg("");
                }}
                className="text-primary hover:underline font-semibold ml-1"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
