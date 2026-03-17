import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getServerSession } from "@/lib/get-session";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) redirect("/auth/sign-in");
  if (!user.emailVerified) redirect("/verify-email");

  return <DashboardLayout>{children}</DashboardLayout>;
}
