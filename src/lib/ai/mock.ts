import type { Category, EarlySignal, ScoreKey } from "../types";
import { EARLY_SIGNAL_LABELS, SCORE_KEY_LABELS } from "../config/scoring";
import { DEMO_TRENDS, type DemoTrend } from "../sources/demoCatalog";
import type {
  AnalyzeInput,
  AIProvider,
  BuildPlan,
  ClusterBrief,
  OpportunityDraft,
} from "./types";

function findTrend(trendKey?: unknown): DemoTrend | undefined {
  if (typeof trendKey !== "string") return undefined;
  return DEMO_TRENDS.find((t) => t.key === trendKey);
}



function rationaleFor(
  key: ScoreKey,
  value: number,
  brief: ClusterBrief
): string {
  const src = brief.sourceNames.join(", ");
  const early = EARLY_SIGNAL_LABELS[brief.earlySignal] ?? brief.earlySignal;
  switch (key) {
    case "trendVelocity":
      return `Tarama penceresinde ${brief.sourceCount} bağımsız kaynak (${src}) bunu gündeme taşıdı; etkileşim yoğun ve yükselişte (toplam ${brief.totalEngagement} etkileşim). İlk sinyal ${fmtDate(
        brief.firstSeen
      )} tarihinde görüldü.`;
    case "turkeyFit":
      return `Bu davranış Türkiye pazarında net ve tekrarlayan bir ihtiyaca denk geliyor (kategori: ${brief.category}); taranan sinyallerde öne çıkan yerel alternatif görülmedi.`;
    case "competitionGap":
      return `Taranan sinyallerde öne çıkan Türkiye merkezli bir rakip tespit edilemedi; alan erken görünüyor.`;
    case "monetizationPotential":
      return `Modelin birden fazla doğal kazanç yolu var (iş modellerine bak) ve kurucu için değer üretme süresi kısa.`;
    case "buildability":
      return `İlk sürüm standart web araçları ve herkese açık/veri API'leriyle kurulabilir; egzotik altyapı gerekmez.`;
    case "viralPotential":
      return `Konu kurucu/indie topluluklarında (Twitter, PH, HN) paylaşılabilir ve "yapımını göster" mekaniğinden beslenir.`;
    case "novelty":
      return `En erken sinyaller "${early}" olarak etiketli. Taramaya göre geniş ana akım kapsamasından önce.`;
    default:
      return `${SCORE_KEY_LABELS[key]}: ${value}/100.`;
  }
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function businessModelsFor(t: DemoTrend | undefined, brief: ClusterBrief): string[] {
  if (t && t.businessModels.length) return t.businessModels;
  return ["Abonelik", "Freemium"];
}

function buildPlanFrom(brief: ClusterBrief, draft: OpportunityDraft): BuildPlan {
  const cat: Category = brief.category;
  const features: string[] = [
    "Net değer önerisi + bekleme listeli açılış sayfası",
    "Çekirdek veri/alım pipeline'ı (asıl fark yaratan)",
    "Auth (e-posta) + kaydedilenler",
    "Kategoriye göre arama ve filtreler",
    "Kaynak bağlantılı fırsat detay görünümü",
    "Basit Türkiye-açısı üretici",
    "Herkese açık paylaşım / demo modu",
    "Alım sağlığını izleyen basit panel",
  ];
  if (cat === "AI") features.push("Soyutlama arkasında LLM entegrasyonu (sahte + gerçek)");
  if (cat === "E-commerce" || cat === "SaaS")
    features.push("Ödemeye hazır fiyat sayfası (MVP'de yalnızca arayüz)");

  return {
    mvpScope:
      "Döngüyü uçtan uca kanıtla: dar bir sinyal dilimi topla, kümele, Türkiye açılı en yüksek fırsatı kaydetme aksiyonuyla göster. Faturalandırma, ekip ve analitiği ertele.",
    features: features.slice(0, 10),
    landingPageCopy: {
      headline: draft.title,
      subheadline:
        "Türkiye pazarı için skorlanmış, yükselen bir internet trendi — somut yapım planıyla.",
      cta: "Yapmaya başla",
    },
    suggestedPricing: [
      "Free: ayda 10 fırsat",
      "Pro: sınırsız + erken sinyal uyarıları",
      "Hunter: ekip izleme listeleri + API",
    ],
    acquisitionChannels: [
      "Twitter TR / LinkedIn TR kurucu paylaşımları",
      "Product Hunt ve Hacker News (yapımını göster)",
      "Reddit TR toplulukları (r/Yatirim, kurucu grupları)",
      "Telegram/WhatsApp indie-hacker grupları",
      "koftealti.com / yerliyatirimci başlıkları",
    ],
    launchStrategy: [
      "20+ gerçekçi fırsatlı herkese açık demo çıkar",
      "7 gün boyunca her gün yapım günlüğü paylaş",
      "Nişteki 5 Türk mikro-influencer'a ulaş",
      "Mıknatıs olarak ücretsiz 'Türkiye açısı' incelemesi sun",
    ],
    copyChecklist: {
      clone: [
        "Çekirdek döngüyü birebir klonla — yurtdışında dönüştüren mekanik bu",
        "Fiyat ve paket yapısını kopyala (ücret aldığı kanıtlı)",
        "Açılış sayfası yapısını ve ilk çalıştırma akışını yansıt",
      ],
      localize: [
        "Ana dili Türkçe metin (makine tonu değil) + TL fiyat + yerel ödeme",
        draft.localizationNotes,
        `Türkiye açısıyla öne çık: ${draft.suggestedTurkishAngle.slice(0, 110)}`,
      ],
      skip: [
        "v1'de kurumsal özellikleri atla (SSO, denetim logları, ekipler)",
        "Native mobil uygulamaları atla — önce web çık, ilk ol",
        "Mükemmel çıktı kalitesini atla; insan düzeltmeli 'yeterince iyi'yi çıkar",
      ],
    },
  };
}

export class MockAIProvider implements AIProvider {
  name = "mock";

  async analyzeCluster(input: AnalyzeInput): Promise<OpportunityDraft> {
    const trend = findTrend(input.rawData?.trendKey);
    const subScores = input.subScores as Record<ScoreKey, number>;

    const title = trend?.title ?? input.title;
    const summary = trend?.summary ?? defaultSummary(input);
    const whyNow = trend?.whyNow ?? defaultWhyNow(input);
    const whatIsChanging = trend?.whatIsChanging ?? "Bunu kurmanın maliyeti sert düştü.";
    const whyPeopleCare = trend?.whyPeopleCare ?? "Kurucular haksız bir erken avantaj istiyor.";
    const turkishAngle =
      trend?.turkeyAngle ?? `Yerel kullanıcılar için "${input.title}" ürününün Türkiye-öncelikli sürümü.`;
    const localizationNotes =
      trend?.localizationNotes ?? "Metni, ödeme yöntemlerini (TL) ve yerel kanalları uyarla.";
    const models = businessModelsFor(trend, input);
    const mvpTime = trend?.mvpTime ?? estimateMvpTime(subScores.buildability);

    const scoreRationales: Partial<Record<ScoreKey, string>> = {};
    (Object.keys(subScores) as ScoreKey[]).forEach((k) => {
      scoreRationales[k] = rationaleFor(k, subScores[k], input);
    });

    return {
      title,
      summary,
      whyNow,
      whatIsChanging,
      whyPeopleCare,
      suggestedTurkishAngle: turkishAngle,
      localizationNotes,
      suggestedBusinessModel: models,
      estimatedMvpTime: mvpTime,
      scoreRationales,
    };
  }

  async generateBuildPlan(brief: ClusterBrief, draft: OpportunityDraft): Promise<BuildPlan> {
    return buildPlanFrom(brief, draft);
  }
}

function defaultSummary(b: ClusterBrief): string {
  return `"${b.title}" konusunda ${b.sourceCount} bağımsız kaynak (${b.sourceNames.join(
    ", "
  )}) erken ivme gösteriyor. Ana akıma ulaşmadan bir kurucunun dikkatini hak ediyor.`;
}

function defaultWhyNow(b: ClusterBrief): string {
  return `Son günlerde ${b.sourceCount} bağımsız kaynak (${b.sourceNames.join(
    ", "
  )}) bu konuda sinyal üretti. İlk görülme ${fmtDate(b.firstSeen)}. Taramaya göre Türkiye'de henüz geniş ana akım kapsamasına ulaşmadı.`;
}

function estimateMvpTime(buildability: number): string {
  if (buildability >= 88) return "<3 gün";
  if (buildability >= 75) return "<1 hafta";
  return ">1 hafta";
}

export const mockAI = new MockAIProvider();
