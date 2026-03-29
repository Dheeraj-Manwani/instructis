"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, animate } from "motion/react";
import {
  ArrowRight, Play, CheckCircle2, Upload, Brain, Search, MessageSquare,
  FileText, BarChart3, Star, Twitter, Linkedin, MessageCircle, ChevronRight,
  School, GraduationCap, Smartphone, Trophy, Sparkles, Menu, X, Rocket,
  UserCircle2, Palette, LogIn, LayoutDashboard, LogOut, PhoneCall, MapPin, Copy, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";
import appLogo from "@/assets/logo.png";
import fullDayImage from "@/assets/landing/4cards/fullday.webp";
import structuredLearningImage from "@/assets/landing/4cards/Structured_learning.webp";
import smartLearningImage from "@/assets/landing/4cards/Smart_Learning.webp";
import nextGenHybridImage from "@/assets/landing/4cards/Nextgen_Hybrid.webp";
import { toast } from "react-hot-toast";
import LoadingButton from "@/components/LoadingButton";
import { createCallbackRequest } from "@/lib/api/callback-requests";
import TopResultsCarousel from "@/components/TopResultsCarousel";
import MeetOurStarsCarousel from "@/components/MeetOurStarsCarousel";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import CallbackFloatingPhoneButton from "@/components/CallbackFloatingPhoneButton";
import { ModeToggle } from "@/components/ModeToggle";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } },
} as const;
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
} as const;

