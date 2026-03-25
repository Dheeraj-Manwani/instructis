"use client";

import { Phone } from "lucide-react";

export default function CallbackFloatingPhoneButton() {
  function scrollToCallback() {
    const el = document.getElementById("callback");
    if (el) {
      // Offset for the fixed navbar so the section title isn't hidden.
      const navOffset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({ top, behavior: "smooth" });
      return;
    }
    // Fallback for edge cases
    window.location.hash = "#callback";
  }

  return (
    <button
      type="button"
      onClick={scrollToCallback}
      aria-label="Request a callback"
      className="fixed bottom-6 right-6 z-[60] h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/25 border border-white/20 flex items-center justify-center transition-transform duration-200 hover:scale-105 animate-[pulse_2s_ease-in-out_infinite] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50"
    >
      <Phone className="w-6 h-6 text-white" />
    </button>
  );
}

