"use client";

import CountUp from "react-countup";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Trophy, GraduationCap, Rocket, HeartHandshake } from "lucide-react";
import { ScrollAnimate } from "@/components/motion/scroll-animate";
import { cn } from "@/lib/utils";

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

export function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const stats = [
    {
      icon: <Trophy className="w-10 h-10 text-primary" />,
      value: 35,
      suffix: "+",
      label: "Years of Excellence",
      color: "border-primary"
    },
    {
      icon: <GraduationCap className="w-10 h-10 text-jee" />,
      value: 500,
      suffix: "K+",
      label: "Students Trained",
      color: "border-jee"
    },
    {
      icon: <Rocket className="w-10 h-10 text-neet" />,
      value: 9689,
      suffix: "",
      separator: ",",
      label: "JEE Advanced Qualifiers 2025",
      color: "border-neet"
    },
    {
      icon: <HeartHandshake className="w-10 h-10 text-amber-500" />,
      value: 98,
      suffix: "%",
      label: "Students Recommend Us",
      color: "border-amber-500"
    }
  ];

  return (
    <section id="stats" className="py-24 bg-background" ref={ref}>
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={staggerItem}
              className={cn(
                "bg-card rounded-2xl p-8 shadow-lg ring-1 ring-border/60 dark:ring-border border-t-4",
                stat.color,
                "hover:-translate-y-2 hover:shadow-xl dark:shadow-black/25 transition-all duration-300 flex flex-col items-center text-center group"
              )}
            >
              <div className="mb-6 p-4 rounded-full bg-muted/60 group-hover:bg-muted transition-colors">
                {stat.icon}
              </div>
              <div className="font-mono text-5xl font-extrabold text-foreground mb-2">
                {isInView ? (
                  <CountUp
                    end={stat.value}
                    duration={2.5}
                    separator={stat.separator || ""}
                    useEasing={true}
                  />
                ) : "0"}
                <span className="text-primary">{stat.suffix}</span>
              </div>
              <p className="text-muted-foreground font-medium text-lg leading-snug">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
