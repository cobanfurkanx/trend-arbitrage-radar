import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import type { Card, Snapshot } from "../../src/lib/radar/schema";

test("built site serves real signals and stays usable on mobile", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("kanıtla seç");
  const json = await (await page.request.get("/data/radar.json")).json() as Snapshot;
  expect(json.version).toBe(1);
  if (json.cards.length) {
    await expect(page.locator("article").first()).toBeVisible();
    await page.getByRole("button", { name: "Dosyayı aç", exact: true }).first().click();
    await expect(page.getByRole("heading", { name: "Kaynak kanıtları" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: "Kaynak kanıtları" })).toBeVisible();
  }
  await page.goto("/");
  await page.screenshot({ path: ".radar/qa/desktop.png", fullPage: false });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: ".radar/qa/mobile.png", fullPage: false });
  expect(errors).toEqual([]);
});

const card: Card = {
  id: "p_test_only", title: "Test invoice product", category: "SaaS", signalIds: ["s_test"],
  firstSeen: "2026-09-11T09:00:00Z", lastSeen: "2026-09-11T09:00:00Z", fingerprint: "test",
  analyzedFingerprint: "test", analyzedAt: "2026-09-11T09:00:00Z", analysisStatus: "ready",
  momentum: 50, velocity: null, opportunityScore: null, confidence: "low", stage: "radar", review: null,
  signals: [{ id: "s_test", source: "hackernews", url: "https://news.ycombinator.com/item?id=1", productUrl: null, title: "Test fixture", description: "Browser test only", category: "SaaS", publishedAt: "2026-09-11T09:00:00Z", firstSeen: "2026-09-11T09:00:00Z", lastSeen: "2026-09-11T09:00:00Z", engagement: 5 }],
  analysis: {
    title: "Test: Fatura takip aracı", summary: "Yalnız tarayıcı testi için hazırlanmış araştırma hipotezi.", customer: "Küçük ajanslar", problem: "Geciken fatura takibi", turkishAngle: "Türkçe hatırlatma hipotezi",
    features: ["Fatura ekle", "Vade takibi", "Hatırlatma taslağı"], firstCustomers: ["Beş ajansla görüş"],
    validation: ["Beş müşteri görüşmesi yap", "Bir ödeme niyeti ara"], stopCondition: "Beş görüşmede ihtiyaç yoksa dur", unknowns: ["Ödeme isteği bilinmiyor"], mvpDays: 3, difficulty: "easy",
  },
};

test("saved notes, progress, filters, plan download and economics work without a backend", async ({ page }) => {
  await page.route("**/data/radar.json", (r) => r.fulfill({ json: { version: 1, generatedAt: new Date().toISOString(), lastSuccessfulCollection: new Date().toISOString(), sources: [], cards: [card] } }));
  await page.goto("/");
  await page.getByRole("button", { name: "Kanıtlı fırsatlar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Henüz kanıtları tamamlanmış fırsat yok." })).toBeVisible();
  await page.getByRole("button", { name: "Erken radar", exact: true }).click();
  await page.getByRole("combobox", { name: "Kategori", exact: true }).selectOption("AI");
  await expect(page.locator("article")).toHaveCount(0);
  await page.getByRole("combobox", { name: "Kategori", exact: true }).selectOption("SaaS");
  await page.getByRole("button", { name: "Kaydet", exact: true }).click();
  await page.getByRole("button", { name: "Çalışma listem", exact: true }).click();
  await expect(page.locator("article")).toHaveCount(1);
  await page.getByRole("button", { name: "Dosyayı aç", exact: true }).click();
  await page.getByLabel("Aşama", { exact: true }).selectOption("interviewing");
  await page.getByLabel("Görüşmeler, bulgular, kararlar").fill("Üç ajansla görüştüm.");
  await page.reload();
  await expect(page.getByLabel("Görüşmeler, bulgular, kararlar")).toHaveValue("Üç ajansla görüştüm.");
  await expect(page.getByLabel("Aşama", { exact: true })).toHaveValue("interviewing");
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: "Planı indir" }).click();
  const download = await event;
  const content = await readFile((await download.path())!, "utf8");
  expect(content).toContain("Fatura ekle");
  expect(content).toContain("Önce doğrula");
  await page.getByLabel("Fiyat / müşteri (TL)", { exact: true }).fill("10");
  await expect(page.getByText("Birim katkı pozitif olmalı", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Araştırma masası", exact: true }).click();
  await page.getByRole("button", { name: "Çalışma listem", exact: true }).click();
  const backupEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Notları dışa aktar" }).click();
  const backup = await backupEvent;
  expect(JSON.parse(await readFile((await backup.path())!, "utf8"))[card.id].note).toBe("Üç ajansla görüştüm.");
});

