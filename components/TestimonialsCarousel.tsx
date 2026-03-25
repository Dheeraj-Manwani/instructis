"use client";

import { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Testimonial = {
  id: string;
  title: string;
  subtitle: string;
  imgUrl: string;
  name: string;
  badgeText: string;
};

export default function TestimonialsCarousel() {
  const testimonials = useMemo<Testimonial[]>(
    () => [
      {
        id: "t1",
        title: "The study schedule was perfect!",
        subtitle: "What our parents say about us",
        imgUrl: "https://picsum.photos/seed/parent-1/650/650",
        name: "Yogita Goyal’s Father",
        badgeText: "AIR 1697",
      },
      {
        id: "t2",
        title: "The quality of tests was top-notch!",
        subtitle: "What our parents say about us",
        imgUrl: "https://picsum.photos/seed/parent-2/650/650",
        name: "Simran Goyal’s Father",
        badgeText: "527/720",
      },
      {
        id: "t3",
        title: "Her mental ability improved a lot",
        subtitle: "What our parents say about us",
        imgUrl: "https://picsum.photos/seed/parent-3/650/650",
        name: "Inchara Shasti’s Mother",
        badgeText: "Class 6",
      },
      {
        id: "t4",
        title: "My child was WITH me all the time",
        subtitle: "What our parents say about us",
        imgUrl: "https://picsum.photos/seed/parent-4/650/650",
        name: "Suchi Jain’s Father",
        badgeText: "695/720",
      },
    ],
    []
  );

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              ALLEN Online se, <span className="text-blue-600">success</span>{" "}
              MUMKIN hai!
            </h2>
            <p className="text-slate-600 mt-2 text-base md:text-lg">
              What our parents say about us
            </p>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="swiper-button-prev !static !translate-y-0 !m-0 !h-10 !w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <div className="swiper-button-next !static !translate-y-0 !m-0 !h-10 !w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        <Swiper
          modules={[Navigation]}
          navigation
          loop
          spaceBetween={22}
          breakpoints={{
            0: { slidesPerView: 1.05 },
            640: { slidesPerView: 1.6 },
            900: { slidesPerView: 2.2 },
            1200: { slidesPerView: 3.1 },
          }}
        >
          {testimonials.map((t) => (
            <SwiperSlide key={t.id}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5">
                  <p className="text-slate-800 font-semibold text-base text-center">
                    {t.title}
                  </p>
                </div>

                <div className="relative px-5 pb-6">
                  <div className="rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={t.imgUrl}
                      alt=""
                      className="w-full h-[265px] object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-2 flex justify-center pointer-events-none">
                    <div className="bg-slate-900/80 text-white text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-2">
                      Watch Now
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <div className="text-slate-700 font-semibold text-sm">
                    {t.name}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-blue-700 font-extrabold text-lg">
                      {t.badgeText}
                    </div>
                    <div className="h-10 w-10 rounded-full border border-blue-200 bg-white flex items-center justify-center text-blue-600">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

