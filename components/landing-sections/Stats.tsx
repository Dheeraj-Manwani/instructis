"use client";

import { animate, motion, useInView, useMotionValue, useMotionValueEvent, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Trophy, GraduationCap, Rocket, HeartHandshake } from "lucide-react";
import { ScrollAnimate } from "@/components/motion/scroll-animate";
import { cn } from "@/lib/utils";

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function AnimatedStatValue({
  value,
  inView,
  format,
}: {
  value: number;
  inView: boolean;
  format?: (num: number) => string;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(format ? format(0) : "0");

  useMotionValueEvent(rounded, "change", (latest) => {
    setDisplayValue(format ? format(latest) : String(latest));
  });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, value, { duration: 2, ease: "easeOut" });
    return () => controls.stop();
  }, [count, inView, value]);

  return <span>{displayValue}</span>;
}

export function Stats() {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(gridRef, { once: true, margin: "-60px" });

  const stats = [
    {
      icon: Trophy,
      value: 35,
      suffix: "+",
      label: "Years of Excellence",
      blobColor: "from-primary/20 to-transparent",
      iconColor: "from-primary to-primary/80",
      iconGlow: "shadow-primary/40",
      suffixColor: "text-primary",
    },
    {
      icon: GraduationCap,
      value: 24,
      suffix: "M+",
      label: "Students Trained",
      blobColor: "from-jee/20 to-transparent",
      iconColor: "from-jee to-blue-500",
      iconGlow: "shadow-jee/40",
      suffixColor: "text-jee",
    },
    {
      icon: Rocket,
      value: 9689,
      suffix: "",
      label: "JEE Advanced Qualifiers 2025",
      blobColor: "from-neet/20 to-transparent",
      iconColor: "from-neet to-orange-500",
      iconGlow: "shadow-neet/40",
      suffixColor: "text-neet",
      format: (num: number) => num.toLocaleString(),
    },
    {
      icon: HeartHandshake,
      value: 98,
      suffix: "%",
      label: "Students Recommend Us",
      blobColor: "from-amber-500/20 to-transparent",
      iconColor: "from-amber-500 to-amber-400",
      iconGlow: "shadow-amber-500/40",
      suffixColor: "text-amber-400",
    },
  ];

  return (
    <section id="stats" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollAnimate className="text-center max-w-3xl mx-auto mb-16" direction="up" duration={0.8}>
          <h2 className="text-primary font-bold tracking-wider uppercase mb-3">By The Numbers</h2>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-6">
            A Legacy of <span className="text-gradient-gold">Unmatched Results</span>
          </h3>
          <p className="text-muted-foreground text-lg">
            Numbers that speak louder than words. We don't just teach; we engineer success stories year after year.
          </p>
        </ScrollAnimate>

        <motion.div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={cardVariant}
              className={cn(
                "relative overflow-hidden rounded-3xl p-8 min-h-[290px]",
                "bg-white dark:bg-slate-900",
                "border border-slate-200 dark:border-slate-800",
                "shadow-xl shadow-slate-200/70 dark:shadow-2xl dark:shadow-black/20",
                "group cursor-default hover:-translate-y-1 transition-all duration-300",
                "flex flex-col justify-between"
              )}
            >
              <div
                className={cn(
                  "absolute -top-8 -right-8 w-40 h-40 rounded-full bg-linear-to-br blur-2xl opacity-60",
                  "group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 pointer-events-none",
                  "dark:opacity-60 opacity-50",
                  stat.blobColor
                )}
              />
              <div
                className={cn(
                  "mb-6 w-14 h-14 rounded-2xl flex items-center justify-center bg-linear-to-br shadow-lg",
                  stat.iconColor,
                  stat.iconGlow
                )}
              >
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <div className="font-mono text-6xl font-black mb-2 bg-linear-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent leading-none">
                <AnimatedStatValue value={stat.value} inView={isInView} format={stat.format} />
                {stat.suffix && (
                  <span className={cn("text-5xl", stat.suffixColor)}>
                    {stat.suffix}
                  </span>
                )}
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium text-base leading-snug mt-1">
                {stat.label}
              </p>
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  stat.blobColor
                )}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
