"use client";

import { Sparkles } from "lucide-react";

export function Marquee() {
  const items = [
    "🎯 4/10 NEET Top Rankers",
    "🎯 4/10 JEE Top Rankers",
    "📚 35 Years of Excellence",
    "🏛️ 4 Centers Across India",
    "🚀 Flexible Learning Paths",
    "👨‍🎓 Over 24 Million Students Mentored",
    "🎓 90%+ Success Rate in Top Exams",

  ];

  return (
    <div className="bg-primary py-4 overflow-hidden flex border-y border-primary/40 dark:border-primary/30">
      <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite] w-max">
        {/* First set */}
        {items.map((item, index) => (
          <div key={index} className="flex items-center text-white font-bold px-8 text-lg md:text-xl tracking-wide">
            {item}
            <Sparkles className="w-5 h-5 mx-8 text-green-300 opacity-50" />
          </div>
        ))}
        {/* Duplicate set for seamless infinite scroll */}
        {items.map((item, index) => (
          <div key={`dup-${index}`} className="flex items-center text-white font-bold px-8 text-lg md:text-xl tracking-wide">
            {item}
            <Sparkles className="w-5 h-5 mx-8 text-green-300 opacity-50" />
          </div>
        ))}
        {/* Third set just to be safe on ultra-wide screens */}
        {items.map((item, index) => (
          <div key={`dup2-${index}`} className="flex items-center text-white font-bold px-8 text-lg md:text-xl tracking-wide">
            {item}
            <Sparkles className="w-5 h-5 mx-8 text-green-300 opacity-50" />
          </div>
        ))}
      </div>
    </div>
  );
}
