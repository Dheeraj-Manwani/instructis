"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const jeeFaqs = [
  { q: "What courses do you offer for JEE preparation?", a: "We offer three comprehensive JEE programs: NURTURE (2-year for Class 11), ENTHUSIAST (1-year for Class 12), and LEADER (intensive dropper batch). All include classroom, online, and hybrid modes." },
  { q: "Is online coaching as effective as classroom learning?", a: "Absolutely! Our live online sessions are fully interactive with real-time Q&A, doubt resolution, and recorded sessions. Our online students consistently match classroom results." },
  { q: "How are doubt-clearing sessions conducted?", a: "We offer both live doubt sessions (scheduled) and an on-demand doubt chat system. Our guarantee: every doubt resolved within 2 hours." },
  { q: "What is the fee structure for JEE courses?", a: "Fees vary by program and mode. NURTURE starts from ₹1.2L/year, ENTHUSIAST from ₹90K, LEADER from ₹80K. Scholarship students get up to 90% waiver." },
  { q: "Are scholarships available for meritorious students?", a: "Yes! Our ELITE Scholarship Test is held every month. Top scorers get 50-90% fee waiver. Apply for the next test — it's completely free to register." },
  { q: "Can I switch from online mode to classroom?", a: "Yes, mode switching is allowed once per academic year. Just inform your academic coordinator 2 weeks in advance." },
];

const neetFaqs = [
  { q: "What NEET preparation courses do you offer?", a: "We offer FOUNDATION (2-year Class 11), ACHIEVER (1-year Class 12), and CHAMPION (intensive dropper) programs, all tailored for NEET-UG success." },
  { q: "How do you prepare students for the NEET exam pattern?", a: "Daily MCQ practice, weekly full-length mocks in exact NEET pattern, and chapter-wise NCERT drills form the core of our NEET methodology." },
  { q: "What is the quality of Biology coaching?", a: "Our Biology faculty includes AIIMS alumni who teach both conceptual clarity and NCERT line-by-line coverage — crucial for NEET top scores." },
  { q: "Is there a special repeater/dropper program for NEET?", a: "Yes, our CHAMPION batch is specifically for NEET repeaters. It focuses on gap analysis, rapid revision, and mock-based improvement." },
  { q: "Do you offer an online test series for NEET?", a: "Yes! Our NEET Online Test Series includes 50+ full-length mocks, 500+ chapter tests, and detailed solutions with video explanations." },
  { q: "What is your NEET success rate?", a: "In NEET 2025, 6 of India's top 10 rankers studied at Instructis. Our overall NEET selection rate is above 91% for enrolled students." },
];

function FaqItem({ q, a, isOpen, onClick }: { q: string, a: string, isOpen: boolean, onClick: () => void }) {
  return (
    <div
      className={cn(
        "border-b border-border py-5 transition-colors cursor-pointer group",
        isOpen ? "bg-primary/10 dark:bg-primary/15 rounded-r-lg border-l-4 border-l-primary pl-4 pr-4 -ml-[4px]" : "hover:bg-muted/60 hover:text-primary dark:hover:bg-primary/10 px-2 rounded-lg"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-center gap-4">
        <h4 className={cn("font-semibold text-left transition-colors", isOpen ? "text-primary" : "text-foreground group-hover:text-primary")}>
          {q}
        </h4>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          className={cn("shrink-0 transition-colors", isOpen ? "text-primary" : "text-muted-foreground group-hover:text-primary")}
        >
          <Plus className="w-5 h-5" />
        </motion.div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="text-muted-foreground leading-relaxed pt-3 pb-1 pr-8">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <section id="faq" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about Instructis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          <div>
            <h3 className="text-2xl font-bold text-jee mb-6 border-b-2 border-jee/20 pb-2 inline-block">JEE FAQs</h3>
            <div className="flex flex-col gap-1">
              {jeeFaqs.map((faq, i) => (
                <FaqItem
                  key={`jee-${i}`}
                  q={faq.q}
                  a={faq.a}
                  isOpen={openIndex === `jee-${i}`}
                  onClick={() => toggle(`jee-${i}`)}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-neet mb-6 border-b-2 border-neet/20 pb-2 inline-block">NEET FAQs</h3>
            <div className="flex flex-col gap-1">
              {neetFaqs.map((faq, i) => (
                <FaqItem
                  key={`neet-${i}`}
                  q={faq.q}
                  a={faq.a}
                  isOpen={openIndex === `neet-${i}`}
                  onClick={() => toggle(`neet-${i}`)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
