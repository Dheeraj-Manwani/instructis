"use client";

import { useState } from "react";
import { motion, type Variants } from "motion/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, Navigation } from "swiper/modules";
import { ChevronRight, PlayCircle, Trophy, Users, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";

const slides = [
  {
    id: 1,
    image: process.env.CLOUDFRONT_URL + '/instructis/ins_hero1.png',
    badge: "🎓 The Next Generation of Education",
    title: "India's Smartest Coaching for IIT-JEE & NEET",
    subtitle: "Join the legacy of champions. Expert faculty, proven methodology, and unmatched results."
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&h=1080&fit=crop",
    badge: "🩺 Medical Marvels",
    title: "4 Out of Top 10 NEET Rankers From Us",
    subtitle: "Precision focus on NCERT and beyond to secure your seat in top medical colleges."
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&h=1080&fit=crop",
    badge: "👨‍🏫 Master Mentors",
    title: "Learn From IIT & AIIMS Alumni Faculty",
    subtitle: "Get guided by those who have walked the path and conquered it."
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&h=1080&fit=crop",
    badge: "🚀 Future Ready",
    title: "Your Dream. Our Mission. Let's Begin.",
    subtitle: "Admissions open for 2026-27 batches. Limited seats available."
  }
];

export function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } }
  };

  return (
    <section
      id="top"
      className="relative h-screen min-h-[600px] w-full bg-dark-navy overflow-hidden"
    >
      <Swiper
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
        effect="fade"
        speed={1000}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true, renderBullet: () => `<span class="swiper-pagination-bullet !w-12 !h-1 !rounded-none !bg-white/50 hover:!bg-white transition-all"></span>` }}
        navigation={{
          nextEl: '.hero-next',
          prevEl: '.hero-prev',
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id} className="relative w-full h-full">
            {/* Background Image with Ken Burns */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <div
                className={cn(
                  "absolute inset-0 bg-cover bg-center w-full h-full",
                  activeIndex === index ? "animate-kenburns" : "scale-100"
                )}
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-dark-navy/95 via-dark-navy/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/90 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-20">
              {activeIndex === index && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="max-w-3xl"
                >
                  <motion.div variants={itemVariants} className="inline-block mb-6">
                    <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold tracking-wide shadow-xl">
                      {slide.badge}
                    </span>
                  </motion.div>

                  <motion.h1
                    variants={itemVariants}
                    className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight"
                  >
                    {slide.title.split(' ').map((word, i) => (
                      <span key={i} className="inline-block mr-[0.25em]">
                        {word === "IIT-JEE" || word === "NEET" ? (
                          <span className={word === "IIT-JEE" ? "text-jee" : "text-neet"}>{word}</span>
                        ) : (
                          word
                        )}
                      </span>
                    ))}
                  </motion.h1>

                  <motion.p
                    variants={itemVariants}
                    className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl font-medium leading-relaxed"
                  >
                    {slide.subtitle}
                  </motion.p>

                  <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
                    <a
                      href="#courses"
                      className="px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-[0_0_40px_rgba(26,122,60,0.4)] hover:shadow-[0_0_60px_rgba(26,122,60,0.6)] transition-all hover:-translate-y-1 flex items-center gap-2 group"
                    >
                      Explore Courses
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a
                      href="#testimonials"
                      className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm font-bold transition-all hover:-translate-y-1 flex items-center gap-2"
                    >
                      <PlayCircle className="w-5 h-5" />
                      Watch Success Stories
                    </a>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Arrows */}
      <div className="absolute top-1/2 -translate-y-1/2 right-8 z-20 hidden lg:flex flex-col gap-4">
        <button className="hero-prev w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110">
          <svg className="w-6 h-6 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
        <button className="hero-next w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Floating Glass Stats */}
      <div className="absolute bottom-0 left-0 right-0 z-20 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="glass-dark rounded-2xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-3 rounded-xl"><Trophy className="w-6 h-6 text-primary" /></div>
              <div>
                <p className="text-white font-bold font-mono text-xl">35+ Years</p>
                <p className="text-gray-400 text-sm font-medium">Of Educational Excellence</p>
              </div>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div className="flex items-center gap-4">
              <div className="bg-jee/20 p-3 rounded-xl"><Users className="w-6 h-6 text-jee" /></div>
              <div>
                <p className="text-white font-bold font-mono text-xl">Over 24 Million Students</p>
                <p className="text-gray-400 text-sm font-medium">Successfully Mentored</p>
              </div>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div className="flex items-center gap-4">
              <div className="bg-neet/20 p-3 rounded-xl"><Star className="w-6 h-6 text-neet fill-neet" /></div>
              <div>
                <p className="text-white font-bold font-mono text-xl">Over 90% Success</p>
                <p className="text-gray-400 text-sm font-medium">Selection Rate in Top Exams</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global overrides for Swiper Pagination specifically for Hero */}
      <style>{`
        .swiper-pagination-bullet-active { background: white !important; }
      `}</style>
    </section>
  );
}
