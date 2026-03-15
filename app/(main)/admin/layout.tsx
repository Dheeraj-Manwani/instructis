import { getServerSession } from "@/lib/get-session";
import { redirect, } from "next/navigation";
import { RoleEnum } from "@prisma/client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) redirect("/unauthorized");
  if (!user.emailVerified) redirect("/verify-email");
  if (user.role !== RoleEnum.ADMIN) redirect("/");

  return <>{children}</>;
}
