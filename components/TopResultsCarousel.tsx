"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import sliderImage1 from "@/assets/landing/slider/5464x1820px_2_1767078766007.webp";
import sliderImage2 from "@/assets/landing/slider/5464x1820_16_1773032761815.webp";
import sliderImage3 from "@/assets/landing/slider/5464x1820px_21_1774410783207.webp";
import sliderImage4 from "@/assets/landing/slider/5464x1820-1_2_1771391996036.webp";

export default function TopResultsCarousel() {
  const slides = [sliderImage1, sliderImage2, sliderImage3, sliderImage4];

  return (
    <section className="w-full pt-24 pb-12 sm:pt-28">
      <div className="mx-auto w-full px-4 sm:px-6">
        <div className="relative">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            autoplay={{ delay: 2600, disableOnInteraction: false }}
            speed={1100}
            loop
            grabCursor
            navigation={{
              prevEl: ".top-results-prev",
              nextEl: ".top-results-next",
            }}
            pagination={{ clickable: true }}
            className="resultsImageSwiper"
          >
            {slides.map((src, idx) => (
              <SwiperSlide key={idx}>
                <div className="aspect-video overflow-hidden rounded-3xl border border-white/20 bg-slate-900/40 shadow-[0_24px_64px_rgba(0,0,0,0.35)] md:aspect-3/1">
                  <Image
                    src={src}
                    alt={`Top result image ${idx + 1}`}
                    width={5464}
                    height={1820}
                    className="h-full w-full object-cover animate-[heroZoom_12s_ease-in-out_infinite_alternate]"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            type="button"
            aria-label="Previous slide"
            className="top-results-prev absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-[#0f2f74]/75 p-2.5 text-white shadow-lg backdrop-blur-sm transition hover:bg-[#0f2f74] md:left-5"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className="top-results-next absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-[#0f2f74]/75 p-2.5 text-white shadow-lg backdrop-blur-sm transition hover:bg-[#0f2f74] md:right-5"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>

      <style jsx global>{`
        .resultsImageSwiper .swiper-slide {
          opacity: 0.65;
          transition: opacity 420ms ease;
        }

        .resultsImageSwiper .swiper-slide-active {
          opacity: 1;
        }

        .resultsImageSwiper .swiper-button-prev,
        .resultsImageSwiper .swiper-button-next {
          display: none;
        }

        .resultsImageSwiper .swiper-button-prev::after,
        .resultsImageSwiper .swiper-button-next::after {
          font-size: 18px;
          font-weight: 800;
        }

        .resultsImageSwiper .swiper-pagination {
          bottom: 16px !important;
        }

        .resultsImageSwiper .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
        }

        .resultsImageSwiper .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 999px;
          background: #ffffff;
        }

        @keyframes heroZoom {
          0% {
            transform: scale(1.02) translateY(0);
          }
          100% {
            transform: scale(1.12) translateY(-8px);
          }
        }
      `}</style>
    </section>
  );
}

