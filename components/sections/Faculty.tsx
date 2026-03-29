"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Linkedin, Star } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import { ScrollAnimate } from "@/components/motion/scroll-animate";

const faculty = [
  { name: "Dr. Rajesh Sharma", qual: "Ph.D. IIT Bombay", sub: "Physics", exp: "15+", mentored: "12,000+", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop", color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800" },
  { name: "Neha Verma", qual: "M.Sc. AIIMS Delhi", sub: "Biology", exp: "12+", mentored: "9,000+", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop", color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/60 dark:text-green-300 dark:border-green-800" },
  { name: "Anil Kumar", qual: "B.Tech IIT Kanpur", sub: "Mathematics", exp: "18+", mentored: "20,000+", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop", color: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800" },
  { name: "Priya Desai", qual: "M.Tech NIT Trichy", sub: "Chemistry", exp: "10+", mentored: "8,500+", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop", color: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800" },
  { name: "Suresh Menon", qual: "Ph.D. IISc", sub: "Physics", exp: "20+", mentored: "25,000+", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop", color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800" },
];

export function Faculty() {
  return (
    <section id="faculty" className="py-24 bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollAnimate className="text-center max-w-3xl mx-auto mb-16" direction="up" duration={0.8}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-6">
            Learn From The <span className="text-primary">Best Minds</span> in India
          </h2>
          <p className="text-muted-foreground text-lg">
            Our stellar faculty members are renowned authors, ex-IITians, and medical professionals dedicated to your success.
          </p>
        </ScrollAnimate>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={32}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true, dynamicBullets: true }}
          className="pb-16"
        >
          {faculty.map((prof, i) => (
            <SwiperSlide key={i}>
              <div className="bg-card border border-border rounded-3xl p-8 shadow-lg dark:shadow-black/20 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 text-center group">
                <div className="relative inline-block mb-6">
                  <div className={`absolute inset-0 rounded-full border-4 ${prof.color} scale-110 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300`} />
                  <img 
                    src={prof.img} 
                    alt={prof.name}
                    className="w-32 h-32 rounded-full object-cover relative z-10 border-4 border-background shadow-md"
                  />
                  <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap z-20 border ${prof.color}`}>
                    {prof.sub}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-1">{prof.name}</h3>
                <p className="text-muted-foreground font-medium mb-4">{prof.qual}</p>
                
                <div className="flex justify-center items-center gap-1 text-amber-400 mb-6">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                  <span className="text-foreground font-bold ml-2 text-sm">4.9/5</span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-border pt-6 mb-6">
                  <div>
                    <p className="text-2xl font-black text-foreground mb-1">{prof.exp}</p>
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Years Exp.</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground mb-1">{prof.mentored}</p>
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Mentored</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <a href="#callback" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                    View Full Profile
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
