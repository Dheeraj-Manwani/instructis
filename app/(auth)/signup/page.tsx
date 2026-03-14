import { Metadata } from "next";
import { SignUpPage } from "./SignUpPage";

export const metadata: Metadata = {
  title: "Sign Up | Pulse",
};

export default function Page() {
  return <SignUpPage />;
}
