import { expect, it } from "vitest";
import type { Analysis } from "./schema";
import { vetAnalysis } from "./analysis-quality";

const draft: Analysis = { title: "Fatura takip", summary: "Araştırma hipotezi", customer: "Ajanslar", problem: "Geç ödemeler", turkishAngle: "Türkçe takip ihtiyacını test et", features: ["Vade takibi"], firstCustomers: ["Beş ajansa e-posta"], validation: ["Beş ajansla görüş", "Bir ücretli pilot teklif et"], stopCondition: "Ödeme niyeti yoksa dur", unknowns: ["Talep bilinmiyor"], mvpDays: 7, difficulty: "easy" };
it("rejects invented completed experiments and metrics masquerading as a validation plan", () => {
  expect(() => vetAnalysis({ ...draft, validation: ["İlk 10 kullanıcıdan 8'i %40 artış bildirdi", "Bir ücretli pilot teklif et"] })).toThrow("AI_UNSUPPORTED_CLAIMS");
  expect(() => vetAnalysis({ ...draft, validation: ["30 gün içinde 2.124$ gelir", "60% profit margin"] })).toThrow("AI_UNSUPPORTED_CLAIMS");
});
it("rejects unsupported Turkey-first claims and unknown architecture presented as free", () => {
  expect(() => vetAnalysis({ ...draft, turkishAngle: "Türkiye'de bu alandaki ilk uygulama" })).toThrow();
  expect(() => vetAnalysis({ ...draft, builder: { buyer: "agency", format: "web", upfrontUsd: 0, monthlyUsd: 0, needsApi: false, needsGpu: false, needsPrivateData: false, basis: "Kaynakta açık mimari veya fiyat yoktur." } })).toThrow();
});
it("accepts an actionable hypothesis without manufacturing evidence", () => { expect(vetAnalysis(draft)).toEqual(draft); });
