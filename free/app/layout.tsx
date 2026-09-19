import type { Metadata } from "next";
import "../../src/app/globals.css";

export const metadata: Metadata = {
  title: "TrendCatcher — Türkiye için fikir radarı",
  description: "Yurtdışından erken ürün sinyalleri, kaynak kanıtları ve Türkiye için dar MVP planları. Ücretsiz araştırma masası.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="tr"><body>{children}</body></html>;
}
