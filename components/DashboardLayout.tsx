"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import {
  Upload,
  BarChart3,
  Trophy,
  PenTool,
  Brain,
  MessageCircle,
  Bell,
  ChevronLeft,
  Menu,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./ModeToggle";
import { UserDropdown } from "./UserDropdown";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "./Loader";

const navItems = [
  { title: "Marks Upload", path: "/marks", icon: Upload },
  { title: "Question Analysis", path: "/analysis", icon: BarChart3 },
  { title: "Results", path: "/results", icon: Trophy },
  { title: "Question Builder", path: "/question-builder", icon: PenTool },
  { title: "AI Rank Predictor", path: "/predicter", icon: Brain },
  { title: "WhatsApp Preview", path: "/whatsapp", icon: MessageCircle },
  { title: "User Management", path: "/admin/users", icon: ShieldCheck },
];

const pageTitles: Record<string, string> = {
  "/": "Faculty Marks Upload",
  "/analysis": "Student Question Analysis",
  "/results": "Exam Results",
  "/question-builder": "Question Builder",
  "/predicter": "AI Rank Predictor",
  "/whatsapp": "WhatsApp Notifications",
  "/admin/users": "User Management",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { isSignedIn, user, isPending } = useAuth();

  if (isPending) return <PageLoader />;

  if (!isSignedIn || !user) redirect("/auth/sign-in");

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-border bg-card transition-all duration-200",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-primary">
              Instructis
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Nav - Next.js Link triggers NextTopLoader on navigation */}
        <nav className="flex-1 space-y-1 p-2 pt-3">
          {navItems.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  active
                    ? "border-l-[3px] border-primary bg-primary/8 text-primary"
                    : "border-l-[3px] border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Faculty info */}
        {!collapsed && (
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2">
              <ModeToggle />
              <UserDropdown user={user} />
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className={cn("flex flex-1 flex-col transition-all duration-200", collapsed ? "ml-16" : "ml-60")}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-6">
          <h1 className="text-base font-semibold text-foreground">
            {pageTitles[pathname] || "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <button className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <Bell size={18} />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                3
              </span>
            </button>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <UserDropdown user={user} />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
