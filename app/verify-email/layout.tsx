import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function VerifyEmailLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) redirect("/auth/sign-in");
  if (user.emailVerified) redirect("/");

  return <>{children}</>;
}
