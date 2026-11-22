export type LanguageCode = 'en' | 'ur' | 'hi' | 'te' | 'kn';

export type SeverityLevel = 'nominal' | 'minor' | 'strong' | 'extreme';

export type PageRoute = 'welcome' | 'easy' | 'home' | 'weather' | 'helper' | 'alerts' | 'settings';

export type EasyMenuSection = 'today' | 'sun' | 'earth' | 'warnings' | 'all-voice' | 'ai';

export type SpaceWeatherTopic = 'flares' | 'storms' | 'kp' | 'wind' | 'gps';

export type AiProviderKind =
  | 'firebase-ai-on-device'
  | 'firebase-ai-cloud'
  | 'server-gemini'
  | 'on-device-browser'
  | 'offline-local-guide'
  | 'offline-unavailable';

export type LocalModelSupport = 'available' | 'downloadable' | 'unsupported';

export interface SolarDataPoint {
  timestamp: string;
  flux: number; // W/m^2
  kp: number; // 0 - 9
}

export type AlertCategory = 'warning' | 'watch' | 'alert' | 'summary';

export type AlertNoticeCode =
  | 'K04W'
  | 'K05W'
  | 'K06W'
  | 'K07W'
  | 'K04A'
  | 'K05A'
  | 'K06A'
  | 'K07A'
  | 'EF3A'
  | 'WATA_G1'
  | 'WATA_G2'
  | 'WATA_G3'
  | 'PROTON_WARN'
  | 'PROTON_ALERT'
  | 'FLARE_SUM'
  | 'OTHER';

export interface SpaceAlertItem {
  id: string;
  productId: string;
  issuedAt: string;
  title: string;
  summary: string;
  severity: SeverityLevel;
  sourceUrl: string;
  category?: AlertCategory;
  noticeCode?: AlertNoticeCode;
  validFromIso?: string;
  validToIso?: string;
  beginTimeIso?: string;
  kpThreshold?: number;
  gScaleTarget?: string;
  electronPeakPfu?: number;
  isContinuing?: boolean;
  isActiveWindow?: boolean;
}

export interface SolarForecastDay {
  dayOffset: 1 | 2 | 3;
  dateIso: string;
  gScale: string;
  gLevelNum: number;
  rMinorProb: number | null;
  rMajorProb: number | null;
  sProb: number | null;
}

export type FeedDiscrepancyKind =
  | 'none'
  | 'warning-higher-than-live'
  | 'forecast-higher-than-live'
  | 'partial-feed';

export interface SolarWeatherState {
  source: 'live-noaa' | 'offline-cache' | 'simulated';
  severity: SeverityLevel;
  flareClass: string | null;
  xrayFlux: number | null; // W/m^2
  kpIndex: number | null; // 0 - 9
  solarWindSpeed: number | null; // km/s (only real NOAA RTSW/DSCOVR measurement)
  protonDensity: number | null; // p/cm^3 (only real NOAA RTSW/DSCOVR measurement)
  radioBlackoutScale: string; // R0 - R5
  geomagneticScale: string; // G0 - G5
  radiationScale: string; // S0 - S5
  navigationRiskLevel: SeverityLevel;
  sampleGpsDriftMeters?: number; // ONLY populated in simulated test samples
  sampleGpsLockPercent?: number; // ONLY populated in simulated test samples
  alerts: SpaceAlertItem[];
  officialSourceUrl: string;
  lastUpdated: string;
  fetchedAtIso: string;
  kpObservedAtIso?: string;
  xrayObservedAtIso?: string;
  windObservedAtIso?: string;
  scalesUpdatedAtIso?: string;
  forecastDays?: SolarForecastDay[];
  yesterdayPeak?: {
    dateIso: string;
    rScale: string;
    sScale: string;
    gScale: string;
  };
  feedDiscrepancyKind?: FeedDiscrepancyKind;
  activeWarningKp?: number | null;
  history: SolarDataPoint[];
}

export interface FavoriteSpaceItem {
  id: string;
  kind: 'telemetry' | 'alert';
  title: string;
  summary: string;
  source: SolarWeatherState['source'];
  sourceUrl: string;
  flareClass?: string;
  kpIndex?: number;
  recordedAtLabel: string;
  createdAtIso: string;
}

export interface HelperMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  provider?: AiProviderKind;
  timestamp: string;
  createdAtIso: string;
  canRetry?: boolean;
  retryQuestion?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  language: LanguageCode;
  createdAtIso: string;
  updatedAtIso: string;
  lastMessageAtIso: string;
  lastMessagePreview: string;
  messageCount: number;
  messages: HelperMessage[];
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}
