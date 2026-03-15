import type { Metadata } from "next";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in | Instructis",
  description: "Sign in to your Instructis account",
};

export default function SignIn() {
  return (
    <main className="min-h-svh">
      <SignInForm />
    </main>
  );
}
