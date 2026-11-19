import { LanguageCode } from '../types/sentinel';

const DIGITS: Record<LanguageCode, string[]> = {
  en: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  ur: ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'],
  hi: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  te: ['౦', '౧', '౨', '౩', '౪', '౫', '౬', '౭', '౮', '౯'],
  kn: ['೦', '೧', '೨', '೩', '೪', '೫', '೬', '೭', '೮', '೯'],
};

const MONTHS: Record<LanguageCode, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ur: ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  hi: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्तूबर', 'नवंबर', 'दिसंबर'],
  te: ['జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్', 'జులై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్'],
  kn: ['ಜನವರಿ', 'ಫೆಬ್ರವರಿ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿಲ್', 'ಮೇ', 'ಜೂನ್', 'ಜುಲೈ', 'ಆಗಸ್ಟ್', 'ಸೆಪ್ಟೆಂಬರ್', 'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್', 'ಡಿಸೆಂಬರ್'],
};

export function localizeDigits(value: number | string, lang: LanguageCode): string {
  const map = DIGITS[lang] ?? DIGITS.en;
  return String(value).replace(/\d/g, (d) => map[Number(d)] ?? d);
}

function getPeriodLabel(hour24: number, lang: LanguageCode): string {
  if (lang === 'en') {
    return hour24 >= 12 ? 'PM' : 'AM';
  }
  if (lang === 'ur') {
    if (hour24 >= 5 && hour24 < 12) return 'صبح';
    if (hour24 >= 12 && hour24 < 16) return 'دوپہر';
    if (hour24 >= 16 && hour24 < 20) return 'شام';
    return 'رات';
  }
  if (lang === 'hi') {
    if (hour24 >= 5 && hour24 < 12) return 'सुबह';
    if (hour24 >= 12 && hour24 < 16) return 'दोपहर';
    if (hour24 >= 16 && hour24 < 20) return 'शाम';
    return 'रात';
  }
  if (lang === 'te') {
    if (hour24 >= 5 && hour24 < 12) return 'ఉదయం';
    if (hour24 >= 12 && hour24 < 16) return 'మధ్యాహ్నం';
    if (hour24 >= 16 && hour24 < 20) return 'సాయంత్రం';
    return 'రాత్రి';
  }
  // kn
  if (hour24 >= 5 && hour24 < 12) return 'ಬೆಳಿಗ್ಗೆ';
  if (hour24 >= 12 && hour24 < 16) return 'ಮಧ್ಯಾಹ್ನ';
  if (hour24 >= 16 && hour24 < 20) return 'ಸಂಜೆ';
  return 'ರಾತ್ರಿ';
}

const EN_MONTH_INDEX: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

/**
 * Parses NOAA SWPC timestamps strictly as UTC when timezone offset is omitted:
 * - "2026-11-18 05:56:07.553"
 * - "2026-11-18T09:08:00"
 * - "2026 Nov 18 0555 UTC"
 * - Standard ISO strings with Z or ±HH:MM
 */
export function parseNoaaTimestampUtc(input: Date | string | undefined | null): Date | null {
  if (!input) return null;
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input;
  }

  const trimmed = input.trim();
  if (!trimmed) return null;

  // Format: "2026 Nov 18 0555 UTC" or "2026 Nov 18 05:55 UTC"
  const swpcTextMatch = trimmed.match(
    /^(\d{4})\s+([A-Za-z]{3})\s+(\d{1,2})\s+(\d{2}):?(\d{2})(?:\s*UTC)?$/i
  );
  if (swpcTextMatch) {
    const year = Number(swpcTextMatch[1]);
    const month = EN_MONTH_INDEX[swpcTextMatch[2].toLowerCase()];
    const day = Number(swpcTextMatch[3]);
    const hour = Number(swpcTextMatch[4]);
    const minute = Number(swpcTextMatch[5]);
    if (month !== undefined) {
      const d = new Date(Date.UTC(year, month, day, hour, minute, 0));
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }

  // Format: "YYYY-MM-DD HH:MM:SS(.sss)" or "YYYY-MM-DDTHH:MM:SS(.sss)" without timezone
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(trimmed)) {
    const normalized = `${trimmed.replace(' ', 'T')}Z`;
    const d = new Date(normalized);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // Date-only "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}T00:00:00Z`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseValidDate(input: Date | string | undefined | null): Date | null {
  return parseNoaaTimestampUtc(input);
}

