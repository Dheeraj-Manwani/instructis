"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const questions = [
  { q: "Which excites you more?", options: ["🚀 Designing rockets & software", "🩺 Saving lives & medical science"] },
  { q: "How do you learn best?", options: ["🏫 Classroom with peers", "💻 At my own pace online", "🔀 Mix of both"] },
  { q: "When are you taking the exam?", options: ["In 2 years (Class 11)", "Next year (Class 12)", "This year (Dropper)"] },
  { q: "Your biggest challenge?", options: ["Weak fundamentals", "Speed & accuracy", "Revision & retention", "Exam anxiety"] },
  { q: "Hours you can dedicate daily?", options: ["4–6 hours", "6–8 hours", "8+ hours"] }
];

export function QuizSection() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (idx: number) => {
    setAnswers({ ...answers, [currentQ]: idx });
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        setShowResult(true);
      }
    }, 400);
  };

  const getResult = () => {
    const target = answers[0] === 0 ? "JEE" : "NEET";
    let batch = "";
    if (answers[2] === 0) batch = target === "JEE" ? "NURTURE" : "FOUNDATION";
    else if (answers[2] === 1) batch = target === "JEE" ? "ENTHUSIAST" : "ACHIEVER";
    else batch = target === "JEE" ? "LEADER" : "CHAMPION";

    const mode = answers[1] === 0 ? "Classroom" : answers[1] === 1 ? "Online" : "Hybrid";
    const duration = answers[2] === 0 ? "2-year" : "1-year";

    return { target, batch, mode, duration };
  };

  const reset = () => {
    setCurrentQ(0);
    setAnswers({});
    setShowResult(false);
  };

  return (
    <section className="py-24 bg-gradient-to-br from-green-50 to-blue-50 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Find Your Perfect Path in 60 Seconds
          </h2>
          <p className="text-gray-600">Quick quiz — discover your ideal batch.</p>
        </div>

        <div className="bg-white shadow-2xl rounded-3xl p-8 md:p-12 relative overflow-hidden min-h-[400px]">
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key={`q-${currentQ}`}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Progress bar */}
                <div className="mb-8">
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: `${(currentQ / questions.length) * 100}%` }}
                      animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Step {currentQ + 1} of 5</p>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-8">{questions[currentQ].q}</h3>

                <div className="flex flex-col gap-3">
                  {questions[currentQ].options.map((opt, i) => {
                    const isSelected = answers[currentQ] === i;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelect(i)}
                        className={cn(
                          "w-full py-4 px-6 rounded-2xl border-2 text-left font-semibold transition-all duration-200",
                          isSelected
                            ? "bg-primary border-primary text-white scale-[1.02] shadow-lg shadow-primary/20"
                            : "bg-white border-gray-200 text-gray-700 hover:border-primary hover:bg-green-50 hover:text-primary"
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center"
              >
                {/* Confetti */}
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-sm bg-primary"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `-20px`,
                      animation: `fall ${1 + Math.random() * 2}s linear forwards`,
                      backgroundColor: ['#1a7a3c', '#3b82f6', '#f97316'][Math.floor(Math.random() * 3)]
                    }}
                  />
                ))}

                <div className="bg-gradient-to-br from-primary to-green-700 text-white rounded-3xl p-10 w-full shadow-xl">
                  <div className="text-6xl mb-6">🎯</div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">You're a perfect fit for</h3>
                  <h4 className="text-4xl md:text-5xl font-black text-yellow-300 mb-8 tracking-tight">{getResult().batch}</h4>

                  <div className="flex flex-wrap justify-center gap-3 mb-10">
                    <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-semibold">Target: {getResult().target}</span>
                    <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-semibold">Mode: {getResult().mode}</span>
                    <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-semibold">Duration: {getResult().duration}</span>
                  </div>

                  <button className="bg-white text-primary hover:bg-gray-50 font-bold py-4 px-8 rounded-xl w-full sm:w-auto transition-transform active:scale-95 shadow-xl mb-4">
                    View This Course →
                  </button>
                  <div className="mt-2">
                    <button onClick={reset} className="text-white/70 hover:text-white text-sm font-medium underline underline-offset-4">
                      Retake Quiz
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <style>{`
        @keyframes fall {
          to { transform: translateY(500px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
