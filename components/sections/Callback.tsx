"use client";

import { useState } from "react";
import { PhoneCall, ShieldCheck, Clock, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
// import { FloatingInput, FloatingSelect } from "../FloatingInput";
import Lottie from "lottie-react";

// Minimal lottie JSON for success state to avoid external dependency failure
const successLottie = {
  v: "5.5.2",
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "Success",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Layer 1",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: { a: 0, k: 0, ix: 10 },
        p: { a: 0, k: [50, 50, 0], ix: 2, l: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1, l: 2 },
        s: { a: 1, k: [{ i: { x: [0.833, 0.833, 0.833], y: [0.833, 0.833, 0.833] }, o: { x: [0.167, 0.167, 0.167], y: [0.167, 0.167, 0.167] }, t: 0, s: [0, 0, 100] }, { t: 30, s: [100, 100, 100] }], ix: 6, l: 2 }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              d: 1,
              ty: "el",
              s: { a: 0, k: [80, 80], ix: 2 },
              p: { a: 0, k: [0, 0], ix: 3 },
              nm: "Ellipse Path 1",
              mn: "ADBE Vector Shape - Ellipse",
              hd: false
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.101960784314, 0.478431372549, 0.235294117647, 1], ix: 4 }, /* #1a7a3c */
              o: { a: 0, k: 100, ix: 5 },
              r: 1,
              bm: 0,
              nm: "Fill 1",
              mn: "ADBE Vector Graphic - Fill",
              hd: false
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0], ix: 2 },
              a: { a: 0, k: [0, 0], ix: 1 },
              s: { a: 0, k: [100, 100], ix: 3 },
              r: { a: 0, k: 0, ix: 6 },
              o: { a: 0, k: 100, ix: 7 },
              sk: { a: 0, k: 0, ix: 4 },
              sa: { a: 0, k: 0, ix: 5 },
              nm: "Transform"
            }
          ],
          nm: "Ellipse 1",
          np: 2,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false
        },
        {
          ty: "gr",
          it: [
            {
              ind: 0,
              ty: "sh",
              ix: 1,
              ks: {
                a: 1,
                k: [
                  {
                    i: { x: 0.833, y: 0.833 },
                    o: { x: 0.167, y: 0.167 },
                    t: 15,
                    s: [
                      {
                        i: [[0, 0], [0, 0], [0, 0]],
                        o: [[0, 0], [0, 0], [0, 0]],
                        v: [[-15, 0], [-15, 0], [-15, 0]],
                        c: false
                      }
                    ]
                  },
                  {
                    t: 45,
                    s: [
                      {
                        i: [[0, 0], [0, 0], [0, 0]],
                        o: [[0, 0], [0, 0], [0, 0]],
                        v: [[-20, 0], [-5, 15], [20, -10]],
                        c: false
                      }
                    ]
                  }
                ],
                ix: 2
              },
              nm: "Path 1",
              mn: "ADBE Vector Shape - Group",
              hd: false
            },
            {
              ty: "st",
              c: { a: 0, k: [1, 1, 1, 1], ix: 3 },
              o: { a: 0, k: 100, ix: 4 },
              w: { a: 0, k: 6, ix: 5 },
              lc: 2,
              lj: 2,
              ml: 10,
              bm: 0,
              nm: "Stroke 1",
              mn: "ADBE Vector Graphic - Stroke",
              hd: false
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0], ix: 2 },
              a: { a: 0, k: [0, 0], ix: 1 },
              s: { a: 0, k: [100, 100], ix: 3 },
              r: { a: 0, k: 0, ix: 6 },
              o: { a: 0, k: 100, ix: 7 },
              sk: { a: 0, k: 0, ix: 4 },
              sa: { a: 0, k: 0, ix: 5 },
              nm: "Transform"
            }
          ],
          nm: "Shape 1",
          np: 2,
          cix: 2,
          bm: 0,
          ix: 2,
          mn: "ADBE Vector Group",
          hd: false
        }
      ]
    }
  ]
};

