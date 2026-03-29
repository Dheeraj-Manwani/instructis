"use client";

import { useEffect, useState } from "react";

import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { Stats } from "@/components/sections/Stats";
import { Courses } from "@/components/sections/Courses";
import { QuizSection } from "@/components/sections/QuizSection";
import { Results } from "@/components/sections/Results";
import { WhyUs } from "@/components/sections/WhyUs";
import { Faculty } from "@/components/sections/Faculty";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { BookDemo } from "@/components/sections/BookDemo";
import { Testimonials } from "@/components/sections/Testimonials";
import { ParentsCorner } from "@/components/sections/ParentsCorner";
import { ScholarshipResources } from "@/components/sections/ScholarshipResources";
import { ComparisonTable } from "@/components/sections/ComparisonTable";
import { CentersMap } from "@/components/sections/CentersMap";
import { NewsMedia } from "@/components/sections/NewsMedia";
import { MobileApp } from "@/components/sections/MobileApp";
import { FAQ } from "@/components/sections/FAQ";
import { Callback } from "@/components/sections/Callback";
import { Footer } from "@/components/sections/Footer";
import { ArrowUp } from "lucide-react";

export default function LandingPage() {
    const [showTopBtn, setShowTopBtn] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowTopBtn(window.scrollY > 500);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary-foreground overflow-x-hidden">
            <Navbar />

            <main>
                <Hero />
                <Marquee />
                <Stats />
                <Courses />
                {/* <QuizSection /> */}
                <Results />
                <WhyUs />
                <Faculty />
                <HowItWorks />
                {/* <BookDemo /> */}
                <Testimonials />
                {/* <ParentsCorner /> */}
                {/* <ScholarshipResources /> */}
                {/* <ComparisonTable /> */}
                <CentersMap />
                {/* <NewsMedia /> */}
                {/* <MobileApp /> */}
                <FAQ />
                <Callback />
            </main>

            <Footer />

            {/* Floating Action Buttons */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 items-end pointer-events-none">
                {/* Scroll to Top */}
                <button
                    onClick={scrollToTop}
                    className={`pointer-events-auto p-3 rounded-full bg-card text-foreground shadow-lg border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:shadow-black/30 ${showTopBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                >
                    <ArrowUp className="w-6 h-6" />
                </button>

                {/* WhatsApp Button */}
                <div className="relative pointer-events-auto group">
                    <div className="absolute inset-0 bg-[#25D366] rounded-full animate-pulse-ring -z-10" />
                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#1ebd5a] text-white rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] transition-transform hover:scale-110 active:scale-95"
                    >
                        {/* Custom WhatsApp SVG icon since Lucide doesn't have it exactly */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                    </a>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 bg-foreground text-background text-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md border border-border after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:left-full after:border-4 after:border-transparent after:border-l-foreground">
                        Chat with an Expert
                    </div>
                </div>
            </div>
        </div>
    );
}