test("backup import preserves ideas saved while the file is being read", async ({ page }) => {
  await page.route("**/data/radar.json", (r) => r.fulfill({ json: { version: 1, generatedAt: new Date().toISOString(), lastSuccessfulCollection: new Date().toISOString(), sources: [], cards: [card] } }));
  await page.goto("/");
  await page.getByRole("button", { name: "Çalışma listem", exact: true }).click();
  // Hold file I/O open while the user continues working in the notebook.
  await page.evaluate(() => {
    const original = File.prototype.text;
    File.prototype.text = async function () {
      await new Promise<void>((resolve) => {
        Object.assign(window, { finishBackupRead: resolve });
      });
      return original.call(this);
    };
  });
  await page.getByLabel("Yedek içe aktar").setInputFiles({
    name: "backup.json", mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ p_archived: { status: "building", note: "Imported research" } })),
  });
  await page.waitForFunction(() => "finishBackupRead" in window);
  await page.getByRole("button", { name: "Erken radar", exact: true }).click();
  await page.getByRole("button", { name: "Kaydet", exact: true }).click();
  await page.evaluate(() => (window as unknown as { finishBackupRead: () => void }).finishBackupRead());
  await expect(page.getByRole("status")).toContainText("Notlar içe aktarıldı.");
  await page.reload();
  await page.getByRole("button", { name: "Çalışma listem", exact: true }).click();
  await expect(page.locator("article")).toHaveCount(1);
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Notları dışa aktar" }).click();
  const backup = await downloadEvent;
  expect(JSON.parse(await readFile((await backup.path())!, "utf8"))).toEqual({
    [card.id]: { status: "watching", note: "" },
    p_archived: { status: "building", note: "Imported research" },
  });
});

test("a failed snapshot request has a recoverable error state", async ({ page }) => {
  await page.route("**/data/radar.json", (r) => r.fulfill({ status: 503 }));
  await page.goto("/");
  await expect(page.getByRole("alert").filter({ hasText: "Veriler yüklenemedi" })).toBeVisible();
  await page.unroute("**/data/radar.json");
  await page.getByRole("button", { name: "Yeniden dene" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("kanıtla seç");
});

test("builder filters keep unknown costs out and separate SDKs from ideas", async ({ page }) => {
  const sdk = { ...card, id: "p_sdk", title: "Payments SDK", signals: [{ ...card.signals[0], title: "Payments SDK", description: "A library for developers" }] };
  await page.route("**/data/radar.json", (r) => r.fulfill({ json: { version: 1, generatedAt: new Date().toISOString(), lastSuccessfulCollection: new Date().toISOString(), sources: [], cards: [card, sdk] } }));
  await page.goto("/");
  await expect(page.locator("article")).toHaveCount(1);
  await page.getByLabel("Kime satılır?", { exact: true }).selectOption("agency");
  await expect(page.locator("article")).toHaveCount(1);
  await page.getByText("Bütçe, zorluk ve bağımlılıklar", { exact: true }).click();
  await page.getByLabel("Başlangıç bütçesi · USD", { exact: true }).selectOption("0");
  await expect(page.locator("article")).toHaveCount(0);
  await page.getByLabel("Başlangıç bütçesi · USD", { exact: true }).selectOption("unknown");
  await expect(page.locator("article")).toHaveCount(1);
  await page.getByLabel("Ticari kanıt", { exact: true }).selectOption("reviewed");
  await expect(page.locator("article")).toHaveCount(0);
  await page.getByRole("button", { name: "Tüm filtreleri temizle" }).click();
  await page.getByRole("button", { name: "Yapım araçları", exact: true }).click();
  await expect(page.locator("article")).toHaveCount(1);
  await page.getByRole("button", { name: "Dosyayı aç", exact: true }).click();
  await expect(page.getByText("Yapım aracı; doğrudan satılabilir ürün olarak değerlendirilmedi.")).toBeVisible();
});

test("revenue examples work without AI and distinguish income from profit", async ({ page }) => {
  const stamp = new Date().toISOString();
  const earned: Card = { ...card, id: "p_revenue", title: "Revenue App", analysis: undefined, analysisStatus: "pending", signals: [{ ...card.signals[0], source: "trustmrr", revenue: {
    last30DaysUsd: 500, mrrUsd: 120, totalUsd: 1900, growth30d: 15, profitMarginReported: null,
    foundedAt: null, observedAt: stamp, syncedAt: null, paymentProvider: "stripe", sourceUrl: "https://trustmrr.com/startup/example",
  } }] };
  await page.route("**/data/radar.json", (r) => r.fulfill({ json: { version: 1, generatedAt: stamp, lastSuccessfulCollection: stamp, sources: [{ name: "producthunt", status: "disabled", count: 0, reason: "Token mevcut; kullanım izni onayı yapılandırılmadı." }], cards: [earned] } }));
  await page.goto("/");
  await page.getByRole("button", { name: "Gelirli örnekler", exact: true }).click();
  await expect(page.locator("article")).toHaveCount(1);
  await expect(page.getByText("Son 30 gün gelir", { exact: true })).toBeVisible();
  await page.getByLabel("Gelir seçkisi", { exact: true }).selectOption("young");
  await expect(page.locator("article")).toHaveCount(0);
  await page.getByLabel("Gelir seçkisi", { exact: true }).selectOption("margin");
  await expect(page.locator("article")).toHaveCount(0);
  await page.getByLabel("Gelir seçkisi", { exact: true }).selectOption("all");
  await page.getByRole("button", { name: "Dosyayı aç", exact: true }).click();
  await expect(page.getByText("Kâr marjı · sahibinin beyanı", { exact: true })).toBeVisible();
  await expect(page.getByText("Gelir, net kâr değildir.", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: "Gelir kaynağını aç" })).toHaveAttribute("href", "https://trustmrr.com/startup/example");
  await page.getByRole("button", { name: "Araştırma masası", exact: true }).click();
  await page.getByText("Puanlar ve kaynaklar nasıl okunmalı?", { exact: true }).click();
  await expect(page.getByText("producthunt: Token mevcut; kullanım izni onayı yapılandırılmadı.")).toBeVisible();
});
