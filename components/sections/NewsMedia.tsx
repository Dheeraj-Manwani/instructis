"use client";

import { ExternalLink } from "lucide-react";

const news = [
  { img: "https://picsum.photos/400/250?random=60", title: "Instructis Students Sweep Top 10 Ranks in JEE Advanced 2025", date: "June 12, 2025", source: "Times of India" },
  { img: "https://picsum.photos/400/250?random=61", title: "How Instructis's AI Learning System is Revolutionising Exam Prep", date: "May 5, 2025", source: "Economic Times" },
  { img: "https://picsum.photos/400/250?random=62", title: "NEET 2025: Instructis Claims 6 of Top 10 All India Ranks", date: "May 28, 2025", source: "NDTV" }
];

const publishers = ["Times of India", "Hindustan Times", "NDTV", "Aaj Tak", "Economic Times", "India Today", "Business Standard"];

export function NewsMedia() {
  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-dark-navy mb-4">
            As Seen In
          </h2>
        </div>
      </div>

      {/* Marquee */}
      <div className="bg-white border-y border-gray-200 py-6 mb-16 flex overflow-hidden">
        <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite] w-max">
          {[...publishers, ...publishers, ...publishers].map((p, i) => (
            <div key={i} className="font-serif font-bold text-2xl text-gray-400 px-12 grayscale hover:grayscale-0 hover:text-primary transition-all duration-300 cursor-default">
              {p}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((item, i) => (
            <a key={i} href="#" className="bg-white rounded-2xl shadow-md overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group flex flex-col">
              <div className="relative overflow-hidden aspect-[16/10]">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-dark-navy shadow-sm">
                  {item.source}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-sm text-gray-500 mb-3 font-medium">{item.date}</p>
                <h3 className="font-bold text-lg text-dark-navy mb-4 group-hover:text-primary transition-colors flex-1 line-clamp-3 leading-snug">
                  {item.title}
                </h3>
                <div className="flex items-center text-primary font-semibold text-sm group-hover:underline">
                  Read Article <ExternalLink className="w-4 h-4 ml-1" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
