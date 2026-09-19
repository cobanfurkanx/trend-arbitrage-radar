import type { Category, EarlySignal, ScoreKey, SourceName } from "../types";

export interface DemoSignal {
  source: SourceName;
  title: string;
  url: string;
  author: string;
  daysAgo: number;
  engagement: number;
  keywords: string[];
  snippet: string;
}

export interface DemoTrend {
  key: string;
  title: string;
  category: Category;
  earlySignal: EarlySignal;
  summary: string;
  whyNow: string;
  whatIsChanging: string;
  whyPeopleCare: string;
  turkeyAngle: string;
  localizationNotes: string;
  businessModels: string[];
  mvpTime: string;
  subScores: Record<ScoreKey, number>;
  signals: DemoSignal[];
}

export const DEMO_TRENDS: DemoTrend[] = [
  {
    key: "ai-directory",
    title: "YZ Araç Dizinleri ve Derlenmiş Toplayıcılar",
    category: "AI",
    earlySignal: "VeryEarly",
    summary:
      "Indie üreticiler, genel dizinlerin indeksleyebildiğinden hızlı niş 'YZ araç dizinleri' çıkarıyor. Kalıp bu hafta 4 bağımsız kaynakta tekrarlandı.",
    whyNow:
      "Son 72 saatte YZ-araç dizinlerine atıf yapan 4 bağımsız lansman Product Hunt, Hacker News ve Reddit'te göründü. Arama ilgisi yükseliyor ama henüz ana akım Türkçe sorgulara ulaşmadı.",
    whatIsChanging:
      "YZ araç keşfi parçalanıyor: kullanıcılar tek listeye güvenmiyor, dikey ve fikirli dizinler arıyor.",
    whyPeopleCare:
      "Kurması ucuz, sıralamada hızlı ve listeleme + satış ortaklığıyla doğal kazançlı.",
    turkeyAngle:
      "Ürünleri fiyat, Türkçe destek kalitesi ve yerel kullanım senaryolarına (e-ticaret, eğitim, hukuk) göre karşılaştıran Türkçe YZ araç dizini.",
    localizationNotes:
      "İnceleme skorlamasını Türk KOBİ'lerine uyarla; TL fiyatları öne çıkar; Türkçe müşteri destek puanları ekle.",
    businessModels: ["Satış ortaklığı", "Öne çıkan listeleme", "Abonelik", "Potansiyel müşteri üretimi"],
    mvpTime: "<1 hafta",
    subScores: { trendVelocity: 92, turkeyFit: 90, competitionGap: 80, monetizationPotential: 88, buildability: 95, viralPotential: 78, novelty: 70 },
    signals: [
      { source: "producthunt", title: "Launch: Niche AI Tools Index", url: "https://www.producthunt.com/posts/niche-ai-tools-index", author: "maker_ays", daysAgo: 1, engagement: 340, keywords: ["ai", "directory", "tools", "aggregator"], snippet: "Dikey YZ araçlarının derlenmiş dizini, bugün lansmanı yapıldı." },
      { source: "hackernews", title: "Show HN: I built an AI tools directory in a weekend", url: "https://news.ycombinator.com/item?id=39900111", author: "hn_user_42", daysAgo: 2, engagement: 210, keywords: ["ai", "directory", "weekend", "sideproject"], snippet: "Niş YZ dizinlerini hızlı kurma üzerine tartışma." },
      { source: "reddit", title: "Anyone else seeing a wave of AI tool directories?", url: "https://www.reddit.com/r/SideProject/comments/ai_dir", author: "u/sidehustler", daysAgo: 3, engagement: 120, keywords: ["ai", "directory", "sideproject"], snippet: "Dizin trendini fark eden Reddit başlığı." },
      { source: "x", title: "AI directories are the new link farms (in a good way)", url: "https://x.com/devx/status/1", author: "@devx", daysAgo: 1, engagement: 540, keywords: ["ai", "directory", "indie"], snippet: "Yükselen YZ dizin dalgasına dair tweet." },
    ],
  },
  {
    key: "ai-email-triage",
    title: "Solo Kurucular için YZ E-posta Triyajı",
    category: "AI",
    earlySignal: "Emerging",
    summary:
      "E-postayı özetleyip otomatik önceliklendiren hafif YZ asistanları kurumsaldan solo kurucu nişine yayılıyor.",
    whyNow:
      "Açık kaynaklı iki e-posta özetleyici reposunun GitHub yıldızları 6 günde ikiye katlandı; bir Product Hunt lansmanı 48 saat ilk 5'te kaldı. Taramada Türkçe dengi yok.",
    whatIsChanging:
      "LLM'ler kurumsal sözleşmesiz, yerel ve özel e-posta triyajını mümkün kıldı.",
    whyPeopleCare:
      "Kurucular e-postada boğuluyor; günde bir saat kazandıran 5 dakikalık kurulum kolay satar.",
    turkeyAngle:
      "Yerel gönderici kalıplarını (e-ticaret siparişleri, resmi bildirimler, banka uyarıları) anlayan Türkçe öncelikli e-posta triyajı.",
    localizationNotes:
      "Türkçe e-posta geleneklerine eğit; yerel fatura ve kargo dilini yakala.",
    businessModels: ["Freemium", "Abonelik", "Pro paket"],
    mvpTime: "<1 hafta",
    subScores: { trendVelocity: 84, turkeyFit: 82, competitionGap: 78, monetizationPotential: 80, buildability: 85, viralPotential: 70, novelty: 66 },
    signals: [
      { source: "github", title: "mailpilot-ai: local email summarizer", url: "https://github.com/demo/mailpilot-ai", author: "demo", daysAgo: 4, engagement: 480, keywords: ["ai", "email", "opensource", "privacy"], snippet: "Açık kaynaklı yerel e-posta triyaj projesi." },
      { source: "producthunt", title: "InboxZero Lite", url: "https://www.producthunt.com/posts/inboxzero-lite", author: "maker_li", daysAgo: 2, engagement: 290, keywords: ["email", "ai", "productivity"], snippet: "E-posta triyajı PH lansmanı." },
      { source: "reddit", title: "Self-hosted email summarizer recommendations?", url: "https://www.reddit.com/r/selfhosted/comments/mailai", author: "u/selfhostfan", daysAgo: 5, engagement: 95, keywords: ["email", "selfhosted", "ai"], snippet: "E-posta YZ araçları soran Reddit başlığı." },
    ],
  },
  {
    key: "ai-sales-cold",
    title: "YZ ile Soğuk Satış Kişiselleştirme",
    category: "SaaS",
    earlySignal: "Emerging",
    summary:
      "Ölçekli hiper-kişiselleştirilmiş soğuk e-posta yazan araçlar küçük ajanslarda tutuyor.",
    whyNow:
      "Bu ay üç ayrı lansman ve yükselen X bahsi. Türk KOBİ outreach pazarı yeterince kapsanmıyor.",
    whatIsChanging: "Manuel kişiselleştirme ölçeklenmiyor; LLM'ler 1:1 hissini ucuza veriyor.",
    whyPeopleCare: "Ciroya doğrudan etki; ajanslar için kolay ROI hikayesi.",
    turkeyAngle: "Anadolu KOBİ'lerine uygun tonda yerelleştiren Türkçe soğuk outreach asistanı.",
    localizationNotes: "Türk iş görgüsüne ton ayarı; yerel CRM entegrasyonları.",
    businessModels: ["SaaS", "Kullanım bazlı", "Ajans beyaz etiket"],
    mvpTime: "<1 hafta",
    subScores: { trendVelocity: 80, turkeyFit: 85, competitionGap: 76, monetizationPotential: 86, buildability: 78, viralPotential: 64, novelty: 60 },
    signals: [
      { source: "producthunt", title: "ColdGenius", url: "https://www.producthunt.com/posts/coldgenius", author: "maker_ok", daysAgo: 3, engagement: 260, keywords: ["sales", "ai", "outreach", "saas"], snippet: "Soğuk e-posta YZ'si PH lansmanı." },
      { source: "x", title: "Cold email AI is quietly printing money for agencies", url: "https://x.com/growthx/status/2", author: "@growthx", daysAgo: 2, engagement: 410, keywords: ["sales", "ai", "agency"], snippet: "Soğuk e-posta YZ getirisine dair tweet." },
      { source: "hackernews", title: "Personalized cold outreach at scale", url: "https://news.ycombinator.com/item?id=39900222", author: "hn_user_7", daysAgo: 6, engagement: 150, keywords: ["sales", "outreach", "llm"], snippet: "HN tartışması." },
    ],
  },
  {
    key: "vertical-search",
    title: "Niş Konular için Dikey Arama Motorları",
    category: "SaaS",
    earlySignal: "VeryEarly",
    summary:
      "Indie geliştiriciler genel arama yerine tek dikeye (hukuk, ikinci el araç, yerel hizmet) arama motoru kuruyor.",
    whyNow:
      "Birkaç GitHub reposu ve bir Hacker News başlığı erken ivmeye işaret ediyor. Taramada yerel hizmetler için Türkçe dikey arama görülmedi.",
    whatIsChanging: "Embedding'ler niş aramayı ucuza kurulur ve barındırılır hale getirdi.",
    whyPeopleCare: "Genel arama yerel inceliği kaçırıyor; dikeyler daha iyi dönüştürüyor.",
    turkeyAngle: "TL ve şehir filtreli, yerel hizmetlere (tamirci, kurs, kira) Türkçe dikey arama.",
    localizationNotes: "İl/ilçe taksonomileri; Türkçe sorgu anlama; yerel işletme verisi.",
    businessModels: ["Potansiyel müşteri üretimi", "Öne çıkan yerleşim", "Abonelik"],
    mvpTime: "<1 hafta",
    subScores: { trendVelocity: 78, turkeyFit: 88, competitionGap: 82, monetizationPotential: 80, buildability: 72, viralPotential: 60, novelty: 74 },
    signals: [
      { source: "github", title: "vertical-search-starter", url: "https://github.com/demo/vertical-search-starter", author: "demo", daysAgo: 5, engagement: 210, keywords: ["search", "embeddings", "vertical"], snippet: "Dikey arama başlangıç kiti." },
      { source: "hackernews", title: "Why vertical search is back", url: "https://news.ycombinator.com/item?id=39900333", author: "hn_user_9", daysAgo: 4, engagement: 320, keywords: ["search", "vertical", "startup"], snippet: "Dikey aramaya dair HN yazısı." },
      { source: "reddit", title: "Built a search engine for one tiny niche", url: "https://www.reddit.com/r/SideProject/comments/vsearch", author: "u/nichedev", daysAgo: 7, engagement: 88, keywords: ["search", "sideproject"], snippet: "Reddit yapım günlüğü." },
    ],
  },
  {
    key: "ai-meeting-summary",
    title: "YZ Toplantı Not Tutucular (Gizlilik Öncelikli)",
    category: "Developer",
    earlySignal: "Emerging",
    summary:
      "Açık kaynaklı, yerel-öncelikli toplantı özetleyiciler geliştirici çevrelerinde kapalı SaaS'ları geçiyor.",
    whyNow: "GitHub hareketliliği güçlü; bir Product Hunt lansmanı trendde. Gizlilik açısı Türkiye'de karşılık buluyor.",
    whatIsChanging: "Cihaz üstü transkripsiyon sonunda yeterince iyi.",
    whyPeopleCare: "Ekipler sesi ABD sunucularına göndermeden özet istiyor.",
    turkeyAngle: "Cihaz üstü destekli, Türkçe jargona ayarlı Türkçe toplantı özetleyici.",
    localizationNotes: "Türkçe teknik kelime hazinesi; yerel uyum hikayesi.",
    businessModels: ["Açık çekirdek", "Abonelik", "Kurumsal"],
    mvpTime: "<1 hafta",
    subScores: { trendVelocity: 76, turkeyFit: 80, competitionGap: 74, monetizationPotential: 76, buildability: 70, viralPotential: 66, novelty: 68 },
    signals: [
      { source: "github", title: "local-meet-ai", url: "https://github.com/demo/local-meet-ai", author: "demo", daysAgo: 3, engagement: 360, keywords: ["meeting", "ai", "privacy", "local"], snippet: "Yerel-öncelikli toplantı YZ'si." },
      { source: "producthunt", title: "MeetNotes Local", url: "https://www.producthunt.com/posts/meetnotes-local", author: "maker_z", daysAgo: 2, engagement: 230, keywords: ["meeting", "notes", "ai"], snippet: "PH lansmanı." },
      { source: "x", title: "Local-first AI is the only AI I trust", url: "https://x.com/privx/status/3", author: "@privx", daysAgo: 1, engagement: 300, keywords: ["privacy", "ai", "local"], snippet: "Gizlilik tweeti." },
    ],
  },
  {
    key: "browser-ext-ai",
    title: "Okuma için YZ Tarayıcı Eklentileri",
    category: "Consumer",
    earlySignal: "VeryEarly",
    summary:
      "Sayfayı özetleyen, hover ile çeviren, terimleri açıklayan minik YZ eklentileri her gün çıkıyor.",
    whyNow: "Eklenti mağazalarında YZ okuma araçları patladı; Reddit + X ekseninde küme oluşuyor.",
    whatIsChanging: "LLM API'leri eklenti içinde sayfa başına çalışacak kadar ucuzladı.",
    whyPeopleCare: "Sekmeden çıkmadan anında kavrama.",
    turkeyAngle: "Türkçe okuma yardımcısı eklenti: özetle, çevir, yerel bağlamı açıkla.",
    localizationNotes: "Türkçe hover-çeviri; yerel haber/kaynak bağlamı.",
    businessModels: ["Freemium", "Abonelik"],
    mvpTime: "<3 gün",
    subScores: { trendVelocity: 86, turkeyFit: 84, competitionGap: 80, monetizationPotential: 72, buildability: 90, viralPotential: 82, novelty: 72 },
    signals: [
      { source: "reddit", title: "Made an AI extension that summarizes any page", url: "https://www.reddit.com/r/chrome/comments/aiext", author: "u/extmaker", daysAgo: 2, engagement: 140, keywords: ["extension", "ai", "reading"], snippet: "Reddit tanıtımı." },
      { source: "x", title: "AI reading extensions are eating my bookmarks", url: "https://x.com/readx/status/4", author: "@readx", daysAgo: 1, engagement: 380, keywords: ["extension", "ai", "reading"], snippet: "Tweet." },
      { source: "producthunt", title: "PagePilot AI", url: "https://www.producthunt.com/posts/pagepilot-ai", author: "maker_ab", daysAgo: 3, engagement: 200, keywords: ["extension", "ai", "summary"], snippet: "PH lansmanı." },
    ],
  },
  {
    key: "ai-subscription-manager",
    title: "Haneler için Abonelik ve Harcama Takipçileri",
    category: "Consumer",
    earlySignal: "Emerging",
    summary:
      "Tekrarlayan ödemeleri tespit edip kategorize eden uygulamalar banka uygulamalarından çıkıp bağımsız tüketici ürününe dönüşüyor.",
    whyNow: "Peş peşe lansmanlar; 'abonelik takipçisi' aramalarında yükselen ilgi. Türk bankaları bunu iyi göstermiyor.",
    whatIsChanging: "Açık bankacılık + LLM kategorizasyonu sürtünmeyi düşürüyor.",
    whyPeopleCare: "İnsanlar aboneliklere sessizce fazla ödüyor.",
    turkeyAngle: "Yerel banka SMS ve kartlarını okuyan Türkçe hane abonelik takipçisi.",
    localizationNotes: "Türk banka SMS/e-postalarını ayrıştır; TL kategoriler; yerel üye işyeri adları.",
    businessModels: ["Freemium", "Abonelik", "Satış ortaklığı (daha iyi planlar)"],
    mvpTime: "<1 hafta",
    subScores: { trendVelocity: 74, turkeyFit: 86, competitionGap: 78, monetizationPotential: 78, buildability: 76, viralPotential: 70, novelty: 62 },
    signals: [
      { source: "producthunt", title: "SubTrack Lite", url: "https://www.producthunt.com/posts/subtrack-lite", author: "maker_cd", daysAgo: 4, engagement: 180, keywords: ["subscription", "finance", "consumer"], snippet: "PH lansmanı." },
      { source: "googletrends", title: "subscription tracker interest +40%", url: "https://trends.google.com/demo/subtrack", author: "google", daysAgo: 6, engagement: 100, keywords: ["subscription", "tracker", "search"], snippet: "Arama trendi yukarı." },
      { source: "reddit", title: "How do you track all your subs?", url: "https://www.reddit.com/r/personalfinance/comments/subtr", author: "u/budgeter", daysAgo: 5, engagement: 90, keywords: ["subscription", "budget"], snippet: "Reddit sorusu." },
    ],
  },
  {
    key: "ai-code-review",
    title: "Küçük Ekipler için YZ PR/Kod İnceleme Botları",
    category: "Developer",
    earlySignal: "Emerging",
    summary:
      "PR'lara bağlamlı yorum bırakan hafif inceleme botları indie ekiplerde ağır kurumsal araçların yerini alıyor.",
    whyNow: "GitHub Marketplace eklemeleri + HN tartışması; yerelleştirilmiş rehberlikte Türk geliştirici ekipleri yeterince kapsanmıyor.",
    whatIsChanging: "Ucuz çıkarım PR başına incelemeyi karşılanabilir kıldı.",
    whyPeopleCare: "CI öncesi hata yakala; juniorları eğit.",
    turkeyAngle: "Düzeltmeleri Türkçe açıklayan Türk geliştirici odaklı inceleme botu.",
    localizationNotes: "Türkçe açıklamalar; yerel kodlama kamplarına uyum.",
    businessModels: ["SaaS", "Kullanıcı başı", "Açık kaynak eklenti"],
    mvpTime: "<1 hafta",
    subScores: { trendVelocity: 72, turkeyFit: 78, competitionGap: 70, monetizationPotential: 82, buildability: 68, viralPotential: 60, novelty: 64 },
    signals: [
      { source: "github", title: "pr-review-bot", url: "https://github.com/demo/pr-review-bot", author: "demo", daysAgo: 5, engagement: 290, keywords: ["code", "review", "ai", "bot"], snippet: "PR inceleme botu reposu." },
      { source: "hackernews", title: "AI code review that actually helps", url: "https://news.ycombinator.com/item?id=39900444", author: "hn_user_11", daysAgo: 3, engagement: 260, keywords: ["code", "review", "ai"], snippet: "HN tartışması." },
      { source: "reddit", title: "Self-hosted PR review bot?", url: "https://www.reddit.com/r/webdev/comments/prrev", author: "u/webdevx", daysAgo: 6, engagement: 70, keywords: ["code", "review", "selfhosted"], snippet: "Reddit sorusu." },
    ],
  },
  {
    key: "ai-pricing-page",
    title: "KOBİ'ler için YZ Destekli Dinamik Fiyatlandırma",
    category: "E-commerce",
    earlySignal: "VeryEarly",
    summary:
      "Küçük e-ticaret mağazaları kurumsal RMS yerine hafif dinamik fiyat asistanları benimsiyor.",
    whyNow: "Birkaç lansman + X sohbeti; Türk pazaryeri satıcıları manuel fiyatlıyor.",
    whatIsChanging: "ML fiyatlandırma artık veri bilimi ekibi gerektirmiyor.",
    whyPeopleCare: "Marj iyileşmesi anında ve ölçülebilir.",
    turkeyAngle: "Trendyol/Hepsiburada satıcılarına Türkçe dinamik fiyat yardımcısı.",
    localizationNotes: "Yerel pazaryerleriyle entegre ol; TL marj mantığı; yerel tatiller.",
    businessModels: ["SaaS", "Gelir paylaşımı", "Abonelik"],
    mvpTime: "<1 hafta",
    subScores: { trendVelocity: 70, turkeyFit: 88, competitionGap: 80, monetizationPotential: 84, buildability: 66, viralPotential: 58, novelty: 66 },
    signals: [
      { source: "producthunt", title: "Pricey AI", url: "https://www.producthunt.com/posts/pricey-ai", author: "maker_ef", daysAgo: 4, engagement: 160, keywords: ["pricing", "ecommerce", "ai"], snippet: "PH lansmanı." },
      { source: "x", title: "Dynamic pricing for tiny shops is now a weekend build", url: "https://x.com/ecomx/status/5", author: "@ecomx", daysAgo: 2, engagement: 250, keywords: ["pricing", "ecommerce"], snippet: "Tweet." },
      { source: "reddit", title: "How are small shops pricing dynamically?", url: "https://www.reddit.com/r/ecommerce/comments/dynprice", author: "u/shopowner", daysAgo: 7, engagement: 60, keywords: ["pricing", "ecommerce"], snippet: "Reddit sorusu." },
    ],
  },
  {
    key: "domain-ai-names",
    title: "Müsaitlik Kontrollü YZ Domain Üreticiler",
    category: "Domains",
    earlySignal: "Emerging",
    summary:
      "Markalaşabilir domain üretip tek tıkla TLD müsaitliği bakan araçlar flipper'lar arasında trend.",
    whyNow: "Lansmanlar + domain forum hareketliliği; Türkçe latin markalaşabilir boşluk.",
    whatIsChanging: "LLM'ler markalaşabilir isim üretiyor; API'ler müsaitliği anında bakıyor.",
    whyPeopleCare: "Domain flipping + hızlı startup isimlendirme.",
    turkeyAngle: ".com.tr ve latin müsaitlikli Türkçe markalaşabilir domain üretici.",
    localizationNotes: ".com.tr kuralları; Türkçe fonetik; yerel marka hissi.",
    businessModels: ["Freemium", "Satış ortaklığı (kayıt firmaları)", "Abonelik"],
    mvpTime: "<3 gün",
    subScores: { trendVelocity: 76, turkeyFit: 82, competitionGap: 78, monetizationPotential: 70, buildability: 88, viralPotential: 74, novelty: 64 },
    signals: [
      { source: "producthunt", title: "NameFlow AI", url: "https://www.producthunt.com/posts/nameflow-ai", author: "maker_gh", daysAgo: 3, engagement: 190, keywords: ["domain", "naming", "ai"], snippet: "PH lansmanı." },
      { source: "x", title: "AI domain name tools are getting good", url: "https://x.com/domainx/status/6", author: "@domainx", daysAgo: 1, engagement: 220, keywords: ["domain", "ai", "flipping"], snippet: "Tweet." },
      { source: "reddit", title: "Best AI domain name generator?", url: "https://www.reddit.com/r/Domains/comments/domai", author: "u/domainer", daysAgo: 5, engagement: 80, keywords: ["domain", "naming"], snippet: "Reddit sorusu." },
    ],
  },
  {
    key: "ai-ugc-moderation",
    title: "Üretici Toplulukları için YZ Moderasyon",
    category: "Social",
    earlySignal: "VeryEarly",
    summary:
      "Indie topluluk araçları Güven ve Güvenlik ekibi kurmak yerine YZ moderasyonu eklenti olarak sunuyor.",
    whyNow: "Birkaç lansman + HN başlığı; Türk üretici platformlarında uygun fiyatlı moderasyon yok.",
    whatIsChanging: "Çok dilli moderasyon modelleri artık karşılanabilir.",
    whyPeopleCare: "Küçük topluluklar insan moderatör çalıştıramaz.",
    turkeyAngle: "Discord/Telegram gruplarına Türkçe topluluk moderasyon API'si.",
    localizationNotes: "Türkçe argo ve toksisite incelikleri; yerel platform entegrasyonları.",
    businessModels: ["API kullanımı", "SaaS", "Freemium"],
    mvpTime: "<1 hafta",
    subScores: { trendVelocity: 68, turkeyFit: 84, competitionGap: 76, monetizationPotential: 76, buildability: 74, viralPotential: 62, novelty: 70 },
    signals: [
      { source: "hackernews", title: "Cheap AI moderation for small communities", url: "https://news.ycombinator.com/item?id=39900555", author: "hn_user_13", daysAgo: 4, engagement: 200, keywords: ["moderation", "ai", "community"], snippet: "HN." },
      { source: "github", title: "mod-bot-lite", url: "https://github.com/demo/mod-bot-lite", author: "demo", daysAgo: 3, engagement: 150, keywords: ["moderation", "bot", "ai"], snippet: "Repo." },
      { source: "reddit", title: "How do tiny Discords moderate?", url: "https://www.reddit.com/r/discordapp/comments/modai", author: "u/modlead", daysAgo: 6, engagement: 55, keywords: ["moderation", "community"], snippet: "Reddit sorusu." },
    ],
  },
  {
    key: "ai-newsletter-curate",
    title: "Nişlere YZ Bülten Derleme",
    category: "Content",
    earlySignal: "Emerging",
    summary:
      "Solo üreticiler niş bültenleri saatler yerine dakikalar içinde derleyip yazmak için YZ kullanıyor.",
    whyNow: "Lansmanlar + üretici tweetleri; Türkçe niş bültenler yeterince kapsanmıyor.",
    whatIsChanging: "Derleme + taslak otomatize; editörlük insanda kalıyor.",
    whyPeopleCare: "Bülten yorgunluğuna hiper-niş, yüksek sinyalli sayılarla cevap.",
    turkeyAngle: "Sektörlere (gayrimenkul, hukuk, oyun) Türkçe niş bülten stüdyosu.",
    localizationNotes: "Türkçe editoryal ton; yerel sektör açıları.",
    businessModels: ["Abonelik", "Sponsorluklar", "Şablonlar"],
    mvpTime: "<3 gün",
    subScores: { trendVelocity: 74, turkeyFit: 80, competitionGap: 74, monetizationPotential: 72, buildability: 84, viralPotential: 70, novelty: 66 },
    signals: [
      { source: "producthunt", title: "CurateAI Newsletters", url: "https://www.producthunt.com/posts/curateai", author: "maker_ij", daysAgo: 3, engagement: 170, keywords: ["newsletter", "ai", "content"], snippet: "PH lansmanı." },
      { source: "x", title: "I ship a niche newsletter in 20 min with AI", url: "https://x.com/newsx/status/7", author: "@newsx", daysAgo: 1, engagement: 260, keywords: ["newsletter", "ai", "creator"], snippet: "Tweet." },
      { source: "reddit", title: "AI newsletter curation tools?", url: "https://www.reddit.com/r/newsletters/comments/curatenl", author: "u/creatorx", daysAgo: 5, engagement: 65, keywords: ["newsletter", "ai"], snippet: "Reddit sorusu." },
    ],
  },
  {
    key: "ai-resume-tailor",
    title: "İş Arayanlara YZ CV Uyarlama",
    category: "SaaS",
    earlySignal: "Emerging",
    summary:
      "CV'yi iş ilanına göre yeniden yazan araçlar büyüyor, özellikle yurtdışı başvurularda.",
    whyNow: "Peş peşe lansmanlar; yurtdışına başvuran Türk kullanıcıların yerelleştirilmiş uyarlamaya ihtiyacı var.",
    whatIsChanging: "Ayrıştırma + üretim uyarlamayı anlık hale getiriyor.",
    whyPeopleCare: "Aynı başvurudan daha çok mülakat.",
    turkeyAngle: "Hem TR hem AB/ABD ilanlarına uyarlayan Türkçe CV terzisi.",
    localizationNotes: "İki dilli çıktı; TR vs uluslararası CV normları.",
    businessModels: ["Freemium", "İşlem başı ödeme", "Abonelik"],
    mvpTime: "<3 gün",
    subScores: { trendVelocity: 78, turkeyFit: 82, competitionGap: 72, monetizationPotential: 74, buildability: 82, viralPotential: 76, novelty: 60 },
    signals: [
      { source: "producthunt", title: "TailorMyCV", url: "https://www.producthunt.com/posts/tailormycv", author: "maker_kl", daysAgo: 2, engagement: 210, keywords: ["resume", "ai", "jobs"], snippet: "PH lansmanı." },
      { source: "x", title: "Resume tailoring AI got me 3x interviews", url: "https://x.com/jobx/status/8", author: "@jobx", daysAgo: 1, engagement: 320, keywords: ["resume", "ai", "jobs"], snippet: "Tweet." },
      { source: "reddit", title: "AI resume tailoring that isn't scammy?", url: "https://www.reddit.com/r/jobs/comments/tailorcv", author: "u/jobseeker", daysAgo: 4, engagement: 100, keywords: ["resume", "ai"], snippet: "Reddit sorusu." },
    ],
  },
  {
    key: "ai-local-seo",
    title: "KOBİ'lere YZ Yerel SEO Üretici",
    category: "SaaS",
    earlySignal: "VeryEarly",
    summary:
      "Küçük işletme sahipleri konum sayfaları ve yorum yanıtlarını ölçekli üretmek için YZ kullanıyor.",
    whyNow: "Erken lansmanlar + ajans sohbeti; Türk yerel işletmeler SEO'da zayıf.",
    whatIsChanging: "Konum bazlı içerik kalite korkuluklarıyla otomatize edilebiliyor.",
    whyPeopleCare: "Yerel arama yaya trafiği ve telefon getiriyor.",
    turkeyAngle: "İlçeye göre dişçi, avukat, restoranlara Türkçe yerel SEO üretici.",
    localizationNotes: "İlçe düzeyinde Türkçe içerik; yerel kaynak dizinleri.",
    businessModels: ["SaaS", "Ajans beyaz etiket", "Abonelik"],
    mvpTime: "<1 hafta",
    subScores: { trendVelocity: 66, turkeyFit: 86, competitionGap: 80, monetizationPotential: 80, buildability: 72, viralPotential: 58, novelty: 64 },
    signals: [
      { source: "producthunt", title: "LocalSEO AI", url: "https://www.producthunt.com/posts/localseo-ai", author: "maker_mn", daysAgo: 5, engagement: 140, keywords: ["seo", "local", "ai", "smb"], snippet: "PH lansmanı." },
      { source: "x", title: "Local SEO is the easiest AI agency niche", url: "https://x.com/seox/status/9", author: "@seox", daysAgo: 2, engagement: 200, keywords: ["seo", "local", "agency"], snippet: "Tweet." },
      { source: "reddit", title: "AI for local business SEO pages?", url: "https://www.reddit.com/r/SEO/comments/localseo", author: "u/seopro", daysAgo: 6, engagement: 50, keywords: ["seo", "local"], snippet: "Reddit sorusu." },
    ],
  },
  {
    key: "ai-study-buddy",
    title: "Sınav Hazırlığına YZ Çalışma Arkadaşı",
    category: "Consumer",
    earlySignal: "Emerging",
    summary:
      "Öğrenciler kendi notlarından pratik soru üreten YZ öğretmenleri benimsiyor.",
    whyNow: "Lansmanlar + güçlü arama ilgisi; Türkiye'nin sınav kültürü birebir uyuyor.",
    whatIsChanging: "Cihaz üstü + ucuz API'ler kişisel öğretmenliği erişilebilir kıldı.",
    whyPeopleCare: "Türkiye'de sınav baskısı (LGS, YKS) yoğun ve yaygın.",
    turkeyAngle: "MEB müfredatlı YKS/LGS Türkçe sınav hazırlık yardımcısı.",
    localizationNotes: "MEB müfredatına hizala; Türkçe soru stilleri.",
    businessModels: ["Freemium", "Abonelik", "B2B okul"],
    mvpTime: "<1 hafta",
    subScores: { trendVelocity: 80, turkeyFit: 92, competitionGap: 78, monetizationPotential: 78, buildability: 70, viralPotential: 84, novelty: 62 },
    signals: [
      { source: "googletrends", title: "AI study helper interest +55%", url: "https://trends.google.com/demo/studyai", author: "google", daysAgo: 4, engagement: 120, keywords: ["study", "ai", "exam"], snippet: "Arama trendi." },
      { source: "producthunt", title: "QuizMe AI", url: "https://www.producthunt.com/posts/quizme-ai", author: "maker_op", daysAgo: 3, engagement: 180, keywords: ["study", "ai", "education"], snippet: "PH lansmanı." },
      { source: "x", title: "My kid's AI tutor is wild", url: "https://x.com/parentx/status/10", author: "@parentx", daysAgo: 1, engagement: 240, keywords: ["study", "ai", "education"], snippet: "Tweet." },
    ],
  },
  {
    key: "ai-contract-review",
    title: "Freelancerlara YZ Sözleşme İnceleme",
    category: "SaaS",
    earlySignal: "VeryEarly",
    summary:
      "Freelancerlar imzalamadan riskli maddeleri yakalamak için YZ kullanıyor, küçük işlerde avukatı atlıyor.",
    whyNow: "Erken lansmanlar; uluslararası platformlardaki Türk freelancerların TR+EN incelemeye ihtiyacı var.",
    whatIsChanging: "Madde çıkarma + sade dilde açıklama artık güvenilir.",
    whyPeopleCare: "Kötü müşteriden ucuza korun.",
    turkeyAngle: "Upwork tarzı işlere Türkçe/İngilizce freelance sözleşme inceleyici.",
    localizationNotes: "İki dilli maddeler; TR iş hukuku ipuçları (hukuki tavsiye değildir notuyla).",
    businessModels: ["Freemium", "İnceleme başı ödeme", "Abonelik"],
    mvpTime: "<3 gün",
    subScores: { trendVelocity: 64, turkeyFit: 84, competitionGap: 78, monetizationPotential: 76, buildability: 80, viralPotential: 60, novelty: 68 },
    signals: [
      { source: "producthunt", title: "ClauseGuard", url: "https://www.producthunt.com/posts/clauseguard", author: "maker_qr", daysAgo: 5, engagement: 130, keywords: ["contract", "ai", "freelance"], snippet: "PH lansmanı." },
      { source: "reddit", title: "AI to review freelance contracts?", url: "https://www.reddit.com/r/freelance/comments/clauseai", author: "u/freelancerx", daysAgo: 6, engagement: 70, keywords: ["contract", "ai", "freelance"], snippet: "Reddit sorusu." },
      { source: "x", title: "Freelancers need cheap contract review", url: "https://x.com/freelx/status/11", author: "@freelx", daysAgo: 2, engagement: 160, keywords: ["contract", "ai", "freelance"], snippet: "Tweet." },
    ],
  },
  {
    key: "ai-social-listening",
    title: "Minik Markalara YZ Sosyal Dinleme",
    category: "Social",
    earlySignal: "Emerging",
    summary:
      "Uygun fiyatlı sosyal dinleme panoları mikro markalarda kurumsal paketlerin yerini alıyor.",
    whyNow: "Lansmanlar + ajans ilgisi; Türk KOBİ'leri Türkçe dinleme istiyor.",
    whatIsChanging: "Taranan bahislerden özet duygu analizi artık ucuz.",
    whyPeopleCare: "Pazarlama ekibi olmadan müşterinin ne dediğini bil.",
    turkeyAngle: "X/Instagram/Reddit TR kapsayan yerel markalara Türkçe sosyal dinleme lite.",
    localizationNotes: "Türkçe duygu analizi; yerel platform kapsamı.",
    businessModels: ["SaaS", "Abonelik", "Ajans"],
    mvpTime: "<1 hafta",
    subScores: { trendVelocity: 70, turkeyFit: 86, competitionGap: 76, monetizationPotential: 78, buildability: 68, viralPotential: 62, novelty: 64 },
    signals: [
      { source: "producthunt", title: "BrandPulse Lite", url: "https://www.producthunt.com/posts/brandpulse-lite", author: "maker_st", daysAgo: 4, engagement: 150, keywords: ["social", "listening", "ai", "brand"], snippet: "PH lansmanı." },
      { source: "x", title: "Social listening doesn't need a $1k tool", url: "https://x.com/brandx/status/12", author: "@brandx", daysAgo: 1, engagement: 190, keywords: ["social", "listening", "saas"], snippet: "Tweet." },
      { source: "reddit", title: "Cheap social listening for small brand?", url: "https://www.reddit.com/r/marketing/comments/soclisten", author: "u/marketerx", daysAgo: 5, engagement: 60, keywords: ["social", "listening"], snippet: "Reddit sorusu." },
    ],
  },
  {
    key: "ai-invoice-extractor",
    title: "YZ Fatura ve Masraf Çıkarma",
    category: "Developer",
    earlySignal: "Emerging",
    summary:
      "Faturaları yapılandırılmış veriye çeviren açık kaynak OCR+LLM hatları yıldız topluyor.",
    whyNow: "GitHub ivmesi; Türk e-fatura formatı birebir uyuyor.",
    whatIsChanging: "LLM'ler dağınık faturaları katı şablonlardan iyi okuyor.",
    whyPeopleCare: "Muhasebe otomasyonu gerçek saatler kazandırıyor.",
    turkeyAngle: "Yerel vergi alanlı Türkçe e-fatura/fatura çıkarıcı.",
    localizationNotes: "Türkçe e-fatura XML ayrıştır; yerel KDV mantığı.",
    businessModels: ["Açık çekirdek", "API", "Abonelik"],
    mvpTime: "<1 hafta",
    subScores: { trendVelocity: 72, turkeyFit: 88, competitionGap: 74, monetizationPotential: 80, buildability: 66, viralPotential: 56, novelty: 66 },
    signals: [
      { source: "github", title: "invoice-extract-ai", url: "https://github.com/demo/invoice-extract-ai", author: "demo", daysAgo: 4, engagement: 320, keywords: ["invoice", "ai", "ocr", "finance"], snippet: "Repo." },
      { source: "hackernews", title: "LLM invoice parsing beats templates", url: "https://news.ycombinator.com/item?id=39900666", author: "hn_user_15", daysAgo: 3, engagement: 230, keywords: ["invoice", "llm", "ocr"], snippet: "HN." },
      { source: "reddit", title: "Automating invoice entry?", url: "https://www.reddit.com/r/accounting/comments/invoia", author: "u/accountx", daysAgo: 6, engagement: 65, keywords: ["invoice", "automation"], snippet: "Reddit sorusu." },
    ],
  },
  {
    key: "ai-voice-notes",
    title: "YZ Sesli Not Düzenleyiciler",
    category: "Consumer",
    earlySignal: "VeryEarly",
    summary:
      "Sesli notları yazıya döküp görev/not olarak oto-organize eden uygulamalar mobil-öncelikli kullanıcılara yayılıyor.",
    whyNow: "Birkaç lansman; mobil-öncelikli Türk kullanıcılar yeterince kapsanmıyor.",
    whatIsChanging: "Cihaz üstü transkripsiyon + özetleme yeterince hızlı.",
    whyPeopleCare: "Yoldayken yazmadan fikir yakala.",
    turkeyAngle: "Türkçe görev çıkaran Türkçe sesli not düzenleyici.",
    localizationNotes: "Türkçe ses transkripsiyonu; yerel görev fiilleri.",
    businessModels: ["Freemium", "Abonelik"],
    mvpTime: "<3 gün",
    subScores: { trendVelocity: 68, turkeyFit: 82, competitionGap: 78, monetizationPotential: 70, buildability: 78, viralPotential: 72, novelty: 70 },
    signals: [
      { source: "producthunt", title: "VoiceFlow Notes", url: "https://www.producthunt.com/posts/voiceflow-notes", author: "maker_uv", daysAgo: 3, engagement: 160, keywords: ["voice", "notes", "ai", "mobile"], snippet: "PH lansmanı." },
      { source: "x", title: "Voice notes + AI = my second brain", url: "https://x.com/voicex/status/13", author: "@voicex", daysAgo: 1, engagement: 210, keywords: ["voice", "ai", "notes"], snippet: "Tweet." },
      { source: "reddit", title: "Best AI voice note app?", url: "https://www.reddit.com/r/ProductivityApps/comments/voicenote", author: "u/prodx", daysAgo: 5, engagement: 55, keywords: ["voice", "notes"], snippet: "Reddit sorusu." },
    ],
  },
  {
    key: "ai-outfit",
    title: "YZ Kombin ve Gardırop Planlayıcılar",
    category: "Consumer",
    earlySignal: "VeryEarly",
    summary:
      "Gardırop fotoğrafından kombin öneren tüketici uygulamaları moda-öncüsü pazarlarda yükseliyor.",
    whyNow: "Erken lansmanlar + Pinterest/Reddit ilgisi; Türk muhafazakar-giyim açısı benzersiz.",
    whatIsChanging: "Görüntü modelleri giysi parçalarını güvenilir okuyor.",
    whyPeopleCare: "Stilistsiz kişisel stil.",
    turkeyAngle: "Muhafazakar-giyim ve mevsimsel TR stilli Türkçe gardırop planlayıcı.",
    localizationNotes: "Muhafazakar-giyim filtreleri; Türkiye mevsim etkinlikleri.",
    businessModels: ["Freemium", "Satış ortaklığı (perakende)", "Abonelik"],
    mvpTime: "<1 hafta",
    subScores: { trendVelocity: 66, turkeyFit: 84, competitionGap: 80, monetizationPotential: 72, buildability: 70, viralPotential: 76, novelty: 72 },
    signals: [
      { source: "producthunt", title: "StyleAI", url: "https://www.producthunt.com/posts/styleai", author: "maker_wx", daysAgo: 4, engagement: 150, keywords: ["fashion", "ai", "outfit", "consumer"], snippet: "PH lansmanı." },
      { source: "reddit", title: "AI outfit planner from my closet?", url: "https://www.reddit.com/r/femalefashion/comments/styleai", author: "u/fashionx", daysAgo: 6, engagement: 80, keywords: ["fashion", "ai", "outfit"], snippet: "Reddit sorusu." },
      { source: "x", title: "AI stylists are weirdly good now", url: "https://x.com/stylex/status/14", author: "@stylex", daysAgo: 2, engagement: 180, keywords: ["fashion", "ai"], snippet: "Tweet." },
    ],
  },
  {
    key: "ai-lead-enrich",
    title: "Tek Kişilik Ekiplere YZ Lead Zenginleştirme",
    category: "SaaS",
    earlySignal: "Emerging",
    summary:
      "Tek kişilik satış yığınları artık halka açık veriden eksik alanları dolduran YZ lead zenginleştirme içeriyor.",
    whyNow: "Lansmanlar + X sohbeti; Türk KOBİ verisi parçalı ve zenginleştirilebilir.",
    whatIsChanging: "Halka açık veri toplama + LLM lead başına karşılanabilir.",
    whyPeopleCare: "Az manuel araştırmayla daha iyi outreach.",
    turkeyAngle: "Yerel dizin ve sosyalden beslenen Türkçe lead zenginleştirme.",
    localizationNotes: "Türk şirket kayıtları; yerel telefon/e-posta kalıpları.",
    businessModels: ["SaaS", "Kullanım bazlı", "API"],
    mvpTime: "<1 hafta",
    subScores: { trendVelocity: 70, turkeyFit: 82, competitionGap: 72, monetizationPotential: 82, buildability: 70, viralPotential: 58, novelty: 62 },
    signals: [
      { source: "producthunt", title: "EnrichAI", url: "https://www.producthunt.com/posts/enrichai", author: "maker_yz", daysAgo: 3, engagement: 170, keywords: ["lead", "enrichment", "ai", "saas"], snippet: "PH lansmanı." },
      { source: "x", title: "Lead enrichment is a one-person business now", url: "https://x.com/salesx/status/15", author: "@salesx", daysAgo: 1, engagement: 220, keywords: ["lead", "enrichment", "ai"], snippet: "Tweet." },
      { source: "hackernews", title: "Building a tiny lead-enrichment API", url: "https://news.ycombinator.com/item?id=39900777", author: "hn_user_17", daysAgo: 5, engagement: 180, keywords: ["lead", "enrichment", "api"], snippet: "HN." },
    ],
  },
  {
    key: "ai-recipe",
    title: "YZ Tarif ve Buzdolabı Toplama Uygulamaları",
    category: "Content",
    earlySignal: "VeryEarly",
    summary:
      "'Buzdolabımda ne varsa' ondan tarif çıkaran uygulamalar trend, yerelleştirilmiş mutfak dokunuşlarıyla.",
    whyNow: "Lansmanlar + arama ilgisi; Türk mutfağı yerelleştirmesi bomboş.",
    whatIsChanging: "Çok modlu modeller fotoğraftan malzemeyi tanıyor.",
    whyPeopleCare: "Gıda israfını azalt; hızlı yemek fikri.",
    turkeyAngle: "Yerel malzemeli ve TR yemekli Türkçe buzdolabından-tarife uygulaması.",
    localizationNotes: "Türkçe malzeme adları; bölgesel yemekler (Ege, Güneydoğu).",
    businessModels: ["Freemium", "Abonelik", "Satış ortaklığı (market)"],
    mvpTime: "<3 gün",
    subScores: { trendVelocity: 68, turkeyFit: 84, competitionGap: 78, monetizationPotential: 68, buildability: 80, viralPotential: 78, novelty: 70 },
    signals: [
      { source: "producthunt", title: "FridgeChef AI", url: "https://www.producthunt.com/posts/fridgechef-ai", author: "maker_aa", daysAgo: 4, engagement: 160, keywords: ["recipe", "ai", "food", "consumer"], snippet: "PH lansmanı." },
      { source: "googletrends", title: "fridge recipe app interest +35%", url: "https://trends.google.com/demo/fridge", author: "google", daysAgo: 5, engagement: 90, keywords: ["recipe", "ai", "food"], snippet: "Arama trendi." },
      { source: "reddit", title: "AI that uses my leftovers?", url: "https://www.reddit.com/r/Cooking/comments/fridgeai", author: "u/cookx", daysAgo: 6, engagement: 60, keywords: ["recipe", "ai", "food"], snippet: "Reddit sorusu." },
    ],
  },
  {
    key: "ai-onboarding",
    title: "YZ Ürün Karşılama Sihirbazları",
    category: "Developer",
    earlySignal: "VeryEarly",
    summary:
      "Indie SaaS'ler ilk çalıştırma deneyimini her kullanıcıya uyarlayan YZ karşılama çıkarıyor.",
    whyNow: "Az lansman; kalıp henüz ana akım değil — erken sinyal.",
    whatIsChanging: "LLM'ler segmente göre bağlamsal karşılama metni üretebiliyor.",
    whyPeopleCare: "Az manuel akışla daha iyi aktivasyon.",
    turkeyAngle: "Yerel SaaS'lere Türkçe dostu uyarlanabilir karşılama SDK'si.",
    localizationNotes: "Türkçe metin üretimi; yerel SaaS kalıpları.",
    businessModels: ["SaaS", "SDK lisansı", "Abonelik"],
    mvpTime: "<1 hafta",
    subScores: { trendVelocity: 62, turkeyFit: 80, competitionGap: 76, monetizationPotential: 78, buildability: 72, viralPotential: 56, novelty: 74 },
    signals: [
      { source: "github", title: "adaptive-onboard", url: "https://github.com/demo/adaptive-onboard", author: "demo", daysAgo: 5, engagement: 180, keywords: ["onboarding", "ai", "saas", "dev"], snippet: "Repo." },
      { source: "producthunt", title: "OnboardAI", url: "https://www.producthunt.com/posts/onboardai", author: "maker_bb", daysAgo: 3, engagement: 140, keywords: ["onboarding", "ai", "saas"], snippet: "PH lansmanı." },
      { source: "hackernews", title: "Adaptive onboarding with LLMs", url: "https://news.ycombinator.com/item?id=39900888", author: "hn_user_19", daysAgo: 4, engagement: 160, keywords: ["onboarding", "llm"], snippet: "HN." },
    ],
  },
];
