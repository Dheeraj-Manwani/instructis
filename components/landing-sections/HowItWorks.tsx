"use client";

import { useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { ScrollAnimate } from "@/components/motion/scroll-animate";

export function HowItWorks() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"]
  });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section id="how-it-works" className="py-24 bg-muted/35 dark:bg-muted/15" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollAnimate className="text-center max-w-3xl mx-auto mb-16" direction="up" duration={0.8}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-6">
            Your Learning, <span className="text-primary">Your Way</span>
          </h2>
        </ScrollAnimate>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {/* Cards */}
          <div className="bg-card text-card-foreground border border-border shadow-lg dark:bg-zinc-900/75 dark:border-zinc-700/80 dark:shadow-black/40 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 rounded-2xl p-8 flex flex-col">
            <div className="text-5xl mb-6">🏫</div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Classroom</h3>
            <p className="text-muted-foreground dark:text-zinc-300 mb-6 flex-1">Face-to-face learning at 50+ centers across India. Small batches, personal attention.</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-muted text-sm font-medium rounded-full text-foreground/90 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-1 dark:ring-zinc-600">Offline</span>
              <span className="px-3 py-1 bg-muted text-sm font-medium rounded-full text-foreground/90 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-1 dark:ring-zinc-600">Centers</span>
              <span className="px-3 py-1 bg-muted text-sm font-medium rounded-full text-foreground/90 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-1 dark:ring-zinc-600">Personal</span>
            </div>
          </div>

          <div className="bg-card text-card-foreground border border-border shadow-lg dark:bg-zinc-900/75 dark:border-zinc-700/80 dark:shadow-black/40 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 rounded-2xl p-8 flex flex-col">
            <div className="text-5xl mb-6">💻</div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Online Live</h3>
            <p className="text-muted-foreground dark:text-zinc-300 mb-6 flex-1">Live interactive sessions from home with real-time doubt solving and recordings.</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-muted text-sm font-medium rounded-full text-foreground/90 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-1 dark:ring-zinc-600">Live</span>
              <span className="px-3 py-1 bg-muted text-sm font-medium rounded-full text-foreground/90 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-1 dark:ring-zinc-600">Home</span>
              <span className="px-3 py-1 bg-muted text-sm font-medium rounded-full text-foreground/90 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-1 dark:ring-zinc-600">Recordings</span>
            </div>
          </div>

          <div className="bg-card text-card-foreground border border-border shadow-lg dark:bg-zinc-900/75 dark:border-zinc-700/80 dark:shadow-black/40 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 rounded-2xl p-8 flex flex-col">
            <div className="text-5xl mb-6">🔀</div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Hybrid</h3>
            <p className="text-muted-foreground dark:text-zinc-300 mb-6 flex-1">Best of both worlds — attend from anywhere, never miss a class.</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-muted text-sm font-medium rounded-full text-foreground/90 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-1 dark:ring-zinc-600">Flexible</span>
              <span className="px-3 py-1 bg-muted text-sm font-medium rounded-full text-foreground/90 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-1 dark:ring-zinc-600">Anywhere</span>
              <span className="px-3 py-1 bg-muted text-sm font-medium rounded-full text-foreground/90 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-1 dark:ring-zinc-600">Access</span>
            </div>
          </div>
        </div>



      </div>
    </section>
  );
}
