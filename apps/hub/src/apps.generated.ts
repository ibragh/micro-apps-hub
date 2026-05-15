// AUTO-GENERATED from scripts/apps.manifest.mjs. Do not edit manually.
// Re-run `node scripts/build-hub-catalog.mjs` after editing the manifest.

export interface HubApp {
  slug: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  category: string;
  engine: string;
  accent: string;
  tier: 1 | 2;
}

export const hubApps: HubApp[] = [
  {
    "slug": "seerah-quiz",
    "nameAr": "اختبار السيرة النبوية",
    "nameEn": "Seerah Quiz",
    "descAr": "اختبار تفاعلي عن سيرة النبي محمد ﷺ — مكة، الهجرة، المدينة، أحداث ومواقف موثقة من مصادر معتمدة.",
    "category": "islamic",
    "engine": "quiz",
    "accent": "#0e7c66",
    "tier": 1
  },
  {
    "slug": "today-history",
    "nameAr": "حدث في مثل هذا اليوم",
    "nameEn": "Today in History",
    "descAr": "أحداث تاريخية موثقة وقعت في مثل هذا اليوم، مع ذكر المصدر لكل حدث.",
    "category": "history",
    "engine": "timeline",
    "accent": "#2a4d8f",
    "tier": 1
  },
  {
    "slug": "saudi-history-quiz",
    "nameAr": "اختبار تاريخ السعودية",
    "nameEn": "Saudi History Quiz",
    "descAr": "اختبار عن تاريخ المملكة العربية السعودية — الدول السعودية، الملوك، أبرز الأحداث، والمناطق.",
    "category": "saudi-history",
    "engine": "quiz",
    "accent": "#0a6f3a",
    "tier": 1
  },
  {
    "slug": "guess-saudi-player",
    "nameAr": "خمن اللاعب السعودي",
    "nameEn": "Guess the Saudi Player",
    "descAr": "احزر اللاعب السعودي من قرائن نصية: المركز، النادي، الإنجازات، والحقبة. بدون صور أو شعارات محمية.",
    "category": "football",
    "engine": "clue",
    "accent": "#0b7d5f",
    "tier": 1
  },
  {
    "slug": "if-minister",
    "nameAr": "لو كنت وزيرًا",
    "nameEn": "If You Were a Minister",
    "descAr": "محاكاة قرارات وزارية — تواجه سيناريوهات في الخدمات والاقتصاد والتعليم وتختار، ثم نشرح أثر كل خيار.",
    "category": "decision",
    "engine": "decision",
    "accent": "#7a3aa1",
    "tier": 1
  },
  {
    "slug": "history-court",
    "nameAr": "محكمة التاريخ",
    "nameEn": "History Court",
    "descAr": "قضية تاريخية موثقة تُعرض كقضية محكمة، تصوّت: مذنب، بريء، مبرر، أم مثير للجدل؟ نفصل الوقائع عن التحليل.",
    "category": "history",
    "engine": "voting",
    "accent": "#3a3a8f",
    "tier": 1
  },
  {
    "slug": "news-detective",
    "nameAr": "محقق الأخبار",
    "nameEn": "News Detective",
    "descAr": "لعبة وعي إعلامي. تقرأ سيناريو خبري افتراضي وتقرر: صحيح، مضلل، ناقص السياق، أم مفبرك؟",
    "category": "media-literacy",
    "engine": "voting",
    "accent": "#a14a2a",
    "tier": 1
  },
  {
    "slug": "last-minute-decision",
    "nameAr": "قرار الدقيقة الأخيرة",
    "nameEn": "Last-Minute Decision",
    "descAr": "لديك وقت قصير لاتخاذ قرار صعب: عمل، أسرة، إدارة أو رياضة. كل ثانية تحسب.",
    "category": "decision",
    "engine": "decision",
    "accent": "#b3261e",
    "tier": 1
  },
  {
    "slug": "knowledge-auction",
    "nameAr": "مزاد المعرفة",
    "nameEn": "Knowledge Auction",
    "descAr": "لديك رصيد افتراضي تراهن منه على ثقتك في إجابة كل سؤال. ثقة أعلى → ربح أعلى وخطر أعلى.",
    "category": "knowledge",
    "engine": "auction",
    "accent": "#8a6a14",
    "tier": 1
  },
  {
    "slug": "time-traveler",
    "nameAr": "المسافر عبر الزمن",
    "nameEn": "Time Traveler",
    "descAr": "تجد نفسك في حقبة تاريخية: ماذا تختار؟ خياراتك تُقيَّم ضمن السياق التاريخي الموثق لتلك الحقبة.",
    "category": "history",
    "engine": "scenario",
    "accent": "#5a3a6f",
    "tier": 1
  },
  {
    "slug": "decision-council",
    "nameAr": "مجلس القرار",
    "nameEn": "Decision Council",
    "descAr": "مستشارون افتراضيون يقدمون آراء مختلفة لقضيتك، وأنت تتخذ القرار النهائي.",
    "category": "decision",
    "engine": "decision",
    "accent": "#0e7c66",
    "tier": 1
  },
  {
    "slug": "in-his-place",
    "nameAr": "لو كنت مكانه",
    "nameEn": "In His Place",
    "descAr": "تضع نفسك مكان شخصية في لحظة فارقة وتقرر ما تفعل.",
    "category": "history",
    "engine": "scenario",
    "accent": "#2a4d8f",
    "tier": 1
  },
  {
    "slug": "logic-judge",
    "nameAr": "قاضي المنطق",
    "nameEn": "Logic Judge",
    "descAr": "اقرأ حُجَّة وحدد إن كانت سليمة، أم تحتوي مغالطة منطقية، أم استدلالًا عاطفيًا.",
    "category": "critical-thinking",
    "engine": "quiz",
    "accent": "#0a5a4a",
    "tier": 1
  },
  {
    "slug": "saudi-time-machine",
    "nameAr": "آلة الزمن السعودية",
    "nameEn": "Saudi Time Machine",
    "descAr": "اختر سنة وشاهد كيف كانت المملكة في تلك الحقبة: أحداث، ملامح اجتماعية، رياضة وثقافة.",
    "category": "saudi-history",
    "engine": "timeline",
    "accent": "#0a6f3a",
    "tier": 1
  },
  {
    "slug": "crossroads",
    "nameAr": "مفترق الطرق",
    "nameEn": "Crossroads",
    "descAr": "قصة قصيرة تفاعلية، كل خيار يغير المسار.",
    "category": "story",
    "engine": "scenario",
    "accent": "#7a3aa1",
    "tier": 1
  },
  {
    "slug": "who-is-wrong",
    "nameAr": "مين المخطئ؟",
    "nameEn": "Who Is Wrong?",
    "descAr": "موقف خلاف بين طرفين، تحكم من المخطئ ولماذا، ثم تقارن تفسيرك بآراء أخرى.",
    "category": "decision",
    "engine": "voting",
    "accent": "#a14a2a",
    "tier": 1
  },
  {
    "slug": "consultant-test",
    "nameAr": "اختبار المستشار",
    "nameEn": "Consultant Test",
    "descAr": "تتقمص دور مستشار وتقدم توصياتك لقضايا أعمال أو خدمات عامة، ونقيّم أسلوبك.",
    "category": "decision",
    "engine": "decision",
    "accent": "#3a3a8f",
    "tier": 1
  },
  {
    "slug": "history-secrets",
    "nameAr": "أسرار التاريخ",
    "nameEn": "History Secrets",
    "descAr": "قصص وحقائق تاريخية أقل شهرة، كلها موثقة المصدر — لا خرافات.",
    "category": "history",
    "engine": "timeline",
    "accent": "#5a3a6f",
    "tier": 1
  },
  {
    "slug": "predict-the-decision",
    "nameAr": "توقع القرار",
    "nameEn": "Predict the Decision",
    "descAr": "يُعرض موقف حقيقي أو واقعي، حاول توقع القرار الذي اتُخذ فعلًا.",
    "category": "history",
    "engine": "quiz",
    "accent": "#0a6f3a",
    "tier": 1
  },
  {
    "slug": "matchday-coach",
    "nameAr": "مدرب الجولة",
    "nameEn": "Matchday Coach",
    "descAr": "لعبة قرارات تكتيكية: تبديلات، تشكيلة، إصابات، وضغط الدقائق الأخيرة.",
    "category": "football",
    "engine": "decision",
    "accent": "#0b7d5f",
    "tier": 1
  },
  {
    "slug": "what-if",
    "nameAr": "ماذا لو؟",
    "nameEn": "What If?",
    "descAr": "سيناريوهات تاريخية وافتراضية مُعلَّمة بوضوح كمحتوى خيالي للتأمل لا أكثر.",
    "category": "speculative",
    "engine": "scenario",
    "accent": "#7a3aa1",
    "tier": 1
  },
  {
    "slug": "thinking-compass",
    "nameAr": "بوصلة التفكير",
    "nameEn": "Thinking Compass",
    "descAr": "اختبار أسلوب التفكير: حذر، تحليلي، جريء، دبلوماسي، عاطفي، عملي، استراتيجي.",
    "category": "personality",
    "engine": "decision",
    "accent": "#2a4d8f",
    "tier": 1
  },
  {
    "slug": "impossible-choice",
    "nameAr": "القرار المستحيل",
    "nameEn": "Impossible Choice",
    "descAr": "خياران كلاهما صعب — اختر ثم شاهد كيف وزن الآخرون نفس المعضلة.",
    "category": "decision",
    "engine": "voting",
    "accent": "#b3261e",
    "tier": 1
  },
  {
    "slug": "odd-archive",
    "nameAr": "أرشيف الغرائب",
    "nameEn": "Odd Archive",
    "descAr": "حقائق غريبة لكن موثقة من التاريخ والعلوم والثقافة والرياضة.",
    "category": "general-knowledge",
    "engine": "timeline",
    "accent": "#8a6a14",
    "tier": 1
  },
  {
    "slug": "missing-clue",
    "nameAr": "الدليل الناقص",
    "nameEn": "Missing Clue",
    "descAr": "قصة ناقصة، استنتج الدليل المفقود من الأدلة المتاحة.",
    "category": "reasoning",
    "engine": "clue",
    "accent": "#3a3a8f",
    "tier": 1
  },
  {
    "slug": "unknown-suspect",
    "nameAr": "المتهم المجهول",
    "nameEn": "Unknown Suspect",
    "descAr": "لعبة تحرٍّ قصيرة — تستبعد المشتبه بهم وتحدد المتهم. القضايا خيالية بوضوح.",
    "category": "detective",
    "engine": "clue",
    "accent": "#5a3a6f",
    "tier": 1
  },
  {
    "slug": "wisdom-index",
    "nameAr": "مؤشر الحكمة",
    "nameEn": "Wisdom Index",
    "descAr": "يقيس الصبر والإنصاف والوعي بالمخاطر والتفكير بعيد المدى — لا الذكاء فقط.",
    "category": "personality",
    "engine": "decision",
    "accent": "#0a5a4a",
    "tier": 1
  },
  {
    "slug": "diplomat-test",
    "nameAr": "اختبار الدبلوماسي",
    "nameEn": "Diplomat Test",
    "descAr": "مواقف حساسة تستدعي حسًّا تفاوضيًا — اختر أفضل ردّ.",
    "category": "decision",
    "engine": "decision",
    "accent": "#2a4d8f",
    "tier": 1
  },
  {
    "slug": "saudi-mood-map",
    "nameAr": "خريطة المزاج السعودي",
    "nameEn": "Saudi Mood Map",
    "descAr": "استطلاع يومي على مواضيع محايدة (طقس، رياضة، عطلة) — بدون مواضيع حساسة.",
    "category": "poll",
    "engine": "voting",
    "accent": "#0a6f3a",
    "tier": 1
  },
  {
    "slug": "national-memory",
    "nameAr": "الذاكرة الوطنية",
    "nameEn": "National Memory",
    "descAr": "تطبيق ذاكرة وأسئلة عن أحداث وأماكن ورموز ثقافية سعودية موثقة.",
    "category": "saudi-history",
    "engine": "quiz",
    "accent": "#0b7d5f",
    "tier": 1
  }
];
