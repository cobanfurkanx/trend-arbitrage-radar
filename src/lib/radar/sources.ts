import type { RawSignalInput } from "../sources/types";
import type { Revenue } from "./schema";

// Free radar connectors need not become selectable providers in the legacy app.
export type RadarInput = Omit<RawSignalInput, "source"> & { source: string; revenue?: Revenue };
export function sourceFailure(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  const status = /HTTP[ _](\d{3})/.exec(message)?.[1];
  if (status === "401" || status === "403") return "Erişim reddedildi; token veya kaynak iznini kontrol et.";
  if (status === "429") return "Kaynak istek sınırına ulaşıldı; önceki kayıtlar korunuyor.";
  if (message === "PH_GRAPHQL_ERROR") return "Product Hunt GraphQL sorgusu reddedildi.";
  if (message.includes("INVALID_RESPONSE")) return "Kaynak yanıtı beklenen veri yapısında değil.";
  return "Kaynağa erişilemedi; bağlantı, zaman aşımı veya servis hatası.";
}
