"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { Play, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import "swiper/css";

const testimonials = [
  { name: "Anjali Mishra", rank: "AIR 247, JEE Advanced 2025", img: "https://picsum.photos/80/80?random=50", text: "The faculty at Instructis truly cares. Their doubt resolution system helped me clear concepts at 2AM before my exam. I couldn't have cracked JEE without them." },
  { name: "Rohit Sharma", rank: "AIR 89, JEE Advanced 2025", img: "https://picsum.photos/80/80?random=51", text: "The AI-powered study plan was a game changer. It identified my weak areas and built a custom schedule. 6 months with Instructis changed my entire trajectory." },
  { name: "Priya Nair", rank: "AIR 12, NEET 2025", img: "https://picsum.photos/80/80?random=52", text: "From a student who feared Biology to securing AIIMS Delhi — Instructis made this possible with their incredible teaching methodology." },
  { name: "Arjun Patel", rank: "AIR 156, JEE Advanced 2025", img: "https://picsum.photos/80/80?random=53", text: "The mock tests are harder than the actual JEE. By the time I sat the real exam, I felt fully prepared and calm." },
  { name: "Sneha Gupta", rank: "AIR 34, NEET 2025", img: "https://picsum.photos/80/80?random=54", text: "Scholarship saved my dream. I got 80% waiver and the faculty treated me like IIT gold. Thank you Instructis!" },
  { name: "Vikram Singh", rank: "AIR 198, JEE Main 2025", img: "https://picsum.photos/80/80?random=55", text: "The weekly analytics showed exactly where I stood vs. the competition. It kept me motivated and on track every single week." }
];

export function Testimonials() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section id="testimonials" className="py-24 bg-amber-50/90 dark:bg-amber-950/20 relative overflow-hidden">
      {/* Animated blob shapes */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-green-200/50 dark:bg-green-500/15 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-70 dark:opacity-40 animate-[float_8s_ease-in-out_infinite]"></div>
      <div className="absolute top-0 right-20 w-96 h-96 bg-yellow-200/50 dark:bg-yellow-500/15 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-70 dark:opacity-40 animate-[float_10s_ease-in-out_infinite]"></div>
      <div className="absolute -bottom-20 left-40 w-96 h-96 bg-primary/20 dark:bg-primary/25 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-70 dark:opacity-35 animate-[float_9s_ease-in-out_infinite]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-3">
            What Our Students Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-1">
            Real stories from students who achieved their goals with Instructis.
          </p>
        </div>

        <Swiper
          modules={[Autoplay]}
          spaceBetween={32}
          slidesPerView={1}
          breakpoints={{
            768: { slidesPerView: 2 },
          }}
          loop={true}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          className="pb-12"
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={i}>
              <div className="bg-card/95 dark:bg-card backdrop-blur-md border border-border shadow-xl dark:shadow-black/30 rounded-2xl p-8 relative h-full flex flex-col">
                <span className="text-8xl text-primary/20 font-serif absolute top-4 left-6 leading-none select-none">"</span>

                <button
                  onClick={() => setIsVideoOpen(true)}
                  className="absolute top-6 right-6 w-10 h-10 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center text-primary transition-colors z-10"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>

                <p className="text-foreground/90 relative z-10 pt-8 pb-6 flex-1 text-lg italic leading-relaxed">
                  {t.text}
                </p>

                <div className="flex items-center gap-4 relative z-10 border-t border-border pt-6">
                  <img src={t.img} alt={t.name} className="w-14 h-14 rounded-full border-2 border-primary object-cover" />
                  <div>
                    <h4 className="font-bold text-foreground text-lg">{t.name}</h4>
                    <p className="text-sm font-medium text-muted-foreground">{t.rank}</p>
                    <div className="flex text-yellow-400 mt-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span key={j}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setIsVideoOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
