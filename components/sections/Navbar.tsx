"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import appLogo from "@/assets/logo.png";
import { ModeToggle } from "../ModeToggle";

const navLinks: { label: string; href: string }[] = [
  { label: "Courses", href: "#courses" },
  { label: "Results", href: "#results" },
  { label: "Faculty", href: "#faculty" },
  { label: "About", href: "#about" },
  { label: "Blog", href: "#testimonials" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "glass py-3" : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-transparent flex items-center justify-center overflow-hidden group-hover:opacity-90 transition-opacity">
              <Image
                src={appLogo}
                alt="Instructis"
                className="h-8 w-8 object-contain"
              />
            </div>
            <span
              className={cn(
                "text-xl font-extrabold tracking-tight transition-colors",
                scrolled ? "text-foreground" : "text-white"
              )}
            >
              Instructis
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className={cn(
                  "text-sm font-semibold transition-colors hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full",
                  scrolled ? "text-muted-foreground hover:text-foreground" : "text-gray-200"
                )}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <div
              className={cn(
                !scrolled &&
                "[&_button]:border-white/40 [&_button]:bg-white/10 [&_button]:text-white [&_button]:hover:bg-white/20"
              )}
            >
              <ModeToggle />
            </div>
            <Link
              href="/auth/sign-in"
              className={cn(
                "font-semibold text-sm transition-colors hover:text-primary",
                scrolled ? "text-muted-foreground hover:text-foreground" : "text-white"
              )}
            >
              Login
            </Link>
            <a
              href="#callback"
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center"
            >
              Enroll Now
            </a>
          </div>

          <button
            className="md:hidden p-2"
            type="button"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className={cn("w-6 h-6", scrolled ? "text-foreground" : "text-white")} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-card text-card-foreground border-l border-border z-50 p-6 flex flex-col shadow-2xl md:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <a href="#top" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center">
                    <Image src={appLogo} alt="Instructis" className="h-8 w-8 object-contain" />
                  </div>
                  <span className="text-xl font-extrabold text-foreground">Instructis</span>
                </a>
                <button type="button" onClick={() => setMobileMenuOpen(false)} className="p-2 bg-muted rounded-full text-muted-foreground hover:bg-muted/80">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
                <span className="text-sm font-medium text-muted-foreground">Theme</span>
                <ModeToggle />
              </div>

              <div className="flex flex-col gap-6 flex-1 pt-2">
                {navLinks.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xl font-semibold text-foreground hover:text-primary"
                  >
                    {label}
                  </a>
                ))}
              </div>

              <div className="flex flex-col gap-4 mt-auto">
                <Link
                  href="/auth/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl border-2 border-border font-bold text-foreground hover:border-primary hover:text-primary transition-colors text-center"
                >
                  Login
                </Link>
                <a
                  href="#callback"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/25 text-center"
                >
                  Enroll Now
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
