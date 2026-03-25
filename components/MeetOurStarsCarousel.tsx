"use client";

import { useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import { Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type StarFilter = "ALL" | "NEET" | "JEE" | "CLASSES 6-10";

type StarCard = {
  id: string;
  name: string;
  course: StarFilter;
  tag: string; // e.g. NEET-UG '25
  airText: string; // e.g. AIR 74
  imgUrl: string;
  location: string;
};

const filterButtons: { value: StarFilter; label: string }[] = [
  { value: "ALL", label: "ALL" },
  { value: "NEET", label: "NEET" },
  { value: "JEE", label: "JEE" },
  { value: "CLASSES 6-10", label: "CLASSES 6-10" },
];

export default function MeetOurStarsCarousel() {
  const [activeFilter, setActiveFilter] = useState<StarFilter>("ALL");

  const stars = useMemo<StarCard[]>(
    () => [
      {
        id: "tanmay-jagga",
        name: "Tanmay Jagga",
        course: "NEET",
        tag: "NEET-UG ’25",
        airText: "AIR 74",
        location: "NEET-UG • Online Classroom Course",
        imgUrl: "https://picsum.photos/seed/star-tanmay/400/520",
      },
      {
        id: "artiro-ray",
        name: "Aritro Ray",
        course: "JEE",
        tag: "JEE Adv. ’25",
        airText: "AIR 50",
        location: "JEE Adv. • Online Classroom Course",
        imgUrl: "https://picsum.photos/seed/star-aritro/400/520",
      },
      {
        id: "charuvrat-bains",
        name: "Charuvrat Bains",
        course: "ALL",
        tag: "IESO 2025",
        airText: "Silver",
        location: "IESO • Online Classroom Course",
        imgUrl: "https://picsum.photos/seed/star-charuvrat/400/520",
      },
      {
        id: "aabhin-eet-patna",
        name: "Aabhineet Patn…",
        course: "ALL",
        tag: "CBSE 10th, ’25",
        airText: "99.4%",
        location: "CBSE 10th • Online Classroom Course",
        imgUrl: "https://picsum.photos/seed/star-aabhineet/400/520",
      },
      {
        id: "pragya-poonja",
        name: "Pragya Poonia",
        course: "NEET",
        tag: "NEET-UG ’25",
        airText: "AIR 1341",
        location: "NEET-UG • Online Classroom Course",
        imgUrl: "https://picsum.photos/seed/star-pragya/400/520",
      },
      {
        id: "jaiveer-jr-science",
        name: "Jaiveer",
        course: "CLASSES 6-10",
        tag: "Jr. Science",
        airText: "AIR 395",
        location: "Jr. Science • Online Classroom Course",
        imgUrl: "https://picsum.photos/seed/star-jaiveer/400/520",
      },
      {
        id: "arka-banerjee",
        name: "Arka Banerjee",
        course: "JEE",
        tag: "JEE Adv. ’25",
        airText: "AIR 395",
        location: "JEE Adv. • Online Classroom Course",
        imgUrl: "https://picsum.photos/seed/star-arka/400/520",
      },
    ],
    []
  );

  const filteredStars = stars.filter((s) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "NEET") return s.course === "NEET";
    if (activeFilter === "JEE") return s.course === "JEE";
    if (activeFilter === "CLASSES 6-10") return s.course === "CLASSES 6-10";
    return true;
  });

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-start justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center gap-3">
              <span>Meet our stars</span>
              <Sparkles className="w-6 h-6 text-amber-500" />
            </h2>
          </div>

          {/* Swiper arrows */}
          <div className="hidden md:flex items-center gap-3">
            <div className="swiper-button-prev !static !translate-y-0 !m-0 !h-10 !w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <div className="swiper-button-next !static !translate-y-0 !m-0 !h-10 !w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-4 items-center mb-10">
          {filterButtons.map((b) => {
            const isActive = b.value === activeFilter;
            return (
              <button
                key={b.value}
                type="button"
                onClick={() => setActiveFilter(b.value)}
                className={cn(
                  "px-8 py-3 rounded-xl border text-base font-semibold transition-colors",
                  isActive
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-slate-300 text-slate-700 bg-white"
                )}
              >
                {b.label}
              </button>
            );
          })}
        </div>

        <Swiper
          modules={[Navigation, Autoplay, FreeMode]}
          navigation
          loop
          freeMode={{ enabled: true, momentum: false }}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={4500}
          spaceBetween={18}
          className="meetStarsSwiper"
          breakpoints={{
            0: { slidesPerView: 1.1 },
            640: { slidesPerView: 2.2 },
            900: { slidesPerView: 3.2 },
            1200: { slidesPerView: 5 },
            1400: { slidesPerView: 6 },
          }}
        >
          {filteredStars.map((s) => (
            <SwiperSlide key={s.id}>
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="relative h-[220px] bg-[#EAF4FF] flex items-center justify-center">
                  <img
                    src={s.imgUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-14 bg-slate-900/90 flex items-center justify-center text-white font-extrabold text-base tracking-tight">
                    {s.tag}
                  </div>
                </div>

                <div className="px-5 py-5">
                  <div className="text-sm text-slate-600 font-semibold">
                    {s.location}
                  </div>
                  <div className="mt-2 font-extrabold text-slate-900 text-lg">
                    {s.name}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-blue-600 font-extrabold text-2xl leading-none">
                      {s.airText}
                    </div>
                    <div className="h-9 w-9 rounded-full border border-blue-200 bg-white flex items-center justify-center text-blue-600">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .meetStarsSwiper .swiper-wrapper {
          transition-timing-function: linear !important;
        }
      `}</style>
    </section>
  );
}

