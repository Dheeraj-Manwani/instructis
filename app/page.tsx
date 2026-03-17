"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, animate } from "motion/react";
import {
  ArrowRight, Play, CheckCircle2, Upload, Brain, Search, MessageSquare,
  FileText, BarChart3, Star, Twitter, Linkedin, MessageCircle, ChevronRight,
  School, GraduationCap, Smartphone, Trophy, Sparkles, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import appLogo from "@/assets/logo.png";

/* ─── helpers ─── */
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const ctrl = animate(0, target, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.floor(v).toLocaleString("en-IN") + suffix;
      },
    });
    return () => ctrl.stop();
  }, [inView, target, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

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

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">
      {/* ════════ NAVBAR ════════ */}
      <nav
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5" : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-emerald-500/25 overflow-hidden">
              <Image
                src={appLogo}
                alt="Instructis"
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="text-xl font-extrabold tracking-tight">Instructis</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#institutes" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">For Institutes</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
            <Link href="/batches">
              <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:scale-105 transition-all duration-300">
                Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileNav(!mobileNav)}>
            {mobileNav ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileNav && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t px-6 py-4 flex flex-col gap-4"
          >
            <a href="#features" onClick={() => setMobileNav(false)} className="text-sm font-medium">Features</a>
            <a href="#institutes" onClick={() => setMobileNav(false)} className="text-sm font-medium">For Institutes</a>
            <a href="#pricing" onClick={() => setMobileNav(false)} className="text-sm font-medium">Pricing</a>
            <Link href="/batches" onClick={() => setMobileNav(false)}>
              <Button className="rounded-full bg-emerald-600 text-white w-full">Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </motion.div>
        )}
      </nav>

      {/* ════════ HERO ════════ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* mesh gradient bg */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-emerald-200/40 blur-[120px] animate-pulse" />
          <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-blue-200/30 blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-amber-100/30 blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-5 gap-12 items-center">
          {/* left */}
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

          {/* right – dashboard mockup */}
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

            {/* floating badges */}
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
      </section>

      {/* ════════ STATS BAR ════════ */}
      <SectionWrap className="bg-slate-900 py-14">
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
      </SectionWrap>

      {/* ════════ FEATURES ════════ */}
      <SectionWrap id="features" className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Features</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">Everything Your Institute Needs</h2>
            <p className="mt-4 text-slate-500 max-w-2xl mx-auto">One platform to manage marks, predict ranks, analyze performance, and keep parents informed.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Upload, title: "Bulk Marks Upload", desc: "Import from Excel or Google Sheets in seconds. Auto-calculate percentiles instantly.", color: "from-emerald-500 to-emerald-600" },
              { icon: Brain, title: "AI Rank Predictor", desc: "Predict JEE & NEET ranks using AI. Show students exactly where they stand and what to improve.", color: "from-blue-500 to-blue-600" },
              { icon: Search, title: "Per-Question Analysis", desc: "See which questions each student got wrong, with AI-generated explanations and correct solutions.", color: "from-violet-500 to-violet-600" },
              { icon: MessageSquare, title: "WhatsApp Notifications", desc: "Auto-send beautiful report cards to parents via WhatsApp the moment marks are saved.", color: "from-emerald-500 to-teal-600" },
              { icon: FileText, title: "Question Builder", desc: "Rich-text question creation with MCQ support, difficulty levels, and explanations — built for JEE/NEET.", color: "from-amber-500 to-orange-500" },
              { icon: BarChart3, title: "Performance Analytics", desc: "Track weak areas, improvement trends, and percentile bands for every student over time.", color: "from-pink-500 to-rose-500" },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-shadow duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}>
                </div>
                <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg", f.color)} style={{ boxShadow: "0 8px 20px -4px rgba(0,0,0,0.15)" }}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrap>

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

      {/* ════════ WHATSAPP SECTION ════════ */}
      <SectionWrap className="py-24 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Parents Stay Informed. Always.</h2>
            <p className="text-emerald-200 max-w-xl mx-auto mb-12">
              The moment marks are uploaded, parents receive a beautiful WhatsApp report card with JEE/NEET results, rank predictions, and focus areas.
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
            {["📤 Auto-sent on Mark Upload", "📊 Includes Rank Prediction", "🎯 Focus Areas Highlighted"].map((p) => (
              <span key={p} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 text-sm font-medium">{p}</span>
            ))}
          </motion.div>
        </div>
      </SectionWrap>

      {/* ════════ HOW IT WORKS ════════ */}
      <SectionWrap className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">How It Works</h2>
            <p className="mt-4 text-slate-500">Three simple steps to transform your coaching workflow.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* connecting line */}
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
      </SectionWrap>

      {/* ════════ TESTIMONIALS ════════ */}
      <SectionWrap className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Loved by Faculty Across India</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Ravi Verma", role: "HOD Physics, Apex Coaching, Kota", quote: "Instructis saved us 3 hours per test cycle. Parents love the WhatsApp reports and students take their weak areas seriously now." },
              { name: "Dr. Meena Sharma", role: "Director, Pinnacle Institute, Delhi", quote: "The AI rank predictor is shockingly accurate. Our students improved by 15 percentile points on average last semester." },
              { name: "Arjun Nair", role: "Faculty, Elite Academy, Hyderabad", quote: "Question analysis with step-by-step explanations means I spend less time correcting and more time teaching. Game changer." },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">&quot;{t.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                    {t.name.split(" ").map(w => w[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
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
            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-5">Ready to Transform Your Coaching Institute?</h2>
            <p className="text-slate-400 mb-10 text-lg">Join 500+ institutes using Instructis to track, predict, and improve student performance.</p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Link href="/batches">
                <Button size="lg" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-10 h-13 text-base shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-105 transition-all duration-300">
                  Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-full px-10 h-13 text-base border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
                Book a Demo
              </Button>
            </div>
            <p className="text-sm text-slate-500">No credit card required · Setup in 10 minutes · Free for small institutes</p>
          </motion.div>
        </div>
      </SectionWrap>

      {/* ════════ FOOTER ════════ */}
      <footer className="bg-slate-950 text-slate-400 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                  <Image
                    src={appLogo}
                    alt="Instructis"
                    className="h-7 w-7 object-contain"
                  />
                </div>
                <span className="text-lg font-extrabold text-white">Instructis</span>
              </div>
              <p className="text-sm leading-relaxed">Smarter coaching. Better results.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Connect</h4>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"><Twitter className="w-4 h-4" /></a>
                <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"><Linkedin className="w-4 h-4" /></a>
                <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"><MessageCircle className="w-4 h-4" /></a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-xs">
            © 2025 Instructis. Built for JEE & NEET coaching institutes in India.
          </div>
        </div>
      </footer>
    </div>
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
        <div className="bg-emerald-700 text-white px-4 py-2 flex items-center justify-between text-[10px]">
          <span className="font-semibold">Instructis</span>
          <span className="opacity-60">WhatsApp</span>
        </div>
        {/* chat */}
        <div className="bg-[#ECE5DD] p-3 space-y-2 min-h-[320px]">
          <div className="bg-white rounded-lg p-3 shadow-sm max-w-[220px] space-y-2">
            <p className="text-[10px] font-bold text-slate-800">📊 Instructis Report Card</p>
            <p className="text-[10px] text-slate-600">Student: <b>Rahul Sharma</b></p>
            <div className="flex gap-2">
              <div className="flex-1 bg-blue-50 border border-blue-200 rounded-md p-1.5 text-center">
                <p className="text-[9px] text-blue-600 font-semibold">JEE</p>
                <p className="text-sm font-extrabold text-blue-700">92.5%</p>
              </div>
              <div className="flex-1 bg-orange-50 border border-orange-200 rounded-md p-1.5 text-center">
                <p className="text-[9px] text-orange-600 font-semibold">NEET</p>
                <p className="text-sm font-extrabold text-orange-700">88.2%</p>
              </div>
            </div>
            <p className="text-[9px] text-emerald-700 font-semibold">📈 Improvement: +12 Points</p>
            <p className="text-[9px] text-slate-500">Focus: Thermodynamics, Electrostatics</p>
            <div className="flex gap-1.5">
              <span className="text-[8px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Practice Now</span>
              <span className="text-[8px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">View Full Report</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-400">10:32 AM ✓✓</span>
          </div>
        </div>
      </div>
    </div>
  );
}
