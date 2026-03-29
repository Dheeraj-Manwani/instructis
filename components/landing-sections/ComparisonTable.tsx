"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const features = [
  { name: "Faculty Qualification", icon: "🎓", Instructis: "IIT/AIIMS PhD ✅", allen: "Mixed ⚠️", aakash: "Mixed ⚠️", unacademy: "Varied ⚠️", pw: "Varied ⚠️" },
  { name: "Doubt Resolution Time", icon: "⏱️", Instructis: "< 2 hrs ✅", allen: "24 hrs ⚠️", aakash: "24-48 hrs ❌", unacademy: "Variable ⚠️", pw: "Varies ⚠️" },
  { name: "Personalized Study Plan", icon: "📊", Instructis: "AI-powered ✅", allen: "Generic ⚠️", aakash: "Generic ⚠️", unacademy: "Partial ⚠️", pw: "None ❌" },
  { name: "AI-Powered Analytics", icon: "🤖", Instructis: "Full ✅", allen: "None ❌", aakash: "None ❌", unacademy: "Partial ⚠️", pw: "Basic ⚠️" },
  { name: "Physical Centers", icon: "🏛️", Instructis: "50+ ✅", allen: "100+ ✅", aakash: "200+ ✅", unacademy: "Online only ❌", pw: "Online only ❌" },
  { name: "Hybrid Mode", icon: "🔀", Instructis: "Yes ✅", allen: "Limited ⚠️", aakash: "Yes ✅", unacademy: "Yes ✅", pw: "Yes ✅" },
  { name: "Scholarship Tests", icon: "🏆", Instructis: "Monthly ✅", allen: "Yearly ⚠️", aakash: "Yearly ⚠️", unacademy: "None ❌", pw: "None ❌" },
  { name: "Parent Dashboard", icon: "👨‍👩‍👦", Instructis: "Full ✅", allen: "Basic ⚠️", aakash: "Basic ⚠️", unacademy: "None ❌", pw: "None ❌" },
  { name: "Mock Test Frequency", icon: "📝", Instructis: "Weekly ✅", allen: "Monthly ⚠️", aakash: "Bi-weekly ⚠️", unacademy: "On-demand ✅", pw: "On-demand ✅" },
  { name: "24x7 Support", icon: "📞", Instructis: "Yes ✅", allen: "No ❌", aakash: "No ❌", unacademy: "Chat only ⚠️", pw: "Chat only ⚠️" },
  { name: "Success Rate", icon: "📈", Instructis: "95% ✅", allen: "Not disclosed ❌", aakash: "Not disclosed ❌", unacademy: "Not disclosed ❌", pw: "Not disclosed ❌" },
  { name: "Satisfaction Score", icon: "⭐", Instructis: "4.8/5 ✅", allen: "4.2/5 ⚠️", aakash: "4.1/5 ⚠️", unacademy: "3.9/5 ❌", pw: "4.0/5 ⚠️" }
];

export function ComparisonTable() {
  const formatCell = (val: string) => {
    if (val.includes("✅")) return <span className="text-green-600 font-medium">{val}</span>;
    if (val.includes("⚠️")) return <span className="text-yellow-600 font-medium">{val}</span>;
    if (val.includes("❌")) return <span className="text-red-500 font-medium">{val}</span>;
    return val;
  };

  return (
    <section className="py-24 bg-gray-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-dark-navy mb-4">
            Why Students Choose <span className="text-primary">Instructis</span> Over the Rest
          </h2>
          <p className="text-gray-600 text-lg">An honest look. No marketing fluff.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-5 px-6 font-bold text-gray-700 bg-white border-b-2 border-gray-200 w-[220px]">Features</th>
                  <th className="py-5 px-6 font-bold text-primary bg-green-50 border-b-2 border-green-200 relative w-[160px] text-center">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] uppercase font-black tracking-wider px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                      ⭐ Best Choice
                    </div>
                    Instructis
                  </th>
                  <th className="py-5 px-6 font-bold text-gray-500 bg-white border-b-2 border-gray-200 text-center">Allen</th>
                  <th className="py-5 px-6 font-bold text-gray-500 bg-white border-b-2 border-gray-200 text-center">Aakash</th>
                  <th className="py-5 px-6 font-bold text-gray-500 bg-white border-b-2 border-gray-200 text-center">Unacademy</th>
                  <th className="py-5 px-6 font-bold text-gray-500 bg-white border-b-2 border-gray-200 text-center">Physics Wallah</th>
                </tr>
              </thead>
              <tbody>
                {features.map((f, i) => (
                  <motion.tr
                    key={f.name}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(i % 2 === 0 ? "bg-white" : "bg-gray-50", "border-b border-gray-100 hover:bg-gray-100/50 transition-colors")}
                  >
                    <td className="py-4 px-6 text-sm font-semibold text-gray-700 flex items-center gap-3">
                      <span className="text-lg">{f.icon}</span> {f.name}
                    </td>
                    <td className="py-4 px-6 text-sm text-center bg-green-50/50 border-x border-green-100 font-bold relative overflow-hidden group">
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-green-200/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                      {formatCell(f.Instructis)}
                    </td>
                    <td className="py-4 px-6 text-sm text-center text-gray-600">{formatCell(f.allen)}</td>
                    <td className="py-4 px-6 text-sm text-center text-gray-600">{formatCell(f.aakash)}</td>
                    <td className="py-4 px-6 text-sm text-center text-gray-600">{formatCell(f.unacademy)}</td>
                    <td className="py-4 px-6 text-sm text-center text-gray-600">{formatCell(f.pw)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Based on publicly available information and student surveys. Last updated March 2025.
        </p>
      </div>
    </section>
  );
}
