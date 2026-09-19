import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listOpportunities } from "@/lib/queries";
import { CATEGORY_LABELS, EARLY_SIGNAL_LABELS } from "@/lib/config/scoring";
import { firstMoverWindow, relativeTime, scoreLabel, windowDot, windowLabel } from "@/lib/utils";
import { Dot, Eyebrow, Rule, ScoreFigure } from "@/components/editorial";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    n: "01",
    title: "İnterneti tarıyoruz",
    text: "Lansmanlar, HN, Reddit, PH, GitHub, arama ve sosyal medyadan erken sinyaller toplanır.",
  },
  {
    n: "02",
    title: "Sinyalleri kümeleyip skorluyoruz",
    text: "Bağımsız kaynaklar tek dosyada birleşir; Türkiye uyumu ve kopyalanabilirlik puanlanır.",
  },
  {
    n: "03",
    title: "Kanıtıyla sunuyoruz",
    text: "Her skorun dayanağı ve her iddianın kaynağı dosyada açıkça görünür.",
  },
  {
    n: "04",
    title: "Kararı sen veriyorsun",
    text: "Kaydet, karşılaştır, kopya rehberiyle yapım planına geç.",
  },
];

const USE_CASES = [
  { title: "Indie Hackerlar", text: "Hafta sonu çıkarılabilir fikirler için taranmış kısa liste." },
  { title: "Kurucular", text: "Rakipler yerelleştirmeden önce boşluk analizi." },
  { title: "Ajanslar", text: "Müşteriye sunulabilir, kaynaklı trend dosyaları." },
  { title: "Domain Avcıları", text: "İsim dalgalarını erken yakalamak için sinyal akışı." },
];

const PRICING = [
  {
    name: "Free",
    price: "₺0",
    features: ["Ayda 10 fırsat", "Temel skorlar", "Kaydet ve izle"],
    cta: "Ücretsiz başla",
    featured: false,
  },
  {
    name: "Pro",
    price: "₺199",
    features: ["Sınırsız fırsat", "Erken sinyal uyarıları", "Türkiye açısı + yapım planları"],
    cta: "Pro'ya geç",
    featured: true,
  },
  {
    name: "Hunter",
    price: "₺599",
    features: ["Ekip izleme listeleri", "API erişimi", "Öncelikli veri alımı"],
    cta: "Avcı ol",
    featured: false,
  },
];

