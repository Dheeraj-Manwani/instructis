import type { Metadata } from "next";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = {
  title: "Sign up | Instructis",
  description: "Create your Instructis account",
};

export default function SignUp() {
  return (
    <main className="min-h-svh">
      <SignUpForm />
    </main>
  );
}
