import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import AuthModal from "./components/AuthModal";
import CleanKinNavbar from "./components/CleanKinNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CleanKin Chennai — Civic Cleanup Network",
  description: "Report dump spots, organize cleanup drives, and track civic cleanup progress across Chennai.",
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
          <CleanKinNavbar />
          <AuthModal />
          <main id="main-content" className="flex-grow">
            {children}
          </main>
          <footer className="bg-teal-50 border-t border-teal-200 mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-12 text-center">
              <p className="text-sm text-slate-700 mb-4">
                &copy; 2026 CleanKin. All rights reserved. | <Link href="/terms" className="text-teal-800 underline">Terms of Service</Link>
              </p>
              <p className="text-xs text-slate-600 max-w-2xl mx-auto italic">
                CleanKin is dedicated to civic cleanup and community action across Chennai. We do not provide medical or nursing services.
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