/**
 * Formats a clean, full time string in the target language with zero English AM/PM leakage
 * and LTR digit isolation so RTL Urdu timestamps never flip or clip.
 */
export function formatTimeForLanguage(
  input: Date | string | undefined | null,
  lang: LanguageCode,
  options?: { includeSeconds?: boolean; compact24h?: boolean }
): string {
  const dt = parseValidDate(input);
  if (!dt) return '';

  const h24 = dt.getHours();
  const mins = String(dt.getMinutes()).padStart(2, '0');
  const secs = String(dt.getSeconds()).padStart(2, '0');

  if (options?.compact24h) {
    const hh = String(h24).padStart(2, '0');
    const raw = options.includeSeconds ? `${hh}:${mins}:${secs}` : `${hh}:${mins}`;
    return `\u2066${localizeDigits(raw, lang)}\u2069`;
  }

  const h12 = h24 % 12 || 12;
  const clockRaw = options?.includeSeconds
    ? `${h12}:${mins}:${secs}`
    : `${h12}:${mins}`;
  const clockLocalized = `\u2066${localizeDigits(clockRaw, lang)}\u2069`;
  const period = getPeriodLabel(h24, lang);

  if (lang === 'en') {
    return `${clockLocalized} ${period}`;
  }
  return `${period} ${clockLocalized}`;
}

export function formatShortDateForLanguage(
  input: Date | string | undefined | null,
  lang: LanguageCode
): string {
  const dt = parseValidDate(input);
  if (!dt) return '';
  const month = (MONTHS[lang] ?? MONTHS.en)[dt.getMonth()] ?? '';
  const day = localizeDigits(dt.getDate(), lang);
  return lang === 'en' ? `${month} ${day}` : `${day} ${month}`;
}

export function formatFullTimestampForLanguage(
  input: Date | string | undefined | null,
  lang: LanguageCode
): string {
  const dt = parseValidDate(input);
  if (!dt) return '';
  const dPart = formatShortDateForLanguage(dt, lang);
  const tPart = formatTimeForLanguage(dt, lang);
  return `${dPart} · ${tPart}`;
}

export function formatAgeForLanguage(
  input: Date | string | undefined | null,
  lang: LanguageCode
): string {
  const dt = parseValidDate(input);
  if (!dt) return '';
  const diffMin = Math.max(0, Math.round((Date.now() - dt.getTime()) / 60000));
  if (diffMin < 1) {
    switch (lang) {
      case 'ur':
        return 'ابھی ابھی';
      case 'hi':
        return 'अभी अभी';
      case 'te':
        return 'ఇప్పుడే';
      case 'kn':
        return 'ಈಗಷ್ಟೇ';
      default:
        return 'just now';
    }
  }
  if (diffMin < 60) {
    const n = localizeDigits(diffMin, lang);
    switch (lang) {
      case 'ur':
        return `${n} منٹ پہلے`;
      case 'hi':
        return `${n} मिनट पहले`;
      case 'te':
        return `${n} నిమిషాల క్రితం`;
      case 'kn':
        return `${n} ನಿಮಿಷಗಳ ಹಿಂದೆ`;
      default:
        return `${n} min ago`;
    }
  }
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 48) {
    const n = localizeDigits(diffHrs, lang);
    switch (lang) {
      case 'ur':
        return `${n} گھنٹے پہلے`;
      case 'hi':
        return `${n} घंटे पहले`;
      case 'te':
        return `${n} గంటల క్రితం`;
      case 'kn':
        return `${n} ಗಂಟೆಗಳ ಹಿಂದೆ`;
      default:
        return `${n} hr ago`;
    }
  }
  const diffDays = Math.floor(diffHrs / 24);
  const n = localizeDigits(diffDays, lang);
  switch (lang) {
    case 'ur':
      return `${n} دن پہلے`;
    case 'hi':
      return `${n} दिन पहले`;
    case 'te':
      return `${n} రోజుల క్రితం`;
    case 'kn':
      return `${n} ದಿನಗಳ ಹಿಂದೆ`;
    default:
      return `${n} d ago`;
  }
}