export function Callback() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
    }, 2000);
  };

  return (
    <section id="callback" className="w-full bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2">

        {/* Left Side */}
        <div className="bg-[#0d5c2e] p-8 md:p-16 lg:p-24 text-white relative overflow-hidden flex flex-col justify-center">
          {/* Abstract bg elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 border border-white/20">
              <PhoneCall className="w-8 h-8 text-green-300" />
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Talk to Our Expert Counsellors — <span className="text-amber-400">Free!</span>
            </h2>

            <p className="text-green-100 text-lg md:text-xl mb-12 max-w-lg leading-relaxed">
              Get personalised course guidance, fee details, and scholarship info in one call. No spam, we promise.
            </p>

            <div className="space-y-6 mb-16">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-full"><Clock className="w-5 h-5 text-amber-400" /></div>
                <span className="text-lg font-semibold tracking-wide">Response in 30 mins</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-full"><ShieldCheck className="w-5 h-5 text-amber-400" /></div>
                <span className="text-lg font-semibold tracking-wide">100% Free Consultation</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-full"><CheckCircle2 className="w-5 h-5 text-amber-400" /></div>
                <span className="text-lg font-semibold tracking-wide">Trusted by 5 Lakh Families</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[10, 11, 12, 13, 14].map((n) => (
                  <img
                    key={n}
                    src={`https://images.unsplash.com/photo-15${n}0000000000?w=100&h=100&fit=crop`}
                    alt="Student"
                    className="w-12 h-12 rounded-full border-2 border-[#0d5c2e] object-cover"
                  />
                ))}
              </div>
              <div className="text-sm font-medium text-green-200">
                <span className="text-white font-bold block">+12,000 students</span>
                counselled this month
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="p-8 md:p-16 lg:p-24 bg-muted/50 dark:bg-muted/25 flex items-center justify-center">
          <div className="w-full max-w-xl bg-card text-card-foreground p-8 rounded-3xl shadow-lg border border-border dark:shadow-black/25">
            {status === "success" ? (
              <div className="text-center py-12">
                <div className="w-32 h-32 mx-auto mb-6">
                  <Lottie animationData={successLottie} loop={false} />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-4">Request Received!</h3>
                <p className="text-muted-foreground mb-8">Our expert counsellor will call you shortly on the provided number.</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="px-8 py-3 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 border border-border transition-colors"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-2xl font-bold text-foreground mb-6">Request Callback</h3>

                {/* <FloatingInput id="name" label="Full Name" required /> */}

                <div className="flex gap-4">
                  <div className="w-24">
                    {/* <FloatingInput id="code" label="Code" value="+91" readOnly disabled className="bg-gray-50 font-mono text-center px-0" /> */}
                  </div>
                  {/* <FloatingInput id="phone" label="Mobile Number" type="tel" required pattern="[0-9]{10}" /> */}
                </div>

                {/* <FloatingInput id="email" label="Email Address" type="email" /> */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* <FloatingSelect
                    id="class"
                    label="Current Class"
                    required
                    options={[
                      { value: "11", label: "Class 11" },
                      { value: "12", label: "Class 12" },
                      { value: "dropper", label: "12th Pass / Dropper" },
                    ]}
                  />
                  <FloatingSelect
                    id="exam"
                    label="Target Exam"
                    required
                    options={[
                      { value: "jee", label: "JEE Main & Advanced" },
                      { value: "neet", label: "NEET UG" },
                      { value: "both", label: "Both (PCMB)" },
                    ]}
                  /> */}
                </div>

                {/* <FloatingInput id="city" label="City" required /> */}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full bg-primary hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {status === "loading" ? (
                      <><Loader2 className="w-6 h-6 animate-spin" /> Processing...</>
                    ) : (
                      <>Request My Free Callback <ArrowRight className="w-5 h-5" /></>
                    )}
                  </button>
                </div>

                <p className="text-center text-muted-foreground text-sm mt-4 flex items-center justify-center gap-2">
                  <PhoneCall className="w-4 h-4 shrink-0" />
                  Or call us directly:{" "}
                  <a href="tel:18001234567" className="font-bold text-primary hover:text-primary/90 transition-colors">
                    1800-123-4567
                  </a>{" "}
                  (Toll Free)
                </p>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
