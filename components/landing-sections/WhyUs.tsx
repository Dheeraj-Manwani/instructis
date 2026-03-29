"use client";

import { motion } from "motion/react";
import { ScrollAnimate } from "@/components/motion/scroll-animate";
import { Brain, Users, LineChart, FileText, Clock, Trophy } from "lucide-react";

export function WhyUs() {
  const usps = [
    { icon: Brain, title: "AI-Powered Personalized Learning", desc: "Adaptive algorithms that identify weak spots and generate custom practice paths." },
    { icon: Users, title: "Faculty from IITs & AIIMS", desc: "Learn directly from top rankers who have mastered the exams you are preparing for." },
    { icon: LineChart, title: "Weekly Performance Analytics", desc: "Deep dive insights into speed, accuracy, and subject-wise stamina." },
    { icon: FileText, title: "5000+ Chapter-wise Questions", desc: "Exhaustive question banks strictly adhering to the latest NTA patterns." },
    { icon: Clock, title: "Doubt Resolution < 2 Hours", desc: "24/7 dedicated doubt solving portal connecting you to subject experts instantly." },
    { icon: Trophy, title: "Scholarship Tests", desc: "We believe finances shouldn't stop talent. Up to 90% scholarships available." },
  ];

  return (
    <section id="about" className="py-24 bg-green-50/90 dark:bg-green-950/25 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Column - Image & Floating Cards */}
          <ScrollAnimate className="relative" direction="left" duration={0.8}>
            <div className="rounded-3xl overflow-hidden shadow-2xl relative z-10 border-8 border-background">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=900&fit=crop"
                alt="Students studying"
                className="w-full h-[600px] object-cover"
              />
              {/* <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" /> */}
            </div>

            {/* Floating Card 1 */}
            <div className="absolute -top-8 -left-8 bg-card text-card-foreground p-6 rounded-2xl shadow-xl border border-border z-20 animate-[float_6s_ease-in-out_infinite]">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 dark:bg-orange-950/50 p-3 rounded-full">
                  <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-3xl font-black text-foreground">200+</p>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Expert Faculty</p>
                </div>
              </div>
            </div>

            {/* Floating Card 2 */}
            <div className="absolute -bottom-8 -right-8 bg-card text-card-foreground p-6 rounded-2xl shadow-xl border border-border z-20 animate-[float_6s_ease-in-out_3s_infinite]">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-950/50 p-3 rounded-full">
                  <Trophy className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-3xl font-black text-foreground">98%</p>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Background decorative dots */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(#1a7a3c_2px,transparent_2px)] [background-size:24px_24px] opacity-10 dark:opacity-[0.07] -z-10" />
          </ScrollAnimate>

          {/* Right Column - Content */}
          <div>
            <ScrollAnimate className="mb-10" direction="up" duration={0.8}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-6">
                The Instructis <span className="text-primary">Advantage</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                We go beyond traditional teaching. Our ecosystem is built to guarantee your success.
              </p>
            </ScrollAnimate>

            <div className="space-y-6">
              {usps.map((usp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="flex gap-4 group cursor-default"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 bg-card rounded-xl shadow-sm border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:scale-110 transition-all duration-300">
                      <usp.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{usp.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{usp.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
