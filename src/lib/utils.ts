import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { EarlySignal } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
}

export function relativeTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = Date.now() - date.getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "az önce";
  if (h < 24) return `${h} sa önce`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} gün önce`;
  return formatDate(date);
}

export function scoreLabel(score: number): string {
  if (score >= 80) return "Yüksek öncelik";
  if (score >= 65) return "İzlemeye değer";
  if (score >= 50) return "Erken izleme";
  return "Zayıf sinyal";
}

export const DEMO_BADGE = "Demo Verisi";

export type FirstMoverWindow = "OPEN" | "NARROW" | "CROWDED";

export function firstMoverWindow(earlySignal: EarlySignal, competitionGap: number): FirstMoverWindow {
  if (
    (earlySignal === "VeryEarly" && competitionGap >= 70) ||
    (earlySignal === "Emerging" && competitionGap >= 82)
  )
    return "OPEN";
  if (earlySignal === "Established" || competitionGap < 50) return "CROWDED";
  return "NARROW";
}

export function windowDot(w: FirstMoverWindow): string {
  switch (w) {
    case "OPEN":
      return "bg-moss";
    case "NARROW":
      return "bg-ochre";
    default:
      return "bg-ink-faint";
  }
}

export function windowLabel(w: FirstMoverWindow): string {
  switch (w) {
    case "OPEN":
      return "İlk hamle penceresi açık";
    case "NARROW":
      return "Pencere daralıyor";
    default:
      return "Kalabalık";
  }
}
