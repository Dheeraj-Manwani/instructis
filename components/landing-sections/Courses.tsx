"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollAnimate } from "@/components/motion/scroll-animate";

const coursesData = {
  JEE: [
    {
      name: "NURTURE",
      target: "Class 11",
      duration: "2 Years",
      mode: "Classroom / Online",
      description: "Build a strong foundation early. Ideal for students starting class 11.",
      successRate: 92,
      color: "bg-jee"
    },
    {
      name: "ENTHUSIAST",
      target: "Class 12",
      duration: "1 Year",
      mode: "Classroom / Online",
      description: "Fast-paced comprehensive coverage of 11th & 12th syllabus.",
      successRate: 88,
      color: "bg-jee"
    },
    {
      name: "LEADER",
      target: "12th Pass / Dropper",
      duration: "1 Year",
      mode: "Classroom / Hybrid",
      description: "Intensive preparation program focused purely on rank boosting.",
      successRate: 95,
      color: "bg-jee"
    }
  ],
  NEET: [
    {
      name: "FOUNDATION",
      target: "Class 11",
      duration: "2 Years",
      mode: "Classroom / Online",
      description: "In-depth NCERT coverage with rigorous MCQ practice for Biology.",
      successRate: 94,
      color: "bg-neet"
    },
    {
      name: "ACHIEVER",
      target: "Class 12",
      duration: "1 Year",
      mode: "Classroom / Online",
      description: "Board exams + NEET preparation handled seamlessly together.",
      successRate: 89,
      color: "bg-neet"
    },
    {
      name: "CHAMPION",
      target: "12th Pass / Dropper",
      duration: "1 Year",
      mode: "Classroom / Hybrid",
      description: "Aggressive test series and doubt solving for maximum marks.",
      successRate: 97,
      color: "bg-neet"
    }
  ]
};

export function Courses() {
  const [activeTab, setActiveTab] = useState<"JEE" | "NEET">("JEE");

  return (
    <section
      id="courses"
      className="py-24 relative overflow-hidden bg-muted/40 dark:bg-[#111827] dark:border-y dark:border-white/5"
    >
      {/* Decorative background layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(45,122,58,0.14),transparent_40%),radial-gradient(circle_at_90%_15%,rgba(14,165,233,0.12),transparent_36%),radial-gradient(circle_at_60%_100%,rgba(249,115,22,0.08),transparent_42%)] dark:opacity-100 opacity-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03),rgba(255,255,255,0))] dark:opacity-100 opacity-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-size-[28px_28px] dark:opacity-40 opacity-0 pointer-events-none" />
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollAnimate className="text-center max-w-3xl mx-auto mb-16" direction="up" duration={0.8}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-6">
            Choose Your Path to <span className="text-primary">Success</span>
          </h2>
          <p className="text-muted-foreground dark:text-zinc-300 text-lg">
            Meticulously designed programs tailored to your current academic stage and target examination.
          </p>
        </ScrollAnimate>

        {/* Custom Tabs */}
        <ScrollAnimate className="flex justify-center mb-16" direction="up" delay={0.1} duration={0.8}>
          <div className="flex p-1.5 rounded-2xl backdrop-blur-sm relative border shadow-sm bg-muted/90 border-border/60 dark:bg-zinc-900/95 dark:border-zinc-700/80 dark:shadow-black/40">
            {(["JEE", "NEET"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative px-8 py-3.5 rounded-xl font-bold text-lg transition-colors z-10 w-40",
                  activeTab === tab
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground dark:text-zinc-300 dark:hover:text-zinc-100"
                )}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="active-tab"
                    className={cn(
                      "absolute inset-0 rounded-xl -z-10 shadow-md",
                      tab === "JEE" ? "bg-jee" : "bg-neet"
                    )}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {tab} Courses
              </button>
            ))}
          </div>
        </ScrollAnimate>

        {/* Course Cards */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, staggerChildren: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {coursesData[activeTab].map((course, index) => (
                <motion.div
                  key={course.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-3xl overflow-hidden shadow-lg border border-border hover:shadow-2xl dark:border-zinc-700/70 dark:bg-zinc-900/40 dark:backdrop-blur-sm dark:shadow-black/50 hover:-translate-y-2 transition-all duration-300 group flex flex-col h-full"
                >
                  <div className={cn("p-6 text-white relative overflow-hidden", course.color)}>
                    {/* Decorative pattern inside header */}
                    <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] bg-size-[20px_20px]" />
                    <h3 className="text-2xl font-black mb-1 relative z-10">{course.name}</h3>
                    <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold relative z-10">
                      {course.target}
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col dark:bg-zinc-950/50">
                    <p className="text-muted-foreground dark:text-zinc-300 mb-6 flex-1 leading-relaxed">
                      {course.description}
                    </p>

                    <ul className="space-y-4 mb-8">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className={cn("w-5 h-5 mt-0.5 shrink-0", activeTab === "JEE" ? "text-jee" : "text-neet")} />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground dark:text-zinc-400">Duration</p>
                          <p className="font-bold text-foreground">{course.duration}</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className={cn("w-5 h-5 mt-0.5 shrink-0", activeTab === "JEE" ? "text-jee" : "text-neet")} />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground dark:text-zinc-400">Mode</p>
                          <p className="font-bold text-foreground">{course.mode}</p>
                        </div>
                      </li>
                    </ul>

                    {/* Progress Bar */}
                    <div className="mb-8">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-foreground/90 dark:text-zinc-200">Past Success Rate</span>
                        <span className="font-bold text-foreground">{course.successRate}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-muted dark:bg-zinc-800/90 ring-1 ring-inset ring-black/5 dark:ring-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${course.successRate}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={cn("h-full rounded-full", course.color)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-auto">
                      <a
                        href="#callback"
                        className={cn(
                          "flex-1 py-3.5 rounded-xl font-bold text-white transition-transform active:scale-95 shadow-lg text-center",
                          activeTab === "JEE" ? "bg-jee hover:bg-blue-600 shadow-jee/30" : "bg-neet hover:bg-orange-600 shadow-neet/30"
                        )}
                      >
                        Enroll Now
                      </a>
                      <a
                        href="#callback"
                        className="p-3.5 rounded-xl border-2 border-border text-muted-foreground hover:border-primary hover:text-foreground transition-colors inline-flex items-center justify-center"
                        aria-label="Continue to enrollment"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Banner */}
        <ScrollAnimate className="mt-16 text-center" direction="up" duration={0.8}>
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-card py-4 px-8 rounded-full shadow-lg border border-border dark:border-zinc-700/70 dark:bg-zinc-900/60 dark:shadow-black/30">
            <span className="text-foreground/90 dark:text-zinc-200 font-medium">Not sure which course is right for you?</span>
            <a href="#callback" className="text-primary font-bold hover:underline flex items-center gap-2">
              Request a Free Callback <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </ScrollAnimate>
      </div>
    </section>
  );
}
