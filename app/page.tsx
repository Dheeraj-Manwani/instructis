"use client";

import { useEffect, useState } from "react";

import { Navbar } from "@/components/landing-sections/Navbar";
import { Hero } from "@/components/landing-sections/Hero";
import { Marquee } from "@/components/landing-sections/Marquee";
import { Stats } from "@/components/landing-sections/Stats";
import { Courses } from "@/components/landing-sections/Courses";
import { QuizSection } from "@/components/landing-sections/QuizSection";
import { Results } from "@/components/landing-sections/Results";
import { WhyUs } from "@/components/landing-sections/WhyUs";
import { Faculty } from "@/components/landing-sections/Faculty";
import { HowItWorks } from "@/components/landing-sections/HowItWorks";
import { BookDemo } from "@/components/landing-sections/BookDemo";
import { Testimonials } from "@/components/landing-sections/Testimonials";
import { ParentsCorner } from "@/components/landing-sections/ParentsCorner";
import { ScholarshipResources } from "@/components/landing-sections/ScholarshipResources";
import { ComparisonTable } from "@/components/landing-sections/ComparisonTable";
import { CentersMap } from "@/components/landing-sections/CentersMap";
import { NewsMedia } from "@/components/landing-sections/NewsMedia";
import { MobileApp } from "@/components/landing-sections/MobileApp";
import { FAQ } from "@/components/landing-sections/FAQ";
import { Callback } from "@/components/landing-sections/Callback";
import { Footer } from "@/components/landing-sections/Footer";
import { ArrowUp } from "lucide-react";

export default function LandingPage() {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary-foreground overflow-x-hidden">
      <Navbar />

      <main>
        <Hero />
        <Marquee />
        <Stats />
        <Courses />
        {/* <QuizSection /> */}
        <Results />
        <WhyUs />
        <Faculty />
        <HowItWorks />
        {/* <BookDemo /> */}
        <Testimonials />
        {/* <ParentsCorner /> */}
        {/* <ScholarshipResources /> */}
        {/* <ComparisonTable /> */}
        <CentersMap />
        {/* <NewsMedia /> */}
        {/* <MobileApp /> */}
        <FAQ />
        <Callback />
      </main>

      <Footer />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 items-end pointer-events-none">
        {/* Scroll to Top */}
        <button
          onClick={scrollToTop}
          className={`pointer-events-auto p-3 rounded-full bg-card text-foreground shadow-lg border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:shadow-black/30 ${showTopBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
