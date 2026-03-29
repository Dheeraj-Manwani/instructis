"use client";

import Image from "next/image";
import { MapPin, Phone, Mail, Instagram, Youtube, Facebook, Twitter, Linkedin } from "lucide-react";
import appLogo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="bg-dark-navy text-gray-300 dark:bg-zinc-950 dark:text-zinc-300 pt-20 pb-10 relative border-t-[16px] border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Newsletter Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pb-16 border-b border-gray-800 dark:border-zinc-800 mb-16">
          <div className="text-center lg:text-left">
          </div>
          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">

          </div>
        </div>

        {/* Main 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Col 1 */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                <Image src={appLogo} alt="Instructis" className="h-8 w-8 object-contain" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">Instructis</span>
            </div>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Where Toppers Are Made. India's premier coaching institute for JEE & NEET preparation with a legacy of 35+ years of excellence.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/instructis.in?igsh=Zjdzbm44bTM3d2d5" target="_blank" className="w-10 h-10 rounded-full bg-gray-800 dark:bg-zinc-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Instagram className="w-5 h-5" /></a>
              <a href="https://www.linkedin.com/company/instructiss/" target="_blank" className="w-10 h-10 rounded-full bg-gray-800 dark:bg-zinc-800 flex items-center justify-center hover:bg-blue-800 hover:text-white transition-all"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-4">
              {[
                { label: "About Us", href: "#about" },
                { label: "Results 2025", href: "#results" },
                { label: "Our Faculty", href: "#faculty" },
                { label: "Study Centers", href: "#centers" },
                { label: "Careers", href: "#callback" },
                { label: "Media & Press", href: "#testimonials" },
                { label: "Blog", href: "#testimonials" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="hover:text-primary transition-colors flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-gray-600 dark:before:bg-zinc-600 before:rounded-full hover:before:bg-primary"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Programs</h4>
            <ul className="space-y-4">
              {['JEE Main', 'JEE Advanced', 'NEET UG', 'Foundation (Class 6-10)', 'Distance Learning Program', 'Online Test Series (AITS)', 'Crash Courses'].map((link) => (
                <li key={link}>
                  <a href="#courses" className="hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-primary shrink-0" />
                <span className="text-gray-400">Plot no 13/4 software unit layout madhapur, hydrabad - 5000081</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="w-6 h-6 text-primary shrink-0" />
                <span className="text-white font-bold text-lg">+91 70938 58372</span>
              </li>
              {/* <li className="flex items-center gap-4">
                <Mail className="w-6 h-6 text-primary shrink-0" />
                <a href="mailto:info@instructis.com" className="hover:text-white transition-colors">info@instructis.com</a>
              </li> */}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400 dark:text-zinc-400">
          <p>© {new Date().getFullYear()} Instructis. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
            <a href="#" className="hover:text-white transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
