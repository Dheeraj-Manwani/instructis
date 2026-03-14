import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession();
  const user = session?.user;

  console.log("[AuthLayout] session type:", typeof session, "truthy:", !!session, "user:", user, !!user);

  if (user) redirect("/");

  return children;
}
