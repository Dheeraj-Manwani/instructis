"use client";

import { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type StudentCard = {
  name: string;
  subject: string;
};

type Slide = {
  titleLeft: string;
  subtitleFrom: string;
  titleRight: string;
  cta: string;
  totalText: string;
  subjects: string[];
  topNumbers: number[];
  students: StudentCard[];
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TopResultsCarousel() {
  const slides = useMemo<Slide[]>(
    () => [
      {
        titleLeft: "Results that matter",
        subtitleFrom: "from",
        titleRight: "NO to OCSC/IMOTC",
        cta: "Aakash Champions Rise Higher!",
        totalText: "Total 29 Students Qualified for OCSC/IMOTC-2026",
        subjects: [
          "Astronomy",
          "Biology",
          "Chemistry",
          "Physics",
          "Jr. Science",
          "Maths",
        ],
        topNumbers: [7, 14, 3, 2, 1, 2],
        students: [
          { name: "Sushant Kumar", subject: "Astronomy" },
          { name: "Soham Nishikanth", subject: "Biology" },
          { name: "Uttkarsh Khokhar", subject: "Chemistry" },
          { name: "Harshit Singh", subject: "Physics" },
          { name: "Jaiveer Junior Science", subject: "Jr. Science" },
          { name: "Anmol Tiwari", subject: "Maths" },
        ],
      },
      {
        titleLeft: "Results that matter",
        subtitleFrom: "from",
        titleRight: "NO to OCSC/IMOTC",
        cta: "Aakash Champions Rise Higher!",
        totalText: "Total 34 Students Qualified for OCSC/IMOTC-2026",
        subjects: [
          "Astronomy",
          "Biology",
          "Chemistry",
          "Physics",
          "Jr. Science",
          "Maths",
        ],
        topNumbers: [10, 12, 6, 4, 2, 0],
        students: [
          { name: "Neel Kumar", subject: "Astronomy" },
          { name: "Riya Sharma", subject: "Biology" },
          { name: "Aditya Verma", subject: "Chemistry" },
          { name: "Mehul Gupta", subject: "Physics" },
          { name: "Saanvi Singh", subject: "Jr. Science" },
          { name: "Vihaan Tiwari", subject: "Maths" },
        ],
      },
    ],
    []
  );

  return (
    <section className="w-full bg-gradient-to-b from-[#2C4B87] via-[#27437A] to-[#1B3463] text-white">
      <div className="relative px-4 sm:px-6 pt-20 pb-10">
        {/* Decorative blob */}
        <div className="pointer-events-none absolute -top-24 -right-28 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="max-w-7xl mx-auto">
          <Swiper
            modules={[Navigation]}
            navigation
            loop
            className="resultsSwiper"
            onBeforeInit={(swiper) => {
              // Ensure navigation elements are created for each render.
              // (Swiper React sometimes needs this when used with fixed layout.)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const s = swiper as any;
              s.params.navigation = true;
            }}
          >
            {slides.map((s, idx) => (
              <SwiperSlide key={idx}>
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                  <div className="space-y-5">
                    <div className="text-2xl font-extrabold text-yellow-400 tracking-tight">
                      {s.titleLeft}
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-2xl font-extrabold">{s.subtitleFrom}</div>
                      <div className="h-[1px] flex-1 bg-white/30" />
                    </div>
                    <div className="text-[54px] leading-none font-extrabold tracking-tight">
                      {s.titleRight}
                    </div>
                    <div className="inline-flex items-center justify-center bg-white/95 text-slate-900 font-extrabold px-6 py-3 rounded-full shadow-sm">
                      {s.cta}
                    </div>

                    <div className="pt-6">
                      <Button className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-6 text-lg font-extrabold">
                        Know More
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-center font-extrabold text-2xl">
                      {s.totalText}
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                      {s.subjects.map((sub) => (
                        <div
                          key={sub}
                          className="bg-sky-600/80 border border-white/10 text-white font-bold px-5 py-2 rounded-lg text-sm"
                        >
                          {sub}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-6 gap-3">
                      {s.topNumbers.map((n, i) => (
                        <div
                          key={`${n}-${i}`}
                          className="h-[86px] bg-white/95 rounded-xl border border-white/40 flex items-center justify-center"
                        >
                          <div className="text-[64px] font-extrabold text-[#122B66] leading-none">
                            {n}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-6 gap-3">
                      {s.students.map((st, i) => (
                        <div
                          key={`${st.name}-${i}`}
                          className="text-center"
                        >
                          <div
                            className={cn(
                              "w-full aspect-[0.88] rounded-xl overflow-hidden border border-white/20 bg-slate-900/10",
                              "flex items-center justify-center"
                            )}
                          >
                            <div className="w-[76%] h-[76%] rounded-lg bg-sky-800/80 flex items-center justify-center text-white font-extrabold text-xl">
                              {initials(st.name)}
                            </div>
                          </div>
                          <div className="mt-2 text-[13px] font-semibold text-white/90 leading-tight">
                            {st.name}
                          </div>
                          <div className="text-[12px] text-white/80">{st.subject}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <style jsx global>{`
        /* Make Swiper arrows match the screenshot-ish placement */
        .resultsSwiper .swiper-button-prev,
        .resultsSwiper .swiper-button-next {
          color: white;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.18);
          width: 52px;
          height: 52px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.25);
        }
        .resultsSwiper .swiper-button-prev:after,
        .resultsSwiper .swiper-button-next:after {
          font-size: 20px;
          font-weight: 900;
        }
      `}</style>
    </section>
  );
}

