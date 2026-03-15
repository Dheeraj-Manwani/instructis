import type { Metadata } from "next";
import { VerifyEmailContent } from "./verify-email-content";

export const metadata: Metadata = {
  title: "Verify your email | Instructis",
  description: "Verify your email address to continue",
};

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4">
      <VerifyEmailContent />
    </main>
  );
}
