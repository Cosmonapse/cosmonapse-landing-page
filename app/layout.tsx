import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Michroma } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";
import { KEYWORDS_ALL, SITE_NAME, SITE_URL, TWITTER } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// Geometric display face used for the "Cosmonapse" wordmark  -  closest
// Google-hosted match to the NASA "worm" logotype style.
const michroma = Michroma({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-brand",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Cosmonapse - Open Protocol for Event-Driven AI Agents",
    // Every child page renders as "<page title> | Cosmonapse".
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "The open Apache 2.0 protocol for event-driven AI agents. Build reactive multi-agent harnesses on one signal envelope and one channel - no orchestrator loop.",
  applicationName: SITE_NAME,
  keywords: KEYWORDS_ALL,
  authors: [{ name: "Cosmonapse", url: SITE_URL }],
  creator: "Cosmonapse",
  publisher: "Cosmonapse",
  category: "technology",
  alternates: { canonical: SITE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Cosmonapse - Event-Driven AI Agents",
    description:
      "The open protocol for event-driven AI agents and reactive multi-agent harnesses. One envelope. One channel. Replaceable neurons. Apache 2.0.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cosmonapse - Event-Driven AI Agents",
    description:
      "The open protocol for event-driven AI agents and reactive multi-agent harnesses. One envelope. One channel. Replaceable neurons.",
    site: TWITTER,
    creator: TWITTER,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${michroma.variable}`}>
      <body>
        <JsonLd />
        <Nav />
        <main>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
