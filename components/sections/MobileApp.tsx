"use client";

import { CheckCircle2, Star } from "lucide-react";

export function MobileApp() {
  const features = [
    "Live HD classes",
    "Offline downloads",
    "24/7 doubt chat",
    "Personalized mock tests",
    "AI progress tracking",
    "Push notifications"
  ];

  return (
    <section className="bg-[#0f1729] py-24 overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left: Phone Mockup */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="w-64 h-[500px] mx-auto rounded-[3rem] border-8 border-gray-800 bg-gray-900 shadow-2xl overflow-hidden relative z-10">
              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-6 bg-gray-800 rounded-b-3xl w-32 mx-auto z-20"></div>
              <img src="https://picsum.photos/300/600?random=70" alt="App Screenshot" className="w-full h-full object-cover" />
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -left-10 sm:-left-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-white text-sm font-semibold shadow-xl animate-[float_4s_ease-in-out_infinite] z-20 flex items-center gap-2">
              <span className="text-xl">📺</span> Live Classes
            </div>

            <div className="absolute top-16 -right-10 sm:-right-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-white text-sm font-semibold shadow-xl animate-[float_5s_ease-in-out_1s_infinite] z-20 flex items-center gap-2">
              <span className="text-xl">💬</span> Doubt Chat
            </div>

            <div className="absolute bottom-24 -left-8 sm:-left-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-white text-sm font-semibold shadow-xl animate-[float_6s_ease-in-out_2s_infinite] z-20 flex items-center gap-2">
              <span className="text-xl">📝</span> Mock Tests
            </div>

            <div className="absolute bottom-6 -right-8 sm:-right-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-white text-sm font-semibold shadow-xl animate-[float_4.5s_ease-in-out_0.5s_infinite] z-20 flex items-center gap-2">
              <span className="text-xl">📊</span> Progress Report
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Learn On The <span className="text-primary">Go</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Access all your study material, live classes, and doubt sessions anywhere, anytime with the Instructis mobile app.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-gray-300 font-medium">{f}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <button className="flex items-center gap-3 bg-black hover:bg-gray-900 border border-gray-800 text-white px-6 py-3 rounded-xl transition-colors">
                <svg className="w-8 h-8" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>
                <div className="text-left">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Download on the</div>
                  <div className="text-lg font-semibold leading-tight">App Store</div>
                </div>
              </button>

              <button className="flex items-center gap-3 bg-black hover:bg-gray-900 border border-gray-800 text-white px-6 py-3 rounded-xl transition-colors">
                <svg className="w-8 h-8 text-[#00E676]" viewBox="0 0 512 512" fill="currentColor"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" /></svg>
                <div className="text-left">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Get it on</div>
                  <div className="text-lg font-semibold leading-tight">Google Play</div>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-6 pt-6 border-t border-gray-800">
              <div>
                <div className="flex text-amber-400 mb-1">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 fill-current" />)}
                </div>
                <div className="text-white font-bold">4.8 Rating</div>
              </div>
              <div className="w-px h-10 bg-gray-800"></div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">2M+</div>
                <div className="text-gray-400 text-sm font-medium">Downloads</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
