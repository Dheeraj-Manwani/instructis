"use client";

import React, { ReactNode } from "react";
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
  LogOutIcon,
  LucideIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./ModeToggle";
import { UserDropdown } from "./UserDropdown";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "./Loader";
import { motion, AnimatePresence } from "motion/react";
import { RoleEnum } from "@prisma/client";
import { useBreadcrumbStore, type BreadcrumbItem } from "@/store/BreadcrumbContext";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { toast } from "react-hot-toast";
import appLogo from "@/assets/logo.png";

type NavItem = {
  title: string;
  path: string;
  icon: LucideIcon;
  roles: RoleEnum[];
  isDemo?: boolean;
};

const allNavItems: NavItem[] = [
  // demo / navigation options for faculty (non-navigating)
  { title: "Dashboard", path: "/dashboard", icon: BarChart3, roles: [RoleEnum.FACULTY], isDemo: true },
  { title: "Students", path: "/students", icon: Users, roles: [RoleEnum.FACULTY], isDemo: true },
  { title: "Quizzes", path: "/quizzes", icon: PenTool, roles: [RoleEnum.FACULTY], isDemo: true },
  { title: "Results & Percentiles", path: "/results", icon: Trophy, roles: [RoleEnum.FACULTY], isDemo: true },
  { title: "Attendance", path: "/attendance", icon: Bell, roles: [RoleEnum.FACULTY], isDemo: true },
  { title: "Reports", path: "/reports", icon: BarChart3, roles: [RoleEnum.FACULTY], isDemo: true },

  // existing faculty items
  { title: "My Batches", path: "/my-batches", icon: Users, roles: [RoleEnum.FACULTY] },
  { title: "Topics", path: "/topics", icon: BookOpen, roles: [RoleEnum.FACULTY] },
  { title: "Questions", path: "/questions", icon: PenTool, roles: [RoleEnum.FACULTY] },

  // existing admin items
  { title: "Batches", path: "/batches", icon: Users, roles: [RoleEnum.ADMIN] },
  { title: "User Management", path: "/admin/users", icon: ShieldCheck, roles: [RoleEnum.ADMIN] },
];

const pageTitles: Record<string, string> = {
  // common
  "/profile": "Profile",

  // faculty pages
  "/my-batches": "My Batches",
  "/topics": "Topics",
  "/questions": "Questions",
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

// Build default breadcrumb for my-batches flow from pathname (used when page hasn't set breadcrumb yet)
function getMyBatchesBreadcrumb(pathname: string): BreadcrumbItem[] {
  if (pathname === "/my-batches") {
    return [{ label: "My Batches" }];
  }
  const batchMatch = pathname.match(/^\/my-batches\/([^/]+)(?:\/test\/([^/]+))?\/?$/);
  if (!batchMatch) return [{ label: "My Batches", href: "/my-batches" }];
  const batchId = batchMatch[1];
  const testId = batchMatch[2];
  const items: BreadcrumbItem[] = [
    { label: "My Batches", href: "/my-batches" },
    { label: "Batch", href: `/my-batches/${batchId}` },
  ];
  if (testId) {
    items.push({ label: "Test", href: `/my-batches/${batchId}/test/${testId}` });
  }
  return items;
}

function TopBarTitle({ pathname }: { pathname: string }) {
  const items = useBreadcrumbStore((s) => s.items);
  const isMyBatchesFlow = pathname.startsWith("/my-batches");
  const displayItems = isMyBatchesFlow
    ? (items.length ? items : getMyBatchesBreadcrumb(pathname))
    : null;

  if (displayItems && displayItems.length > 0) {
    return (
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
        {displayItems.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-4 w-4 shrink-0" />}
            {item.href ? (
              <Link
                href={item.href}
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-foreground">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    );
  }
  return (
    <h1 className="text-base font-semibold text-foreground">
      {getPageTitle(pathname)}
    </h1>
  );
}


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const resetBreadcrumb = useBreadcrumbStore((s) => s.resetBreadcrumb);
  const { isSignedIn, user, isPending } = useAuth();

  useEffect(() => {
    resetBreadcrumb();
  }, [pathname, resetBreadcrumb]);

  if (isPending) return <PageLoader />;

  if (!isSignedIn || !user) redirect("/auth/sign-in");

  // Type assertion: user.role exists in the database but may not be in the session type
  const userRole = (user as { role?: RoleEnum }).role;
  if (!userRole) redirect("/auth/sign-in");

  // Filter navigation items based on user role
  const navItems = allNavItems.filter((item) =>
    item.roles.includes(userRole) && !item.isDemo
  );

  // Route protection: redirect unauthorized users
  const currentPageItem = allNavItems.find((item) => pathname === item.path);
  if (currentPageItem && !currentPageItem.roles.includes(userRole)) {
    // Redirect to first available route for user's role
    const firstAvailableRoute = navItems[0]?.path || "/";
    redirect(firstAvailableRoute);
  }

  async function handleSignOut() {
    const { error } = await authClient.signOut();
    if (error) {
      toast.error(error.message || "Something went wrong");
    } else {
      toast.success("Signed out successfully");
      window.location.href = "/auth/sign-in";
    }
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
          <div className="flex items-center gap-3">
            <Image
              src={appLogo}
              alt="Instructis"
              className="h-9 w-9 rounded-lg"
            />
            {!collapsed && (
              <span className="text-lg font-bold tracking-tight text-primary">
                Instructis
              </span>
            )}
          </div>
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
            const active = !item.isDemo && pathname.startsWith(item.path);
            const commonClasses = cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-150 relative group",
              active
                ? "border-l-[3px] border-primary bg-primary/8 text-primary"
                : "border-l-[3px] border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
            );

            const content = (
              <>
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
                      {item.isDemo && (
                        <span className="ml-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                          (Demo)
                        </span>
                      )}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            );

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {item.isDemo ? (
                  <button
                    type="button"
                    className={commonClasses}
                    onClick={() => toast("This is a demo menu item")}
                  >
                    {content}
                  </button>
                ) : (
                  <Link href={item.path} className={commonClasses}>
                    {content}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-border p-3 space-y-2">
          {/* {!collapsed && (
            <div className="flex items-center gap-2">
              <ModeToggle />
              <UserDropdown user={user} />
            </div>
          )} */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            <LogOutIcon className="h-4 w-4" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={cn("flex flex-1 flex-col transition-all duration-200", collapsed ? "ml-16" : "ml-60")}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-6">
          <TopBarTitle pathname={pathname} />
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
            {/* <button className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <Bell size={18} />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                3
              </span>
            </button> */}
            <div className="flex items-center gap-2 mr-3">
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
