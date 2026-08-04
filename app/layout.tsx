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
    default: "Cosmonapse - Platform Suite for Event-Driven AI",
    // Every child page renders as "<page title> | Cosmonapse".
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Design, run and observe event-driven AI systems. Genesis to build them, the open Apache 2.0 Core protocol to run them, Prism to watch them. No orchestrator loop.",
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
    title: "Cosmonapse - Platform Suite for Event-Driven AI",
    description:
      "Design them in Genesis, run them on the open Core protocol, watch them in Prism. Build domain-specialised AI systems, not another model wrapper. Apache 2.0.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [ogImage()],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cosmonapse - Platform Suite for Event-Driven AI",
    description:
      "Design them in Genesis, run them on the open Core protocol, watch them in Prism. Build domain-specialised AI systems, not another model wrapper.",
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
