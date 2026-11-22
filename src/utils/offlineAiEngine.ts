import { formatDigits, LOCALIZATION } from '../data/localization';
import { HelperMessage, LanguageCode, SolarWeatherState } from '../types/sentinel';
import { formatAgeForLanguage, formatFullTimestampForLanguage } from './dateTime';

type OfflineIntent =
  | 'greeting-help'
  | 'offline-capability'
  | 'gps-phone-signals'
  | 'warnings-forecast'
  | 'kp-meaning'
  | 'flare-sun'
  | 'solar-wind'
  | 'power-health-safety'
  | 'aurora-satellites'
  | 'storm-now'
  | 'general-fallback';

function normalizeQuestion(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

function detectIntent(rawQuestion: string, history: HelperMessage[]): OfflineIntent {
  const q = normalizeQuestion(rawQuestion);
  if (!q) return 'storm-now';

  // Follow-up short phrases ("اور کل؟", "کیوں؟", "اس کا مطلب", "tell me more")
  if (
    /^(کیوں|مزید|اور|مطلب|تفصیل|جی|why|more|explain|detail|what about tomorrow)/i.test(q) &&
    history.length > 0
  ) {
    if (/(کل|tomorrow|آگے|پرسوں)/i.test(q)) return 'warnings-forecast';
    const lastUser = [...history].reverse().find((m) => m.sender === 'user');
    if (lastUser) {
      const prev = detectIntent(lastUser.text, []);
      if (prev !== 'general-fallback') return prev;
    }
  }

  if (
    /(انٹرنیٹ\s*بند|بغیر\s*انٹرنیٹ|بغیر\s*نیٹ|آف\s*لائن|نیٹ\s*نہ|offline|without internet|no internet|bina net|internet band|ऑफ़लाइन|इंटरनेट बंद|ఇంటర్నెట్|ఆఫ్‌లైన్|ಇಂಟರ್ನೆಟ್|ಆಫ್‌ಲೈನ್)/i.test(
      q
    )
  ) {
    return 'offline-capability';
  }

  if (
    /(نقش|راست|جی\s*پی\s*ایس|موبائل|فون|سگنل|کال|ریڈیو|نیٹ\s*ورک|جہاز|پرواز|gps|map|signal|phone|mobile|network|call|radio|flight|aviation|navigation|rasta|नक़्शे|सिग्नल|फ़ोन|మ్యాప్|సిగ్నల్|ఫోన్|ಮ್ಯಾಪ್|ಸಿಗ್ನಲ್|ಫೋನ್)/i.test(
      q
    )
  ) {
    return 'gps-phone-signals';
  }

  if (
    /(کل\s*کو|کل\s*کیا|پرسوں|آنے\s*وال|پیش\s*گوئی|پیشگوئی|وارننگ|انتباہ|خطر|الرٹ|tomorrow|forecast|warning|alert|watch|danger|next day|kal|khatra|कल|ख़तरा|चेतावनी|రేపు|ప్రమాదం|హెచ్చరిక|ನಾಳೆ|ಅಪಾಯ|ಎಚ್ಚರಿಕೆ)/i.test(
      q
    )
  ) {
    return 'warnings-forecast';
  }

  if (
    /(نمبر|کے\s*پی|پیمانہ|مقناطیسی|مطلب|کیا\s*بتاتا|درجہ|\bkp\b|\bg[0-5]\b|scale|meaning|magnetic number|storm number|number kya|नंबर|पैमाना|సంఖ్య|సూచిక|ಸಂಖ್ಯೆ|ಮಾಪನ)/i.test(
      q
    )
  ) {
    return 'kp-meaning';
  }

  if (
    /(چمک|شعل|فلیئر|ایکس\s*رے|flare|xray|x-ray|flash|chamak|चमक|फ्लेयर|మెరుపు|ಹೊಳಪು)/i.test(q)
  ) {
    return 'flare-sun';
  }

  if (
    /(سورج\s*کی\s*ہوا|ہوا\s*کی\s*رفتار|آندھی|solar\s*wind|\bwind\b|hawa|raftaar|सूरज की हवा|हवा|గాలి|ಗಾಳಿ)/i.test(
      q
    )
  ) {
    return 'solar-wind';
  }

  if (
    /(انسان|صحت|بجلی|گرڈ|نقصان|محفوظ|احتیاط|ڈاکٹر|جان|تباہی|health|human|body|safe|safety|power|grid|electricity|damage|bijli|sehat|nuqsan|ehtiyat|इंसान|सेहत|बिजली|सुरक्षित|ఆరోగ్యం|విద్యుత్|సురక్షితం|ಆರೋಗ್ಯ|ವಿದ್ಯುತ್|ಸುರಕ್ಷಿತ)/i.test(
      q
    )
  ) {
    return 'power-health-safety';
  }

  if (
    /(قطبی\s*روشنی|رنگین\s*روشنی|سیٹلائٹ|سیارچ|aurora|northern\s*lights|satellite|रोशनी|उपग्रह|ఉపగ్రహం|ಉಪಗ್ರಹ)/i.test(
      q
    )
  ) {
    return 'aurora-satellites';
  }

  if (
    /(طوفان|آج|ابھی|موسم|سورج|حالت|صورتحال|کیا\s*حال|storm|today|now|weather|sun|status|current|toofan|mausam|halat|suraj|तूफ़ान|आज|सूरज|मौसम|తుఫాను|ఈరోజు|సూర్యు|వాతావరణం|ಬಿರುಗಾಳಿ|ಇಂದು|ಸೂರ್ಯ|ಹವಾಮಾನ)/i.test(
      q
    )
  ) {
    return 'storm-now';
  }

  if (
    /^(سلام|السلام|ہیلو|آداب|مدد|آپ کون|کون ہو|hello|hi|hey|help|namaste|नमस्ते|హలో|నమస్కారం|ನಮಸ್ಕಾರ)/i.test(
      q
    )
  ) {
    return 'greeting-help';
  }

  return 'general-fallback';
}

function getSavedMeta(solar: SolarWeatherState | null, lang: LanguageCode) {
  if (!solar) {
    return {
      hasSaved: false,
      timeLabel: '',
      ageLabel: '',
      isCalmLive: true,
    };
  }
  const timeLabel = formatFullTimestampForLanguage(solar.fetchedAtIso, lang);
  const ageLabel = formatAgeForLanguage(solar.fetchedAtIso, lang);
  const isCalmLive = solar.kpIndex === null || solar.kpIndex < 5;
  return { hasSaved: true, timeLabel, ageLabel, isCalmLive };
}

function buildUrduOfflineReply(
  intent: OfflineIntent,
  solar: SolarWeatherState | null
): string {
  const t = LOCALIZATION.ur;
  const meta = getSavedMeta(solar, 'ur');

  const savedPrefix = meta.hasSaved
    ? `آخری محفوظ سرکاری رپورٹ${meta.ageLabel ? ` (${meta.ageLabel})` : ''} کے مطابق: `
    : 'ابھی اس موبائل میں کوئی پرانی سرکاری رپورٹ محفوظ نہیں ہے، اس لیے تازہ نمبر دستیاب نہیں ہیں۔ ';

  switch (intent) {
    case 'greeting-help':
      return `${meta.hasSaved ? savedPrefix + t.severityDescriptions[solar!.severity] + ' ' : ''}ابھی انٹرنیٹ بند ہے، لیکن میں آف لائن مقامی رہنما کے طور پر محفوظ معلومات کی مدد سے خلائی موسم، موبائل نقشوں، طوفان کے نمبر اور احتیاط کے بارے میں آپ کے بنیادی اردو سوالات کا جواب دے سکتا ہوں۔`;

    case 'offline-capability':
      return `انٹرنیٹ بند ہونے پر بھی یہ ایپ کھلتی رہتی ہے، پہلے سے محفوظ شدہ آخری رپورٹ دکھاتی ہے، اور اس کا آف لائن مقامی رہنما خلائی طوفان، موبائل نقشوں، کل کی پیشگوئی اور سائنسی اصطلاحات کے بنیادی اردو سوالات کا جواب دے سکتا ہے۔ البتہ نئی سرکاری رپورٹ لانے، آن لائن اے آئی اور سرور سے آواز بنوانے کے لیے انٹرنیٹ ضروری ہوتا ہے۔`;

    case 'gps-phone-signals':
      if (!solar) {
        return `${savedPrefix}عام طور پر جب تک بڑا خلائی طوفان نہ آئے موبائل کے نقشے، راستے اور فون کال بالکل ٹھیک چلتے ہیں۔ انٹرنیٹ ملنے پر تازہ رپورٹ لے کر تصدیق کی جا سکتی ہے۔`;
      }
      return `${savedPrefix}${t.gpsPlainScaleNote(solar.navigationRiskLevel)} زمین پر روزمرہ فون کال اور انٹرنیٹ عام طور پر متاثر نہیں ہوتے، اس لیے گھبرانے کی ضرورت نہیں۔`;

    case 'warnings-forecast': {
      if (!solar) {
        return `${savedPrefix}ابھی پرانی وارننگ یا کل کی پیشگوئی محفوظ نہیں ہے۔ انٹرنیٹ آن ہونے پر "تازہ کریں" دبائیں تاکہ سرکاری مرکز سے تازہ انتباہات محفوظ ہو جائیں۔`;
      }
      const tomorrow = solar.forecastDays?.[1];
      const topAlert = solar.alerts[0] ? t.localizedAlertContent(solar.alerts[0]) : null;
      const alertPart = topAlert
        ? `محفوظ اطلاعات میں ${formatDigits(solar.alerts.length, 'ur')} سرکاری اطلاع شامل ہے؛ اہم پیغام: ${topAlert.title}۔ ${topAlert.impact}`
        : 'محفوظ رپورٹ میں کوئی بڑی ہنگامی وارننگ درج نہیں تھی۔';
      const tomorrowPart = tomorrow
        ? ` کل کی پیشگوئی: ${tomorrow.gLevelNum >= 1 ? `درجہ ${formatDigits(tomorrow.gLevelNum, 'ur')} کے ہلکے طوفان کا امکان` : t.forecastNoStormText}۔`
        : '';
      const discPart =
        solar.feedDiscrepancyKind === 'warning-higher-than-live' && solar.kpIndex !== null
          ? ` یاد رہے موجودہ لمحے کا نمبر (${formatDigits(solar.kpIndex, 'ur')}) پرسکون ہے، جبکہ کھلی تنبیہ آنے والے کئی گھنٹوں کے امکان کے لیے ہوتی ہے۔`
          : '';
      return `${savedPrefix}${alertPart}${tomorrowPart}${discPart}`;
    }

    case 'kp-meaning': {
      const currentPart = solar
        ? ` محفوظ رپورٹ میں یہ نمبر ${solar.kpIndex !== null ? formatDigits(solar.kpIndex, 'ur') : 'درج نہیں'} تھا (${t.kpPlainMeaning(solar.kpIndex)})۔`
        : '';
      return `طوفان کا مقناطیسی نمبر صفر سے نو تک ہوتا ہے جو بتاتا ہے کہ زمین کے گرد مقناطیسی دائرہ کتنا ہل رہا ہے۔ صفر سے تین بالکل پرسکون ہے، نمبر چار صرف ہلکی ہلچل ہے، اور اصل خلائی طوفان نمبر پانچ سے شروع ہوتا ہے۔${currentPart}`;
    }

    case 'flare-sun':
      if (!solar) {
        return `${savedPrefix}سورج کی چمک کا مطلب سورج کی سطح سے نکلنے والی تیز روشنی اور توانائی کی لہر ہے۔ چھوٹی چمک سے زمین پر کوئی فرق نہیں پڑتا، جبکہ بہت بڑی چمک سے دن کے وقت ریڈیو سگنل چند منٹ کمزور ہو سکتے ہیں۔`;
      }
      return `${savedPrefix}${t.flarePlainMeaning(solar.flareClass)} چھوٹی یا درمیانی چمک سے زمین پر عام زندگی متاثر نہیں ہوتی۔`;

    case 'solar-wind':
      if (!solar) {
        return `${savedPrefix}سورج سے تیز ذرات کی ہوا مسلسل آتی رہتی ہے جس کی عام رفتار تقریباً تین سو سے چار سو کلومیٹر فی سیکنڈ ہوتی ہے۔ جب یہ رفتار بہت زیادہ بڑھ جائے تو مقناطیسی ہلچل پیدا ہو سکتی ہے۔`;
      }
      return `${savedPrefix}${t.windPlainMeaning(solar.solarWindSpeed)}`;

    case 'power-health-safety':
      if (!solar) {
        return `${savedPrefix}زمین کا کرۂ ہوائی اور مقناطیسی حصار انسانوں کی مکمل حفاظت کرتا ہے، اس لیے خلائی موسم سے انسانوں کی صحت کو کوئی براہِ راست نقصان نہیں ہوتا۔ عام گھروں کی بجلی اور موبائل فون بھی عام حالات میں محفوظ رہتے ہیں۔`;
      }
      return `${savedPrefix}${t.severityLabels[solar.severity]}۔ زمین کا قدرتی مقناطیسی حفاظتی غلاف انسانوں کو محفوظ رکھتا ہے اس لیے انسانی صحت کو کوئی براہِ راست خطرہ نہیں۔ ${t.gpsPlainScaleNote(solar.navigationRiskLevel)}`;

    case 'aurora-satellites':
      if (!solar) {
        return `${savedPrefix}جب سورج کی تیز ہوا زمین کے مقناطیسی دائرے سے ٹکراتی ہے تو قطبی علاقوں کے آسمان پر خوبصورت رنگین روشنیاں نظر آتی ہیں اور اونچائی پر موجود سیارچوں پر ہلکا دباؤ آ سکتا ہے۔`;
      }
      return `${savedPrefix}${
        solar.kpIndex !== null && solar.kpIndex >= 5
          ? 'قطبی علاقوں کے آسمان پر رنگین روشنی اور سیارچوں پر ہلکا دباؤ ممکن ہے۔'
          : 'اس رپورٹ کے وقت صورتحال ہلکی تھی، اس لیے سیارچوں یا عام نظاموں کے لیے کوئی بڑا خطرہ نہیں تھا۔'
      } ${solar.alerts.some((a) => a.noticeCode === 'EF3A') ? 'محفوظ اطلاع میں اونچے سیارچوں کے مدار میں تیز ذرات کی نگرانی بھی درج تھی، لیکن زمین پر صارفین محفوظ ہیں۔' : ''}`;

    case 'storm-now':
      if (!solar) {
        return `${savedPrefix}تازہ سرکاری رپورٹ لانے کے لیے انٹرنیٹ آن کر کے "تازہ کریں" کا بٹن دبائیں، پھر وہ معلومات آف لائن بھی اس موبائل میں محفوظ رہے گی۔`;
      }
      return `${savedPrefix}${t.severityLabels[solar.severity]}۔ ${t.severityDescriptions[solar.severity]} ${t.kpPlainMeaning(solar.kpIndex)}`;

    case 'general-fallback':
    default:
      if (!solar) {
        return 'ابھی انٹرنیٹ بند ہے اور اس موبائل میں کوئی پرانی رپورٹ محفوظ نہیں ہے، نیز اس براؤزر میں اپنی اے آئی (جیمنائی نینو) بھی موجود نہیں۔ آف لائن رہتے ہوئے آپ خلائی طوفان، موبائل نقشوں، طوفان کے نمبر یا احتیاط کے بارے میں بنیادی سوالات پوچھ سکتے ہیں؛ تفصیلی سوالوں کے لیے انٹرنیٹ آن ہونے پر دوبارہ کوشش کریں۔';
      }
      return `${savedPrefix}${t.severityDescriptions[solar.severity]} ${t.gpsPlainScaleNote(solar.navigationRiskLevel)} نوٹ: انٹرنیٹ بند ہونے کی وجہ سے ابھی صرف محفوظ معلومات پر مبنی بنیادی آف لائن رہنما جواب دے رہا ہے؛ تفصیلی یا مختلف موضوع کے سوال کے لیے انٹرنیٹ آن کر کے دوبارہ پوچھیں۔`;
  }
}

function buildEnglishOfflineReply(
  intent: OfflineIntent,
  solar: SolarWeatherState | null
): string {
  const t = LOCALIZATION.en;
  const meta = getSavedMeta(solar, 'en');
  const savedPrefix = meta.hasSaved
    ? `Based on your last saved NOAA report${meta.ageLabel ? ` (${meta.ageLabel})` : ''}: `
    : 'Internet is off and no previous solar report is saved on this device yet. ';

  switch (intent) {
    case 'greeting-help':
      return `${meta.hasSaved ? savedPrefix + t.severityDescriptions[solar!.severity] + ' ' : ''}Internet is currently off, so I am using the built-in Offline Local Guide to answer basic questions about solar storms, phone GPS, warnings, and safety from saved data.`;
    case 'offline-capability':
      return 'Even without internet, the app stays open, shows your last saved solar report, and answers basic space-weather, GPS safety, forecast, and Kp scale questions through its built-in Offline Local Guide. Fetching fresh NOAA updates and server voice requires an internet connection.';
    case 'gps-phone-signals':
      return solar
        ? `${savedPrefix}${t.gpsPlainScaleNote(solar.navigationRiskLevel)} Everyday calls and cellular data stay normal.`
        : `${savedPrefix}Phone GPS and maps stay normal during calm space weather; reconnect once to save a fresh report.`;
    case 'warnings-forecast': {
      if (!solar) {
        return `${savedPrefix}Connect briefly and tap Refresh to store live warnings and the 3-day outlook for offline use.`;
      }
      const tomorrow = solar.forecastDays?.[1];
      const topAlert = solar.alerts[0] ? t.localizedAlertContent(solar.alerts[0]) : null;
      const alertText = topAlert
        ? `${solar.alerts.length} saved notice(s); top item: ${topAlert.title}. ${topAlert.impact}`
        : 'No major active warning was saved in that report.';
      const tomText = tomorrow
        ? ` Tomorrow outlook: ${tomorrow.gLevelNum >= 1 ? tomorrow.gScale : t.forecastNoStormText}.`
        : '';
      return `${savedPrefix}${alertText}${tomText}`;
    }
    case 'kp-meaning':
      return `The geomagnetic Kp number runs from 0 to 9. Levels 0 to 3 are calm, 4 is active unrest (still not a storm), and official G1 storms start at Kp 5.${solar ? ` Your saved report recorded Kp ${solar.kpIndex ?? 'not available'}.` : ''}`;
    case 'flare-sun':
      return solar
        ? `${savedPrefix}${t.flarePlainMeaning(solar.flareClass)}`
        : `${savedPrefix}Solar flares are bursts of X-ray light on the Sun. Small flares do not affect daily life; strong flares can briefly fade daytime shortwave radio.`;
    case 'solar-wind':
      return solar
        ? `${savedPrefix}${t.windPlainMeaning(solar.solarWindSpeed)}`
        : `${savedPrefix}Solar wind is the steady stream of particles from the Sun, usually around 300 to 400 km/s when quiet.`;
    case 'power-health-safety':
      return `${savedPrefix}Earth’s atmosphere and magnetic field protect people on the ground, so space weather does not harm human health directly.${solar ? ` ${t.gpsPlainScaleNote(solar.navigationRiskLevel)}` : ''}`;
    case 'aurora-satellites':
      return `${savedPrefix}${
        solar?.kpIndex !== null && (solar?.kpIndex ?? 0) >= 5
          ? 'High-latitude aurora and minor satellite drag are possible at elevated Kp.'
          : 'Conditions in your saved report were mild for satellites, while ground users remain safe.'
      }`;
    case 'storm-now':
      return solar
        ? `${savedPrefix}${t.severityLabels[solar.severity]}. ${t.severityDescriptions[solar.severity]} ${t.kpPlainMeaning(solar.kpIndex)}`
        : `${savedPrefix}Tap Refresh once online to save current live NOAA measurements on your phone.`;
    case 'general-fallback':
    default:
      return solar
        ? `${savedPrefix}${t.severityDescriptions[solar.severity]} ${t.gpsPlainScaleNote(solar.navigationRiskLevel)} Note: this Offline Local Guide answers basic saved-data questions without internet; reconnect for open-ended cloud AI questions.`
        : `${savedPrefix}While offline without built-in Gemini Nano, I can answer general space-weather basics (GPS impact, Kp scale, safety). Reconnect briefly to fetch live NOAA data or ask custom questions.`;
  }
}

function buildIndicOfflineReply(
  lang: 'hi' | 'te' | 'kn',
  intent: OfflineIntent,
  solar: SolarWeatherState | null
): string {
  const t = LOCALIZATION[lang];
  const meta = getSavedMeta(solar, lang);
  const ageTag = meta.ageLabel ? ` (${meta.ageLabel})` : '';

  if (lang === 'hi') {
    const prefix = meta.hasSaved
      ? `पिछली सहेजी गई सरकारी रिपोर्ट${ageTag} के अनुसार: `
      : 'इंटरनेट बंद है और अभी फ़ोन में कोई पुरानी रिपोर्ट सहेजी नहीं गई है। ';

    switch (intent) {
      case 'offline-capability':
        return 'इंटरनेट बंद होने पर भी यह ऐप सहेजी गई रिपोर्ट दिखाती है और इसका ऑफ़लाइन स्थानीय गाइड अंतरिक्ष मौसम, फ़ोन नक़्शे, तूफ़ान नंबर और सुरक्षा के बुनियादी सवालों का जवाब दे सकता है। ताज़ा डेटा लाने के लिए इंटरनेट ज़रूरी है।';
      case 'gps-phone-signals':
        return solar
          ? `${prefix}${t.gpsPlainScaleNote(solar.navigationRiskLevel)} रोज़मर्रा की कॉल और मोबाइल सामान्य चलते हैं।`
          : `${prefix}शांत मौसम में फ़ोन के नक़्शे और सिग्नल सामान्य चलते हैं। इंटरनेट आने पर ताज़ा रिपोर्ट देखें।`;
      case 'warnings-forecast': {
        if (!solar) return `${prefix}ताज़ा चेतावनी और कल का पूर्वानुमान सहेजने के लिए इंटरनेट चालू होने पर रिफ्रेश दबाएँ।`;
        const tom = solar.forecastDays?.[1];
        const top = solar.alerts[0] ? t.localizedAlertContent(solar.alerts[0]) : null;
        return `${prefix}${top ? `${top.title}। ${top.impact}` : 'कोई बड़ी आपात चेतावनी दर्ज नहीं थी।'}${tom ? ` कल का अनुमान: ${tom.gLevelNum >= 1 ? tom.gScale : t.forecastNoStormText}।` : ''}`;
      }
      case 'kp-meaning':
        return `तूफ़ान का चुंबकीय नंबर शून्य से नौ तक होता है। चार तक स्थिति शांत या हल्की हलचल होती है और असली तूफ़ान नंबर पाँच से शुरू होता है।${solar ? ` सहेजी रिपोर्ट में यह नंबर ${solar.kpIndex !== null ? formatDigits(solar.kpIndex, 'hi') : 'उपलब्ध नहीं'} था।` : ''}`;
      case 'flare-sun':
        return solar ? `${prefix}${t.flarePlainMeaning(solar.flareClass)}` : `${prefix}सूरज की चमक ऊर्जा की एक लहर होती है; छोटी चमक से धरती पर कोई असर नहीं पड़ता।`;
      case 'solar-wind':
        return solar ? `${prefix}${t.windPlainMeaning(solar.solarWindSpeed)}` : `${prefix}सूरज से लगातार कणों की हवा आती है, जो शांत दिनों में लगभग तीन से चार सौ किमी प्रति सेकंड होती है।`;
      case 'power-health-safety':
        return `${prefix}धरती का सुरक्षा कवच इंसानों को पूरी तरह बचाता है, इसलिए सेहत पर कोई सीधा ख़तरा नहीं होता।${solar ? ` ${t.gpsPlainScaleNote(solar.navigationRiskLevel)}` : ''}`;
      case 'storm-now':
      default:
        return solar
          ? `${prefix}${t.severityLabels[solar.severity]}। ${t.severityDescriptions[solar.severity]} ${t.gpsPlainScaleNote(solar.navigationRiskLevel)}`
          : `${prefix}इंटरनेट बंद होने के कारण अभी केवल बुनियादी ऑफ़लाइन गाइड उत्तर दे रहा है; विस्तृत सवाल के लिए इंटरनेट चालू होने पर पूछें।`;
    }
  }

  if (lang === 'te') {
    const prefix = meta.hasSaved
      ? `చివరిగా సేవ్ చేసిన ప్రభుత్వ నివేదిక${ageTag} ప్రకారం: `
      : 'ఇంటర్నెట్ లేదు మరియు ఇంకా పాత నివేదిక సేవ్ కాలేదు. ';

    switch (intent) {
      case 'offline-capability':
        return 'ఇంటర్నెట్ లేకపోయినా సేవ్ చేసిన సమాచారం ఆధారంగా ఆఫ్‌లైన్ స్థానిక గైడ్ అంతరిక్ష వాతావరణం, ఫోన్ మ్యాప్స్ మరియు తుఫాను సంఖ్య గురించి ప్రాథమిక ప్రశ్నలకు సమాధానం ఇస్తుంది.';
      case 'gps-phone-signals':
        return solar
          ? `${prefix}${t.gpsPlainScaleNote(solar.navigationRiskLevel)}`
          : `${prefix}సాధారణ రోజుల్లో ఫోన్ మ్యాప్స్ మరియు సిగ్నల్స్ బాగానే పనిచేస్తాయి.`;
      case 'warnings-forecast': {
        if (!solar) return `${prefix}తాజా హెచ్చరికలు సేవ్ చేయడానికి ఇంటర్నెట్ ఉన్నప్పుడు రిఫ్రెష్ నొక్కండి.`;
        const tom = solar.forecastDays?.[1];
        const top = solar.alerts[0] ? t.localizedAlertContent(solar.alerts[0]) : null;
        return `${prefix}${top ? `${top.title}. ${top.impact}` : 'పెద్ద హెచ్చరికలేవీ లేవు.'}${tom ? ` రేపటి అంచనా: ${tom.gLevelNum >= 1 ? tom.gScale : t.forecastNoStormText}.` : ''}`;
      }
      case 'kp-meaning':
        return `అయస్కాంత సంఖ్య సున్నా నుండి తొమ్మిది వరకు ఉంటుంది. నాలుగు వరకు సాధారణ కదలిక మాత్రమే; అసలు తుఫాను ఐదు నుండి మొదలవుతుంది.${solar ? ` సేవ్ చేసిన సంఖ్య: ${solar.kpIndex !== null ? formatDigits(solar.kpIndex, 'te') : 'లేదు'}.` : ''}`;
      case 'power-health-safety':
        return `${prefix}భూమి రక్షణ కవచం మనుషులను కాపాడుతుంది కాబట్టి ఆరోగ్యానికి ప్రత్యక్ష ప్రమాదం లేదు.`;
      case 'storm-now':
      default:
        return solar
          ? `${prefix}${t.severityLabels[solar.severity]}. ${t.severityDescriptions[solar.severity]} ${t.gpsPlainScaleNote(solar.navigationRiskLevel)}`
          : `${prefix}ఇంటర్నెట్ లేనందున ప్రాథమిక ఆఫ్‌లైన్ గైడ్ మాత్రమే అందుబాటులో ఉంది; పూర్తి ప్రశ్నల కోసం ఇంటర్నెట్ ఆన్ చేసి అడగండి.`;
    }
  }

  // Kannada ('kn')
  const prefix = meta.hasSaved
    ? `ಕೊನೆಯದಾಗಿ ಉಳಿಸಿದ ಸರ್ಕಾರಿ ವರದಿ${ageTag} ಪ್ರಕಾರ: `
    : 'ಇಂಟರ್ನೆಟ್ ಆಫ್ ಆಗಿದೆ ಮತ್ತು ಇನ್ನೂ ಹಳೆಯ ವರದಿ ಉಳಿಸಲಾಗಿಲ್ಲ. ';

  switch (intent) {
    case 'offline-capability':
      return 'ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದಿದ್ದರೂ ಉಳಿಸಿದ ಮಾಹಿತಿಯ ಆಧಾರದ ಮೇಲೆ ಆಫ್‌ಲೈನ್ ಸ್ಥಳೀಯ ಮಾರ್ಗದರ್ಶಿ ಬಾಹ್ಯಾಕಾಶ ಹವಾಮಾನ, ಫೋನ್ ನಕ್ಷೆಗಳು ಮತ್ತು ಬಿರುಗಾಳಿ ಸಂಖ್ಯೆಯ ಮೂಲ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಬಲ್ಲದು.';
    case 'gps-phone-signals':
      return solar
        ? `${prefix}${t.gpsPlainScaleNote(solar.navigationRiskLevel)}`
        : `${prefix}ಶಾಂತ ದಿನಗಳಲ್ಲಿ ಫೋನ್ ನಕ್ಷೆಗಳು ಮತ್ತು ಸಿಗ್ನಲ್‌ಗಳು ಸಾಮಾನ್ಯವಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತವೆ.`;
    case 'warnings-forecast': {
      if (!solar) return `${prefix}ಹೊಸ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಉಳಿಸಲು ಇಂಟರ್ನೆಟ್ ಇದ್ದಾಗ ರಿಫ್ರೆಶ್ ಒತ್ತಿರಿ.`;
      const tom = solar.forecastDays?.[1];
      const top = solar.alerts[0] ? t.localizedAlertContent(solar.alerts[0]) : null;
      return `${prefix}${top ? `${top.title}. ${top.impact}` : 'ದೊಡ್ಡ ಎಚ್ಚರಿಕೆಗಳು ದಾಖಲಾಗಿಲ್ಲ.'}${tom ? ` ನಾಳೆಯ ಮುನ್ಸೂಚನೆ: ${tom.gLevelNum >= 1 ? tom.gScale : t.forecastNoStormText}.` : ''}`;
    }
    case 'kp-meaning':
      return `ಕಾಂತೀಯ ಸಂಖ್ಯೆ ಸೊನ್ನೆಯಿಂದ ಒಂಬತ್ತರವರೆಗೆ ಇರುತ್ತದೆ. ನಾಲ್ಕರವರೆಗೆ ಸಾಮಾನ್ಯ ಚಲನೆ ಮಾತ್ರ; ನಿಜವಾದ ಬಿರುಗಾಳಿ ಐದರಿಂದ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ.${solar ? ` ಉಳಿಸಿದ ಸಂಖ್ಯೆ: ${solar.kpIndex !== null ? formatDigits(solar.kpIndex, 'kn') : 'ಲಭ್ಯವಿಲ್ಲ'}.` : ''}`;
    case 'power-health-safety':
      return `${prefix}ಭೂಮಿಯ ರಕ್ಷಣಾ ಕವಚವು ಮನುಷ್ಯರನ್ನು ರಕ್ಷಿಸುವುದರಿಂದ ಆರೋಗ್ಯಕ್ಕೆ ನೇರ ಅಪಾಯವಿಲ್ಲ.`;
    case 'storm-now':
    default:
      return solar
        ? `${prefix}${t.severityLabels[solar.severity]}. ${t.severityDescriptions[solar.severity]} ${t.gpsPlainScaleNote(solar.navigationRiskLevel)}`
        : `${prefix}ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದ ಕಾರಣ ಮೂಲ ಆಫ್‌ಲೈನ್ ಮಾರ್ಗದರ್ಶಿ ಮಾತ್ರ ಉತ್ತರಿಸುತ್ತಿದೆ; ವಿವರವಾದ ಪ್ರಶ್ನೆಗಳಿಗೆ ಇಂಟರ್ನೆಟ್ ಆನ್ ಮಾಡಿ ಕೇಳಿ.`;
  }
}

export function generateOfflineSpaceWeatherReply(params: {
  question: string;
  language: LanguageCode;
  solar: SolarWeatherState | null;
  history: HelperMessage[];
}): string {
  const { question, language, solar, history } = params;
  const intent = detectIntent(question, history);

  switch (language) {
    case 'ur':
      return buildUrduOfflineReply(intent, solar);
    case 'en':
      return buildEnglishOfflineReply(intent, solar);
    case 'hi':
    case 'te':
    case 'kn':
      return buildIndicOfflineReply(language, intent, solar);
  }
}