function SectionWrap({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── LANDING PAGE ─── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const isSignedIn = Boolean(session?.user);
  const roleLabel = session?.user?.role
    ? String(session.user.role)
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
    : null;
  const supportPhone = "7093858372";
  const dummyMenuItems = ["Centers", "Courses", "Results", "Scholarship", "Students Hub", "Blogs", "Careers"];

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  async function handleSignOut() {
    const { error } = await authClient.signOut();
    if (error) {
      toast.error(error.message || "Failed to sign out");
      return;
    }
    toast.success("Signed out successfully");
    window.location.href = "/auth/sign-in";
  }

  async function handleCopyPhone() {
    try {
      await navigator.clipboard.writeText(supportPhone);
      toast.success("Phone number copied");
    } catch {
      toast.error("Unable to copy phone number");
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans overflow-x-hidden">
      <TopResultsCarousel />
      <CallbackFloatingPhoneButton />
      {/* ════════ NAVBAR ════════ */}
      <nav
        className={cn(
          "fixed top-0 inset-x-0 z-50 border-b border-border transition-all duration-300",
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-lg shadow-black/5 dark:bg-slate-950/90 dark:border-slate-800"
            : "bg-white/80 dark:bg-slate-950/80 dark:border-slate-800"
        )}
      >
        <div className=" mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center">
            <div className="w-9 h-9 rounded-xl bg-transparent flex items-center justify-center overflow-hidden">
              <Image
                src={appLogo}
                alt="Instructis"
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Instructis</span>
          </Link>

          <div className="hidden md:flex items-center gap-5">
            <div className="flex items-center gap-4">
              {dummyMenuItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                >
                  {item}
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-full border-slate-200 px-3 text-xs font-semibold dark:border-slate-700"
              onClick={() => setPhoneModalOpen(true)}
            >
              <PhoneCall className="h-4 w-4 text-blue-500" />
              <span>Call now</span>
              <span className="text-slate-600 dark:text-slate-300">{supportPhone}</span>
            </Button>
            {/* <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-slate-200 dark:border-slate-700"
            >
              <MapPin className="h-4 w-4 text-rose-500" />
              <span className="sr-only">Location</span>
            </Button> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-11 w-11 rounded-full border-slate-200 dark:border-slate-700">
                  <UserCircle2 className="h-6 w-6" />
                  <span className="sr-only">Open profile menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
                  <span>{isSignedIn ? session?.user?.email : "Account"}</span>
                  {isSignedIn && roleLabel && (
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-foreground/80">
                      <Shield className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium">Role: {roleLabel}</span>
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Palette className="h-4 w-4" />
                    <span>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                {isSignedIn ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/batches">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} variant="destructive">
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild disabled={isSessionPending}>
                    <Link href="/auth/sign-in">
                      <LogIn className="h-4 w-4" />
                      <span>Sign in</span>
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

          </div>

          <div className="md:hidden flex items-center gap-2">
            <ModeToggle />
            <button className="p-2" onClick={() => setMobileNav(!mobileNav)}>
              {mobileNav ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileNav && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t px-6 py-4 flex flex-col gap-4 text-slate-900 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800"
          >
            <a href="#features" onClick={() => setMobileNav(false)} className="text-sm font-medium">Features</a>
            <a href="#institutes" onClick={() => setMobileNav(false)} className="text-sm font-medium">For Institutes</a>
            <a href="#pricing" onClick={() => setMobileNav(false)} className="text-sm font-medium">Pricing</a>
            <div className="pt-1">
              <ModeToggle />
            </div>
            <Link href="/batches" onClick={() => setMobileNav(false)}>
              <Button className="rounded-full bg-emerald-600 text-white w-full">Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </motion.div>
        )}
      </nav>
      <Dialog open={phoneModalOpen} onOpenChange={setPhoneModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Contact Number</DialogTitle>
            <DialogDescription>Use the number below to call or copy.</DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-border bg-muted/30 p-3 text-sm font-semibold">{supportPhone}</div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCopyPhone}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700">
              <a href={`tel:${supportPhone}`}>
                <PhoneCall className="h-4 w-4" />
                Call
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════ HERO ════════ */}
      {/* <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-[520px] h-[520px] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute top-20 right-0 w-[480px] h-[480px] rounded-full bg-blue-500/10 blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 w-[380px] h-[380px] rounded-full bg-amber-400/10 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-3 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-4 py-1.5 text-sm font-medium"
            >
              🎯 Trusted by 500+ Coaching Institutes
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="inline-block mr-[0.3em]"
              >
                The
              </motion.span>{" "}
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.5 }}
                className="inline-block mr-[0.3em] bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent min-w-[11ch]"
              >
                Smartest
              </motion.span>{" "}
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.46, duration: 0.5 }}
                className="inline-block mr-[0.3em]"
              >
                Platform for
              </motion.span>{" "}
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.54, duration: 0.5 }}
                className="inline-block mr-[0.3em]"
              >
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  JEE
                </span>
              </motion.span>{" "}
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.62, duration: 0.5 }}
                className="inline-block mr-[0.3em]"
              >
                &
              </motion.span>{" "}
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="inline-block mr-[0.3em]"
              >
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  NEET
                </span>
              </motion.span>{" "}
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.78, duration: 0.5 }}
                className="inline-block mr-[0.3em]"
              >
                Coaching
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="text-lg text-slate-500 max-w-xl leading-relaxed"
            >
              Upload marks, predict ranks with AI, analyze every question, and notify parents on WhatsApp — all in one powerful dashboard.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/batches">
                <Button size="lg" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-13 text-base shadow-xl shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:scale-105 transition-all duration-300">
                  Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-13 text-base border-slate-300 hover:bg-slate-50" onClick={() => {
                window.open("https://youtu.be/ZK-rNEhJIDs?si=M7JpkKAizkuTQc9D", "_blank");
              }}>
                <Play className="w-5 h-5 mr-2 text-emerald-600" fill="currentColor" /> Watch Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="flex flex-wrap gap-6 text-sm text-slate-500"
            >
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1,20,000+ Students</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 500+ Institutes</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> WhatsApp Integrated</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40, rotate: -2 }}
            animate={{ opacity: 1, x: 0, rotate: -2 }}
            whileHover={{ rotate: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-2 relative hidden lg:block"
          >
            <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200/60 p-5 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-700">Faculty Marks Upload</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Live</span>
              </div>
              {[
                { name: "Rahul Sharma", pct: 92.5, color: "text-emerald-600 bg-emerald-50" },
                { name: "Priya Joshi", pct: 94.1, color: "text-emerald-600 bg-emerald-50" },
                { name: "Aditya Verma", pct: 89.3, color: "text-amber-600 bg-amber-50" },
                { name: "Sameer Gupta", pct: 78.6, color: "text-red-500 bg-red-50" },
              ].map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.15 }}
                  className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {s.name.split(" ").map(w => w[0]).join("")}
                    </div>
                    <span className="text-xs font-medium text-slate-700">{s.name}</span>
                  </div>
                  <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full", s.color)}>{s.pct}%</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border px-3 py-2 text-xs font-bold text-emerald-700"
            >
              +28 Points 🎉
            </motion.div>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-3 -left-4 bg-white rounded-xl shadow-lg border px-3 py-2 text-xs font-bold text-blue-700"
            >
              92.5% Percentile
            </motion.div>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
              className="absolute top-1/2 -right-8 bg-white rounded-xl shadow-lg border px-3 py-2 text-[11px] font-bold text-slate-600"
            >
              118 Parents Notified ✅
            </motion.div>
          </motion.div>
        </div>
      </section> */}

      {/* ════════ COACHING HIGHLIGHTS ════════ */}
      <LandingCoachingHighlights />

      {/* ════════ STATS BAR ════════ */}
      {/* <SectionWrap className="bg-slate-900 py-14">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: School, label: "Coaching Institutes", value: 500, suffix: "+" },
            { icon: GraduationCap, label: "Students Tracked", value: 120000, suffix: "+" },
            { icon: Smartphone, label: "Parent Notification Rate", value: 98, suffix: "%" },
            { icon: Trophy, label: "Top 1000 AIR Achieved", value: 47, suffix: "+" },
          ].map((s, i) => (
            <motion.div key={s.label} variants={fadeUp} className="space-y-2">
              <s.icon className="w-7 h-7 text-emerald-400 mx-auto" />
              <div className="text-3xl md:text-4xl font-extrabold text-white">
                <CountUp target={s.value} suffix={s.suffix} />
              </div>
              <p className="text-sm text-slate-400">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrap> */}


      {/* ════════ AI RANK PREDICTOR SHOWCASE ════════ */}
      <SectionWrap id="institutes" className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          {/* left visual */}
          <motion.div variants={fadeUp} className="space-y-6">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm space-y-5">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Percentile Band</h3>
              <PercentileBand />
              <div className="grid grid-cols-2 gap-4">
                <RankCard icon="🏆" range="95-99%ile" rank="Top 1,000" color="from-amber-500/20 to-amber-600/10 border-amber-500/30" />
                <RankCard icon="🥈" range="90-95%ile" rank="Top 3,000" color="from-slate-500/20 to-slate-600/10 border-slate-500/30" />
              </div>
            </div>
          </motion.div>

          {/* right text */}
          <motion.div variants={fadeUp} className="space-y-6">
            <span className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full px-4 py-1.5 text-sm font-medium">
              <Sparkles className="w-4 h-4" /> Powered by AI
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">Predict Ranks Before the Real Exam</h2>
            <p className="text-slate-400 leading-relaxed">
              Our AI analyzes mock test performance across 1,20,000+ students to give accurate JEE and NEET rank predictions. Identify weak areas and auto-generate a personalized study plan.
            </p>
            <ul className="space-y-3">
              {["Percentile band visualization", "Drawback points per topic", "Recommended practice questions", "AI improvement tips"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> {t}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </SectionWrap>

      {/* ════════ FEATURES ════════ */}
      <SectionWrap id="features" className="py-24 bg-slate-50 dark:bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Why Choose Us</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">A Learning Experience Built for JEE/NEET Results</h2>
            <p className="mt-4 text-slate-500 dark:text-slate-300 max-w-2xl mx-auto">From structured preparation to personal attention, we help every student improve steadily with full parent confidence.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Upload, title: "Structured Test & Practice Routine", desc: "Regular tests and planned revision keep preparation disciplined and exam-ready throughout the year.", color: "from-emerald-500 to-emerald-600" },
              { icon: Brain, title: "Realistic Rank Guidance", desc: "Students know where they stand now and what score range to target next in JEE/NEET.", color: "from-blue-500 to-blue-600" },
              { icon: Search, title: "Detailed Error Analysis", desc: "Every test is reviewed question by question so weak concepts are fixed quickly and confidently.", color: "from-violet-500 to-violet-600" },
              { icon: MessageSquare, title: "Transparent Parent Updates", desc: "Parents receive timely progress reports and action points to support focused study at home.", color: "from-emerald-500 to-teal-600" },
              { icon: FileText, title: "JEE/NEET-Focused Practice Material", desc: "Curated chapter-wise questions by difficulty build speed, accuracy, and strong exam temperament.", color: "from-amber-500 to-orange-500" },
              { icon: BarChart3, title: "Continuous Performance Improvement", desc: "Progress tracking reveals growth areas early so each student improves with a clear personal plan.", color: "from-pink-500 to-rose-500" },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-700 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 transition-shadow duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}>
                </div>
                <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg", f.color)} style={{ boxShadow: "0 8px 20px -4px rgba(0,0,0,0.15)" }}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrap>


      {/* ════════ WHATSAPP SECTION ════════ */}
      <SectionWrap className="py-24 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Parents Get Complete Performance Reports Instantly on WhatsApp</h2>
            <p className="text-emerald-200 max-w-xl mx-auto mb-12">
              The moment marks are uploaded, parents automatically receive a detailed PDF report on WhatsApp with AI insights, JEE/NEET rank prediction, performance breakdown, and clear focus areas for improvement.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex justify-center"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <PhoneMockup />
            </motion.div>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4 mt-12">
            {[
              "📄 Detailed PDF report card auto-delivered",
              "🧠 AI insights + rank prediction",
              "🎯 Clear chapter-wise focus areas",
              "✅ Parents stay updated without asking",
            ].map((p) => (
              <span key={p} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 text-sm font-medium">{p}</span>
            ))}
          </motion.div>
        </div>
      </SectionWrap>

      {/* ════════ HOW IT WORKS ════════ */}
      {/* <SectionWrap className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">How It Works</h2>
            <p className="mt-4 text-slate-500">Three simple steps to transform your coaching workflow.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px] border-t-2 border-dashed border-slate-300" />

            {[
              { step: "01", icon: Upload, title: "Upload Marks", desc: "Faculty uploads marks via Excel, Google Sheets, or manually in the dashboard." },
              { step: "02", icon: Brain, title: "AI Analyzes & Predicts", desc: "Platform calculates percentiles, rank predictions, and identifies weak areas instantly." },
              { step: "03", icon: Smartphone, title: "Notify & Improve", desc: "Parents get WhatsApp alerts. Students get a personalized improvement plan." },
            ].map((s, i) => (
              <motion.div key={s.step} variants={fadeUp} className="text-center relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
                  <s.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Step {s.step}</span>
                <h3 className="text-lg font-bold mt-2 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrap> */}

      {/* ════════ TESTIMONIALS ════════ */}
      <SectionWrap className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Trusted by Parents Across India</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Neha Sharma",
                relation: "Parent of Aarav Sharma",
                city: "Kota",
                quote:
                  "The WhatsApp report card comes right after every test, so we always know where Aarav stands. It clearly shows strengths and weak chapters, which helps us support him better.",
              },
              {
                name: "Rajiv Menon",
                relation: "Parent of Diya Menon",
                city: "Hyderabad",
                quote:
                  "I can see Diya's progress without chasing updates. The rank trend and improvement tips make everything easy to understand, and we feel reassured about her preparation.",
              },
              {
                name: "Pooja Gupta",
                relation: "Parent of Rishabh Gupta",
                city: "Delhi",
                quote:
                  "What I value most is transparency. We get timely updates, clear performance snapshots, and better communication with teachers, so there are no surprises before exams.",
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">&quot;{t.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                    {t.name.split(" ").map(w => w[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-300">{t.relation}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-400">{t.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrap>

      {/* ════════ FINAL CTA ════════ */}
      <SectionWrap className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 -z-0">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[100px]" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div variants={fadeUp}>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-5">Ready to Transform Your Coaching Experience?</h2>
            <p className="text-slate-400 mb-10 text-lg">Join 500+ institutes using Instructis to view marks, predict ranks, analyze performance, and keep parents informed.</p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Link href="/batches">
                <Button size="lg" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-10 h-13 text-base shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-105 transition-all duration-300">
                  Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button
                size="lg"
                onClick={() => router.push("#callback")}
                className="rounded-full px-10 h-13 text-base bg-transparent border border-white/35 text-white hover:bg-white/10 hover:border-white/60"
              >
                Book a Demo
              </Button>
            </div>
            <p className="text-sm text-slate-500">No credit card required · Setup in 10 minutes · Free for small institutes</p>
          </motion.div>
        </div>
      </SectionWrap>
      {/* 
      <MeetOurStarsCarousel />
      <TestimonialsCarousel /> */}

      {/* ════════ REQUEST A CALLBACK ════════ */}
      <CallbackRequestSection />

      {/* ════════ FOOTER ════════ */}
      <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-10 md:grid-cols-5 items-start mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-slate-900/60 flex items-center justify-center overflow-hidden border border-slate-800">
                  <Image
                    src={appLogo}
                    alt="Instructis"
                    className="h-7 w-7 object-contain"
                  />
                </div>
                <span className="text-lg font-extrabold text-white">Instructis</span>
              </div>
              <p className="text-sm leading-relaxed max-w-md">
                Smarter coaching workflows for JEE & NEET institutes — view marks, predict ranks, analyze performance, and keep parents informed.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#callback"
                  className="inline-flex items-center rounded-full border border-emerald-700/30 bg-emerald-700/10 px-5 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-700/15 transition-colors"
                >
                  Request a callback
                </a>
                <Link
                  href="/batches"
                  className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900/40 px-5 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-900/60 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#institutes" className="hover:text-white transition-colors">
                    AI Rank Predictor
                  </a>
                </li>
                <li>
                  <a href="#callback" className="hover:text-white transition-colors">
                    Book a Demo
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Press
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Connect</h4>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#"
                  aria-label="Twitter"
                  className="w-10 h-10 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800 flex items-center justify-center transition-colors"
                >
                  <Twitter className="w-4 h-4 text-slate-200" />
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="w-10 h-10 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800 flex items-center justify-center transition-colors"
                >
                  <Linkedin className="w-4 h-4 text-slate-200" />
                </a>
                <a
                  href="#"
                  aria-label="Chat"
                  className="w-10 h-10 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800 flex items-center justify-center transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-slate-200" />
                </a>
              </div>

              <div className="mt-6 text-sm">
                <p className="text-white font-semibold mb-2">Contact</p>
                <p className="text-slate-400">
                  Email: <a className="text-emerald-200 hover:text-white transition-colors" href="#">support@instructis.com</a>
                </p>
                <p className="text-slate-400 mt-1">
                  Phone:{" "}
                  <a className="text-emerald-200 hover:text-white transition-colors" href="tel:+911234567890">
                    +91 12345 67890
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <span>© 2025 Instructis. Built for JEE & NEET coaching institutes in India.</span>
            <div className="flex gap-5">
              <a href="#" className="hover:text-white transition-colors">
                Sitemap
              </a>
              <a href="#callback" className="hover:text-white transition-colors">
                Request callback
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CallbackRequestSection() {
  const PHONE_NUMBER = "+9195153736499";
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [courseMode, setCourseMode] = useState<"ONLINE" | "CLASSROOM" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    fullName.trim().length >= 2 &&
    /^[0-9]{10,15}$/.test(mobileNumber.trim()) &&
    courseMode != null;

  async function handleSubmit() {
    if (!canSubmit) {
      toast.error("Please fill all fields to request counselling.");
      return;
    }
    if (courseMode == null) return;

    setIsSubmitting(true);
    try {
      await createCallbackRequest({
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        courseMode,
      });
      toast.success("Request submitted! Our admission counsellor will call you shortly.");
      setIsSubmitted(true);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to submit request.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SectionWrap id="callback" className="py-24 bg-linear-to-b from-white to-emerald-50/40 dark:from-slate-950 dark:to-slate-900/60">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* left */}
        <div className="space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
            <GraduationCap className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Get Personal JEE/NEET Counselling & Admission Guidance
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-3 max-w-xl">
              Speak with an academic expert to get the right preparation path, clear next steps,
              and support for your child&apos;s exam journey.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              "Free counselling",
              "No obligation",
              "Guidance for JEE/NEET preparation",
            ].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-200"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {item}
              </span>
            ))}
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Prefer to talk now?{" "}
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="text-emerald-700 font-semibold hover:underline"
            >
              Call {PHONE_NUMBER}
            </a>
          </p>
        </div>

        {/* right */}
        <div className="bg-white dark:bg-slate-900 border-2 border-emerald-100 dark:border-emerald-900/50 rounded-3xl p-7 shadow-xl shadow-emerald-100/60 dark:shadow-black/40">
          {!isSubmitted ? (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Request a Callback</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Quick form - takes less than 30 seconds.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Student Name
                </label>
                <Input
                  value={fullName}
                  placeholder="Enter student name"
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Mobile Number
                </label>
                <Input
                  value={mobileNumber}
                  placeholder="Enter parent/student mobile number"
                  inputMode="numeric"
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="h-12 rounded-xl"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We respect your privacy. Your number is used only for counselling support.
                </p>
              </div>



              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Course Mode
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCourseMode("ONLINE")}
                    className={cn(
                      "px-6 py-3 rounded-xl border text-sm font-semibold transition-colors",
                      courseMode === "ONLINE"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    )}
                  >
                    Online
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourseMode("CLASSROOM")}
                    className={cn(
                      "px-6 py-3 rounded-xl border text-sm font-semibold transition-colors",
                      courseMode === "CLASSROOM"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    )}
                  >
                    Classroom
                  </button>
                </div>
              </div>

              <LoadingButton
                loading={isSubmitting}
                disabled={!canSubmit || isSubmitting}
                onClick={handleSubmit}
                className="w-full h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Get Free Counselling
              </LoadingButton>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <Rocket className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-extrabold">
                Thank you! Our team will call you shortly.
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your counselling request is confirmed. We will guide you with the best next steps for JEE/NEET preparation and admissions.
              </p>
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFullName("");
                    setMobileNumber("");
                    setCourseMode(null);
                  }}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                >
                  Submit Another Request
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SectionWrap>
  );
}

