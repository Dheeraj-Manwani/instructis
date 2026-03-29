"use client";

import { motion } from "motion/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const testimonials = [
  { text: "My daughter Priya got AIR 312 in JEE Advanced 2025. As a parent from a small town in Bihar, I never imagined this was possible. Instructis made it real.", name: "Mrs. Sunita Verma", city: "Muzaffarpur, Bihar", child: "Mother of Priya Verma (AIR 312)", img: "https://picsum.photos/80/80?random=95" },
  { text: "The weekly calls from the counsellors kept us informed every step of the way. We always knew where Rahul stood and what he needed to improve.", name: "Mr. Ramesh Gupta", city: "Jaipur, Rajasthan", child: "Father of Rahul Gupta (AIR 567)", img: "https://picsum.photos/80/80?random=96" },
  { text: "The parent dashboard is incredible. I could see Sneha's attendance, test scores, and even her doubt resolution history from my phone.", name: "Mrs. Kavitha Nair", city: "Kochi, Kerala", child: "Mother of Sneha Nair (NEET AIR 89)", img: "https://picsum.photos/80/80?random=97" }
];

export function ParentsCorner() {
  return (
    <section className="py-24 bg-[#fdf8f0] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-dark-navy mb-4">
            Built for Students. <span className="text-amber-600">Trusted by Parents.</span>
          </h2>
          <p className="text-gray-600 text-lg">Because your child's future is our responsibility too.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-16">
          {/* Features */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-md border border-amber-100 hover:-translate-y-1 transition-transform flex gap-6"
            >
              <div className="w-16 h-16 bg-amber-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📊</div>
              <div>
                <h4 className="font-bold text-lg mb-2 text-dark-navy">Parent Dashboard</h4>
                <p className="text-gray-600 text-sm mb-4">Know exactly how your child is performing — anytime, anywhere.</p>
                {/* Mini mockup */}
                <div className="w-48 bg-gray-900 rounded-2xl border-4 border-gray-700 p-2 shadow-inner">
                  <div className="h-2 w-1/2 bg-gray-700 rounded mb-2" />
                  <div className="flex gap-1 mb-2">
                    <div className="h-8 w-1/3 bg-green-500 rounded-t-sm mt-auto" />
                    <div className="h-12 w-1/3 bg-blue-500 rounded-t-sm mt-auto" />
                    <div className="h-10 w-1/3 bg-primary rounded-t-sm mt-auto" />
                  </div>
                  <div className="h-4 w-full bg-white/10 rounded" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-md border border-amber-100 hover:-translate-y-1 transition-transform flex gap-6"
            >
              <div className="w-16 h-16 bg-amber-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📞</div>
              <div>
                <h4 className="font-bold text-lg mb-2 text-dark-navy">Weekly Progress Calls</h4>
                <p className="text-gray-600 text-sm">Every Sunday, our counsellors call you with a detailed performance report. No surprises.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-md border border-amber-100 hover:-translate-y-1 transition-transform flex gap-6"
            >
              <div className="w-16 h-16 bg-amber-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🔔</div>
              <div>
                <h4 className="font-bold text-lg mb-2 text-dark-navy">Instant Alerts</h4>
                <p className="text-gray-600 text-sm">SMS + WhatsApp + Email alerts for attendance, test results, batch changes, and exam schedules.</p>
              </div>
            </motion.div>
          </div>

          {/* Testimonials */}
          <div className="relative">
            <div className="absolute -inset-4 bg-amber-100/50 rounded-[3rem] -rotate-3 z-0" />
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-amber-100 relative z-10 h-full flex flex-col justify-center">
              <Swiper
                modules={[Autoplay]}
                slidesPerView={1}
                loop={true}
                autoplay={{ delay: 4000 }}
                className="w-full"
              >
                {testimonials.map((t, i) => (
                  <SwiperSlide key={i}>
                    <span className="text-6xl text-amber-200 font-serif leading-none block mb-4">"</span>
                    <p className="text-gray-700 text-lg italic mb-8 leading-relaxed px-2">
                      {t.text}
                    </p>
                    <div className="flex items-center gap-4 px-2">
                      <img src={t.img} className="w-14 h-14 rounded-full border-2 border-amber-400" alt="" />
                      <div>
                        <h4 className="font-bold text-dark-navy">{t.name}</h4>
                        <p className="text-xs text-gray-500 mb-1">{t.city}</p>
                        <p className="text-xs font-semibold text-primary">{t.child}</p>
                        <div className="flex text-amber-400 text-xs mt-1">
                          ★★★★★
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="text-center md:text-left">
            <h4 className="font-bold text-lg text-dark-navy flex items-center gap-2 justify-center md:justify-start">
              💬 Have questions as a parent?
            </h4>
            <p className="text-gray-600 mt-1">Dedicated Parents' Helpline: <span className="font-bold text-primary">1800-XXX-XXXX</span> (Mon–Sat, 9AM–7PM)</p>
          </div>
          <button className="bg-primary hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md whitespace-nowrap">
            Parent Orientation Webinar — Free →
          </button>
        </div>
      </div>
    </section>
  );
}
