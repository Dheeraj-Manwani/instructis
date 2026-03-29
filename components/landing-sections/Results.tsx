"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { Award, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollAnimate } from "@/components/motion/scroll-animate";

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" as const },
  },
};

type Topper = {
  id: number;
  name: string;
  rank: string;
  exam: string;
  score: string;
  quote: string;
  img: string;
};

const toppersByYear: Record<string, Topper[]> = {
  "2025": [
    { id: 1, name: "Rahul Verma", rank: "AIR 1", exam: "JEE Advanced", score: "348/360", quote: "The structured approach and competitive environment pushed me to my absolute limits.", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop" },
    { id: 2, name: "Priya Sharma", rank: "AIR 1", exam: "NEET UG", score: "720/720", quote: "Instructis's biology modules are magical. They made NCERT feel like a storybook.", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop" },
    { id: 3, name: "Amit Kumar", rank: "AIR 3", exam: "JEE Advanced", score: "342/360", quote: "Doubt solving under 2 hours meant my prep never stopped.", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop" },
    { id: 4, name: "Sneha Reddy", rank: "AIR 4", exam: "NEET UG", score: "715/720", quote: "The mock tests were exactly like the real paper. I felt no stress on exam day.", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop" },
  ],
  "2024": [
    { id: 5, name: "Vikram Singh", rank: "AIR 8", exam: "JEE Advanced", score: "338/360", quote: "Faculty mentorship kept me grounded during the tough months.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" },
    { id: 6, name: "Ananya Patel", rank: "AIR 10", exam: "NEET UG", score: "710/720", quote: "The study material is so precise, you don't need to look anywhere else.", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop" },
    { id: 7, name: "Rohan Das", rank: "AIR 15", exam: "JEE Main", score: "99.99%ile", quote: "The online portal analytics showed exactly where I was losing marks.", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop" },
    { id: 8, name: "Kriti Jain", rank: "AIR 22", exam: "NEET UG", score: "705/720", quote: "Best decision of my life was joining the dropper batch here.", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop" },
  ],
  "2023": [
    { id: 9, name: "Arnav Mehta", rank: "AIR 19", exam: "JEE Advanced", score: "334/360", quote: "The revision strategy and weekly testing rhythm gave me full confidence before exam day.", img: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=400&h=400&fit=crop" },
    { id: 10, name: "Riya Nambiar", rank: "AIR 11", exam: "NEET UG", score: "709/720", quote: "Subject mentors were always available and the doubt support felt truly personal.", img: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop" },
    { id: 11, name: "Karan Batra", rank: "AIR 31", exam: "JEE Main", score: "99.96%ile", quote: "The analysis dashboard showed exactly what to fix, and that changed my final result.", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&h=400&fit=crop" },
    { id: 12, name: "Megha Iyer", rank: "AIR 27", exam: "NEET UG", score: "702/720", quote: "Consistent mocks and faculty feedback helped me convert effort into a top rank.", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop" },
  ],
};

export function Results() {
  const [year, setYear] = useState("2025");
  const gridRef = useRef(null);
  const gridInView = useInView(gridRef, { once: true, margin: "-50px" });
  const activeToppers = toppersByYear[year] ?? [];

  return (
    <section id="results" className="py-24 bg-dark-navy relative overflow-hidden">
      {/* CSS Starfield effect placeholder via radial gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-900/20 via-dark-navy to-dark-navy" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollAnimate className="text-center max-w-3xl mx-auto mb-16" direction="up" duration={0.8}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6">
            Our Champions <span className="text-gradient-gold">Speak</span>
          </h2>
          <p className="text-white/75 text-lg">
            Creating history every year. Witness the brilliance of our top performers.
          </p>
        </ScrollAnimate>

        {/* Filters */}
        <ScrollAnimate className="flex justify-center gap-4 mb-12" direction="up" delay={0.1} duration={0.8}>
          {["2025", "2024", "2023"].map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              aria-pressed={year === y}
              className={cn(
                "px-6 py-2 rounded-full font-bold transition-all duration-300 border",
                year === y 
                  ? "bg-linear-to-r from-amber-400 to-amber-600 text-dark-navy border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-105" 
                  : "bg-white/10 text-white/80 border-white/15 hover:bg-white/20 hover:text-white"
              )}
            >
              {y}
            </button>
          ))}
        </ScrollAnimate>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={year}
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
          >
            {activeToppers.map((topper) => (
              <motion.div
                key={`${year}-${topper.id}`}
                variants={staggerItem}
                className="relative group bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all duration-300 overflow-hidden"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer pointer-events-none" />

                <div className="flex items-start justify-between mb-6">
                  <div className="relative">
                    <img
                      src={topper.img}
                      alt={topper.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-amber-400"
                    />
                    {topper.rank.includes("1") && (
                      <div className="absolute -bottom-2 -right-2 bg-amber-400 p-1.5 rounded-full text-dark-navy shadow-lg">
                        <Award className="w-4 h-4 fill-dark-navy" />
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-xs font-black uppercase tracking-wider px-2 py-1 rounded-md mb-1 inline-block",
                      topper.exam.includes("JEE") ? "bg-jee/20 text-jee" : "bg-neet/20 text-neet"
                    )}>
                      {topper.exam}
                    </div>
                    <div className="text-amber-400 font-black text-xl font-mono">{topper.rank}</div>
                  </div>
                </div>

                <h4 className="text-white font-bold text-lg mb-1">{topper.name}</h4>
                <p className="text-gray-400 text-sm font-mono mb-4">Score: {topper.score}</p>

                <div className="relative">
                  <span className="absolute -top-2 -left-2 text-4xl text-white/10 font-serif">"</span>
                  <p className="text-gray-300 text-sm italic relative z-10 pl-2 leading-relaxed">
                    {topper.quote}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
        
        <div className="mt-12 text-center">
          <button className="text-amber-400 font-bold hover:text-amber-300 transition-colors inline-flex items-center gap-2">
            View All Results {year} <Star className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </section>
  );
}
