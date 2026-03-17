import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import fullLogo from "@/assets/full_logo.png";
import appLogo from "@/assets/logo.png";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Instructis",
  description: "Instructis analytics dashboard",
  metadataBase: process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL)
    : undefined,
  manifest: "/assets/site.webmanifest",
  icons: {
    icon: appLogo.src,
    shortcut: appLogo.src,
    apple: appLogo.src,
  },
  openGraph: {
    title: "Instructis",
    description: "Instructis analytics dashboard",
    url: "/",
    siteName: "Instructis",
    images: [
      {
        url: fullLogo.src,
        width: 1200,
        height: 630,
        alt: "Instructis",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instructis",
    description: "Instructis analytics dashboard",
    images: [fullLogo.src],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
