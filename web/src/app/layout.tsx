import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillBench",
  description: "A/B experiment results for Claude Code configurations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <nav className="border-b border-zinc-800 px-6 py-4">
          <div className="mx-auto flex max-w-5xl items-center gap-6">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              SkillBench
            </Link>
            <Link href="/methodology" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Methodology
            </Link>
          </div>
        </nav>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
