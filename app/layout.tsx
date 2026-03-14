import type { Metadata } from "next";

import { Toaster } from "@/components/toaster";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Wavelength Prototype",
  description: "A warm multiplayer party-game prototype inspired by Wavelength.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,113,133,0.35),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.22),_transparent_30%),linear-gradient(180deg,#fff6ee_0%,#fff9f5_45%,#f9fbff_100%)] text-slate-900">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-[-10%] top-20 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
          <div className="absolute right-[-8%] top-24 h-80 w-80 rounded-full bg-indigo-200/35 blur-3xl" />
          <div className="absolute bottom-[-10%] left-1/3 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />
        </div>
        <main className="relative z-10">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
