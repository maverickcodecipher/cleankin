import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CleanKin Chennai — Civic Cleanup Arena",
  description: "Report dump spots, battle for your zone on the Chennai Clean League, and track civic cleanup across the city.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} w-full min-h-screen m-0 p-0 overflow-x-hidden h-full antialiased`}
    >
      <body className="w-full min-h-screen m-0 p-0 overflow-x-hidden flex flex-col bg-background text-foreground">
        <AuthProvider>
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <Navbar />
          <main id="main-content" className="flex-grow">
            {children}
          </main>
          <footer className="bg-[#05080A] border-t border-[#1D2B23] mt-auto relative overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#35F27C]/60 to-transparent" />
            <div className="max-w-7xl mx-auto px-6 py-12 text-center">
              <p className="text-2xl font-black tracking-tight text-white mb-2">CleanKin <span className="text-[#35F27C]">Arena</span></p>
              <p className="text-sm text-[#93A89A] mb-4">
                &copy; 2026 CleanKin. All rights reserved. | <Link href="/terms" className="text-[#35F27C] underline font-semibold">Terms of Service</Link>
              </p>
              <p className="text-xs text-[#5C7263] max-w-2xl mx-auto italic">
                CleanKin is dedicated to civic cleanup and community action across Chennai. We do not provide medical or nursing services.
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
