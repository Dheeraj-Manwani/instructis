import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Unauthorized | Instructis",
};

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-10 w-10 text-destructive" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Access Denied
        </h1>

        <p className="mt-3 text-muted-foreground">
          You need to sign in to access this page. If you believe this is a
          mistake, please contact your administrator.
        </p>

        <div className="mt-8 flex gap-3">
          <Button asChild>
            <Link href="/auth/sign-in">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth/sign-up">Create Account</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
