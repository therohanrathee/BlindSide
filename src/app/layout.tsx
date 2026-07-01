import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BlindSide — Blind Dating for Your University",
  description:
    "The verified blind dating platform for university students. No photos, no swiping — just real connections. Get matched based on personality, meet in person, and let the mystery unfold.",
  keywords: [
    "blind dating",
    "university dating",
    "college dating",
    "blind date app",
    "verified dating",
    "India dating",
  ],
  authors: [{ name: "BlindSide" }],
  openGraph: {
    title: "BlindSide — Blind Dating for Your University",
    description:
      "No photos, no swiping — just real connections. Get matched based on personality and meet in person.",
    type: "website",
    locale: "en_IN",
    siteName: "BlindSide",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlindSide — Blind Dating for Your University",
    description:
      "No photos, no swiping — just real connections. Get matched based on personality and meet in person.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0e1117" },
    { media: "(prefers-color-scheme: light)", color: "#f4f5f7" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Inline script to prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('blindside-theme');
                  if (stored === 'light' || stored === 'dark') {
                    document.documentElement.setAttribute('data-theme', stored);
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
