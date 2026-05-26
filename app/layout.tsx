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
  title: "Cosmonapse — Distributed cognition protocol for autonomous AI agents",
  description:
    "Cosmonapse is a protocol, skill, and SDK for building AI agent systems. One envelope. One channel. Replaceable neurons.",
  metadataBase: new URL("https://cosmonapse.dev"),
  openGraph: {
    title: "Cosmonapse",
    description: "Distributed cognition protocol for autonomous AI agents.",
    type: "website",
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
