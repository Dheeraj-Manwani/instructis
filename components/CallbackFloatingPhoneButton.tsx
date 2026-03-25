"use client";

import { Phone } from "lucide-react";

export default function CallbackFloatingPhoneButton() {
  return (
    <a
      href="#callback"
      aria-label="Request a callback"
      className="fixed bottom-6 right-6 z-60 h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/25 border border-white/20 flex items-center justify-center transition-transform duration-200 hover:scale-105 animate-[pulse_2s_ease-in-out_infinite] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50"
    >
      <Phone className="w-6 h-6 text-white" />
    </a>
  );
}

