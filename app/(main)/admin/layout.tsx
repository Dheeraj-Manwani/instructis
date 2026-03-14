import { getServerSession } from "@/lib/get-session";
import { redirect, } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) redirect("/unauthorized");
  if (user.role !== "admin") redirect("/");

  return <>{children}</>;
}
