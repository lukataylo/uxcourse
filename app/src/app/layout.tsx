import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UX × AI — Custom courses, generated for you",
  description:
    "A custom UX × AI course generated from 200+ public-domain sources and your goals. $100, once.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable}`}>
      <body className="min-h-screen flex flex-col">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteNav() {
  return (
    <nav className="no-print border-b border-border/70 bg-background/80 backdrop-blur sticky top-0 z-10">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          uxcourse<span className="text-accent">.</span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/#how" className="text-muted-foreground hover:text-foreground">
            How it works
          </Link>
          <Link href="/#pricing" className="text-muted-foreground hover:text-foreground">
            Pricing
          </Link>
          <Link
            href="/start"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-primary-foreground hover:bg-primary/90"
          >
            Start
          </Link>
        </div>
      </div>
    </nav>
  );
}

function SiteFooter() {
  return (
    <footer className="no-print border-t border-border/70 mt-24">
      <div className="container py-10 text-sm text-muted-foreground flex flex-col md:flex-row justify-between gap-4">
        <div>© {new Date().getFullYear()} uxcourse — built on 200+ public-domain sources.</div>
        <div className="flex gap-5">
          <Link href="/start" className="hover:text-foreground">Start a course</Link>
          <Link href="/admin" className="hover:text-foreground">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
