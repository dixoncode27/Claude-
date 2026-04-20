import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TBWR — The Best Wrestler | Youth Wrestling Club",
  description:
    "Premium youth wrestling development in Reno/Sparks. Structured training, real athlete development, and clear pathways from beginner to champion.",
  keywords: [
    "youth wrestling",
    "wrestling club",
    "Reno wrestling",
    "Sparks wrestling",
    "athlete development",
    "TBWR",
  ],
  openGraph: {
    title: "TBWR — The Best Wrestler",
    description: "Where champions are developed, not discovered.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-tbwr-black text-tbwr-white antialiased">{children}</body>
    </html>
  );
}
