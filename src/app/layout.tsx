import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const sans = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-sans" });
const serif = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Trend Arbitraj Radarı — Yurtdışında para basanı yakala, Türkiye'de ilk sen çık",
  description:
    "Yükselen internet trendlerini pazarına ulaşmadan keşfet. Türk kurucular, indie hackerlar ve avcılar için üretildi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={`${sans.variable} ${serif.variable}`}>{children}</body>
    </html>
  );
}
