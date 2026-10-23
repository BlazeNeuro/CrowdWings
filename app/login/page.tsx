import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-center text-xs text-muted-foreground">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
