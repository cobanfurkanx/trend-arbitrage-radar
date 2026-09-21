"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Bookmark, Check, Copy, Download, Search } from "lucide-react";
import type { Card, Snapshot } from "../../src/lib/radar/schema";
import { buildPrompt, economics, notebookSchema, type Notebook } from "../../src/lib/radar/client";
import { builderProfile, compareForBuilder, defaultBuilderFilters, matchesBuilder } from "../../src/lib/radar/builder";
import { BuilderBadges, BuilderControls, BuilderSummary } from "./builder-controls";
import { compareRevenue, matchesRevenue, revenueOf } from "../../src/lib/radar/revenue";
import { RevenuePanel } from "./revenue-panel";

const STORAGE = "trendcatcher.notebook.v1";
const categories: Record<string, string> = { AI: "Yapay zeka", SaaS: "SaaS", Developer: "Geliştirici araçları", Consumer: "Tüketici", "E-commerce": "E-ticaret", Social: "Sosyal", Content: "İçerik", Domains: "Domain", Other: "Diğer" };
const statuses = { watching: "İzliyorum", interviewing: "Müşteri görüşmesi", building: "Geliştiriyorum", paid: "İlk ödeme", dropped: "Vazgeçtim" };
const evidenceLabels = { pricing: "Fiyatlandırma", paying_customers: "Ödeme yapan müşteriler", turkey_demand: "Türkiye talebi", competitor: "Rakip araştırması", distribution: "Müşteri erişimi" };
function date(value: string) { return new Date(value).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" }); }
function download(name: string, content: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function External({ url, children }: { url: string; children: React.ReactNode }) {
  if (!/^https?:\/\//i.test(url)) return <span>{children}</span>;
  return <a href={url} target="_blank" rel="noopener noreferrer" className="text-brick hover:underline">{children} <ArrowUpRight className="inline" size={12} aria-hidden /></a>;
}
function Lines({ items }: { items: string[] }) { return <ol className="mt-3 space-y-2">{items.map((s, i) => <li key={i} className="flex gap-3 text-sm leading-relaxed"><span className="tnum text-ink-faint">{String(i + 1).padStart(2, "0")}</span><span>{s}</span></li>)}</ol>; }

export default function Page() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [notebook, setNotebook] = useState<Notebook>({});
  const notebookRef = useRef<Notebook>({});
  const [storageReady, setStorageReady] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [tab, setTab] = useState("radar");
  const [revenuePreset, setRevenuePreset] = useState("meaningful");
  const [days, setDays] = useState("all");
  const [sort, setSort] = useState("momentum");
  const [builderFilters, setBuilderFilters] = useState(defaultBuilderFilters);
  const [selected, setSelected] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const ctrl = new AbortController();
    setError("");
    fetch(`${process.env.NEXT_PUBLIC_RADAR_BASE_PATH ?? ""}/data/radar.json`, { signal: ctrl.signal })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d: Snapshot) => { if (d.version !== 1 || !Array.isArray(d.cards)) throw new Error(); setData(d); })
      .catch(() => { if (!ctrl.signal.aborted) setError("Veriler yüklenemedi. Bağlantını kontrol edip yeniden dene."); });
    return () => ctrl.abort();
  }, [reload]);
  useEffect(() => {
    try {
      notebookRef.current = notebookSchema.parse(JSON.parse(localStorage.getItem(STORAGE) ?? "{}"));
      setNotebook(notebookRef.current);
    }
    catch { setNotice("Kayıtlar okunamadı. Varsa yedeğini içe aktar; yeni kayıtlar bu cihazda tutulacak."); }
    setStorageReady(true);
    const sync = () => setSelected(new URL(window.location.href).searchParams.get("idea"));
    sync(); window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  function update(id: string, value: Notebook[string] | null) {
    const next = { ...notebookRef.current }; if (value) next[id] = value; else delete next[id];
    notebookRef.current = next;
    setNotebook(next);
    try { localStorage.setItem(STORAGE, JSON.stringify(next)); }
    catch { setNotice("Tarayıcı kayıt alanı kullanılamıyor. Kaybolmaması için notlarını dışa aktar."); }
  }
  function openCard(id: string | null) {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("idea", id); else url.searchParams.delete("idea");
    window.history.pushState({}, "", url); setSelected(id); window.scrollTo(0, 0);
  }
  const cards = data?.cards ?? [];
  const active = cards.find((c) => c.id === selected);
  const visible = cards.filter((c) => {
    const kind = builderProfile(c).kind;
    if (tab === "saved" ? !notebook[c.id] : tab === "tools" ? kind !== "tool" : kind === "tool" || (tab === "revenue" ? !matchesRevenue(c, revenuePreset) : tab === "validated" ? c.stage !== "validated" : c.stage !== "radar")) return false;
    if (!matchesBuilder(c, builderFilters, tab === "radar" || tab === "validated")) return false;
    if (category !== "all" && c.category !== category) return false;
    if (days !== "all" && (!c.analysis || c.analysis.mvpDays > Number(days))) return false;
    return `${c.title} ${c.analysis?.title ?? ""} ${c.analysis?.summary ?? ""} ${c.analysis?.customer ?? ""} ${c.signals.map((s) => s.description).join(" ")}`.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr"));
  }).sort((a, b) => sort === "newest" ? b.firstSeen.localeCompare(a.firstSeen) : sort === "score" ? (b.opportunityScore ?? -1) - (a.opportunityScore ?? -1) : tab === "revenue" ? compareRevenue(a, b) : compareForBuilder(a, b));
  const stale = data?.lastSuccessfulCollection && Date.now() - Date.parse(data.lastSuccessfulCollection) > 48 * 3600000;
  return <div className="min-h-screen flex flex-col">
    <header className="border-b border-line bg-paper"><div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
      <button onClick={() => openCard(null)} className="font-serif text-xl font-semibold tracking-tight">TrendCatcher</button>
      <span className="text-[10px] uppercase tracking-[.18em] text-ink-faint">by ShepardAI</span>
      <span className="ml-auto border border-line px-2 py-1 text-[10px] uppercase tracking-widest">Ücretsiz araştırma masası</span>
    </div></header>
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      {notice && <div role="status" className="mb-4 border border-line bg-paper-soft p-3 text-sm">{notice}<button className="ml-3 underline" onClick={() => setNotice("")}>Kapat</button></div>}
      {error ? <div role="alert" className="border border-line p-6"><p>{error}</p><button className="btn-ghost mt-3" onClick={() => setReload((v) => v + 1)}>Yeniden dene</button></div>
        : !data ? <p role="status">Araştırma masası yükleniyor…</p>
        : active ? <Detail card={active} entry={notebook[active.id]} back={() => openCard(null)} save={(v) => update(active.id, v)} notify={setNotice} />
        : selected ? <div><button className="btn-ghost" onClick={() => openCard(null)}>Radara dön</button><h1 className="mt-6 font-serif text-2xl">Bu fikir güncel seçkide bulunmuyor.</h1><p className="mt-2 text-ink-soft">Arşivlenmiş olabilir. Cihazındaki notlar dışa aktarma dosyasında korunur.</p></div>
        : <>
          <p className="kicker">Vibe coderlar için · Fikirden ilk müşteriye</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">Bir sonraki ürününü<br /><span className="text-brick">kanıtla seç.</span></h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">Kime satacağını, ne kadar sürede geliştireceğini ve neye ihtiyaç duyacağını gör. Türkiye ihtiyacını doğrula; üç özelliklik bir MVP ile başla.</p>
          <div className="mt-6 grid grid-cols-3 border-y border-line py-4">
            {[ [cards.filter((c) => builderProfile(c).solo).length, "solo MVP adayı"], [cards.filter((c) => builderProfile(c).kind === "tool").length, "yapım aracı"], [cards.filter((c) => c.stage === "validated" && builderProfile(c).kind === "product").length, "kanıtları incelendi"] ].map(([count, label]) => <div key={label} className="border-r border-line pl-3 first:pl-0 last:border-0 sm:pl-6"><p className="font-serif text-3xl tnum">{count}</p><p className="mt-1 text-xs text-ink-dim">{label}</p></div>)}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-dim"><span>Son başarılı tarama: {data.lastSuccessfulCollection ? date(data.lastSuccessfulCollection) : "Henüz yok"}</span><span>{data.sources.filter((s) => s.status === "ok").length} kaynak akışı erişilebilir</span></div>
          {stale && <p role="status" className="mt-2 text-sm text-ochre">Son tarama 48 saatten eski. Aşağıdaki kayıtlar son başarılı seçkidir.</p>}
          {data.sources.some((s) => s.status === "failed") && <p className="mt-2 text-xs text-ochre">Geçici olarak erişilemeyen kaynaklar: {data.sources.filter((s) => s.status === "failed").map((s) => s.name).join(", ")}. Önceki kayıtlar korunuyor.</p>}
          {cards.some((c) => matchesRevenue(c, "meaningful")) && <button className="mt-5 w-full border border-line bg-paper-soft p-4 text-left text-sm hover:border-brick" onClick={() => { setTab("revenue"); setBuilderFilters({ ...defaultBuilderFilters, scope: "all" }); setDays("all"); setCategory("all"); setQuery(""); }}><strong>{cards.filter((c) => matchesRevenue(c, "meaningful")).length} gelirli ürün dosyası</strong><span className="ml-2 text-ink-dim">Son 30 günde en az 100 $ gelir · Kaynakları incele →</span></button>}
          <nav className="mt-8 flex flex-wrap gap-4 border-b border-line" aria-label="Fikir listeleri">
            {[ ["revenue", "Gelirli örnekler"], ["radar", "Erken radar"], ["validated", "Kanıtlı fırsatlar"], ["tools", "Yapım araçları"], ["saved", "Çalışma listem"] ].map(([value, label]) => <button key={value} onClick={() => setTab(value)} aria-current={tab === value ? "page" : undefined} className={`border-b-2 px-1 pb-3 text-sm ${tab === value ? "border-brick font-semibold" : "border-transparent text-ink-dim"}`}>{label}</button>)}
          </nav>
          <p className="mt-3 text-xs leading-relaxed text-ink-dim">{tab === "revenue" ? "Ödeme sağlayıcılarına bağlı gelir verisi. Türkiye talebi ve solo yapılabilirlik ayrıca araştırılır. Kuruluş tarihi ilk satış tarihi değildir; kâr marjı yalnız sahibinin beyanıdır." : tab === "validated" ? "Ödeme yapan müşteri ve Türkiye talebi kanıtları son 30 günde editör tarafından incelenmiş fikirler. Başarı garantisi değildir." : tab === "tools" ? "Framework, SDK ve altyapı projelerini ürününü geliştirirken kullan. Bu bölüm ticari başarı veya Türkiye talebi iddiası taşımaz." : tab === "saved" ? "Notlar ve ilerlemen yalnız bu tarayıcıda tutulur. Düzenli yedek al." : "Popülerlik, gelir kanıtı değildir. Bu listedeki fikirlerin ticari başarısı veya Türkiye talebi henüz doğrulanmadı."}</p>
          <div className="my-4 flex flex-wrap gap-2">
            <label className="relative min-w-44 flex-1"><span className="sr-only">Fikir veya müşteri ara</span><Search className="absolute left-3 top-3 text-ink-faint" size={15} aria-hidden /><input className="input pl-9" placeholder="Fikir veya müşteri ara…" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
            <select aria-label="Kategori" className="input w-auto" value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">Tüm kategoriler</option>{Object.entries(categories).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <select aria-label="MVP süresi" className="input w-auto" value={days} onChange={(e) => setDays(e.target.value)}><option value="all">MVP süresi</option><option value="3">En fazla 3 gün</option><option value="7">En fazla 1 hafta</option><option value="14">En fazla 2 hafta</option></select>
            <select aria-label="Sıralama" className="input w-auto" value={sort} onChange={(e) => setSort(e.target.value)}><option value="momentum">Vibe coder önceliği</option><option value="newest">Yeni keşfedilen</option><option value="score">Fırsat puanı</option></select>
          </div>
          {tab === "revenue" && <label className="label mb-4">Gelir seçkisi<select aria-label="Gelir seçkisi" className="input mt-1" value={revenuePreset} onChange={(e) => setRevenuePreset(e.target.value)}><option value="meaningful">Son 30 gün ≥100 $ gelir</option><option value="growing">≥100 $ ve büyüyen gelir</option><option value="young">Son 180 günde kurulan · ≥100 $</option><option value="margin">Pozitif kâr marjı beyanı · ≥100 $</option><option value="all">Tüm pozitif gelirli ürünler</option></select></label>}
          <BuilderControls value={builderFilters} change={setBuilderFilters} scopeVisible={tab === "radar" || tab === "validated"} />
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-dim"><span>{visible.length} sonuç · {tab === "tools" ? "SDK ve altyapı araçları; gelir fırsatı olarak sunulmaz." : "Müşteri grupları ve yapılabilirlik hipotezdir. Bilinmeyen bütçeler gizlenmez."}</span><button className="underline" onClick={() => { setBuilderFilters({ ...defaultBuilderFilters, scope: "all" }); setCategory("all"); setDays("all"); setQuery(""); setRevenuePreset("all"); }}>Tüm filtreleri temizle</button></div>
          {tab === "saved" && <div className="mb-4 flex flex-wrap gap-2"><button className="btn-ghost text-xs" onClick={() => download("trendcatcher-notlar.json", JSON.stringify(notebook, null, 2))}><Download size={14} /> Notları dışa aktar</button><label className="btn-ghost cursor-pointer text-xs">Yedek içe aktar<input className="sr-only" type="file" accept="application/json,.json" onChange={async (e) => {
            const f = e.target.files?.[0]; if (!f) return;
            try {
              if (f.size > 2_000_000) throw new Error();
              const imported = notebookSchema.parse(JSON.parse(await f.text()));
              // File reads are asynchronous; merge with edits made while waiting.
              const merged = { ...notebookRef.current, ...imported };
              localStorage.setItem(STORAGE, JSON.stringify(merged));
              notebookRef.current = merged;
              setNotebook(merged);
              setNotice("Notlar içe aktarıldı.");
            }
            catch { setNotice("Yedek okunamadı. Geçerli bir TrendCatcher JSON yedeği seç."); }
            e.target.value = "";
          }} /></label></div>}
          {!visible.length ? <div className="border-y border-line py-12"><h2 className="font-serif text-2xl">{tab === "validated" ? "Henüz kanıtları tamamlanmış fırsat yok." : tab === "saved" ? "Çalışma listen boş veya filtreye uyan kayıt yok." : "Bu filtrelere uyan sinyal yok."}</h2><p className="mt-2 text-sm text-ink-soft">{tab === "validated" ? "Kanıtlar incelendikçe burada görünecek. Yeni hipotezleri erken radarda inceleyebilirsin." : "Filtreleri temizle veya erken radardan bir fikri kaydet."}</p><button className="btn-ghost mt-4" onClick={() => { setTab("radar"); setBuilderFilters({ ...defaultBuilderFilters, scope: "all" }); setQuery(""); setDays("all"); setCategory("all"); }}>Erken radarı göster</button></div>
          : <div className="border-b border-line">{visible.map((c) => <article key={c.id} className="grid gap-4 border-t border-line py-6 md:grid-cols-[1fr_200px]">
            <div><p className="text-xs text-ink-faint">{categories[c.category] ?? c.category} · {revenueOf(c) ? c.title : c.stage === "validated" ? "Kanıtları incelendi" : "Erken sinyal"}</p><h2 className="mt-1 font-serif text-2xl font-semibold leading-snug"><a href={`?idea=${c.id}`} onClick={(e) => { e.preventDefault(); openCard(c.id); }} className="hover:text-brick">{builderProfile(c).kind === "tool" ? c.title : c.analysis?.title ?? c.title}</a></h2><p className="mt-2 text-sm leading-relaxed text-ink-soft">{(builderProfile(c).kind === "tool" ? c.signals[0]?.description : c.analysis?.summary ?? c.signals[0]?.description) ?? "Henüz Türkçe araştırma taslağı hazırlanmadı. Kaynakları inceleyerek problemi ve ticari kanıtları değerlendirebilirsin."}</p>{c.analysis && builderProfile(c).kind !== "tool" && <p className="mt-2 text-sm"><span className="font-medium">Müşteri hipotezi: </span>{c.analysis.customer}</p>}<RevenuePanel card={c} compact /><BuilderBadges card={c} /><p className="mt-3 text-xs text-ink-dim">{c.signals.length} kayıt · {Array.from(new Set(c.signals.map((s) => s.source))).join(" · ")} · Keşif {date(c.firstSeen)}</p></div>
            <aside className="flex items-start justify-between gap-3 md:flex-col"><div><p className="kicker">{revenueOf(c) ? "Ticari sinyal" : c.opportunityScore !== null ? "Fırsat önceliği" : "Sinyal önceliği"}</p><p className="mt-1 font-serif text-3xl tnum">{revenueOf(c) ? "Gelir kaydı" : <>{c.opportunityScore ?? c.momentum}<span className="text-sm text-ink-faint"> / 100</span></>}</p><p className="mt-2 text-xs text-ink-dim">Türkiye talebi: {c.stage === "validated" ? "kanıtı incelendi" : "bilinmiyor"}</p><p className="mt-1 text-xs text-ink-dim">MVP: {c.analysis ? `~${c.analysis.mvpDays} gün · tahmin` : "değerlendirilmedi"}</p></div><div className="flex gap-2"><button disabled={!storageReady} aria-label={notebook[c.id] ? "Listeden çıkar" : "Kaydet"} aria-pressed={!!notebook[c.id]} className="btn-ghost px-2" onClick={() => update(c.id, notebook[c.id] ? null : { status: "watching", note: "" })}><Bookmark size={16} fill={notebook[c.id] ? "currentColor" : "none"} /></button><button className="btn-ghost text-xs" onClick={() => openCard(c.id)}>Dosyayı aç</button></div></aside>
          </article>)}</div>}
          <details className="mt-6 border border-line p-4 text-xs text-ink-dim"><summary className="cursor-pointer font-medium text-ink">Puanlar ve kaynaklar nasıl okunmalı?</summary><p className="mt-3 leading-relaxed">Vibe coder sırası; ürün türü, ticari kanıt, düşük bütçe ve solo yapılabilirliği öne alır. Müşteriye erişim değerlendirmesi varsa önceliğe katılır; eksikse bilinmiyor kabul edilir. Araç ayrımı kaynak başlığı ve açıklamasına dayanır, yanılabilir. Sinyal önceliği, aynı platformdaki yakın tarihli kayıtlarla karşılaştırılır. Tek ölçüm varsa yaşa göre düzeltilmiş ilgi kullanılır; ikinci ölçüm olmadan büyüme iddia edilmez. Platformlar bağımsız müşteri kanıtı sayılmaz. TrustMRR keşif ve pazar akışları aynı platformdur; iki bağımsız doğrulama sayılmaz. Ücretsiz uçlar sınırlı seçki döndürür; tüm pazarı kapsamaz. Gelirli seçki önce en az 100 $ ve büyüyen geliri, sonra bilinen genç kuruluşları öne alır. Çok yüksek büyüme yüzdelerine tek başına öncelik verilmez. Yedi günden eski gelir gözlemleri seçkiden çıkarılır. Fırsat puanı, ticari kanıt (%25), Türkiye talebi (%25), dağıtım (%20), yapılabilirlik (%15), farklılaşma (%10) ve sinyal (%5) değerlendirmeleri tamamlanınca görünür. Kanıt güveni editoryal değerlendirmedir; kazanç olasılığı değildir.</p><ul className="mt-3 space-y-1">{data.sources.map((s) => <li key={s.name}>{s.name}: {s.status === "ok" ? `${s.count} kayıt` : s.reason ?? (s.status === "disabled" ? "etkin değil" : "son tarama başarısız")}</li>)}</ul></details>
        </>}
    </main><footer className="border-t border-line px-4 py-5 text-center text-xs text-ink-faint">TrendCatcher · Hazır araştırma, açık kaynak bağlantıları · Gelir garantisi değildir.</footer>
  </div>;
}

function Detail({ card: c, entry, back, save, notify }: { card: Card; entry?: Notebook[string]; back: () => void; save: (value: Notebook[string] | null) => void; notify: (text: string) => void }) {
  const isTool = builderProfile(c).kind === "tool";
  const a = isTool ? undefined : c.analysis;
  const [copied, setCopied] = useState(false);
  const [price, setPrice] = useState(199);
  const [variable, setVariable] = useState(20);
  const [fixed, setFixed] = useState(0);
  const units = economics(price, variable, fixed);
  return <>
    <button className="btn-subtle pl-0 text-xs" onClick={back}><ArrowLeft size={14} /> Araştırma masası</button>
    <p className="kicker mt-6">{categories[c.category] ?? c.category} · {c.stage === "validated" ? "Kanıtlı fırsat" : "Doğrulanmamış erken sinyal"}</p>
    <h1 className="mt-2 max-w-3xl font-serif text-4xl font-semibold leading-tight">{a?.title ?? c.title}</h1>
    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-soft">{a?.summary ?? c.signals[0]?.description ?? "Kaynaklar toplandı; araştırma taslağı henüz hazırlanmadı."}</p>
    <div className="mt-4 flex flex-wrap gap-3"><button className="btn-primary" onClick={() => save(entry ? null : { status: "watching", note: "" })}><Bookmark size={15} />{entry ? "Listeden çıkar" : "Çalışma listeme ekle"}</button>{a && <><button className="btn-ghost" onClick={async () => { try { await navigator.clipboard.writeText(buildPrompt(c)); setCopied(true); } catch { notify("Kopyalanamadı. Dosya olarak indirebilirsin."); } }}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Kopyalandı" : "Vibecoding promptunu kopyala"}</button><button className="btn-ghost" onClick={() => download(`${c.id}-plan.md`, buildPrompt(c), "text/markdown")}><Download size={15} /> Planı indir</button></>}</div>
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="space-y-7">
        <RevenuePanel card={c} />
        <section className="border-y border-line py-5"><h2 className="font-serif text-2xl">Kaynak kanıtları</h2><p className="mt-2 text-xs text-ink-dim">Güven: {c.confidence === "high" ? "yüksek · temel kanıtlar incelendi" : c.confidence === "medium" ? "kısmi kanıt" : "düşük · yalnız keşif sinyali"}. Türkiye başarısı ayrıca test edilmeli.</p>
          <ul className="mt-4 space-y-4">{c.signals.map((s) => <li key={s.id}><External url={s.url}>{s.title}</External><p className="mt-1 text-xs text-ink-dim">{s.source} · {s.engagement} etkileşim · {s.revenue ? "Kayıt gözlemi" : "Yayın"} {date(s.publishedAt)}</p>{s.productUrl && <p className="mt-1 text-xs"><External url={s.productUrl}>Ürün bağlantısı</External></p>}</li>)}</ul>
          <p className="mt-4 text-xs text-ink-dim">{c.velocity === null ? "Karşılaştırılabilir saatlik hız henüz yok. Etkileşim sayısı satış kanıtı değildir." : `Ölçülen değişim: ${c.velocity.toFixed(2)} etkileşim/saat. Satış veya gelir göstergesi değildir.`}</p>
          {c.review?.evidence.length ? <ul className="mt-5 space-y-3 border-t border-line pt-4">{c.review.evidence.map((e, i) => <li key={i} className="text-sm"><strong>{evidenceLabels[e.kind]}: </strong>{e.claim}<p className="mt-1 text-xs"><External url={e.url}>Kanıtı aç</External> · {e.level === "reviewed" ? "Editör inceledi" : "Kaynak beyanı"} · {date(e.checkedAt)}</p></li>)}</ul> : <p className="mt-4 border-l-2 border-ochre pl-3 text-sm text-ink-soft">{revenueOf(c) ? "Gelir kaydı mevcut; Türkiye talebi henüz doğrulanmadı." : "Ödeme yapan müşteri ve Türkiye talebi kanıtı henüz eklenmedi."}</p>}
          {c.review?.note && <p className="mt-4 text-sm text-ink-soft">Editör notu: {c.review.note}</p>}
        </section>
        {a ? <>
          <section><p className="kicker">Araştırma hipotezi · {c.analyzedAt ? date(c.analyzedAt) : ""}</p>{c.analysisStatus !== "ready" && <p className="mt-2 text-sm text-ochre">Son başarılı taslak gösteriliyor; güncelleme bekleniyor.</p>}<h2 className="mt-2 font-serif text-2xl">Kimin hangi problemini çözüyor?</h2><p className="mt-3 text-sm leading-relaxed"><strong>Müşteri: </strong>{a.customer}</p><p className="mt-2 text-sm leading-relaxed">{a.problem}</p><p className="mt-3 text-sm leading-relaxed"><strong>Türkiye açısı: </strong>{a.turkishAngle}</p></section>
          <section className="border-t border-line pt-5"><h2 className="font-serif text-2xl">Önce 48 saatte doğrula</h2><Lines items={a.validation} /><p className="mt-4 border-l-2 border-brick pl-3 text-sm"><strong>Durma kriteri: </strong>{a.stopCondition}</p></section>
          <section className="border-t border-line pt-5"><h2 className="font-serif text-2xl">Dar MVP</h2><p className="mt-2 text-xs text-ink-dim">Yaklaşık {a.mvpDays} gün · {a.difficulty === "easy" ? "kolay" : a.difficulty === "medium" ? "orta" : "zor"} · Tahmin, kapsam ve deneyime bağlı.</p><Lines items={a.features} /></section>
          <section className="border-t border-line pt-5"><h2 className="font-serif text-2xl">İlk müşterilere ulaş</h2><Lines items={a.firstCustomers} /></section>
          <section className="border-t border-line pt-5"><h2 className="font-serif text-2xl">Hâlâ bilmediklerimiz</h2><Lines items={a.unknowns} /></section>
        </> : <section className="border border-line bg-paper-soft p-5"><h2 className="font-serif text-2xl">{isTool ? "Ürününü geliştirirken kullan" : "Araştırma sırada"}</h2><p className="mt-2 text-sm leading-relaxed">{isTool ? "Bu kayıt bir yapım kaynağıdır. Kullanım lisansını, bakım durumunu ve entegrasyon ihtiyacını kaynak bağlantısından incele. Doğrudan satılabilir fikir veya gelir kanıtı sayılmaz." : "Bu fikir için henüz hazır plan yok. Kaynakları incele; ödeme yapan müşteriyi, Türkiye’deki alternatifleri ve ilk müşteriye erişim yolunu doğrulamadan geliştirmeye başlama."}</p></section>}
      </div>
      <aside className="space-y-5">
        <BuilderSummary card={c} />
        <section className="border border-line bg-paper-card p-5"><h2 className="font-serif text-xl">Çalışma defterim</h2>{entry ? <><label className="label mt-4" htmlFor="progress">Aşama</label><select id="progress" className="input" value={entry.status} onChange={(e) => save({ ...entry, status: e.target.value as Notebook[string]["status"] })}>{Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select><label htmlFor="note" className="label mt-4">Görüşmeler, bulgular, kararlar</label><textarea id="note" className="input min-h-36" maxLength={4000} value={entry.note} onChange={(e) => save({ ...entry, note: e.target.value })} placeholder="Kimle görüştün? Hangi varsayım değişti?" /><p className="mt-2 text-xs text-ink-faint">Yalnız bu cihazda. Çalışma listem bölümünden yedekleyebilirsin.</p></> : <p className="mt-3 text-sm text-ink-soft">Not tutmak ve ilerlemeni izlemek için fikri çalışma listene ekle.</p>}</section>
        <section className="border border-line p-5"><h2 className="font-serif text-xl">Birim ekonomi denemesi</h2><p className="mt-2 text-xs leading-relaxed text-ink-dim">Örnek varsayımlar. Aylık tutarları değiştir; vergi, iade, destek ve kendi emeğini ayrıca değerlendir.</p>{[ ["Fiyat / müşteri (TL)", price, setPrice], ["Değişken maliyet / müşteri (TL)", variable, setVariable], ["Sabit gider (TL)", fixed, setFixed] ].map(([label, value, setter]) => <label key={label as string} className="label mt-4">{label as string}<input className="input mt-1" type="number" min="0" max="10000000" value={value as number} onChange={(e) => (setter as (v: number) => void)(Math.max(0, Math.min(10000000, Number(e.target.value))))} /></label>)}<p className="mt-4 border-t border-line pt-3 text-sm">Müşteri başına katkı: <strong>{units.contribution.toLocaleString("tr-TR")} TL</strong></p><p className="mt-2 text-sm">Sabit gideri karşılamak için: <strong>{units.customers === null ? "Birim katkı pozitif olmalı" : `${units.customers} müşteri`}</strong></p></section>
      </aside>
    </div>
  </>;
}
