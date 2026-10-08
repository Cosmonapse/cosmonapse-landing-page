import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Michroma } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";
import { KEYWORDS_ALL, OG_IMAGE, SITE_NAME, SITE_URL, TWITTER, ogImage } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import ThemeScript from "@/components/ThemeScript";
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
    default: "Cosmonapse - Framework for Proactive, Event-Driven AI Agents",
    // Every child page renders as "<page title> | Cosmonapse".
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Cosmonapse is the open-source framework to build proactive, event-driven AI agents that act when something happens, not when someone types. Apache 2.0.",
  applicationName: SITE_NAME,
  keywords: KEYWORDS_ALL,
  authors: [{ name: "Cosmonapse", url: SITE_URL }],
  creator: "Cosmonapse",
  publisher: "Cosmonapse",
  category: "technology",
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
    title: "Cosmonapse - Framework for Proactive, Event-Driven AI Agents",
    description:
      "The open-source framework to build proactive, event-driven AI agents. Design them in Genesis, run them on the open Core protocol, watch them in Prism.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [ogImage()],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cosmonapse - Framework for Proactive, Event-Driven AI Agents",
    description:
      "The open-source framework to build proactive, event-driven AI agents. Design them in Genesis, run them on Core, watch them in Prism.",
    site: TWITTER,
    creator: TWITTER,
    images: [`${SITE_URL}${OG_IMAGE}`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} ${michroma.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
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
