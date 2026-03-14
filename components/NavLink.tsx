"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, useTransition, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type NavLinkProps = LinkProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof LinkProps> & {
    activeClassName?: string;
    pendingClassName?: string;
    exact?: boolean;
  };

function getPath(href: LinkProps["href"]): string {
  if (typeof href === "string") return href.split("?")[0] ?? href;
  return href.pathname ?? "";
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  (
    {
      href,
      className,
      activeClassName,
      pendingClassName,
      exact = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const pathname = usePathname();
    const [isPending] = useTransition();

    const hrefPath = getPath(href);
    const isActive = exact
      ? pathname === hrefPath
      : pathname === hrefPath ||
        (hrefPath !== "/" && pathname.startsWith(hrefPath + "/"));

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          className,
          isActive && activeClassName,
          isPending && pendingClassName
        )}
        onClick={onClick}
        {...props}
      />
    );
  }
);

NavLink.displayName = "NavLink";

export { NavLink };
