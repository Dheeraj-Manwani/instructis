"use client";

import { useEffect, useState } from "react";
import { Download, PlayCircle, Play } from "lucide-react";

export function ScholarshipResources() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // 30 days from now
    const targetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const resources = [
    { title: "Previous Year Papers", desc: "10+ years of solved papers with detailed solutions", icon: Download, action: "Download" },
    { title: "Free Video Lectures", desc: "200+ hours of free content by top faculty", icon: PlayCircle, action: "Watch" },
    { title: "Free Mock Test", desc: "Full syllabus mock test — no registration required", icon: Play, action: "Start" },
    { title: "Formula Sheets", desc: "Comprehensive cheat sheets for all chapters", icon: Download, action: "Download" },
  ];

  const targetDateStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <section className="bg-gradient-to-br from-[#1a7a3c] to-[#0d9488]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Column */}
          <div className="text-white">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold tracking-wide text-sm mb-6">
              ELITE Scholarship Test
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
              Earn up to 90% fee waiver on your course
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Next test: {targetDateStr}
            </p>

            <div className="flex gap-4 mb-10">
              {Object.entries(timeLeft).map(([label, value]) => (
                <div key={label} className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-dark-navy/40 backdrop-blur-lg border border-white/10 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-bold mb-2 shadow-lg">
                    {value.toString().padStart(2, '0')}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-white/80 uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>

            <button className="bg-white text-[#1a7a3c] hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:-translate-y-1 shadow-xl">
              Register for Free →
            </button>
          </div>

          {/* Right Column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {resources.map((res, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 shadow-lg cursor-pointer group">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <res.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-dark-navy text-lg mb-2">{res.title}</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2">{res.desc}</p>
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wide">
                  {res.action} <res.icon className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
