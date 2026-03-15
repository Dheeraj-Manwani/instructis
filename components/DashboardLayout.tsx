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
  Users,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./ModeToggle";
import { UserDropdown } from "./UserDropdown";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "./Loader";
import { motion, AnimatePresence } from "motion/react";
import { RoleEnum } from "@prisma/client";

const allNavItems: Array<{
  title: string;
  path: string;
  icon: React.ComponentType<any>;
  roles: RoleEnum[];
}> = [
    { title: "My Batches", path: "/my-batches", icon: Users, roles: [RoleEnum.FACULTY] },
    { title: "Topics", path: "/topics", icon: BookOpen, roles: [RoleEnum.FACULTY] },
    { title: "Questions", path: "/questions", icon: PenTool, roles: [RoleEnum.FACULTY] },
    { title: "Marks Upload", path: "/marks", icon: Upload, roles: [RoleEnum.FACULTY] },
    { title: "Question Analysis", path: "/analysis", icon: BarChart3, roles: [RoleEnum.FACULTY] },
    { title: "Results", path: "/results", icon: Trophy, roles: [RoleEnum.FACULTY] },
    { title: "AI Rank Predictor", path: "/predicter", icon: Brain, roles: [RoleEnum.FACULTY] },
    { title: "WhatsApp Preview", path: "/whatsapp", icon: MessageCircle, roles: [RoleEnum.FACULTY] },


    { title: "Batches", path: "/batches", icon: Users, roles: [RoleEnum.ADMIN] },
    { title: "User Management", path: "/admin/users", icon: ShieldCheck, roles: [RoleEnum.ADMIN] },
  ];

const pageTitles: Record<string, string> = {
  // faculty pages
  "/my-batches": "My Batches",
  "/topics": "Topics",
  "/questions": "Questions",
  "/marks": "Faculty Marks Upload",
  "/analysis": "Student Question Analysis",
  "/results": "Exam Results",
  "/predicter": "AI Rank Predictor",
  "/whatsapp": "WhatsApp Notifications",

  // admin pages
  "/batches": "Batches",
  "/admin/users": "User Management",
};

// Helper function to get page title from pathname
function getPageTitle(pathname: string): string {
  // Check exact matches first
  if (pageTitles[pathname]) {
    return pageTitles[pathname];
  }
  // Check if it's a batch detail page
  if (pathname.startsWith("/my-batches/")) {
    return "Batch Details";
  }
  return "Dashboard";
}


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { isSignedIn, user, isPending } = useAuth();

  if (isPending) return <PageLoader />;

  if (!isSignedIn || !user) redirect("/auth/sign-in");

  // Type assertion: user.role exists in the database but may not be in the session type
  const userRole = (user as { role?: RoleEnum }).role;
  if (!userRole) redirect("/auth/sign-in");

  // Filter navigation items based on user role
  const navItems = allNavItems.filter((item) =>
    item.roles.includes(userRole)
  );

  // Route protection: redirect unauthorized users
  const currentPageItem = allNavItems.find((item) => pathname === item.path);
  console.log('currentPageItem ::::::::: ', currentPageItem);
  if (currentPageItem && !currentPageItem.roles.includes(userRole)) {
    // Redirect to first available route for user's role
    const firstAvailableRoute = navItems[0]?.path || "/";
    redirect(firstAvailableRoute);
  }

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
          {navItems.map((item, index) => {
            const active = pathname.startsWith(item.path);
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-150 relative group",
                    active
                      ? "border-l-[3px] border-primary bg-primary/8 text-primary"
                      : "border-l-[3px] border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon size={18} className="shrink-0" />
                  </motion.div>
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
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
            {getPageTitle(pathname)}
          </h1>
          <div className="absolute left-1/2 -translate-x-1/2">
            {userRole && (
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 border border-border">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">
                  {String(userRole)
                    .replace(/_/g, " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </div>
            )}
          </div>
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
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
