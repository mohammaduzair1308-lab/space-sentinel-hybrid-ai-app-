import {
  AlertCategory,
  AlertNoticeCode,
  FeedDiscrepancyKind,
  SeverityLevel,
  SolarDataPoint,
  SolarForecastDay,
  SolarWeatherState,
  SpaceAlertItem,
} from '../types/sentinel';
import { localizeDigits, parseNoaaTimestampUtc } from './dateTime';

const CACHE_KEY = 'space_sentinel_last_live_solar_v2';
export const NOAA_HOME_URL = 'https://www.swpc.noaa.gov/';
export const NOAA_ALERTS_URL = 'https://www.swpc.noaa.gov/products/alerts-watches-and-warnings';
export const NOAA_SCALES_URL = 'https://www.swpc.noaa.gov/noaa-scales-explanation';

function formatClock24(dt: Date, includeSeconds = false): string {
  const hh = String(dt.getHours()).padStart(2, '0');
  const mm = String(dt.getMinutes()).padStart(2, '0');
  if (!includeSeconds) return `${hh}:${mm}`;
  const ss = String(dt.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function classifyFlare(flux: number | null): { flareClass: string | null; radioScale: string } {
  if (flux === null || !Number.isFinite(flux) || flux <= 0) {
    return { flareClass: null, radioScale: 'R0' };
  }
  if (flux >= 1e-4) {
    const mag = Math.min(9.9, +(flux / 1e-4).toFixed(1));
    return { flareClass: `X${mag}`, radioScale: flux >= 1e-3 ? 'R4' : 'R3' };
  }
  if (flux >= 1e-5) {
    const mag = +(flux / 1e-5).toFixed(1);
    return { flareClass: `M${mag}`, radioScale: flux >= 5e-5 ? 'R2' : 'R1' };
  }
  if (flux >= 1e-6) {
    const mag = +(flux / 1e-6).toFixed(1);
    return { flareClass: `C${mag}`, radioScale: 'R0' };
  }
  const mag = Math.max(1.0, +(flux / 1e-7).toFixed(1));
  return { flareClass: `B${mag}`, radioScale: 'R0' };
}

/**
 * Official NOAA Geomagnetic Storm Scale:
 * Kp < 5 -> G0 (nominal; Kp 4 is active/unsettled, NEVER G1)
 * Kp 5 -> G1 (minor)
 * Kp 6 -> G2 (moderate -> minor/elevated app tier)
 * Kp 7 -> G3 (strong)
 * Kp 8 -> G4 (extreme/severe)
 * Kp 9 -> G5 (extreme)
 */
export function classifyGeomagnetic(kp: number | null): { severity: SeverityLevel; geoScale: string } {
  if (kp === null || !Number.isFinite(kp)) return { severity: 'nominal', geoScale: 'G0' };
  if (kp >= 9) return { severity: 'extreme', geoScale: 'G5' };
  if (kp >= 8) return { severity: 'extreme', geoScale: 'G4' };
  if (kp >= 7) return { severity: 'strong', geoScale: 'G3' };
  if (kp >= 6) return { severity: 'strong', geoScale: 'G2' };
  if (kp >= 5) return { severity: 'minor', geoScale: 'G1' };
  return { severity: 'nominal', geoScale: 'G0' };
}

function classifyNavigationRisk(kp: number | null, flux: number | null): SeverityLevel {
  if ((kp !== null && kp >= 8) || (flux !== null && flux >= 1e-3)) return 'extreme';
  if ((kp !== null && kp >= 6) || (flux !== null && flux >= 1e-4)) return 'strong';
  if ((kp !== null && kp >= 5) || (flux !== null && flux >= 1e-5)) return 'minor';
  return 'nominal';
}

function parseAlertSeverity(message: string, noticeCode: AlertNoticeCode): SeverityLevel {
  const upper = message.toUpperCase();
  if (
    upper.includes('G4') ||
    upper.includes('G5') ||
    upper.includes('R4') ||
    upper.includes('R5') ||
    upper.includes('EXTREME') ||
    noticeCode === 'K07W' ||
    noticeCode === 'K07A'
  ) {
    return upper.includes('G4') || upper.includes('G5') || upper.includes('R4') || upper.includes('R5')
      ? 'extreme'
      : 'strong';
  }
  if (
    upper.includes('G3') ||
    upper.includes('R3') ||
    upper.includes('S3') ||
    noticeCode === 'K06W' ||
    noticeCode === 'K06A' ||
    noticeCode === 'WATA_G3'
  ) {
    return 'strong';
  }
  if (
    noticeCode === 'K04W' ||
    noticeCode === 'K04A' ||
    noticeCode === 'K05W' ||
    noticeCode === 'K05A' ||
    noticeCode === 'EF3A' ||
    noticeCode === 'WATA_G1' ||
    noticeCode === 'WATA_G2' ||
    upper.includes('WARNING') ||
    upper.includes('WATCH') ||
    upper.includes('ALERT') ||
    upper.includes('G1') ||
    upper.includes('G2')
  ) {
    return 'minor';
  }
  return 'nominal';
}

function summarizeNoaaAlert(rawMessage: string): { title: string; summary: string } {
  const lines = rawMessage
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const titleLine =
    lines.find((l) => /^(CONTINUED\s+ALERT|ALERT|WARNING|WATCH|SUMMARY):/i.test(l)) ??
    lines.find((l) => l.length > 8 && !l.startsWith('Space Weather Message Code')) ??
    'NOAA Space Weather Advisory';
  const summaryLines = lines
    .filter(
      (l) =>
        !l.startsWith('Space Weather Message Code') &&
        !l.startsWith('Serial Number') &&
        !l.startsWith('Issue Time') &&
        l !== titleLine
    )
    .slice(0, 3);
  return {
    title: titleLine.slice(0, 120),
    summary: summaryLines.join(' ').slice(0, 320) || titleLine,
  };
}

interface ParsedAlertMeta {
  category: AlertCategory;
  noticeCode: AlertNoticeCode;
  validFromIso?: string;
  validToIso?: string;
  beginTimeIso?: string;
  kpThreshold?: number;
  gScaleTarget?: string;
  electronPeakPfu?: number;
  isContinuing: boolean;
  isActiveWindow: boolean;
}

function parseNoaaAlertStructure(rawMessage: string, productId: string, nowMs: number): ParsedAlertMeta {
  const cleaned = rawMessage.replace(/\r/g, '');
  const codeMatch = cleaned.match(/Space Weather Message Code:\s*([A-Z0-9]+)/i);
  const msgCode = (codeMatch?.[1] ?? productId).toUpperCase();

  const validFromMatch = cleaned.match(/Valid From:\s*([^\n]+)/i);
  const validToMatch = cleaned.match(/Valid To:\s*([^\n]+)/i);
  const beginMatch = cleaned.match(/Begin Time:\s*([^\n]+)/i);
  const peakFluxMatch = cleaned.match(/Yesterday Maximum 2MeV Flux:\s*([\d,]+)\s*pfu/i);

  const validFromDate = validFromMatch ? parseNoaaTimestampUtc(validFromMatch[1]) : null;
  const validToDate = validToMatch ? parseNoaaTimestampUtc(validToMatch[1]) : null;
  const beginDate = beginMatch ? parseNoaaTimestampUtc(beginMatch[1]) : null;

  const isContinuing = /CONTINUED\s+ALERT/i.test(cleaned);

  let category: AlertCategory = 'alert';
  if (/^WATCH:|WATA/i.test(cleaned) || msgCode.startsWith('WATA')) {
    category = 'watch';
  } else if (/^WARNING:|WAR[KP]/i.test(cleaned) || msgCode.startsWith('WAR')) {
    category = 'warning';
  } else if (/^SUMMARY:|SUM/i.test(cleaned) || msgCode.startsWith('SUM')) {
    category = 'summary';
  }

  let noticeCode: AlertNoticeCode = 'OTHER';
  let kpThreshold: number | undefined;
  let gScaleTarget: string | undefined;

  if (msgCode.startsWith('WARK04') || productId === 'K04W') {
    noticeCode = 'K04W';
    kpThreshold = 4;
  } else if (msgCode.startsWith('WARK05') || productId === 'K05W') {
    noticeCode = 'K05W';
    kpThreshold = 5;
    gScaleTarget = 'G1';
  } else if (msgCode.startsWith('WARK06') || productId === 'K06W') {
    noticeCode = 'K06W';
    kpThreshold = 6;
    gScaleTarget = 'G2';
  } else if (/^WARK0[789]/.test(msgCode) || /^K0[789]W$/.test(productId)) {
    noticeCode = 'K07W';
    kpThreshold = Number(msgCode.slice(-1)) || 7;
    gScaleTarget = kpThreshold >= 9 ? 'G5' : kpThreshold >= 8 ? 'G4' : 'G3';
  } else if (msgCode.startsWith('ALTK04') || productId === 'K04A') {
    noticeCode = 'K04A';
    kpThreshold = 4;
  } else if (msgCode.startsWith('ALTK05') || productId === 'K05A') {
    noticeCode = 'K05A';
    kpThreshold = 5;
    gScaleTarget = 'G1';
  } else if (msgCode.startsWith('ALTK06') || productId === 'K06A') {
    noticeCode = 'K06A';
    kpThreshold = 6;
    gScaleTarget = 'G2';
  } else if (/^ALTK0[789]/.test(msgCode) || /^K0[789]A$/.test(productId)) {
    noticeCode = 'K07A';
    kpThreshold = Number(msgCode.slice(-1)) || 7;
    gScaleTarget = kpThreshold >= 9 ? 'G5' : kpThreshold >= 8 ? 'G4' : 'G3';
  } else if (msgCode.startsWith('ALTEF3') || productId === 'EF3A') {
    noticeCode = 'EF3A';
  } else if (msgCode.startsWith('WATA') || /Geomagnetic Storm Category G(\d)/i.test(cleaned)) {
    const gMatch = cleaned.match(/Category\s+(G[1-5])/i) ?? cleaned.match(/\b(G[1-5])\s*\(/i);
    gScaleTarget = gMatch?.[1]?.toUpperCase() ?? 'G1';
    noticeCode = gScaleTarget === 'G3' || gScaleTarget === 'G4' || gScaleTarget === 'G5'
      ? 'WATA_G3'
      : gScaleTarget === 'G2'
        ? 'WATA_G2'
        : 'WATA_G1';
  } else if (msgCode.startsWith('WARP')) {
    noticeCode = 'PROTON_WARN';
  } else if (msgCode.startsWith('ALTP')) {
    noticeCode = 'PROTON_ALERT';
  } else if (msgCode.startsWith('SUM')) {
    noticeCode = 'FLARE_SUM';
  }

  const electronPeakPfu = peakFluxMatch
    ? Number(peakFluxMatch[1].replace(/,/g, ''))
    : undefined;

  const isActiveWindow = validToDate ? validToDate.getTime() > nowMs : false;

  return {
    category,
    noticeCode,
    validFromIso: validFromDate?.toISOString(),
    validToIso: validToDate?.toISOString(),
    beginTimeIso: beginDate?.toISOString(),
    kpThreshold,
    gScaleTarget,
    electronPeakPfu: Number.isFinite(electronPeakPfu) ? electronPeakPfu : undefined,
    isContinuing,
    isActiveWindow,
  };
}

export function generateScenarioState(
  level: SeverityLevel,
  source: SolarWeatherState['source'] = 'simulated'
): SolarWeatherState {
  const presets: Record<
    SeverityLevel,
    { flux: number; kp: number; wind: number; density: number; drift: number; lock: number }
  > = {
    nominal: { flux: 1.4e-6, kp: 2.1, wind: 382, density: 4.2, drift: 1.4, lock: 98 },
    minor: { flux: 1.8e-5, kp: 5.0, wind: 518, density: 11.6, drift: 4.8, lock: 88 },
    strong: { flux: 6.4e-5, kp: 7.0, wind: 695, density: 22.4, drift: 12.5, lock: 68 },
    extreme: { flux: 3.2e-4, kp: 8.6, wind: 1140, density: 48.0, drift: 29.0, lock: 36 },
  };

  const p = presets[level];
  const { flareClass, radioScale } = classifyFlare(p.flux);
  const { severity, geoScale } = classifyGeomagnetic(p.kp);

  const now = Date.now();
  const history: SolarDataPoint[] = Array.from({ length: 18 }, (_, i) => {
    const t = new Date(now - (17 - i) * 20 * 60 * 1000);
    const wave = Math.sin(i * 0.55) * 0.18 + (i / 17) * 0.35;
    const factor = level === 'nominal' ? 0.85 + wave * 0.3 : 0.45 + wave;
    return {
      timestamp: formatClock24(t),
      flux: +(p.flux * Math.max(0.18, factor)).toExponential(2),
      kp: +Math.min(9, Math.max(0.5, p.kp * (0.55 + (i / 17) * 0.45) + Math.cos(i) * 0.25)).toFixed(1),
    };
  });

  const nowDate = new Date();
  return {
    source,
    severity,
    flareClass,
    xrayFlux: p.flux,
    kpIndex: p.kp,
    solarWindSpeed: p.wind,
    protonDensity: p.density,
    radioBlackoutScale: radioScale,
    geomagneticScale: geoScale,
    radiationScale: level === 'extreme' ? 'S3' : level === 'strong' ? 'S1' : 'S0',
    navigationRiskLevel: severity,
    sampleGpsDriftMeters: source === 'simulated' ? p.drift : undefined,
    sampleGpsLockPercent: source === 'simulated' ? p.lock : undefined,
    alerts: [],
    officialSourceUrl: NOAA_HOME_URL,
    lastUpdated: formatClock24(nowDate, true),
    fetchedAtIso: nowDate.toISOString(),
    feedDiscrepancyKind: 'none',
    activeWarningKp: null,
    history,
  };
}

export function loadCachedSolarState(): SolarWeatherState | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SolarWeatherState;
    return {
      ...parsed,
      source: 'offline-cache',
      sampleGpsDriftMeters: undefined,
      sampleGpsLockPercent: undefined,
    };
  } catch {
    return null;
  }
}

export type SolarFetchErrorKind = 'none' | 'offline' | 'unreachable';

export interface SolarFetchResult {
  state: SolarWeatherState | null;
  ok: boolean;
  errorKind: SolarFetchErrorKind;
  partial?: boolean;
}

interface NoaaScaleEntry {
  DateStamp?: string;
  TimeStamp?: string;
  R?: { Scale?: string | null; Text?: string | null; MinorProb?: string | null; MajorProb?: string | null };
  S?: { Scale?: string | null; Text?: string | null; Prob?: string | null };
  G?: { Scale?: string | null; Text?: string | null };
}

interface KpRecord {
  time_tag?: string;
  kp_index?: number | string;
  estimated_kp?: number | string;
  Kp?: number | string;
  kp?: number | string;
}

interface XrayRecord {
  time_tag?: string;
  flux?: number;
  energy?: string;
}

interface PlasmaObjectRecord {
  time_tag?: string;
  TimeStamp?: string;
  active?: boolean;
  proton_speed?: number | string | null;
  WindSpeed?: number | string | null;
  proton_density?: number | string | null;
}

interface SolarProxyPayload {
  source: string;
  fetchedAt: string;
  officialSourceUrl?: string;
  partial?: boolean;
  observationTimes?: {
    kpObservedAtIso?: string | null;
    xrayObservedAtIso?: string | null;
    windObservedAtIso?: string | null;
    scalesUpdatedAtIso?: string | null;
  };
  kpJson: KpRecord[];
  xrayJson: XrayRecord[];
  plasmaJson: Array<PlasmaObjectRecord | Array<string | number | null>>;
  alertsJson: Array<{ product_id?: string; issue_datetime?: string; message?: string }>;
  scalesJson: Record<string, NoaaScaleEntry> | null;
}

function extractKpValue(record: KpRecord | undefined | null): number | null {
  if (!record) return null;
  const raw = record.estimated_kp ?? record.kp_index ?? record.Kp ?? record.kp;
  if (raw === null || raw === undefined || raw === '') return null;
  const num = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(num) ? Math.min(9, Math.max(0, +num.toFixed(1))) : null;
}

function getTimeMs(tag: string | undefined): number {
  const dt = parseNoaaTimestampUtc(tag);
  return dt ? dt.getTime() : 0;
}

function pickLatestValidRecord<T extends { time_tag?: string }>(
  items: T[],
  isValid: (item: T) => boolean
): T | undefined {
  let best: T | undefined;
  let bestMs = -1;
  for (const item of items) {
    if (!isValid(item)) continue;
    const ms = getTimeMs(item.time_tag);
    if (best === undefined || ms >= bestMs) {
      best = item;
      bestMs = ms;
    }
  }
  return best;
}

function findNearestKpValue(kpList: KpRecord[], targetMs: number, fallbackKp: number): number {
  if (kpList.length === 0 || targetMs <= 0) return fallbackKp;
  let bestVal = fallbackKp;
  let bestDiff = Number.POSITIVE_INFINITY;
  for (const item of kpList) {
    const val = extractKpValue(item);
    if (val === null) continue;
    const ms = getTimeMs(item.time_tag);
    if (ms <= 0) continue;
    const diff = Math.abs(ms - targetMs);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestVal = val;
    }
  }
  return bestVal;
}