export default async function LandingPage() {
  const top = (await listOpportunities({ sort: "score" })).slice(0, 1)[0];
  const topWindow = top ? firstMoverWindow(top.earlySignal, top.competitionGap) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <header className="flex h-16 items-center justify-between">
        <span className="font-serif text-xl font-semibold tracking-tight text-ink">
          Trend Radarı
        </span>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/login" className="btn-subtle">
            Giriş Yap
          </Link>
          <Link href="/dashboard" className="btn-primary py-1.5">
            Fırsatları Tara
          </Link>
        </div>
      </header>

      <section className="grid gap-10 py-12 md:grid-cols-[1fr_1.1fr] md:py-16">
        <div>
          <Eyebrow>Yurtdışı → Türkiye ürün radarı</Eyebrow>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Hangi yabancı iş Türkiye&apos;de tutar, kanıtıyla gör.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">
            Yükselen ürün sinyallerini topluyor, Türkiye uyumuna göre puanlıyor ve her
            fırsatı kaynaklarıyla birlikte dosyalıyoruz. Kopyalamaya değer mi, kararını
            veriye bakarak ver.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link href="/dashboard" className="btn-primary px-5 py-2.5">
              Fırsatları Tara <ArrowRight size={16} aria-hidden />
            </Link>
            <a href="#nasil" className="btn-ghost px-5 py-2.5">
              Nasıl Çalışır
            </a>
          </div>
          <dl className="mt-8 max-w-md border-t border-line">
            {[
              ["Tara", "6 kaynaktan erken sinyaller"],
              ["Karşılaştır", "tek listede skor + kanıt"],
              ["Karar ver", "kaydet ya da yapım planına geç"],
            ].map(([t, d]) => (
              <div key={t} className="flex items-baseline gap-4 border-b border-line-soft py-2 text-sm">
                <dt className="w-24 shrink-0 font-medium text-ink">{t}</dt>
                <dd className="text-ink-soft">{d}</dd>
              </div>
            ))}
          </dl>
        </div>

        {top && (
          <aside aria-label="Günün araştırma özeti" className="border border-line bg-paper-card p-6">
            <div className="flex items-baseline justify-between">
              <Eyebrow>Bugünün dosyası</Eyebrow>
              <span className="text-xs text-ink-faint">{relativeTime(top.createdAt)}</span>
            </div>
            <h2 className="mt-2 font-serif text-2xl font-semibold leading-snug text-ink">
              <Link href={`/opportunities/${top.id}`} className="hover:text-brick-deep hover:underline">
                {top.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{top.summary}</p>
            <div className="mt-4">
              <ScoreFigure score={top.overallScore} label={scoreLabel(top.overallScore)} />
            </div>
            <Rule className="my-4" />
            <p className="text-sm leading-relaxed text-ink">
              <span className="font-medium">Neden şimdi: </span>
              {top.whyNow}
            </p>
            <dl className="mt-4 text-[13px]">
              <div className="flex items-baseline justify-between gap-3 border-b border-line-soft py-1.5">
                <dt className="text-ink-dim">Kategori</dt>
                <dd className="text-ink">{CATEGORY_LABELS[top.category]}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-b border-line-soft py-1.5">
                <dt className="text-ink-dim">Aşama</dt>
                <dd className="text-ink">{EARLY_SIGNAL_LABELS[top.earlySignal]}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-b border-line-soft py-1.5">
                <dt className="text-ink-dim">Kaynak</dt>
                <dd className="text-ink">{(top.signals ?? []).length} sinyal</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 py-1.5">
                <dt className="text-ink-dim">Pencere</dt>
                <dd className="text-ink">
                  {topWindow && <Dot tone={windowDot(topWindow)} label={windowLabel(topWindow)} />}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              <span className="font-medium text-ink">Türkiye açısı: </span>
              {top.suggestedTurkishAngle}
            </p>
            <Link
              href={`/opportunities/${top.id}`}
              className="btn-ghost mt-5 py-2 text-sm"
            >
              Dosyayı aç <ArrowRight size={15} aria-hidden />
            </Link>
          </aside>
        )}
      </section>

      <section id="nasil" className="border-t border-line py-12">
        <Eyebrow>Nasıl çalışır</Eyebrow>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="border-t-2 border-ink pt-3">
              <p className="text-xs text-ink-faint tnum">{s.n}</p>
              <h3 className="mt-1 font-serif text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line py-12">
        <Eyebrow>Kimler için</Eyebrow>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map((u) => (
            <div key={u.title}>
              <h3 className="text-sm font-semibold text-ink">{u.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{u.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line py-12">
        <Eyebrow>Fiyatlandırma</Eyebrow>
        <h2 className="mt-2 font-serif text-2xl font-semibold text-ink">Ödeme altyapısı yok, planlar hedef.</h2>
        <div className="mt-6 grid gap-px border border-line bg-line md:grid-cols-3">
          {PRICING.map((p) => (
            <div key={p.name} className={`flex flex-col gap-3 bg-paper-card p-6 ${p.featured ? "border-t-2 border-t-brick" : ""}`}>
              {p.featured && <p className="kicker text-brick">Önerilen</p>}
              <div>
                <h3 className="text-sm font-semibold text-ink">{p.name}</h3>
                <div className="mt-1 font-serif text-3xl font-semibold text-ink tnum">
                  {p.price}
                  <span className="font-sans text-xs font-normal text-ink-dim">/ay</span>
                </div>
              </div>
              <ul className="flex flex-col gap-1.5 text-sm text-ink-soft">
                {p.features.map((f) => (
                  <li key={f} className="border-b border-line-soft pb-1.5 last:border-0">
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`mt-auto ${p.featured ? "btn-primary" : "btn-ghost"} py-2 text-sm`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-line py-6 text-center text-xs text-ink-faint">
        Trend Arbitraj Radarı · {process.env.NEXT_PUBLIC_DEMO_MODE !== "false" ? "Demo sürüm" : "Canlı radar"}
      </footer>
    </div>
  );
}


