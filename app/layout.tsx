import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import SmoothScrollProvider from "@/components/providers/smooth-scroll-provider";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aura — The Intelligent Parent Dashboard",
  description:
    "Aura organizes every school update — homework, exams, circulars, PDFs, and reminders — into one intelligent dashboard for parents.",
};

export const viewport: Viewport = {
  themeColor: "#EEF0EF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@700,800,500,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-canvas text-ink antialiased">
        <div className="grain-overlay" />
        <SmoothScrollProvider>
          <Navbar />
          {children}
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
