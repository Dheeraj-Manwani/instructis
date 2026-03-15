"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export function VerifyEmailContent() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [loading, setLoading] = useState(false);

  const email = user?.email ?? "";

  async function handleResend() {
    if (!email) {
      toast.error("Email not found. Please sign in again.");
      return;
    }
    setLoading(true);
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Failed to resend email");
    } else {
      toast.success("Verification email sent. Check your inbox.");
    }
  }

  return (
    <Card className="w-full max-w-md border-border bg-card shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl font-semibold text-foreground">
          Verify your email
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          We sent a verification link to{" "}
          <span className="font-medium text-foreground">{email || "your email"}</span>.
          Click the link in that email to access your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive the email? Check your spam folder or request a new link.
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 border-border"
          onClick={handleResend}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Sending…" : "Resend verification email"}
        </Button>
      </CardContent>
    </Card>
  );
}