function LandingCoachingHighlights() {
  const cards = [
    {
      title: "24/7 AI Study Partner",
      desc: "24 access and ai analysis for a competitive edge",
      img: fullDayImage,
    },
    {
      title: "Mastery Through Structured Learning",
      desc: "A powerful system built to crack school and competitive exams with precision",
      img: structuredLearningImage,
    },
    {
      title: "Smarter Learning With Smart Tech",
      desc: "Immersive AV modules and QR-powered videos that make tough concepts easy",
      img: smartLearningImage,
    },
    {
      title: "Next-Gen Hybrid Classrooms",
      desc: "Dynamic smart classrooms blending offline and online for a richer experience",
      img: nextGenHybridImage,
    },
  ];

  return (
    <SectionWrap className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            India&apos;s Best Coaching for{" "}
            <span className="text-sky-500">NEET</span>,{" "}
            <span className="text-sky-500">JEE</span> &amp;{" "}
            <span className="text-sky-500">FOUNDATIONS</span>
          </h2>
          <p className="mt-5 text-slate-600 dark:text-slate-300 max-w-3xl mx-auto text-base md:text-lg">
            Experience the unique blend of pedagogy, practice, and personalized
            mentorship
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {cards.map((c) => (
            <motion.div
              key={c.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="bg-[#EAF4FF] border border-[#D6E6FF] dark:bg-slate-900 dark:border-slate-700 rounded-3xl overflow-hidden"
            >
              <div className="p-8 md:p-10 text-center space-y-5">
                <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  {c.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base md:text-lg max-w-md mx-auto">
                  {c.desc}
                </p>
                <div className="mx-auto w-full max-w-md">
                  <Image
                    src={c.img}
                    alt={c.title}
                    width={900}
                    height={700}
                    className="w-full h-[220px] md:h-[240px] object-contain rounded-2xl bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrap>
  );
}

/* ─── Sub-components ─── */

function PercentileBand() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="space-y-3">
      <div className="relative h-6 rounded-full overflow-hidden bg-slate-700">
        <motion.div
          initial={{ width: "0%" }}
          animate={inView ? { width: "100%" } : {}}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #EF4444, #F59E0B, #22C55E, #15803D)" }}
        />
        <motion.div
          initial={{ left: "0%" }}
          animate={inView ? { left: "82%" } : {}}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
        >
          <div className="w-5 h-5 rounded-full bg-white border-2 border-emerald-500 shadow-lg" />
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-white text-slate-900 px-2 py-0.5 rounded-full whitespace-nowrap shadow">You are here</span>
        </motion.div>
      </div>
      <div className="flex justify-between text-[10px] text-slate-500 px-1">
        <span>0%</span><span>50%</span><span>75%</span><span>90%</span><span>99%</span>
      </div>
    </div>
  );
}

function RankCard({ icon, range, rank, color }: { icon: string; range: string; rank: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, rotateY: 90 }}
      whileInView={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className={cn("rounded-xl border p-4 text-center bg-gradient-to-br", color)}
    >
      <span className="text-2xl">{icon}</span>
      <p className="text-xs text-slate-400 mt-2">Target {range}</p>
      <p className="text-lg font-extrabold text-white">{rank}</p>
    </motion.div>
  );
}

function PhoneMockup() {
  return (
    <div className="w-[280px] bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl shadow-black/30 border border-slate-700">
      <div className="bg-white rounded-[2rem] overflow-hidden">
        {/* status bar */}
        <div className="bg-[#075E54] text-white px-4 py-2 flex items-center justify-between text-[10px]">
          <span className="font-semibold">Parent Updates</span>
          <span className="opacity-80">WhatsApp</span>
        </div>
        {/* chat */}
        <div className="bg-[#ECE5DD] p-3 space-y-2 min-h-[320px]">
          <div className="bg-white rounded-lg p-3 shadow-sm max-w-[220px] space-y-2">
            <p className="text-[10px] font-bold text-slate-800">📎 JEE/NEET Performance Report (PDF)</p>
            <p className="text-[10px] text-slate-600">Student: <b>Rahul Sharma</b></p>
            <div className="border border-slate-200 rounded-md bg-slate-50 p-2">
              <p className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold">PDF Preview</p>
              <div className="mt-1 grid grid-cols-2 gap-1.5">
                <div className="bg-white border border-blue-200 rounded p-1.5 text-center">
                  <p className="text-[8px] text-blue-600 font-semibold">Predicted Rank</p>
                  <p className="text-[11px] font-extrabold text-blue-700">JEE: AIR 2,140</p>
                </div>
                <div className="bg-white border border-orange-200 rounded p-1.5 text-center">
                  <p className="text-[8px] text-orange-600 font-semibold">Percentile</p>
                  <p className="text-[11px] font-extrabold text-orange-700">NEET: 94.2</p>
                </div>
              </div>
            </div>
            <p className="text-[9px] text-emerald-700 font-semibold">🧠 AI Insight: Strong in Chemistry, needs speed in Physics numericals.</p>
            <p className="text-[9px] text-slate-500">🎯 Focus Areas: Thermodynamics, Electrostatics, Biological Classification</p>
            <div className="flex gap-1.5">
              <span className="text-[8px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Auto-sent after marks upload</span>
              <span className="text-[8px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">View detailed PDF</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-400">10:32 AM ✓✓ Delivered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