async function requestSolarProxyOnce(timeoutMs = 25000): Promise<{
  payload: SolarProxyPayload;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch('/api/solar/live', {
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const payload = (await res.json()) as SolarProxyPayload;
    return { payload };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchLiveSolarWeather(
  offlineMode: boolean,
  options?: { forceNetworkAttempt?: boolean }
): Promise<SolarFetchResult> {
  const browserOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  if ((offlineMode && !options?.forceNetworkAttempt) || (browserOffline && !options?.forceNetworkAttempt)) {
    const cached = loadCachedSolarState();
    return {
      state: cached,
      ok: false,
      errorKind: 'offline',
    };
  }

  let payload: SolarProxyPayload | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const timeoutMs = attempt === 0 ? 25000 : 28000;
      const res = await requestSolarProxyOnce(timeoutMs);
      payload = res.payload;
      break;
    } catch {
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 700));
      }
    }
  }

  if (!payload || payload.source !== 'live-noaa') {
    const cached = loadCachedSolarState();
    const stillOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    return {
      state: cached,
      ok: false,
      errorKind: stillOffline ? 'offline' : 'unreachable',
    };
  }

  const kpJson = Array.isArray(payload.kpJson)
    ? [...payload.kpJson].sort((a, b) => getTimeMs(a.time_tag) - getTimeMs(b.time_tag))
    : [];
  const xrayJson = Array.isArray(payload.xrayJson)
    ? [...payload.xrayJson].sort((a, b) => getTimeMs(a.time_tag) - getTimeMs(b.time_tag))
    : [];

  const validXray = xrayJson.filter(
    (d) => typeof d.flux === 'number' && Number.isFinite(d.flux) && d.flux > 0
  );
  const longWaveXray = validXray.filter((d) => !d.energy || d.energy.includes('0.1-0.8'));
  const xraySeries = longWaveXray.length > 0 ? longWaveXray : validXray;

  const latestXray = pickLatestValidRecord(
    xraySeries,
    (d) => typeof d.flux === 'number' && Number.isFinite(d.flux) && d.flux > 0
  );
  const latestKp = pickLatestValidRecord(kpJson, (d) => extractKpValue(d) !== null);

  const kpObservedAtIso =
    parseNoaaTimestampUtc(latestKp?.time_tag)?.toISOString() ??
    parseNoaaTimestampUtc(payload.observationTimes?.kpObservedAtIso)?.toISOString();
  const xrayObservedAtIso =
    parseNoaaTimestampUtc(latestXray?.time_tag)?.toISOString() ??
    parseNoaaTimestampUtc(payload.observationTimes?.xrayObservedAtIso)?.toISOString();

  const flux =
    typeof latestXray?.flux === 'number' && Number.isFinite(latestXray.flux)
      ? Math.max(1e-9, latestXray.flux)
      : null;
  const kp = extractKpValue(latestKp);

  let realWindSpeed: number | null = null;
  let realProtonDensity: number | null = null;
  let windObservedAtIso: string | undefined;
  let bestWindMs = -1;

  const plasmaRows = Array.isArray(payload.plasmaJson) ? payload.plasmaJson : [];
  for (const row of plasmaRows) {
    if (Array.isArray(row)) {
      if (row[0] === 'time_tag') continue;
      const speedVal = Number(row[2]);
      const densityVal = Number(row[1]);
      const rowMs = typeof row[0] === 'string' ? getTimeMs(row[0]) : 0;
      if (Number.isFinite(speedVal) && speedVal > 0 && rowMs >= bestWindMs) {
        bestWindMs = rowMs;
        realWindSpeed = Math.round(speedVal);
        realProtonDensity =
          Number.isFinite(densityVal) && densityVal > 0 ? +densityVal.toFixed(1) : realProtonDensity;
        if (typeof row[0] === 'string') {
          windObservedAtIso = parseNoaaTimestampUtc(row[0])?.toISOString();
        }
      }
    } else if (row && typeof row === 'object') {
      const speedVal = Number(row.proton_speed ?? row.WindSpeed);
      const densityVal = Number(row.proton_density);
      const tag = row.time_tag ?? row.TimeStamp;
      const rowMs = typeof tag === 'string' ? getTimeMs(tag) : 0;
      const hasValidSpeed = Number.isFinite(speedVal) && speedVal > 0;
      if (row.active !== false && hasValidSpeed && rowMs >= bestWindMs) {
        bestWindMs = rowMs;
        realWindSpeed = Math.round(speedVal);
        realProtonDensity =
          Number.isFinite(densityVal) && densityVal > 0 ? +densityVal.toFixed(1) : null;
        if (typeof tag === 'string') {
          windObservedAtIso = parseNoaaTimestampUtc(tag)?.toISOString();
        }
      }
    }
  }

  // Fallback pass over plasmaRows if all available entries had active === false
  if (realWindSpeed === null) {
    for (const row of plasmaRows) {
      if (!row || typeof row !== 'object' || Array.isArray(row)) continue;
      const speedVal = Number(row.proton_speed ?? row.WindSpeed);
      const densityVal = Number(row.proton_density);
      const tag = row.time_tag ?? row.TimeStamp;
      const rowMs = typeof tag === 'string' ? getTimeMs(tag) : 0;
      if (Number.isFinite(speedVal) && speedVal > 0 && rowMs >= bestWindMs) {
        bestWindMs = rowMs;
        realWindSpeed = Math.round(speedVal);
        realProtonDensity =
          Number.isFinite(densityVal) && densityVal > 0 ? +densityVal.toFixed(1) : null;
        if (typeof tag === 'string') {
          windObservedAtIso = parseNoaaTimestampUtc(tag)?.toISOString();
        }
      }
    }
  }

  if (!windObservedAtIso) {
    windObservedAtIso = parseNoaaTimestampUtc(payload.observationTimes?.windObservedAtIso)?.toISOString();
  }

  const currentScale = payload.scalesJson?.['0'];
  const hasAnyTelemetry =
    kp !== null || flux !== null || realWindSpeed !== null || Boolean(currentScale?.DateStamp);

  if (!hasAnyTelemetry) {
    const cached = loadCachedSolarState();
    return {
      state: cached,
      ok: false,
      errorKind: 'unreachable',
    };
  }

  const { flareClass, radioScale: computedRadio } = classifyFlare(flux);
  const { severity: kpSeverity, geoScale: computedGeo } = classifyGeomagnetic(kp);

  const radioScale = currentScale?.R?.Scale ? `R${currentScale.R.Scale}` : computedRadio;
  const geoScale = currentScale?.G?.Scale ? `G${currentScale.G.Scale}` : computedGeo;
  const radiationScale = currentScale?.S?.Scale ? `S${currentScale.S.Scale}` : 'S0';

  const scalesUpdatedAtIso =
    (currentScale?.DateStamp && currentScale?.TimeStamp
      ? parseNoaaTimestampUtc(`${currentScale.DateStamp}T${currentScale.TimeStamp}`)?.toISOString()
      : undefined) ?? parseNoaaTimestampUtc(payload.observationTimes?.scalesUpdatedAtIso)?.toISOString();

  const forecastDays: SolarForecastDay[] = ([1, 2, 3] as const)
    .map((offset): SolarForecastDay | null => {
      const entry = payload.scalesJson?.[String(offset)];
      if (!entry?.DateStamp) return null;
      const gNum = Number(entry.G?.Scale ?? '0');
      const rMinor = entry.R?.MinorProb !== null && entry.R?.MinorProb !== undefined ? Number(entry.R.MinorProb) : null;
      const rMajor = entry.R?.MajorProb !== null && entry.R?.MajorProb !== undefined ? Number(entry.R.MajorProb) : null;
      const sProb = entry.S?.Prob !== null && entry.S?.Prob !== undefined ? Number(entry.S.Prob) : null;
      const dateIso =
        parseNoaaTimestampUtc(`${entry.DateStamp}T${entry.TimeStamp || '00:00:00'}`)?.toISOString() ??
        `${entry.DateStamp}T00:00:00Z`;
      return {
        dayOffset: offset,
        dateIso,
        gScale: Number.isFinite(gNum) ? `G${gNum}` : 'G0',
        gLevelNum: Number.isFinite(gNum) ? gNum : 0,
        rMinorProb: rMinor !== null && Number.isFinite(rMinor) ? rMinor : null,
        rMajorProb: rMajor !== null && Number.isFinite(rMajor) ? rMajor : null,
        sProb: sProb !== null && Number.isFinite(sProb) ? sProb : null,
      };
    })
    .filter((d): d is SolarForecastDay => d !== null);

  const yesterdayEntry = payload.scalesJson?.['-1'];
  const yesterdayPeak =
    yesterdayEntry?.DateStamp
      ? {
          dateIso:
            parseNoaaTimestampUtc(`${yesterdayEntry.DateStamp}T00:00:00`)?.toISOString() ??
            `${yesterdayEntry.DateStamp}T00:00:00Z`,
          rScale: `R${yesterdayEntry.R?.Scale ?? '0'}`,
          sScale: `S${yesterdayEntry.S?.Scale ?? '0'}`,
          gScale: `G${yesterdayEntry.G?.Scale ?? '0'}`,
        }
      : undefined;

  const nowMs = Date.now();
  const alerts: SpaceAlertItem[] = (payload.alertsJson ?? [])
    .filter((a) => typeof a.message === 'string' && a.message.trim().length > 0)
    .slice(0, 5)
    .map((a, idx) => {
      const msg = a.message ?? '';
      const productId = a.product_id ?? 'NOAA';
      const meta = parseNoaaAlertStructure(msg, productId, nowMs);
      const { title, summary } = summarizeNoaaAlert(msg);
      const issuedIso =
        parseNoaaTimestampUtc(a.issue_datetime)?.toISOString() ?? payload.fetchedAt;
      return {
        id: `${productId}-${idx}`,
        productId,
        issuedAt: issuedIso,
        title,
        summary,
        severity: parseAlertSeverity(msg, meta.noticeCode),
        sourceUrl: NOAA_ALERTS_URL,
        category: meta.category,
        noticeCode: meta.noticeCode,
        validFromIso: meta.validFromIso,
        validToIso: meta.validToIso,
        beginTimeIso: meta.beginTimeIso,
        kpThreshold: meta.kpThreshold,
        gScaleTarget: meta.gScaleTarget,
        electronPeakPfu: meta.electronPeakPfu,
        isContinuing: meta.isContinuing,
        isActiveWindow: meta.isActiveWindow,
      };
    });

  // Check highest active warning Kp threshold (e.g., WARK04 valid until 1500 UTC expecting Kp 4)
  const activeWarningKpValues = alerts
    .filter((a) => a.category === 'warning' && a.isActiveWindow && typeof a.kpThreshold === 'number')
    .map((a) => a.kpThreshold as number);
  const activeWarningKp =
    activeWarningKpValues.length > 0 ? Math.max(...activeWarningKpValues) : null;

  let feedDiscrepancyKind: FeedDiscrepancyKind = 'none';
  if (kp !== null && activeWarningKp !== null && activeWarningKp >= 4 && kp < activeWarningKp - 0.5) {
    feedDiscrepancyKind = 'warning-higher-than-live';
  } else if (kp !== null && kp < 5 && (forecastDays[0]?.gLevelNum ?? 0) >= 1) {
    feedDiscrepancyKind = 'forecast-higher-than-live';
  } else if (payload.partial) {
    feedDiscrepancyKind = 'partial-feed';
  }

  const history: SolarDataPoint[] = [];
  if (xraySeries.length > 0) {
    const sampleStep = Math.max(1, Math.floor(xraySeries.length / 18));
    for (let i = 0; i < xraySeries.length && history.length < 18; i += sampleStep) {
      const point = xraySeries[i];
      const dt = parseNoaaTimestampUtc(point.time_tag);
      const pointMs = dt ? dt.getTime() : 0;
      const pointFlux = typeof point.flux === 'number' && Number.isFinite(point.flux) ? point.flux : 1e-8;
      history.push({
        timestamp: !dt ? localizeDigits(i, 'en') : formatClock24(dt),
        flux: Math.max(1e-8, pointFlux),
        kp: findNearestKpValue(kpJson, pointMs, kp ?? 0),
      });
    }
  } else if (kpJson.length > 0) {
    const kpStep = Math.max(1, Math.floor(kpJson.length / 18));
    for (let i = 0; i < kpJson.length && history.length < 18; i += kpStep) {
      const point = kpJson[i];
      const dt = parseNoaaTimestampUtc(point.time_tag);
      history.push({
        timestamp: !dt ? localizeDigits(i, 'en') : formatClock24(dt),
        flux: 0,
        kp: extractKpValue(point) ?? 0,
      });
    }
  }

  const navigationRiskLevel = classifyNavigationRisk(kp, flux);
  const overallSeverity: SeverityLevel =
    navigationRiskLevel === 'extreme' || kpSeverity === 'extreme'
      ? 'extreme'
      : navigationRiskLevel === 'strong' || kpSeverity === 'strong'
        ? 'strong'
        : navigationRiskLevel === 'minor' || kpSeverity === 'minor'
          ? 'minor'
          : 'nominal';

  const fetchedDate = parseNoaaTimestampUtc(payload.fetchedAt) ?? new Date();
  const liveState: SolarWeatherState = {
    source: 'live-noaa',
    severity: overallSeverity,
    flareClass,
    xrayFlux: flux,
    kpIndex: kp,
    solarWindSpeed: realWindSpeed,
    protonDensity: realProtonDensity,
    radioBlackoutScale: radioScale,
    geomagneticScale: geoScale,
    radiationScale,
    navigationRiskLevel,
    alerts,
    officialSourceUrl: payload.officialSourceUrl || NOAA_HOME_URL,
    lastUpdated: formatClock24(fetchedDate, true),
    fetchedAtIso: fetchedDate.toISOString(),
    kpObservedAtIso,
    xrayObservedAtIso,
    windObservedAtIso,
    scalesUpdatedAtIso,
    forecastDays,
    yesterdayPeak,
    feedDiscrepancyKind,
    activeWarningKp,
    history,
  };

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(liveState));
  } catch {
    // Ignore storage quota issues
  }

  return {
    state: liveState,
    ok: true,
    errorKind: 'none',
    partial: payload.partial,
  };
}

