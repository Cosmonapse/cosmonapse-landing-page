import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
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

export const metadata: Metadata = {
  title: "Cosmonapse  -  Distributed cognition protocol for autonomous AI agents",
  description:
    "Cosmonapse is an open protocol and SDK for building autonomous AI agent systems. One envelope. One channel. Replaceable neurons. MIT licensed.",
  metadataBase: new URL("https://cosmonapse.dev"),
  keywords: [
    "AI agents",
    "agent protocol",
    "A2A",
    "multi-agent",
    "distributed cognition",
    "agent SDK",
    "Cosmonapse",
  ],
  openGraph: {
    title: "Cosmonapse  -  The nervous system for autonomous AI agents",
    description:
      "Open protocol and SDK for autonomous AI agents. One envelope. One channel. Replaceable neurons.",
    url: "https://cosmonapse.dev",
    siteName: "Cosmonapse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cosmonapse  -  The nervous system for autonomous AI agents",
    description:
      "Open protocol and SDK for autonomous AI agents. One envelope. One channel. Replaceable neurons.",
    site: "@Cosmonapse",
    creator: "@Cosmonapse",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
