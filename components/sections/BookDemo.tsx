"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Calendar, User, Phone, CheckCircle2 } from "lucide-react";

const demoSlots = [
  { date: "Sat, Apr 5", time: "10:00 AM – 11:30 AM", subject: "Physics", topic: "Newton's Laws Deep Dive", faculty: "Dr. Rajesh S.", mode: "Online", seats: 12, color: "bg-purple-100 text-purple-700" },
  { date: "Sun, Apr 6", time: "2:00 PM – 3:30 PM", subject: "Chemistry", topic: "Organic Chemistry Mastery", faculty: "Prof. Anita K.", mode: "Offline", seats: 8, color: "bg-orange-100 text-orange-700" },
  { date: "Sat, Apr 12", time: "10:00 AM – 11:30 AM", subject: "Biology", topic: "Cell Biology for NEET", faculty: "Dr. Priya M.", mode: "Online", seats: 23, color: "bg-green-100 text-green-700" },
  { date: "Sun, Apr 13", time: "11:00 AM – 12:30 PM", subject: "Maths", topic: "Calculus: Limits & Derivatives", faculty: "Prof. Sanjay R.", mode: "Online", seats: 17, color: "bg-blue-100 text-blue-700" },
  { date: "Sat, Apr 19", time: "10:00 AM – 11:30 AM", subject: "Physics", topic: "Electromagnetism Shortcuts", faculty: "Dr. Vikram P.", mode: "Offline", seats: 5, color: "bg-purple-100 text-purple-700" },
  { date: "Sun, Apr 20", time: "3:00 PM – 4:30 PM", subject: "Chemistry", topic: "Inorganic Chemistry for JEE", faculty: "Prof. Rohit G.", mode: "Online", seats: 31, color: "bg-orange-100 text-orange-700" }
];

export function BookDemo() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [target, setTarget] = useState("JEE");
  const [cls, setCls] = useState("11");
  const [mode, setMode] = useState("Online");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setTimeout(() => setStatus("success"), 1500);
  };

  return (
    <section className="py-24 bg-gradient-to-br from-white to-green-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-dark-navy mb-4">
            Experience Instructis — <span className="text-primary">Absolutely Free</span>
          </h2>
          <p className="text-gray-600 text-lg">Sit in a real class. Zero commitment. 100% value.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-dark-navy">What You'll Experience</h3>
            <ul className="space-y-4 mb-10">
              {[
                "Live 90-minute master class by top faculty",
                "\"Top 10 Concepts Guaranteed in JEE/NEET 2026\"",
                "Study material + formula sheet emailed to you",
                "Personalised Q&A session after class",
                "Performance report + college prediction",
                "Surprise scholarship offer for top demo performers"
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 text-gray-700"
                >
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                  <span className="font-medium">{item}</span>
                </motion.li>
              ))}
            </ul>

            <h3 className="text-xl font-bold mb-4 text-dark-navy">Upcoming Free Masterclasses</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {demoSlots.map((slot, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform">
                  <p className="text-xs text-gray-500 font-semibold mb-2">{slot.date} • {slot.time}</p>
                  <span className={cn("text-xs font-bold px-2 py-1 rounded inline-block mb-2", slot.color)}>{slot.subject}</span>
                  <h4 className="font-bold text-sm mb-2">{slot.topic}</h4>
                  <div className="flex items-center gap-2 mb-3">
                    <img src={`https://picsum.photos/20/20?random=${200 + i}`} className="w-5 h-5 rounded-full" alt="" />
                    <span className="text-xs text-gray-600">{slot.faculty}</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full", slot.mode === 'Online' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600')}>
                      {slot.mode}
                    </span>
                    <span className={cn("text-[10px] font-bold", slot.seats < 20 ? "text-red-500 animate-pulse" : "text-gray-500")}>
                      {slot.seats < 20 ? `Only ${slot.seats} seats left!` : `${slot.seats} seats available`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Form */}
          <div>
            <div className="bg-white shadow-2xl shadow-gray-200/50 rounded-3xl p-8 border border-gray-100">
              {status === "success" ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold text-dark-navy mb-4">🎉 Your seat is reserved!</h3>
                  <p className="text-gray-600 mb-8">Check your WhatsApp for details. See you in class!</p>
                  <button onClick={() => setStatus("idle")} className="text-primary font-bold hover:underline">
                    Book another demo
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-2xl font-bold text-dark-navy mb-6">Reserve Your Seat</h3>

                  {/* Floating label inputs */}
                  <div className="relative">
                    <input type="text" required id="demo-name" className="peer w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-colors" placeholder=" " />
                    <label htmlFor="demo-name" className="absolute left-4 top-4 text-gray-500 text-sm transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-white peer-focus:px-1 peer-valid:-top-2 peer-valid:text-xs peer-valid:bg-white peer-valid:px-1 pointer-events-none">
                      Full Name
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <div className="w-20 h-14 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 font-medium">
                      +91
                    </div>
                    <div className="relative flex-1">
                      <input type="tel" required pattern="[0-9]{10}" id="demo-phone" className="peer w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-colors" placeholder=" " />
                      <label htmlFor="demo-phone" className="absolute left-4 top-4 text-gray-500 text-sm transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-white peer-focus:px-1 peer-valid:-top-2 peer-valid:text-xs peer-valid:bg-white peer-valid:px-1 pointer-events-none">
                        Phone Number
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Target Exam</label>
                    <div className="flex gap-2">
                      {["JEE", "NEET", "Both"].map(t => (
                        <button key={t} type="button" onClick={() => setTarget(t)} className={cn("flex-1 py-2.5 rounded-lg border font-medium transition-colors", target === t ? "bg-primary border-primary text-white" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50")}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Class</label>
                    <div className="flex gap-2">
                      {["11", "12", "Dropper"].map(c => (
                        <button key={c} type="button" onClick={() => setCls(c)} className={cn("flex-1 py-2.5 rounded-lg border font-medium transition-colors", cls === c ? "bg-dark-navy border-dark-navy text-white" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50")}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Date</label>
                      <input type="date" required className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Mode</label>
                      <div className="flex bg-gray-100 rounded-lg p-1 h-12">
                        {["Online", "Offline"].map(m => (
                          <button key={m} type="button" onClick={() => setMode(m)} className={cn("flex-1 rounded-md text-sm font-medium transition-all", mode === m ? "bg-white shadow text-primary" : "text-gray-500")}>
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full bg-primary hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                  >
                    {status === "loading" ? (
                      <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Reserve My Free Seat →"
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 flex items-center justify-center gap-2 mb-4">
                🔒 No credit card. No hidden fee. Just learning.
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <img key={i} src={`https://picsum.photos/32/32?random=${500 + i}`} className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                  ))}
                </div>
                <p className="text-xs font-medium text-gray-600">4,832 students attended a demo last month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
