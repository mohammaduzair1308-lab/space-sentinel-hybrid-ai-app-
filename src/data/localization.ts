import {
  AiProviderKind,
  AlertCategory,
  EasyMenuSection,
  FeedDiscrepancyKind,
  LanguageCode,
  LocalModelSupport,
  SeverityLevel,
  SolarWeatherState,
  SpaceAlertItem,
  SpaceWeatherTopic,
} from '../types/sentinel';
import { formatAgeForLanguage, localizeDigits } from '../utils/dateTime';

export interface LanguageMeta {
  code: LanguageCode;
  nativeName: string;
  speechLang: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGE_LIST: LanguageMeta[] = [
  { code: 'ur', nativeName: 'اردو', speechLang: 'ur-PK', dir: 'rtl' },
  { code: 'en', nativeName: 'English', speechLang: 'en-US', dir: 'ltr' },
  { code: 'hi', nativeName: 'हिन्दी', speechLang: 'hi-IN', dir: 'ltr' },
  { code: 'te', nativeName: 'తెలుగు', speechLang: 'te-IN', dir: 'ltr' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', speechLang: 'kn-IN', dir: 'ltr' },
];

export function formatDigits(value: number | string, lang: LanguageCode): string {
  return localizeDigits(value, lang);
}

export function buildConversationTitle(question: string, fallback: string): string {
  const cleaned = question.replace(/\s+/g, ' ').trim();
  if (!cleaned) return fallback;
  const words = cleaned.split(' ').slice(0, 6).join(' ');
  return words.length > 44 ? `${words.slice(0, 42)}…` : words;
}

export interface TopicDetailContent {
  title: string;
  summary: string;
  scientificExplain: string;
  impactExplain: string;
}

export interface LocalizationBundle {
  brandName: string;
  brandSubtitle: string;
  welcomeIntroBtn: string;

  // Welcome Page
  welcomeTagline: string;
  welcomeWhatTitle: string;
  welcomeWhatDesc: string;
  welcomeWhyTitle: string;
  welcomeWhyDesc: string;
  enterCenterBtn: string;
  enterCenterHint: string;
  listenIntroBtn: string;
  stopVoiceBtn: string;
  voiceLoadingBtn: string;
  introSpeech: string;
  voiceUnavailableNotice: string;
  voiceOfflineUnavailableNotice: string;
  voiceAvailableBadge: string;
  voiceOnlineAvailableBadge: string;

  // Navigation (5 Clear Pages)
  navHome: string;
  navWeather: string;
  navHelper: string;
  navAlerts: string;
  navSettings: string;

  // Header & Common Controls
  headerLanguageLabel: string;
  headerThemeLight: string;
  headerThemeDark: string;
  headerVoiceOn: string;
  headerVoiceMuted: string;
  refreshBtn: string;
  refreshBtnHint: string;
  refreshingBtn: string;
  retryBtn: string;
  dismissBtn: string;
  offlineBanner: string;
  connectionRestoredBanner: string;
  fetchErrorNotice: string;
  noaaCacheBanner: string;
  noaaNoCacheBanner: string;
  cachedDataTimePrefix: string;
  notAvailableShort: string;
  expandDetailsBtn: string;
  hideDetailsBtn: string;
  officialSourceLinkLabel: string;
  returnLiveBtn: string;

  // Main Dashboard (Home) Hierarchical Content
  dashPageTitle: string;
  dashStatusHeading: string;
  dashRiskHeading: string;
  dashRiskTrustworthyHint: string;
  dashRiskUnavailableText: string;
  dashAskAiBtn: string;
  dashAskAiHint: string;
  dashViewAlertsBtn: string;
  dashOpenWeatherBtn: string;
  dashSolarActivityTitle: string;
  dashSolarActivityBrief: string;
  dashSolarActivityDetail: string;
  dashKpTitle: string;
  dashKpBrief: string;
  dashKpDetail: string;
  dashWindTitle: string;
  dashWindBrief: string;
  dashWindDetail: string;
  dashDensityLabel: string;
  dashGpsTitle: string;
  dashGpsBrief: string;
  dashGpsDetail: string;
  dashChartHeading: string;
  dashChartSub: string;
  dashProvenanceHeading: string;

  // Telemetry Units & Labels
  summarySunTitle: string;
  summaryStormTitle: string;
  summaryGpsTitle: string;
  solarWindTitle: string;
  summaryUpdatedTitle: string;
  summarySourceTitle: string;
  gpsMeasuredNote: string;
  sampleGpsNote: (drift: string, lock: string) => string;
  sourceStatus: Record<SolarWeatherState['source'], string>;
  severityLabels: Record<SeverityLevel, string>;
  severityDescriptions: Record<SeverityLevel, string>;
  unitMeters: string;
  unitKmSec: string;
  unitProtonDensity: string;
  unitPercent: string;

  // Dedicated Space Weather Deep-Dive Page
  weatherPageTitle: string;
  weatherPageSubtitle: string;
  weatherTopicSelectorLabel: string;
  weatherTopics: Record<SpaceWeatherTopic, TopicDetailContent>;
  weatherVisualSectionTitle: string;
  trendChartTitle: string;
  trendChartExplain: string;
  orbitTitle: string;
  orbitExplain: string;
  saveSnapshotBtn: string;
  saveSnapshotHint: string;
  exportHtmlBtn: string;
  exportHtmlHint: string;
  savedSnapshotsTitle: string;
  noSnapshotsText: string;
  weatherSourcesHeading: string;

  // Dedicated Alerts Page
  alertsPageTitle: string;
  alertsPageSubtitle: string;
  alertsCurrentConditionTitle: string;
  alertsVoiceCardTitle: string;
  alertsVoiceCardDesc: string;
  card3Action: string;
  card3Stop: string;
  alertsOfficialFeedTitle: string;
  alertsRecentLabel: string;
  alertsEmptyText: string;
  alertsIssuedLabel: string;
  alertsGpsImpactTitle: string;
  alertsGpsImpactDesc: string;
  alertsSavedSectionTitle: string;
  saveFavoriteBtn: string;
  savedFavoriteBadge: string;
  favoritesEmptyText: string;
  removeFavoriteBtn: string;
  alertsTrainingTitle: string;
  alertsTrainingDesc: string;
  alertsTrainingShowBtn: string;
  alertsTrainingHideBtn: string;
  testSampleWarning: string;
  scenarioLabels: Record<SeverityLevel, string>;
  emergencySpeech: Record<SeverityLevel, (sourceDesc: string) => string>;

  // Dedicated AI Assistant Page
  helperTitle: string;
  helperSubtitle: string;
  helperGreeting: string;
  helperPlaceholder: string;
  helperSendBtn: string;
  helperRecordStart: string;
  helperRecordStop: string;
  helperNewChatBtn: string;
  chatListBtn: string;
  chatCloseListBtn: string;
  chatSearchPlaceholder: string;
  chatNoMatches: string;
  chatEmptyList: string;
  chatModeNewBadge: string;
  chatModeSavedBadge: string;
  chatUntitledFallback: string;
  chatRenameBtn: string;
  chatSaveRenameBtn: string;
  chatCancelBtn: string;
  chatDeleteBtn: string;
  chatOriginalLangNote: string;
  chatCreatedLabel: string;
  chatLastMsgLabel: string;
  helperListenReply: string;
  helperReplayReply: string;
  helperStopReplyVoice: string;
  helperThinking: string;
  helperVoiceUnsupported: string;
  offlineAiUnavailableMsg: (solar: SolarWeatherState | null) => string;
  offlineGuideActiveNote: string;
  offlineNanoAndGuideNote: string;
  askAiNanoPromptNote: string;
  networkAiUnavailableMsg: string;
  timeoutAiUnavailableMsg: string;
  rateLimitAiUnavailableMsg: string;
  providerLabels: Record<AiProviderKind, string>;
  starterQuestions: string[];

  // Dedicated Settings Page
  settingsTitle: string;
  settingsSubtitle: string;
  languageCardTitle: string;
  languageCardDesc: string;
  voiceCardTitle: string;
  voiceCardDesc: string;
  speedSlow: string;
  speedNormal: string;
  speedFast: string;
  alertsDisplaySectionTitle: string;
  alertsDisplaySectionDesc: string;
  themeLabel: string;
  textSizeLabel: string;
  textSizeNormal: string;
  textSizeLarge: string;
  accountCardTitle: string;
  accountSignedOutDesc: string;
  accountSignedInDesc: (email: string) => string;
  accountSignInBtn: string;
  accountSignOutBtn: string;
  accountErrorMsg: string;
  privacyCardTitle: string;
  privacyCardDesc: string;
  saveConsentLabel: string;
  toggleOn: string;
  toggleOff: string;
  clearSavedDataBtn: string;
  aiOfflineSectionTitle: string;
  aiOfflineSectionDesc: string;
  aiOnlineExplain: string;
  aiLocalExplain: string;
  card2CheckBtn: string;
  prepareDeviceModelBtn: string;
  preparingDeviceModelBtn: string;
  deviceModelProgressLabel: (percent: number) => string;
  deviceModelReadyNotice: string;
  deviceModelUnsupportedNotice: string;
  deviceModelIncompleteNotice: string;
  deviceModelErrorNotice: (detail?: string) => string;
  card2SimulateBtn: string;
  card2SimulateActive: string;
  localModelLabels: Record<LocalModelSupport, string>;
  hybridPreferLocalBtn: string;
  hybridPreferCloudBtn: string;
  techDetailsShowBtn: string;
  techDetailsHideBtn: string;
  appCheckActiveText: string;
  appCheckPendingText: string;
  sourcesTitle: string;
  sourcesNoaaTitle: string;
  sourcesNoaaDesc: string;
  sourcesNasaTitle: string;
  sourcesNasaDesc: string;
  consoleTodoTitle: string;
  consoleTodoItems: string[];

  // Scientific Provenance, Plain Explanations, 3-Day Forecast, Chart Legend & Localized Official Alerts
  noaaAgencyName: string;
  observedAtLabel: string;
  cachedAgePrefix: string;
  flarePlainMeaning: (flareClass: string | null) => string;
  kpPlainMeaning: (kp: number | null) => string;
  windPlainMeaning: (speed: number | null) => string;
  gpsPlainScaleNote: (level: SeverityLevel) => string;
  feedDiscrepancyTitle: string;
  feedDiscrepancyExplain: Record<
    FeedDiscrepancyKind,
    (liveKp: string, warningKp: string | null, forecastG: string | null) => string
  >;
  forecastSectionTitle: string;
  forecastSectionSubtitle: string;
  forecastDayLabels: { today: string; tomorrow: string; dayAfter: string };
  forecastStormScaleLabel: string;
  forecastRadioChanceLabel: string;
  forecastRadiationChanceLabel: string;
  forecastNoStormText: string;
  yesterdayPeakLabel: string;
  alertCategoryLabels: Record<AlertCategory, string>;
  alertTimingLabels: {
    activeWindow: string;
    continuing: string;
    completed: string;
    notice: string;
  };
  alertAgencyLabel: string;
  alertValidFromLabel: string;
  alertValidToLabel: string;
  alertBeginTimeLabel: string;
  alertImpactsLabel: string;
  localizedAlertContent: (alert: SpaceAlertItem) => {
    title: string;
    summary: string;
    impact: string;
  };
  chartLegendFlare: string;
  chartLegendKp: string;
  chartAxisStrong: string;
  chartAxisMedium: string;
  chartAxisQuiet: string;
  aiOfficialSourcePromptLabel: string;

  // Simple Mode-Choice Welcome & Easy Use 6-Button Mode
  welcomeEnglishSubtitle: string;
  welcomeChooseHeading: string;
  modeEasyOptionLetter: string;
  modeEasyTitle: string;
  modeEasySubtitle: string;
  modeEasyBadge: string;
  modeFullOptionLetter: string;
  modeFullTitle: string;
  modeFullSubtitle: string;
  modeFullBadge: string;
  switchToEasyBtn: string;
  switchToFullBtn: string;
  backToChoiceBtn: string;
  easyPageTitle: string;
  easyPageSubtitle: string;
  easyBackBtn: string;
  easyListenBtn: string;
  easyStopBtn: string;
  easyGuideVoiceBtn: string;
  easyGuideVoiceScript: string;
  easyVoiceCmdBtn: string;
  easyVoiceCmdListening: string;
  easyVoiceCmdHint: string;
  easyVoiceCmdNotUnderstood: string;
  easyVoiceCmdMatched: (num: string, title: string) => string;
  easyMenuItems: Record<
    EasyMenuSection,
    {
      title: string;
      shortDesc: string;
    }
  >;
  easyAiHeading: string;
  easyAiSubheading: string;
  easyAiQuickPrompts: string[];
  easyAiVoiceAskBtn: string;
  easyAllVoiceTitle: string;
  easyAllVoiceSub: string;
  easyNoWarningsTitle: string;
  easyNoWarningsBody: string;
  easyWarningsCountBody: (count: string) => string;
  easyEarthCalmDetails: string[];
  easyEarthMinorDetails: string[];
  easyEarthStrongDetails: string[];
  easySunFlareLabel: string;
  easySunWindLabel: string;
  easyTodayKpLabel: string;
  easyForecastTomorrowPrefix: string;
}

export const LOCALIZATION: Record<LanguageCode, LocalizationBundle> = {
  en: {
    brandName: 'Space Sentinel',
    brandSubtitle: 'Simple Sun & Signal Monitor',
    welcomeIntroBtn: 'Intro',

    welcomeTagline:
      'Check solar storms, phone map safety, and hear clear updates in five everyday languages.',
    welcomeWhatTitle: 'What does this app do?',
    welcomeWhatDesc:
      'It checks official space weather reports, explains whether the Sun is calm or stormy in plain words, and answers your questions by text or voice.',
    welcomeWhyTitle: 'Why check space weather?',
    welcomeWhyDesc:
      'Big storms from the Sun can disturb radio signals, airplane navigation, map accuracy, and power lines. Early updates help everyone stay ready.',
    enterCenterBtn: 'Open Main Screen',
    enterCenterHint: 'See today’s sun weather, charts, and ask questions',
    listenIntroBtn: 'Listen to Intro',
    stopVoiceBtn: 'Stop Voice',
    voiceLoadingBtn: 'Loading Voice...',
    introSpeech:
      'Welcome to Space Sentinel. This app checks live sun weather reports, tells you if phone maps or signals are safe, and lets you ask simple questions anytime.',
    voiceUnavailableNotice: 'We could not play English voice right now. You can still read the answer here.',
    voiceOfflineUnavailableNotice: 'Internet is off and this phone has no built-in English voice. You can read the text here.',
    voiceAvailableBadge: 'English voice is ready on this device',
    voiceOnlineAvailableBadge: 'English voice works online when connected',

    navHome: 'Home',
    navWeather: 'Sun Weather',
    navHelper: 'Ask AI',
    navAlerts: 'Alerts',
    navSettings: 'Settings',

    headerLanguageLabel: 'Language',
    headerThemeLight: 'Light',
    headerThemeDark: 'Dark',
    headerVoiceOn: 'Voice On',
    headerVoiceMuted: 'Muted',
    refreshBtn: 'Check Again',
    refreshBtnHint: 'Get the latest update now',
    refreshingBtn: 'Checking...',
    retryBtn: 'Try Again',
    dismissBtn: 'Close',
    offlineBanner: 'Internet is off or disconnected. Showing earlier saved information.',
    connectionRestoredBanner: 'Internet is back. Latest information has loaded.',
    fetchErrorNotice: 'Could not get new information right now. Showing earlier saved information.',
    noaaCacheBanner: 'Could not get new information right now. Showing earlier saved information.',
    noaaNoCacheBanner: 'Could not load information right now. Please try again in a little while.',
    cachedDataTimePrefix: 'Last saved at: ',
    notAvailableShort: 'Not available',
    expandDetailsBtn: 'Read more',
    hideDetailsBtn: 'Show less',
    officialSourceLinkLabel: 'Official Space Weather Center',
    returnLiveBtn: 'Back to Live Info',

    dashPageTitle: 'Today’s Space Weather',
    dashStatusHeading: 'Sun & Space Right Now',
    dashRiskHeading: 'Safety Check',
    dashRiskTrustworthyHint: 'Based directly on live official space measurements',
    dashRiskUnavailableText: 'No live report has loaded yet. Check your internet and try again.',
    dashAskAiBtn: 'Ask AI Helper',
    dashAskAiHint: 'Type or speak any simple question in everyday words',
    dashViewAlertsBtn: 'See Alerts',
    dashOpenWeatherBtn: 'Learn More About Sun Weather',
    dashSolarActivityTitle: 'Sun Flash Level',
    dashSolarActivityBrief: 'Shows how bright or strong recent flashes on the Sun are.',
    dashSolarActivityDetail:
      'Small flashes (A, B, C) are normal. Medium M and large X flashes can cause short radio trouble on the sunny side of Earth.',
    dashKpTitle: 'Earth Magnetic Shield',
    dashKpBrief: 'Measures how calm or shaky Earth’s magnetic shield is from 0 to 9.',
    dashKpDetail:
      'Numbers under 5 are calm. Numbers 5 or higher mean a geomagnetic storm is happening.',
    dashWindTitle: 'Solar Wind Speed',
    dashWindBrief: 'How fast tiny charged particles from the Sun are flying past Earth.',
    dashWindDetail:
      'Normal speed is around 300 to 450 km/s. Speeds above 600 km/s can bring stronger storm waves.',
    dashDensityLabel: 'Particle thickness',
    dashGpsTitle: 'Phone Maps & Signal Safety',
    dashGpsBrief: 'Tells you if solar weather might disturb radio or navigation signals.',
    dashGpsDetail:
      'Global reports cannot measure exact street-level meter error at your house; this advice comes from official storm scales.',
    dashChartHeading: 'Past 6 Hours Change',
    dashChartSub: 'Move your finger or mouse over the line to check earlier hours.',
    dashProvenanceHeading: 'Last Update & Source',

    summarySunTitle: 'Sun Flash',
    summaryStormTitle: 'Magnetic Level',
    summaryGpsTitle: 'Signal Safety',
    solarWindTitle: 'Solar Wind',
    summaryUpdatedTitle: 'Updated Time',
    summarySourceTitle: 'Source',
    gpsMeasuredNote: 'Exact street-level meter error is not measured here; status reflects official storm scales.',
    sampleGpsNote: (drift, lock) => `Practice example only (not real): ±${drift} m drift, ${lock}% lock`,
    sourceStatus: {
      'live-noaa': 'Live Official Report',
      'offline-cache': 'Earlier Saved Information',
      simulated: 'Practice Example (Not Real)',
    },
    severityLabels: {
      nominal: 'Calm and Safe',
      minor: 'Small Waves',
      strong: 'Strong Storm',
      extreme: 'Big Storm Warning',
    },
    severityDescriptions: {
      nominal: 'The Sun and Earth’s shield are calm. Phone maps and signals are working normally.',
      minor: 'Small space waves noticed. Everyday maps and phones still work fine.',
      strong: 'A strong solar storm is active. Flights near the poles and sensitive radio gear should stay careful.',
      extreme: 'A major solar storm is happening right now. Follow official safety notices.',
    },
    unitMeters: 'm',
    unitKmSec: 'km/s',
    unitProtonDensity: 'p/cm³',
    unitPercent: '%',

    weatherPageTitle: 'Easy Guide to Space Weather',
    weatherPageSubtitle: 'Tap any topic below to understand what happens between the Sun and Earth.',
    weatherTopicSelectorLabel: 'Pick a topic',
    weatherTopics: {
      flares: {
        title: 'Sun Flashes',
        summary: 'Sudden bright bursts of energy from active spots on the Sun.',
        scientificExplain:
          'Space satellites watch these bursts all day. The light reaches Earth in about 8 minutes.',
        impactExplain:
          'Big flashes can briefly weaken long-distance radio signals on the daylight side of Earth.',
      },
      storms: {
        title: 'Space Storms',
        summary: 'Clouds of particles from the Sun hitting Earth’s magnetic shield.',
        scientificExplain:
          'Rated from G0 (calm) to G5 (very big). Storms start when solar clouds push strongly against Earth’s shield.',
        impactExplain:
          'Strong storms create colorful northern lights and can add extra drag on satellites or strain power lines.',
      },
      kp: {
        title: 'Magnetic Index (0–9)',
        summary: 'A simple 0-to-9 score showing how shaky Earth’s magnetic field is.',
        scientificExplain:
          'Measured by stations around the world: 0 to 4 is calm, and 5 to 9 means a storm is active.',
        impactExplain:
          'Higher scores can bend satellite signals slightly as they pass through the upper sky.',
      },
      wind: {
        title: 'Solar Wind',
        summary: 'A steady breeze of tiny invisible particles blowing from the Sun.',
        scientificExplain:
          'Space sensors sitting far ahead of Earth measure this wind and give 15 to 60 minutes early notice.',
        impactExplain:
          'When the wind blows faster than 600 km/s, storm chances go up.',
      },
      gps: {
        title: 'Maps & Satellites',
        summary: 'How big sun storms affect navigation and radio waves.',
        scientificExplain:
          'Satellite signals travel through the upper sky. During big storms, uneven air layers can slow or scatter them.',
        impactExplain:
          'Normal car maps stay fine on calm days; survey tools and polar flights notice changes first during storms.',
      },
    },
    weatherVisualSectionTitle: 'Live Charts & Sun-Earth Picture',
    trendChartTitle: '6-Hour Sun Flash & Magnetic Score',
    trendChartExplain: 'Blue line shows Sun flash strength; green dashed line shows magnetic level (0–9).',
    orbitTitle: 'Sun Wind & Earth Shield Picture',
    orbitExplain: 'Shows moving particles blowing from the Sun toward Earth’s protective shield.',
    saveSnapshotBtn: 'Save Reading',
    saveSnapshotHint: 'Keep this reading in your saved list',
    exportHtmlBtn: 'Save Offline Copy',
    exportHtmlHint: 'Download a page you can open without internet',
    savedSnapshotsTitle: 'Your Saved Readings',
    noSnapshotsText: 'You have not saved any readings yet.',
    weatherSourcesHeading: 'Where This Info Comes From',

    alertsPageTitle: 'Space Weather Alerts',
    alertsPageSubtitle: 'Official warnings from space centers and spoken safety updates.',
    alertsCurrentConditionTitle: 'Safety Level Right Now',
    alertsVoiceCardTitle: 'Hear Safety Update',
    alertsVoiceCardDesc: 'Listen to today’s safety status in simple everyday words.',
    card3Action: 'Play Safety Update',
    card3Stop: 'Stop Voice',
    alertsOfficialFeedTitle: 'Official Notices',
    alertsRecentLabel: 'Latest Official Bulletins',
    alertsEmptyText: 'No active warnings right now. Everything looks normal.',
    alertsIssuedLabel: 'Sent at',
    alertsGpsImpactTitle: 'Maps & Signal Check',
    alertsGpsImpactDesc: 'Based strictly on official radio and magnetic storm reports.',
    alertsSavedSectionTitle: 'Saved Alerts',
    saveFavoriteBtn: 'Save Alert',
    savedFavoriteBadge: 'Saved',
    favoritesEmptyText: 'No alerts saved yet. Tap Save Alert on any notice above.',
    removeFavoriteBtn: 'Remove',
    alertsTrainingTitle: 'Try Practice Storm Examples',
    alertsTrainingDesc: 'See how the screen and voice warning look during a storm. These are only examples, not real weather.',
    alertsTrainingShowBtn: 'Show Practice Examples',
    alertsTrainingHideBtn: 'Hide Examples',
    testSampleWarning: 'Practice example is on — these numbers are just for testing, not real weather.',
    scenarioLabels: {
      nominal: 'Calm Example',
      minor: 'Small Wave Example',
      strong: 'Strong Storm Example',
      extreme: 'Big Storm Example',
    },
    emergencySpeech: {
      nominal: (sourceDesc) =>
        `Space Sentinel update from ${sourceDesc}. Everything is calm right now. Maps and signals are safe to use.`,
      minor: (sourceDesc) =>
        `Space Sentinel update from ${sourceDesc}. Small sun waves are active today, so keep an eye on new notices.`,
      strong: (sourceDesc) =>
        `Space Sentinel warning from ${sourceDesc}. A strong storm is active. Keep backup directions ready for important trips.`,
      extreme: (sourceDesc) =>
        `Urgent warning from Space Sentinel based on ${sourceDesc}. A major space storm is happening right now. Follow official safety notices carefully.`,
    },

    helperTitle: 'Ask AI Helper',
    helperSubtitle: 'Type or speak any question. Your chats are saved here.',
    helperGreeting: 'Hello! Ask me anything about sun storms, maps, or how this app works.',
    helperPlaceholder: 'Write your question here...',
    helperSendBtn: 'Send',
    helperRecordStart: 'Speak Question',
    helperRecordStop: 'Stop Mic',
    helperNewChatBtn: 'New Chat',
    chatListBtn: 'Past Chats',
    chatCloseListBtn: 'Close',
    chatSearchPlaceholder: 'Search past chats...',
    chatNoMatches: 'No matching chats found.',
    chatEmptyList: 'No saved chats yet.',
    chatModeNewBadge: 'New',
    chatModeSavedBadge: 'Saved',
    chatUntitledFallback: 'Space Question',
    chatRenameBtn: 'Rename',
    chatSaveRenameBtn: 'Save',
    chatCancelBtn: 'Cancel',
    chatDeleteBtn: 'Delete',
    chatOriginalLangNote: 'Kept in its original language',
    chatCreatedLabel: 'Started',
    chatLastMsgLabel: 'Updated',
    helperListenReply: 'Listen',
    helperReplayReply: 'Play Again',
    helperStopReplyVoice: 'Stop',
    helperThinking: 'Getting your answer...',
    helperVoiceUnsupported: 'Voice mic is not available in this browser. Please type your question below.',
    offlineAiUnavailableMsg: (solar) => {
      const age = solar?.fetchedAtIso ? formatAgeForLanguage(solar.fetchedAtIso, 'en') : '';
      return `Internet is off and this device has no built-in offline AI, so I cannot make a new reply right now. ${
        solar?.flareClass
          ? `Last saved data${age ? ` (${age})` : ''}: sun flash ${solar.flareClass}, magnetic level ${solar.kpIndex ?? 'not available'}.`
          : 'No earlier report is saved yet.'
      }`;
    },
    offlineGuideActiveNote:
      'Internet is off — Offline Local Guide is active and can still answer basic questions using your saved space report.',
    offlineNanoAndGuideNote:
      'Internet is off — short single-turn English questions can run on-device via Gemini Nano, and the Offline Local Guide handles saved-data questions.',
    askAiNanoPromptNote:
      'Desktop Chrome Gemini Nano is supported here for fast, offline-capable short English answers. Initialize it below when ready.',
    networkAiUnavailableMsg:
      'Could not reach AI right now. Check your internet and try again.',
    timeoutAiUnavailableMsg:
      'It took too long to get a reply. Please tap Try Again.',
    rateLimitAiUnavailableMsg:
      'Too many questions were asked right now or daily free limit was reached. Please wait a little and tap Try Again.',
    providerLabels: {
      'firebase-ai-on-device': 'ON_DEVICE — Gemini Nano',
      'firebase-ai-cloud': 'IN_CLOUD — Firebase AI Logic',
      'server-gemini': 'SERVER BACKUP — /api/gemini/chat',
      'on-device-browser': 'Legacy Browser Local Mode',
      'offline-local-guide': 'OFFLINE LOCAL GUIDE — Saved Local Data',
      'offline-unavailable': 'Could not reply',
    },
    starterQuestions: [
      'Is there any solar storm happening right now?',
      'Will my phone GPS or maps work okay today?',
      'What does the magnetic number mean?',
      'What still works if my internet goes out?',
    ],

    settingsTitle: 'Settings',
    settingsSubtitle: 'Change language, sound, screen look, or account anytime.',
    languageCardTitle: 'Language',
    languageCardDesc: 'Changes buttons and new chats right away. Older chats stay in their own language.',
    voiceCardTitle: 'Voice & Sound',
    voiceCardDesc: 'Turn spoken voice on or off and choose how fast it talks.',
    speedSlow: 'Slow',
    speedNormal: 'Normal',
    speedFast: 'Fast',
    alertsDisplaySectionTitle: 'Screen Look',
    alertsDisplaySectionDesc: 'Switch between dark or light background and bigger text.',
    themeLabel: 'Screen',
    textSizeLabel: 'Text Size',
    textSizeNormal: 'Normal',
    textSizeLarge: 'Large',
    accountCardTitle: 'Your Account',
    accountSignedOutDesc: 'Sign in with Google to keep your chats and saved alerts safely backed up.',
    accountSignedInDesc: (email) => `Signed in as ${email}. Your chats save automatically.`,
    accountSignInBtn: 'Sign In with Google',
    accountSignOutBtn: 'Sign Out',
    accountErrorMsg: 'Could not sign in. Please check popup permission and try again.',
    privacyCardTitle: 'Saved Data on This Device',
    privacyCardDesc: 'Choose whether chats stay saved on this phone or clear them.',
    saveConsentLabel: 'Save Automatically',
    toggleOn: 'On',
    toggleOff: 'Off',
    clearSavedDataBtn: 'Clear Saved Data',
    aiOfflineSectionTitle: 'AI & Offline Mode',
    aiOfflineSectionDesc: 'See how Hybrid AI and Offline Local Guide work on Desktop and Mobile.',
    aiOnlineExplain: 'Short single-turn English questions use PREFER_ON_DEVICE (Gemini Nano if ready, otherwise Firebase AI Logic Cloud). Multi-turn chats and Urdu, Hindi, Telugu, or Kannada always use Firebase AI Logic Cloud.',
    aiLocalExplain: 'Built-in Gemini Nano via Chrome Prompt API works only on supported Desktop Chrome for English. On Android mobile Chrome or when offline, the built-in Offline Local Guide answers basic questions from your saved report without false claims.',
    card2CheckBtn: 'Check Gemini Nano',
    prepareDeviceModelBtn: 'Initialize / Download Gemini Nano',
    preparingDeviceModelBtn: 'Preparing Gemini Nano...',
    deviceModelProgressLabel: (percent) => `Download progress: ${percent}%`,
    deviceModelReadyNotice: 'Gemini Nano is ready in this Desktop Chrome browser for short single-turn English questions.',
    deviceModelUnsupportedNotice: 'Chrome Prompt API (Gemini Nano) is not available on this mobile browser or device. It currently requires supported Desktop Chrome. Online Firebase Cloud AI and Offline Local Guide continue working normally.',
    deviceModelIncompleteNotice: 'Model initialization finished, but Gemini Nano is not marked ready yet. Make sure Desktop Chrome flags/storage allow on-device AI and try again.',
    deviceModelErrorNotice: (detail) =>
      `Could not initialize Gemini Nano${detail ? `: ${detail}` : '.'}`,
    card2SimulateBtn: 'Test Offline Mode',
    card2SimulateActive: 'Offline Mode is On',
    localModelLabels: {
      available: 'Desktop Chrome Gemini Nano is ready (short English prompts)',
      downloadable: 'Gemini Nano is supported here — tap Initialize to download',
      unsupported: 'Gemini Nano is unavailable here (Desktop Chrome Prompt API required)',
    },
    hybridPreferLocalBtn: 'Try Gemini Nano First (Short EN)',
    hybridPreferCloudBtn: 'Use Cloud AI First',
    techDetailsShowBtn: 'More Technical Info',
    techDetailsHideBtn: 'Hide Technical Info',
    appCheckActiveText: 'Extra app safety check is turned on.',
    appCheckPendingText: 'Optional extra security key is not added in Firebase Console yet.',
    sourcesTitle: 'Data Sources',
    sourcesNoaaTitle: 'National Space Weather Center',
    sourcesNoaaDesc: 'Real-time solar flashes, magnetic levels, solar wind, and warnings.',
    sourcesNasaTitle: 'Space Storm Scale Guide',
    sourcesNasaDesc: 'Official charts explaining mild, strong, and severe storm levels.',
    consoleTodoTitle: 'Admin Setup Notes',
    consoleTodoItems: [
      'Turn on Google Sign-In in Firebase Authentication.',
      'Turn on Firebase AI Logic in Firebase Console if needed.',
      'Add App Check key in Firebase Console for production.',
    ],

    noaaAgencyName: 'NOAA Space Weather Prediction Center (USA)',
    observedAtLabel: 'Measured at',
    cachedAgePrefix: 'Saved age',
    flarePlainMeaning: (flareClass) => {
      if (!flareClass) return 'No Sun flash reading is loaded right now.';
      const prefix = flareClass.charAt(0).toUpperCase();
      if (prefix === 'X') return 'Very large Sun flash — can cause strong daytime radio blackouts.';
      if (prefix === 'M') return 'Medium Sun flash — can briefly weaken daytime radio signals.';
      if (prefix === 'C') return 'Small, everyday Sun flash — normal background activity, safe for phones and maps.';
      return 'Very tiny background flash — Sun is very quiet.';
    },
    kpPlainMeaning: (kp) => {
      if (kp === null) return 'Magnetic level is not available right now.';
      if (kp >= 9) return 'Extreme G5 storm level (Kp 9) — major global magnetic disturbance.';
      if (kp >= 8) return 'Severe G4 storm level (Kp 8) — strong magnetic storm active.';
      if (kp >= 7) return 'Strong G3 storm level (Kp 7) — active strong solar storm.';
      if (kp >= 6) return 'Moderate G2 storm level (Kp 6) — moderate magnetic storm.';
      if (kp >= 5) return 'Minor G1 storm level (Kp 5 starts G1) — mild storm active.';
      if (kp >= 4) return 'Active unsettled level (Kp 4 is below G1 storm; G1 starts at Kp 5).';
      return `Quiet Earth shield (${localizeDigits(kp, 'en')} is below 5 — G0 means no storm right now).`;
    },
    windPlainMeaning: (speed) => {
      if (speed === null) return 'Live wind speed sensor reading is temporarily unavailable.';
      if (speed >= 650) return 'Fast solar wind stream — increases chances of Earth magnetic waves.';
      if (speed >= 480) return 'Slightly brisk solar wind — can cause small magnetic ripples.';
      return 'Normal everyday wind speed (300–450 km/s is typical and calm).';
    },
    gpsPlainScaleNote: (level) => {
      if (level === 'extreme' || level === 'strong') {
        return 'Strong storm levels can bend satellite timing signals and affect flights near poles or high-precision survey gear.';
      }
      if (level === 'minor') {
        return 'Mild waves mostly affect high-latitude skies; everyday car maps and phones stay normal.';
      }
      return 'Earth’s upper sky is calm right now — phone GPS, maps, and radio work normally.';
    },
    feedDiscrepancyTitle: 'Why Current Number and Warning Differ',
    feedDiscrepancyExplain: {
      'warning-higher-than-live': (liveKp, warningKp) =>
        `Right now the latest 1-minute reading is calm (Kp ${liveKp}, G0), while an official warning is still open expecting Kp up to ${warningKp ?? '4'} during its active window. That happens because 1-minute readings show this exact minute, while warnings cover several hours.`,
      'forecast-higher-than-live': (liveKp, _wKp, forecastG) =>
        `The latest 1-minute reading right now is calm (Kp ${liveKp}, G0), while today’s 24-hour outlook predicts up to ${forecastG ?? 'G1'} later today. Warnings and 24-hour forecasts look ahead; live numbers show this exact minute.`,
      'partial-feed': () =>
        'One of the live space sensors did not answer on this check, so only verified available numbers are shown.',
      none: () => '',
    },
    forecastSectionTitle: '3-Day Official Forecast & Yesterday',
    forecastSectionSubtitle: 'Official 24-hour storm outlook separate from live 1-minute readings.',
    forecastDayLabels: { today: 'Today', tomorrow: 'Tomorrow', dayAfter: 'Day After' },
    forecastStormScaleLabel: 'Magnetic storm outlook',
    forecastRadioChanceLabel: 'Radio flash chance',
    forecastRadiationChanceLabel: 'Particle storm chance',
    forecastNoStormText: 'Calm (G0 — No storm expected)',
    yesterdayPeakLabel: 'Yesterday highest official levels',
    alertCategoryLabels: {
      warning: 'Warning',
      watch: 'Watch',
      alert: 'Ongoing Alert',
      summary: 'Summary',
    },
    alertTimingLabels: {
      activeWindow: 'Active time window',
      continuing: 'Continuing advisory',
      completed: 'Window ended',
      notice: 'Official notice',
    },
    alertAgencyLabel: 'Issued by',
    alertValidFromLabel: 'Valid from',
    alertValidToLabel: 'Valid until',
    alertBeginTimeLabel: 'Started on',
    alertImpactsLabel: 'Everyday impact',
    localizedAlertContent: (alert) => {
      const code = alert.noticeCode ?? 'OTHER';
      switch (code) {
        case 'K04W':
          return {
            title: 'Warning: Magnetic Activity Up to Kp 4 Expected (Below G1)',
            summary:
              'Official space monitors expect Earth’s magnetic field to reach active level Kp 4 during this time window. Note: Kp 4 is active weather, NOT a G1 storm (G1 begins at Kp 5).',
            impact:
              'Daily users: phone maps and cellular stay normal. High-latitude areas (far north) may see weak aurora and tiny power-grid ripples.',
          };
        case 'K05W':
        case 'K06W':
        case 'K07W': {
          const kpVal = alert.kpThreshold ?? 5;
          const gLabel = alert.gScaleTarget ?? 'G1';
          return {
            title: `Warning: Geomagnetic Storm Expected (${gLabel}, Kp ${kpVal})`,
            summary: `Official space forecasters expect geomagnetic storm level ${gLabel} (Kp ${kpVal}) within the valid window shown below.`,
            impact:
              'Possible high-latitude aurora, mild satellite drag or radio noise, and minor fluctuations on long power grids.',
          };
        }
        case 'K04A':
        case 'K05A':
        case 'K06A':
        case 'K07A': {
          const kpVal = alert.kpThreshold ?? 4;
          const gText = alert.gScaleTarget ? ` (${alert.gScaleTarget})` : ' (below G1)';
          return {
            title: `Observed Alert: Magnetic Level Reached Kp ${kpVal}${gText}`,
            summary: `Ground magnetic stations measured Kp reaching ${kpVal}${gText} at the time listed.`,
            impact:
              kpVal >= 5
                ? 'Minor storm conditions possible on high-latitude radio, power lines, and precision survey GPS.'
                : 'Mostly harmless for daily life; aurora may appear near polar regions.',
          };
        }
        case 'EF3A': {
          const peakText = alert.electronPeakPfu
            ? ` Yesterday’s peak reached ${alert.electronPeakPfu} pfu.`
            : '';
          return {
            title: 'Continuing Advisory: High-Speed Electrons Around Satellites',
            summary: `High-energy electrons at geostationary satellite orbit remain above the 1,000 pfu threshold.${peakText}`,
            impact:
              'Daily phone maps, ground internet, and people on Earth are safe. Satellite operators monitor spacecraft charging.',
          };
        }
        case 'WATA_G1':
        case 'WATA_G2':
        case 'WATA_G3': {
          const gLabel = alert.gScaleTarget ?? 'G1';
          return {
            title: `Watch: ${gLabel} Geomagnetic Storm Possible`,
            summary: `Space weather forecasters posted an advance watch because ${gLabel} storm conditions are possible over the watched days.`,
            impact:
              'Everyday phones and navigation usually work normally; northern sky aurora and minor satellite or power-grid ripples are possible.',
          };
        }
        case 'PROTON_WARN':
        case 'PROTON_ALERT':
          return {
            title: 'Solar Particle Advisory (Satellites & Polar Flights)',
            summary: 'Elevated high-energy solar particles detected or expected near high-altitude polar paths.',
            impact: 'Mainly affects polar high-altitude flights and space satellites; everyday ground users stay safe.',
          };
        case 'FLARE_SUM':
          return {
            title: 'Recent Sun Flash Summary',
            summary: 'Official summary of a recent solar X-ray burst recorded by weather satellites.',
            impact: 'Large flashes can cause short daytime high-frequency radio fades; phone GPS usually recovers quickly.',
          };
        default:
          return {
            title: alert.title || 'Official Space Weather Notice',
            summary: alert.summary || 'Official update from NOAA Space Weather Prediction Center.',
            impact: 'See the official NOAA bulletin link for full technical notes.',
          };
      }
    },
    chartLegendFlare: 'Solid Blue: Sun Flash Strength (X-ray)',
    chartLegendKp: 'Dashed Green: Magnetic Level (Kp 0–9)',
    chartAxisStrong: 'X (Big)',
    chartAxisMedium: 'M (Med)',
    chartAxisQuiet: 'A/B (Calm)',
    aiOfficialSourcePromptLabel: 'Official data sources:',

    welcomeEnglishSubtitle: 'Space Sentinel Hybrid AI',
    welcomeChooseHeading: 'How would you like to use this app?',
    modeEasyOptionLetter: 'A',
    modeEasyTitle: 'Easy Use',
    modeEasySubtitle: 'Large numbered buttons, very simple words, and clear voice guidance.',
    modeEasyBadge: 'Best for beginners & voice',
    modeFullOptionLetter: 'B',
    modeFullTitle: 'Full Information',
    modeFullSubtitle: 'Live charts, official scales, alerts feed, settings, and detailed AI chat.',
    modeFullBadge: 'Charts & full tools',
    switchToEasyBtn: 'Easy Mode',
    switchToFullBtn: 'Full Info',
    backToChoiceBtn: 'Mode Choice',
    easyPageTitle: 'Easy Space Weather Menu',
    easyPageSubtitle: 'Tap any large numbered button below, or speak a number from 1 to 6.',
    easyBackBtn: 'Back',
    easyListenBtn: 'Listen',
    easyStopBtn: 'Stop Voice',
    easyGuideVoiceBtn: 'Hear What Each Button Does',
    easyGuideVoiceScript:
      'Press 1 for today’s space weather. Press 2 for the condition of the Sun. Press 3 for effects on Earth and phone maps. Press 4 for danger warnings. Press 5 to listen to all updates in voice. Press 6 to ask AI any simple question.',
    easyVoiceCmdBtn: 'Speak Command (1–6)',
    easyVoiceCmdListening: 'Listening... Say "Press 1" or "Today’s weather"',
    easyVoiceCmdHint: 'You can tap any button, or tap the mic and say "Press 1" or "Today’s weather".',
    easyVoiceCmdNotUnderstood: 'Could not match a number (1 to 6). Tap any button below to open it.',
    easyVoiceCmdMatched: (num, title) => `Opening ${num}: ${title}`,
    easyMenuItems: {
      today: {
        title: "Today's Space Weather",
        shortDesc: 'See right away if space weather is calm or stormy today.',
      },
      sun: {
        title: 'Condition of the Sun',
        shortDesc: 'Check sun flashes and solar wind speed in plain words.',
      },
      earth: {
        title: 'Effects on Earth',
        shortDesc: 'Know if phone maps, calls, radio, and electricity are safe.',
      },
      warnings: {
        title: 'Danger Warnings',
        shortDesc: 'Check active official storm warnings and upcoming days.',
      },
      'all-voice': {
        title: 'Listen to All Info in Voice',
        shortDesc: 'Hear a complete simple summary of today’s space report.',
      },
      ai: {
        title: 'Ask AI a Question',
        shortDesc: 'Tap a quick question or speak to get a simple answer.',
      },
    },
    easyAiHeading: 'Ask a Simple Question',
    easyAiSubheading: 'Tap any question below to get an answer right away, or speak using the mic.',
    easyAiQuickPrompts: [
      'Are phone maps and signals safe today?',
      'Is there any storm on the Sun right now?',
      'Could anything happen tomorrow?',
    ],
    easyAiVoiceAskBtn: 'Tap and Speak Your Question',
    easyAllVoiceTitle: 'Complete Simple Summary',
    easyAllVoiceSub: 'Press Listen below to hear the full update, or read it anytime.',
    easyNoWarningsTitle: 'No Active Storm Warning',
    easyNoWarningsBody: 'Everything is normal right now. Official space centers report no active danger warning.',
    easyWarningsCountBody: (count) => `There are ${count} recent official notices listed below in plain words.`,
    easyEarthCalmDetails: [
      'Mobile phone calls, internet, and map apps work normally.',
      'Airplanes, boats, and power lines face no space storm trouble today.',
    ],
    easyEarthMinorDetails: [
      'Everyday phones and map apps keep working fine.',
      'Very small space waves only reach far-north polar skies.',
    ],
    easyEarthStrongDetails: [
      'Long-distance radio and high-latitude flights may see short signal trouble.',
      'Normal phones on the ground usually stay safe; follow official notices.',
    ],
    easySunFlareLabel: 'Recent sun flash strength',
    easySunWindLabel: 'Sun wind speed',
    easyTodayKpLabel: 'Earth magnetic level (0 to 9)',
    easyForecastTomorrowPrefix: 'Tomorrow forecast',
  },

  ur: {
    brandName: 'خلائی نگہبان',
    brandSubtitle: 'سورج اور سگنل کی آسان جانکاری',
    welcomeIntroBtn: 'تعارف',

    welcomeTagline:
      'سورج پر آنے والے طوفان، موبائل نقشوں کی حفاظت اور پانچ زبانوں میں آسان آواز اور سوال جواب۔',
    welcomeWhatTitle: 'یہ ویب سائٹ کیا کرتی ہے؟',
    welcomeWhatDesc:
      'یہ سرکاری خلائی مرکز سے تازہ خبر لاتی ہے، آسان لفظوں میں بتاتی ہے کہ سورج پرسکون ہے یا طوفان آیا ہوا ہے، اور آپ کے سوالوں کا جواب دیتی ہے۔',
    welcomeWhyTitle: 'یہ جاننا کیوں ضروری ہے؟',
    welcomeWhyDesc:
      'سورج کے بڑے طوفان ریڈیو، ہوائی جہاز، موبائل کے راستہ بتانے والے نقشوں اور بجلی پر اثر ڈال سکتے ہیں۔ پہلے سے پتہ ہو تو احتیاط آسان ہو جاتی ہے۔',
    enterCenterBtn: 'مرکزی صفحہ کھولیں',
    enterCenterHint: 'ابھی سورج کا حال دیکھیں اور سوال پوچھیں',
    listenIntroBtn: 'تعارف آواز میں سنیں',
    stopVoiceBtn: 'آواز بند کریں',
    voiceLoadingBtn: 'آواز آ رہی ہے...',
    introSpeech:
      'خلائی نگہبان میں خوش آمدید۔ یہاں آپ دیکھ سکتے ہیں کہ سورج پر ابھی کوئی طوفان آیا ہے یا نہیں، راستہ بتانے والا نظام ٹھیک چل رہا ہے یا نہیں، اور آپ اردو میں سوال بھی پوچھ سکتے ہیں۔',
    voiceUnavailableNotice: 'اس موبائل میں اردو بولنے کی آواز نہیں مل رہی۔ آپ جواب پڑھ سکتے ہیں۔',
    voiceOfflineUnavailableNotice: 'انٹرنیٹ بند ہے اور اس موبائل میں اردو کی آواز نہیں ہے۔ آپ جواب پڑھ سکتے ہیں۔',
    voiceAvailableBadge: 'اس موبائل میں اردو کی آواز موجود ہے',
    voiceOnlineAvailableBadge: 'انٹرنیٹ آن ہونے پر اردو آواز آن لائن چلے گی',

    navHome: 'گھر',
    navWeather: 'خلائی موسم',
    navHelper: 'سوال پوچھیں',
    navAlerts: 'انتباہ',
    navSettings: 'ترتیبات',

    headerLanguageLabel: 'زبان',
    headerThemeLight: 'روشن',
    headerThemeDark: 'گہرا',
    headerVoiceOn: 'آواز چالو',
    headerVoiceMuted: 'آواز بند',
    refreshBtn: 'دوبارہ دیکھیں',
    refreshBtnHint: 'ابھی تازہ معلومات منگوائیں',
    refreshingBtn: 'دیکھ رہے ہیں...',
    retryBtn: 'دوبارہ کوشش کریں',
    dismissBtn: 'بند کریں',
    offlineBanner: 'انٹرنیٹ بند ہے یا رابطہ نہیں ہو رہا۔ پچھلی محفوظ معلومات دکھا رہے ہیں۔',
    connectionRestoredBanner: 'انٹرنیٹ دوبارہ آ گیا ہے۔ اب تازہ معلومات دکھائی جا رہی ہیں۔',
    fetchErrorNotice: 'ابھی نئی معلومات نہیں مل سکیں۔ ہم آپ کو پچھلی معلومات دکھا رہے ہیں۔',
    noaaCacheBanner: 'ابھی نئی معلومات نہیں مل سکیں۔ ہم آپ کو پچھلی معلومات دکھا رہے ہیں۔',
    noaaNoCacheBanner: 'ابھی معلومات نہیں مل سکیں۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔',
    cachedDataTimePrefix: 'آخری معلومات: ',
    notAvailableShort: 'موجود نہیں',
    expandDetailsBtn: 'مزید جانیں',
    hideDetailsBtn: 'کم دکھائیں',
    officialSourceLinkLabel: 'سرکاری خلائی مرکز کی ویب سائٹ',
    returnLiveBtn: 'تازہ حال پر واپس آئیں',

    dashPageTitle: 'ابھی کا خلائی حال',
    dashStatusHeading: 'اس وقت سورج کا حال',
    dashRiskHeading: 'حفاظتی جانچ',
    dashRiskTrustworthyHint: 'یہ براہِ راست سرکاری خلائی مرکز کے تازہ نمبروں پر مبنی ہے',
    dashRiskUnavailableText: 'ابھی تازہ معلومات نہیں آ سکیں۔ انٹرنیٹ چیک کرکے دوبارہ کوشش کریں۔',
    dashAskAiBtn: 'اے آئی سے پوچھیں',
    dashAskAiHint: 'آسان اردو میں لکھ کر یا بول کر کوئی بھی سوال پوچھیں',
    dashViewAlertsBtn: 'انتباہ دیکھیں',
    dashOpenWeatherBtn: 'سورج اور طوفان کو سمجھیں',
    dashSolarActivityTitle: 'سورج کی چمک کا درجہ',
    dashSolarActivityBrief: 'بتاتا ہے کہ سورج سے نکلنے والی تیز روشنی کتنی ہلکی یا تیز ہے۔',
    dashSolarActivityDetail:
      'ہلکی چمک عام بات ہے۔ اگر چمک بہت تیز ہو جائے تو کچھ دیر کے لیے ریڈیو سگنل کمزور ہو سکتے ہیں۔',
    dashKpTitle: 'زمین کے گرد حفاظتی گھیرا',
    dashKpBrief: 'صفر سے نو تک بتاتا ہے کہ زمین کا مقناطیسی گھیرا کتنا پرسکون یا ہلا ہوا ہے۔',
    dashKpDetail:
      'پانچ سے کم نمبر بالکل عام اور محفوظ ہیں۔ پانچ یا اس سے زیادہ کا مطلب ہے کہ طوفان چل رہا ہے۔',
    dashWindTitle: 'سورج کی ہوا کی رفتار',
    dashWindBrief: 'سورج سے آنے والی تیز ہوا کتنی تیزی سے زمین کی طرف آ رہی ہے۔',
    dashWindDetail:
      'عام طور پر یہ رفتار تین سو سے ساڑھے چار سو کلومیٹر فی سیکنڈ ہوتی ہے۔ چھ سو سے اوپر جائے تو طوفان کا امکان بڑھتا ہے۔',
    dashDensityLabel: 'ذرات کا گھنا پن',
    dashGpsTitle: 'راستے اور سگنل کی حالت',
    dashGpsBrief: 'بتاتا ہے کہ کیا آج موبائل کے نقشوں اور سگنل پر کوئی اثر پڑ سکتا ہے۔',
    dashGpsDetail:
      'سرکاری خلائی مرکز آپ کے گھر کے عین میٹر کی غلطی نہیں ناپتا؛ یہ مشورہ صرف عالمی طوفان کے نمبروں سے نکالا جاتا ہے۔',
    dashChartHeading: 'پچھلے چھ گھنٹوں کا حال',
    dashChartSub: 'پچھلے گھنٹوں کا حال دیکھنے کے لیے لکیر پر ہاتھ یا ماؤس پھیریں۔',
    dashProvenanceHeading: 'معلومات کا وقت اور ذریعہ',

    summarySunTitle: 'سورج کی چمک',
    summaryStormTitle: 'طوفان کا نمبر',
    summaryGpsTitle: 'سگنل کا مشورہ',
    solarWindTitle: 'سورج کی ہوا',
    summaryUpdatedTitle: 'آخری وقت',
    summarySourceTitle: 'ذریعہ',
    gpsMeasuredNote: 'یہاں گھر کے باہر کا عین میٹر فرق نہیں ناپا جاتا؛ حالت سرکاری طوفانی نمبروں سے ہے۔',
    sampleGpsNote: (drift, lock) => `یہ صرف مشق کی مثال ہے (اصل نہیں): ±${drift} میٹر، ${lock} فیصد سگنل`,
    sourceStatus: {
      'live-noaa': 'تازہ سرکاری معلومات',
      'offline-cache': 'پچھلی محفوظ معلومات',
      simulated: 'صرف مثال (اصل نہیں)',
    },
    severityLabels: {
      nominal: 'بالکل ٹھیک اور پرسکون',
      minor: 'ہلکی سی ہلچل',
      strong: 'تیز طوفان آیا ہوا ہے',
      extreme: 'بہت بڑا طوفان',
    },
    severityDescriptions: {
      nominal: 'سورج اور زمین کا ماحول بالکل پرسکون ہے۔ موبائل کے نقشے اور سگنل آرام سے کام کر رہے ہیں۔',
      minor: 'ہلکی سی ہلچل نظر آئی ہے۔ عام فون اور نقشوں پر کوئی خاص فرق نہیں پڑے گا۔',
      strong: 'سورج کا تیز طوفان چل رہا ہے۔ ہوائی جہاز اور اہم ریڈیو کاموں میں احتیاط رکھنی چاہیے۔',
      extreme: 'اس وقت بہت بڑا خلائی طوفان آیا ہوا ہے۔ سرکاری ہدایتوں کا خیال رکھیں۔',
    },
    unitMeters: 'میٹر',
    unitKmSec: 'کلومیٹر فی سیکنڈ',
    unitProtonDensity: 'ذرات فی مکعب سینٹی میٹر',
    unitPercent: 'فیصد',

    weatherPageTitle: 'سورج اور طوفان کو آسانی سے سمجھیں',
    weatherPageSubtitle: 'نیچے دیے گئے کسی بھی بٹن کو دبائیں اور آسان اردو میں جانیں۔',
    weatherTopicSelectorLabel: 'موضوع چنیں',
    weatherTopics: {
      flares: {
        title: 'سورج کی چمک',
        summary: 'سورج پر اچانک اٹھنے والی تیز روشنی اور گرمی کی لہر۔',
        scientificExplain:
          'خلا میں موجود سیارچے ہر وقت اس پر نظر رکھتے ہیں۔ یہ روشنی تقریباً آٹھ منٹ میں زمین تک پہنچتی ہے۔',
        impactExplain:
          'جب یہ چمک بہت تیز ہو تو دن کے وقت لمبی دوری کے ریڈیو سگنل تھوڑی دیر کے لیے کمزور پڑ سکتے ہیں۔',
      },
      storms: {
        title: 'خلائی طوفان',
        summary: 'سورج سے آنے والے ذرات جب زمین کے حفاظتی گھیرے سے ٹکراتے ہیں۔',
        scientificExplain:
          'اسے صفر سے پانچ تک ناپا جاتا ہے۔ جب سورج کی لہر زمین سے زور سے ٹکرائے تو طوفان بنتا ہے۔',
        impactExplain:
          'بڑے طوفان آسمان میں رنگین روشنی بناتے ہیں اور کبھی کبھار سیارچوں یا بجلی کی تاروں پر دباؤ ڈالتے ہیں۔',
      },
      kp: {
        title: 'طوفان کا نمبر (۰ تا ۹)',
        summary: 'صفر سے نو تک ایک آسان نمبر جو بتاتا ہے کہ زمین کا ماحول کتنا ہل رہا ہے۔',
        scientificExplain:
          'پوری دنیا کے مرکز مل کر یہ نمبر نکالتے ہیں: صفر سے چار تک سب پرسکون، پانچ سے نو تک طوفان ہے۔',
        impactExplain:
          'جتنا یہ نمبر بڑا ہو، اوپر آسمان میں سگنل میں معمولی سی رکاوٹ آ سکتی ہے۔',
      },
      wind: {
        title: 'سورج کی ہوا',
        summary: 'سورج سے ہر وقت نکلنے والی تیز رفتار ہوا جس میں چھوٹے ذرات ہوتے ہیں۔',
        scientificExplain:
          'زمین سے دور خلا میں لگی مشینیں اس ہوا کو پہلے ہی دیکھ لیتی ہیں اور پندرہ سے ساٹھ منٹ پہلے بتا دیتی ہیں۔',
        impactExplain:
          'جب یہ ہوا چھ سو کلومیٹر فی سیکنڈ سے تیز چلے تو طوفان آنے کا امکان بڑھ جاتا ہے۔',
      },
      gps: {
        title: 'نقشے اور سیارچے',
        summary: 'سورج کے طوفان سے راستہ بتانے والے سگنل پر کیا اثر پڑ سکتا ہے۔',
        scientificExplain:
          'سیارچوں کے سگنل اوپر آسمان سے ہو کر آتے ہیں۔ بڑے طوفان میں وہ سگنل تھوڑے سست ہو سکتے ہیں۔',
        impactExplain:
          'عام دنوں میں موبائل کے نقشے بالکل ٹھیک چلتے ہیں، مگر بڑے طوفان میں قطبی پروازوں اور خاص مشینوں پر اثر پڑ سکتا ہے۔',
      },
    },
    weatherVisualSectionTitle: 'چھ گھنٹوں کا نقشہ اور سورج زمین کی تصویر',
    trendChartTitle: 'پچھلے چھ گھنٹوں کا گراف',
    trendChartExplain: 'نیلی لکیر سورج کی چمک اور سبز لکیر صفر سے نو تک طوفان کا نمبر دکھاتی ہے۔',
    orbitTitle: 'سورج، زمین کا گھیرا اور سیارچے',
    orbitExplain: 'تصویر دکھاتی ہے کہ سورج کی ہوا زمین کے حفاظتی گھیرے سے کیسے ٹکراتی ہے۔',
    saveSnapshotBtn: 'یہ حال محفوظ کریں',
    saveSnapshotHint: 'اس وقت کا حال اپنی محفوظ فہرست میں رکھیں',
    exportHtmlBtn: 'بغیر انٹرنیٹ کی فائل اتاریں',
    exportHtmlHint: 'ایک صفحہ اتاریں جو انٹرنیٹ کے بغیر بھی کھل جائے',
    savedSnapshotsTitle: 'آپ کی محفوظ کی ہوئی معلومات',
    noSnapshotsText: 'ابھی آپ نے کچھ محفوظ نہیں کیا۔',
    weatherSourcesHeading: 'معلومات کہاں سے آتی ہیں؟',

    alertsPageTitle: 'خطرے کی اطلاعات اور انتباہ',
    alertsPageSubtitle: 'سرکاری خلائی مرکز کی اطلاعات اور آواز میں سننے کا بٹن۔',
    alertsCurrentConditionTitle: 'ابھی کی صورتحال',
    alertsVoiceCardTitle: 'آواز میں حفاظتی اطلاع سنیں',
    alertsVoiceCardDesc: 'اس وقت کے حالات اور حفاظت کی بات آسان اردو میں سنیں۔',
    card3Action: 'آواز میں اطلاع سنیں',
    card3Stop: 'آواز بند کریں',
    alertsOfficialFeedTitle: 'سرکاری اطلاعات',
    alertsRecentLabel: 'تازہ اور حالیہ اطلاعات',
    alertsEmptyText: 'اس وقت کوئی نیا خطرہ یا انتباہ نہیں ہے۔ حالات عام ہیں۔',
    alertsIssuedLabel: 'جاری ہونے کا وقت',
    alertsGpsImpactTitle: 'راستوں اور سگنل کا حال',
    alertsGpsImpactDesc: 'یہ صرف سرکاری نمبروں کی بنیاد پر ہے، اس میں کوئی اندازے سے بنایا ہوا نمبر نہیں۔',
    alertsSavedSectionTitle: 'محفوظ کی ہوئی اطلاعات',
    saveFavoriteBtn: 'محفوظ کریں',
    savedFavoriteBadge: 'محفوظ ہو گئی',
    favoritesEmptyText: 'ابھی کوئی اطلاع محفوظ نہیں کی گئی۔ اوپر کسی بھی اطلاع کو محفوظ کریں۔',
    removeFavoriteBtn: 'ہٹائیں',
    alertsTrainingTitle: 'طوفان کی مثال دیکھیں (صرف سمجھنے کے لیے)',
    alertsTrainingDesc: 'دیکھیں کہ طوفان کے وقت اسکرین اور آواز کیسی لگتی ہے۔ یہ صرف مثال ہے، اصل موسم نہیں۔',
    alertsTrainingShowBtn: 'مثالیں کھولیں',
    alertsTrainingHideBtn: 'مثالیں چھپائیں',
    testSampleWarning: 'یہ صرف مشق کی مثال چل رہی ہے — یہ اصل خطرہ نہیں ہے۔',
    scenarioLabels: {
      nominal: 'پرسکون مثال',
      minor: 'ہلکی ہلچل کی مثال',
      strong: 'تیز طوفان کی مثال',
      extreme: 'بڑے طوفان کی مثال',
    },
    emergencySpeech: {
      nominal: (sourceDesc) =>
        `خلائی نگہبان کی تازہ خبر، ${sourceDesc} کے مطابق۔ ابھی سورج بالکل پرسکون ہے اور راستے اور سگنل محفوظ ہیں۔`,
      minor: (sourceDesc) =>
        `خلائی نگہبان کی خبر، ${sourceDesc} کے مطابق۔ آج ہلکی سی ہلچل ہے، نئی خبروں پر نظر رکھیں۔`,
      strong: (sourceDesc) =>
        `خلائی نگہبان کا انتباہ، ${sourceDesc} کے مطابق۔ اس وقت تیز طوفان چل رہا ہے؛ اہم سفر میں دوسرا راستہ بھی ذہن میں رکھیں۔`,
      extreme: (sourceDesc) =>
        `خلائی نگہبان کی ہنگامی اطلاع، ${sourceDesc} کے مطابق۔ ابھی بہت بڑا خلائی طوفان آیا ہوا ہے؛ احتیاط کریں اور سرکاری ہدایات پر عمل کریں۔`,
    },

    helperTitle: 'اے آئی سے سوال پوچھیں',
    helperSubtitle: 'آسان اردو میں لکھ کر یا بول کر پوچھیں، آپ کی باتیں یہاں محفوظ رہیں گی۔',
    helperGreeting: 'السلام علیکم! سورج کے طوفان، موبائل کے نقشوں یا اس ایپ کے بارے میں کوئی بھی آسان سوال پوچھیں۔',
    helperPlaceholder: 'اپنا سوال یہاں لکھیں...',
    helperSendBtn: 'بھیجیں',
    helperRecordStart: 'بول کر پوچھیں',
    helperRecordStop: 'مائیک بند کریں',
    helperNewChatBtn: 'نئی بات شروع کریں',
    chatListBtn: 'پرانی باتیں',
    chatCloseListBtn: 'بند کریں',
    chatSearchPlaceholder: 'پرانی باتوں میں تلاش کریں...',
    chatNoMatches: 'ایسی کوئی پرانی بات نہیں ملی۔',
    chatEmptyList: 'ابھی کوئی پرانی بات محفوظ نہیں ہے۔',
    chatModeNewBadge: 'نئی بات',
    chatModeSavedBadge: 'محفوظ',
    chatUntitledFallback: 'نیا سوال',
    chatRenameBtn: 'نام بدلیں',
    chatSaveRenameBtn: 'محفوظ',
    chatCancelBtn: 'منسوخ',
    chatDeleteBtn: 'مٹائیں',
    chatOriginalLangNote: 'اپنی اصل زبان میں محفوظ',
    chatCreatedLabel: 'شروع',
    chatLastMsgLabel: 'آخری پیغام',
    helperListenReply: 'سنیں',
    helperReplayReply: 'دوبارہ سنیں',
    helperStopReplyVoice: 'بند کریں',
    helperThinking: 'جواب تیار ہو رہا ہے...',
    helperVoiceUnsupported: 'اس موبائل یا براؤزر میں بول کر لکھنے کی سہولت نہیں چل رہی۔ نیچے لکھ کر سوال بھیجیں۔',
    offlineAiUnavailableMsg: (solar) => {
      const age = solar?.fetchedAtIso ? formatAgeForLanguage(solar.fetchedAtIso, 'ur') : '';
      return `انٹرنیٹ بند ہے اور اس موبائل میں اپنی اے آئی نہیں ہے، اس لیے ابھی نیا جواب نہیں بن سکتا۔ ${
        solar?.flareClass
          ? `پچھلی محفوظ معلومات${age ? ` (${age})` : ''} کے مطابق سورج کی چمک ${formatDigits(solar.flareClass, 'ur')} اور طوفان کا نمبر ${solar.kpIndex !== null ? formatDigits(solar.kpIndex, 'ur') : 'موجود نہیں'} تھا۔`
          : 'ابھی کوئی پچھلی معلومات بھی محفوظ نہیں ہے۔'
      }`;
    },
    offlineGuideActiveNote:
      'انٹرنیٹ بند ہے — آف لائن مقامی رہنما چالو ہے اور آپ محفوظ معلومات کی مدد سے بنیادی اردو سوالات ابھی بھی پوچھ سکتے ہیں۔',
    offlineNanoAndGuideNote:
      'انٹرنیٹ بند ہے — انگریزی کے مختصر نئے سوالات مقامی Gemini Nano پر اور بنیادی سوالات آف لائن مقامی رہنما پر چل سکتے ہیں۔',
    askAiNanoPromptNote:
      'اس Desktop Chrome میں مختصر انگریزی جوابات کے لیے Gemini Nano دستیاب ہے۔ آپ یہیں سے اسے تیار کر سکتے ہیں۔',
    networkAiUnavailableMsg:
      'ابھی اے آئی سے رابطہ نہیں ہو رہا۔ انٹرنیٹ چیک کرکے دوبارہ کوشش کریں۔',
    timeoutAiUnavailableMsg:
      'جواب آنے میں دیر ہو گئی۔ دوبارہ کوشش کریں۔',
    rateLimitAiUnavailableMsg:
      'ابھی بہت زیادہ سوال پوچھے جا رہے ہیں یا آج کی حد پوری ہو گئی ہے۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔',
    providerLabels: {
      'firebase-ai-on-device': 'ON_DEVICE — Gemini Nano',
      'firebase-ai-cloud': 'IN_CLOUD — Firebase AI Logic',
      'server-gemini': 'SERVER BACKUP — /api/gemini/chat',
      'on-device-browser': 'پرانا براؤزر مقامی موڈ',
      'offline-local-guide': 'OFFLINE LOCAL GUIDE — محفوظ مقامی معلومات',
      'offline-unavailable': 'جواب نہیں مل سکا',
    },
    starterQuestions: [
      'کیا سورج پر ابھی کوئی طوفان آیا ہوا ہے؟',
      'کیا آج موبائل کے نقشے اور راستہ بتانے والا نظام ٹھیک چلے گا؟',
      'طوفان کا نمبر ہمیں کیا بتاتا ہے؟',
      'انٹرنیٹ بند ہو جائے تو کیا کچھ کام کرے گا؟',
    ],

    settingsTitle: 'ترتیبات',
    settingsSubtitle: 'زبان، آواز، اسکرین کا رنگ یا اپنا اکاؤنٹ آسانی سے بدلیں۔',
    languageCardTitle: 'زبان',
    languageCardDesc: 'بٹن اور نئی گفتگو فوراً منتخب زبان میں بدل جائیں گی؛ پرانی باتیں اپنی زبان میں رہیں گی۔',
    voiceCardTitle: 'آواز',
    voiceCardDesc: 'بولنے والی آواز چالو یا بند کریں اور بولنے کی رفتار چنیں۔',
    speedSlow: 'آہستہ',
    speedNormal: 'درمیانی',
    speedFast: 'تیز',
    alertsDisplaySectionTitle: 'اسکرین اور لکھائی',
    alertsDisplaySectionDesc: 'اسکرین کا رنگ گہرا یا روشن رکھیں اور لکھائی کا سائز بڑا کریں۔',
    themeLabel: 'اسکرین',
    textSizeLabel: 'لکھائی',
    textSizeNormal: 'عام',
    textSizeLarge: 'بڑی',
    accountCardTitle: 'آپ کا اکاؤنٹ',
    accountSignedOutDesc: 'اپنی باتیں اور محفوظ اطلاعات بچا کر رکھنے کے لیے گوگل سے لاگ ان کریں۔',
    accountSignedInDesc: (email) => `آپ اس ای میل سے داخل ہیں: ${email}۔ آپ کی باتیں خود بخود محفوظ رہیں گی۔`,
    accountSignInBtn: 'گوگل سے داخل ہوں',
    accountSignOutBtn: 'باہر نکلیں',
    accountErrorMsg: 'داخلہ نہیں ہو سکا۔ پاپ اپ اجازت چیک کرکے دوبارہ کوشش کریں۔',
    privacyCardTitle: 'اس موبائل میں محفوظ ڈیٹا',
    privacyCardDesc: 'طے کریں کہ باتیں اس موبائل میں محفوظ رہیں یا مٹا دی جائیں۔',
    saveConsentLabel: 'خود بخود محفوظ کریں',
    toggleOn: 'چالو',
    toggleOff: 'بند',
    clearSavedDataBtn: 'محفوظ ڈیٹا صاف کریں',
    aiOfflineSectionTitle: 'ہائبرڈ اے آئی اور انٹرنیٹ',
    aiOfflineSectionDesc: 'دیکھیں کہ کمپیوٹر اور موبائل پر مقامی و آن لائن اے آئی کیسے کام کرتی ہے۔',
    aiOnlineExplain: 'انگریزی کے مختصر نئے سوال میں دستیاب ہونے پر Gemini Nano (مقامی) اور ورنہ Firebase AI Logic Cloud چلتا ہے۔ اردو، ہندی، تیلگو، کنڑ اور طویل یا جاری گفتگو ہمیشہ آن لائن کلاؤڈ سے چلتی ہے۔',
    aiLocalExplain: 'Chrome کا Prompt API (Gemini Nano) صرف منتخب Desktop Chrome پر کام کرتا ہے، Android موبائل Chrome پر ابھی دستیاب نہیں۔ انٹرنیٹ بند ہونے پر آف لائن مقامی رہنما محفوظ معلومات سے سچے اور بنیادی جواب دیتا ہے۔',
    card2CheckBtn: 'Gemini Nano جانچیں',
    prepareDeviceModelBtn: 'Gemini Nano تیار / ڈاؤن لوڈ کریں',
    preparingDeviceModelBtn: 'Gemini Nano تیار ہو رہا ہے...',
    deviceModelProgressLabel: (percent) => `ڈاؤن لوڈ پیش رفت: ${formatDigits(percent, 'ur')}%`,
    deviceModelReadyNotice: 'اس Desktop Chrome میں Gemini Nano انگریزی کے مختصر سوالات کے لیے تیار ہے۔',
    deviceModelUnsupportedNotice: 'اس موبائل یا براؤزر میں Chrome Prompt API (Gemini Nano) دستیاب نہیں ہے۔ یہ سہولت فی الحال صرف منتخب Desktop Chrome پر کام کرتی ہے۔ اردو آن لائن اے آئی اور آف لائن مقامی رہنما بدستور کام کر رہے ہیں۔',
    deviceModelIncompleteNotice: 'تیاری کا عمل مکمل ہوا لیکن Gemini Nano ابھی تیار حالت میں نہیں آیا۔ Desktop Chrome کی ضروری سیٹنگز یا جگہ چیک کرکے دوبارہ کوشش کریں۔',
    deviceModelErrorNotice: (detail) =>
      `Gemini Nano تیار نہیں ہو سکا${detail ? `: ${detail}` : '۔'}`,
    card2SimulateBtn: 'بغیر انٹرنیٹ حالت آزمائیں',
    card2SimulateActive: 'بغیر انٹرنیٹ حالت چالو ہے',
    localModelLabels: {
      available: 'Desktop Chrome میں Gemini Nano تیار ہے (مختصر انگریزی سوالات)',
      downloadable: 'Gemini Nano یہاں دستیاب ہے — ڈاؤن لوڈ کے لیے بٹن دبائیں',
      unsupported: 'اس موبائل یا براؤزر میں Gemini Nano دستیاب نہیں (صرف Desktop Chrome)',
    },
    hybridPreferLocalBtn: 'پہلے مقامی Gemini Nano آزمائیں (مختصر انگریزی)',
    hybridPreferCloudBtn: 'پہلے آن لائن اے آئی آزمائیں',
    techDetailsShowBtn: 'مزید تکنیکی معلومات',
    techDetailsHideBtn: 'تکنیکی معلومات چھپائیں',
    appCheckActiveText: 'ایپ کی اضافی حفاظت چالو ہے۔',
    appCheckPendingText: 'اضافی حفاظتی کلید ابھی کنسول میں شامل نہیں کی گئی۔',
    sourcesTitle: 'معلومات کے اصل ذرائع',
    sourcesNoaaTitle: 'قومی خلائی موسمی مرکز',
    sourcesNoaaDesc: 'سورج کی چمک، طوفان کے نمبر، سورج کی ہوا اور انتباہات۔',
    sourcesNasaTitle: 'طوفان ناپنے کے پیمانے',
    sourcesNasaDesc: 'ہلکے، تیز اور بڑے طوفان کو سمجھنے کے سرکاری چارٹ۔',
    consoleTodoTitle: 'منتظم کے لیے باقی کام',
    consoleTodoItems: [
      'فائربیس میں گوگل سے داخلہ چالو کریں۔',
      'فائربیس کنسول میں اے آئی کی خدمت چالو کریں۔',
      'حفاظتی کلید کنسول میں شامل کریں۔',
    ],

    noaaAgencyName: 'امریکی قومی خلائی موسمی مرکز (سرکاری ادارہ)',
    observedAtLabel: 'پیمائش کا وقت',
    cachedAgePrefix: 'معلومات کی عمر',
    flarePlainMeaning: (flareClass) => {
      if (!flareClass) return 'اس وقت سورج کی چمک کا نمبر موجود نہیں ہے۔';
      const prefix = flareClass.charAt(0).toUpperCase();
      if (prefix === 'X') return 'بہت بڑی چمک — دن کے وقت ریڈیو سگنل بند ہو سکتے ہیں۔';
      if (prefix === 'M') return 'درمیانی چمک — ریڈیو سگنل تھوڑی دیر کے لیے کمزور ہو سکتے ہیں۔';
      if (prefix === 'C') return 'ہلکی اور عام چمک — روزمرہ زندگی، موبائل اور نقشوں کے لیے بالکل محفوظ۔';
      return 'بہت ہی ہلکی چمک — سورج اس وقت بالکل پرسکون ہے۔';
    },
    kpPlainMeaning: (kp) => {
      if (kp === null) return 'مقناطیسی طوفان کا نمبر ابھی موجود نہیں ہے۔';
      if (kp >= 9) return 'پانچواں آخری درجہ (نمبر ۹) — بہت بڑا خلائی طوفان چل رہا ہے۔';
      if (kp >= 8) return 'چوتھا درجہ (نمبر ۸) — شدید طوفان چل رہا ہے۔';
      if (kp >= 7) return 'تیسرا درجہ (نمبر ۷) — تیز طوفان چل رہا ہے۔';
      if (kp >= 6) return 'دوسرا درجہ (نمبر ۶) — درمیانے درجے کا طوفان چل رہا ہے۔';
      if (kp >= 5) return 'پہلا درجہ (نمبر ۵ سے طوفان شروع ہوتا ہے) — ہلکا طوفان ہے۔';
      if (kp >= 4) return 'ہلکی ہلچل (نمبر ۴ طوفان نہیں ہے؛ ہلکا طوفان نمبر ۵ سے شروع ہوتا ہے)۔';
      return `بالکل پرسکون ماحول (نمبر ${localizeDigits(kp, 'ur')} پانچ سے کم ہے، یعنی ابھی کوئی طوفان نہیں)۔`;
    },
    windPlainMeaning: (speed) => {
      if (speed === null) return 'سورج کی ہوا کی تازہ رفتار ابھی دستیاب نہیں ہے۔';
      if (speed >= 650) return 'بہت تیز ہوا — اس سے زمین کے گرد طوفان کا امکان بڑھ جاتا ہے۔';
      if (speed >= 480) return 'تھوڑی تیز ہوا — ہلکی ہلچل پیدا ہو سکتی ہے۔';
      return 'عام رفتار (تین سو سے ساڑھے چار سو کلومیٹر فی سیکنڈ بالکل عام ہے)۔';
    },
    gpsPlainScaleNote: (level) => {
      if (level === 'extreme' || level === 'strong') {
        return 'تیز طوفان میں اوپر سے آنے والے سیارچوں کے سگنل متاثر ہو سکتے ہیں، خاص طور پر قطبی پروازوں اور خاص مشینوں میں۔';
      }
      if (level === 'minor') {
        return 'ہلکی ہلچل زیادہ تر قطبی علاقوں میں اثر دکھاتی ہے؛ عام موبائل نقشے ٹھیک چلتے ہیں۔';
      }
      return 'اوپری آسمان بالکل پرسکون ہے — موبائل کے نقشے، راستے اور سگنل عام طرح کام کر رہے ہیں۔';
    },
    feedDiscrepancyTitle: 'موجودہ نمبر اور انتباہ میں فرق کیوں ہے؟',
    feedDiscrepancyExplain: {
      'warning-higher-than-live': (liveKp, warningKp) =>
        `اس وقت تازہ پیمائش پرسکون ہے (طوفان کا نمبر ${liveKp}، یعنی کوئی طوفان نہیں)، مگر سرکاری مرکز کی ایک کھلی پیشگی تنبیہ ابھی بھی چل رہی ہے جس میں مقررہ وقت کے دوران نمبر ${warningKp ?? localizeDigits(4, 'ur')} تک جانے کا امکان بتایا گیا ہے۔ تازہ نمبر ابھی کے ایک منٹ کا حال ہے جبکہ تنبیہ کئی گھنٹوں کے لیے ہوتی ہے۔`,
      'forecast-higher-than-live': (liveKp, _wKp, forecastG) =>
        `اس لمحے کی تازہ پیمائش پرسکون ہے (نمبر ${liveKp})، جبکہ آج کے پورے دن کی پیشگوئی میں بعد میں ${forecastG ? 'ہلکے طوفان' : 'ہلکی ہلچل'} کا امکان درج ہے۔ پیشگوئی پورے دن کے لیے ہوتی ہے اور تازہ نمبر ابھی کے وقت کا۔`,
      'partial-feed': () =>
        'اس وقت خلائی مرکز کی ایک لائن نے جواب نہیں دیا، اس لیے صرف تصدیق شدہ دستیاب نمبر دکھائے جا رہے ہیں۔',
      none: () => '',
    },
    forecastSectionTitle: 'آنے والے تین دن کی پیشگوئی اور کل کا حال',
    forecastSectionSubtitle: 'سرکاری مرکز کی ۲۴ گھنٹے کی پیشگوئی، موجودہ لمحے کی پیمائش سے الگ دکھائی گئی ہے۔',
    forecastDayLabels: { today: 'آج', tomorrow: 'کل', dayAfter: 'پرسوں' },
    forecastStormScaleLabel: 'طوفان کی پیشگوئی',
    forecastRadioChanceLabel: 'ریڈیو چمک کا امکان',
    forecastRadiationChanceLabel: 'ذراتی طوفان کا امکان',
    forecastNoStormText: 'پرسکون (طوفان کی توقع نہیں)',
    yesterdayPeakLabel: 'کل کا سب سے بلند سرکاری درجہ',
    alertCategoryLabels: {
      warning: 'انتباہ',
      watch: 'پیشگی نظر',
      alert: 'جاری اطلاع',
      summary: 'خلاصہ',
    },
    alertTimingLabels: {
      activeWindow: 'اس وقت نافذ',
      continuing: 'جاری سلسلہ',
      completed: 'وقت ختم',
      notice: 'سرکاری پیغام',
    },
    alertAgencyLabel: 'جاری کرنے والا ادارہ',
    alertValidFromLabel: 'شروع وقت',
    alertValidToLabel: 'اختتامی وقت',
    alertBeginTimeLabel: 'آغاز',
    alertImpactsLabel: 'روزمرہ زندگی پر اثر',
    localizedAlertContent: (alert) => {
      const code = alert.noticeCode ?? 'OTHER';
      switch (code) {
        case 'K04W':
          return {
            title: 'انتباہ: زمین کے گرد مقناطیسی ہلچل نمبر ۴ تک جانے کا امکان',
            summary:
              'سرکاری خلائی مرکز کا اندازہ ہے کہ دیے گئے وقت میں مقناطیسی نمبر ۴ تک پہنچ سکتا ہے۔ یاد رکھیں: نمبر ۴ صرف ہلچل ہے، یہ پہلا طوفانی درجہ نہیں (طوفان نمبر ۵ سے شروع ہوتا ہے)۔',
            impact:
              'عام صارفین کے موبائل اور نقشے بالکل ٹھیک چلیں گے۔ صرف قطبی علاقوں میں ہلکی رنگین روشنی اور بجلی کی تاروں میں معمولی لرزش آ سکتی ہے۔',
          };
        case 'K05W':
        case 'K06W':
        case 'K07W': {
          const kpStr = localizeDigits(alert.kpThreshold ?? 5, 'ur');
          return {
            title: `انتباہ: خلائی طوفان کا امکان (نمبر ${kpStr})`,
            summary: `سرکاری مرکز نے نیچے دیے گئے وقت کے دوران مقناطیسی طوفان کے نمبر ${kpStr} تک پہنچنے کا انتباہ دیا ہے۔`,
            impact:
              'اوپری علاقوں میں رنگین روشنی، سیارچوں کے کام میں معمولی دباؤ اور لمبی بجلی کی تاروں پر ہلکا اثر ممکن ہے۔',
          };
        }
        case 'K04A':
        case 'K05A':
        case 'K06A':
        case 'K07A': {
          const kpVal = alert.kpThreshold ?? 4;
          const kpStr = localizeDigits(kpVal, 'ur');
          return {
            title: `موجودہ اطلاع: مقناطیسی نمبر ${kpStr} تک پہنچ گیا`,
            summary: `زمینی رصد گاہوں نے مقناطیسی نمبر ${kpStr} ریکارڈ کیا ہے۔`,
            impact:
              kpVal >= 5
                ? 'قطبی پروازوں، ریڈیو اور خاص پیمائش والے آلات پر ہلکا اثر پڑ سکتا ہے؛ عام فون عموماً محفوظ رہتے ہیں۔'
                : 'روزمرہ زندگی پر کوئی خاص اثر نہیں؛ صرف قطب کے قریب آسمان میں روشنی دکھ سکتی ہے۔',
          };
        }
        case 'EF3A': {
          const peakText = alert.electronPeakPfu
            ? ` کل زیادہ سے زیادہ مقدار ${localizeDigits(alert.electronPeakPfu, 'ur')} ریکارڈ ہوئی۔`
            : '';
          return {
            title: 'جاری اطلاع: خلائی سیارچوں کے اردگرد تیز الیکٹران ذرات',
            summary: `اونچائی پر موجود سیارچوں کے مدار میں تیز توانائی والے ذرات کی تعداد مقررہ حد سے زیادہ چل رہی ہے۔${peakText}`,
            impact:
              'زمین پر عام لوگوں، موبائل نقشوں اور انٹرنیٹ پر کوئی خطرہ نہیں۔ سیارچے چلانے والے ادارے احتیاطی نگرانی کرتے ہیں۔',
          };
        }
        case 'WATA_G1':
        case 'WATA_G2':
        case 'WATA_G3': {
          const lvl = alert.gScaleTarget?.replace('G', '') ?? '1';
          return {
            title: `پیشگی اطلاع: درجہ ${localizeDigits(lvl, 'ur')} کے خلائی طوفان کا امکان`,
            summary: `سرکاری مرکز نے آنے والے دنوں کے لیے درجہ ${localizeDigits(lvl, 'ur')} کے ممکنہ خلائی طوفان کی پیشگی اطلاع دی ہے۔`,
            impact:
              'عام فون اور نقشے عام طور پر چلتے رہتے ہیں؛ شمالی علاقوں میں آسمان روشن ہو سکتا ہے اور سیارچوں پر ہلکا اثر ممکن ہے۔',
          };
        }
        case 'PROTON_WARN':
        case 'PROTON_ALERT':
          return {
            title: 'ذراتی تابکاری کی اطلاع (سیارچے اور قطبی پروازیں)',
            summary: 'بلند قطبی راستوں کے قریب سورج سے آنے والے تیز ذرات ریکارڈ یا متوقع ہیں۔',
            impact: 'یہ زیادہ تر اونچی قطبی پروازوں اور سیارچوں سے متعلق ہے؛ زمین پر عام صارفین محفوظ ہیں۔',
          };
        case 'FLARE_SUM':
          return {
            title: 'سورج کی حالیہ چمک کا سرکاری خلاصہ',
            summary: 'خلائی موسمی سیارچوں نے سورج کی ایک تیز چمک ریکارڈ کی ہے۔',
            impact: 'بڑی چمک سے دن کے حصے میں ریڈیو سگنل تھوڑی دیر کمزور ہو سکتے ہیں؛ موبائل نقشے عام رہتے ہیں۔',
          };
        default:
          return {
            title: 'سرکاری خلائی موسمی اطلاع',
            summary: 'امریکی قومی خلائی موسمی مرکز کی جانب سے تازہ سرکاری پیغام جاری کیا گیا ہے۔ تفصیل اصل سرکاری لنک پر دیکھیں۔',
            impact: 'مکمل تفصیل کے لیے نیچے دیے گئے سرکاری لنک کو کھولیں۔',
          };
      }
    },
    chartLegendFlare: 'نیلی لکیر: سورج کی چمک کی طاقت',
    chartLegendKp: 'سبز ٹوٹی لکیر: طوفان کا نمبر (۰ تا ۹)',
    chartAxisStrong: 'بہت تیز',
    chartAxisMedium: 'درمیانی',
    chartAxisQuiet: 'پرسکون',
    aiOfficialSourcePromptLabel: 'تصدیق کے سرکاری لنک:',

    welcomeEnglishSubtitle: 'Space Sentinel Hybrid AI',
    welcomeChooseHeading: 'آپ کس طریقے سے استعمال کرنا چاہتے ہیں؟',
    modeEasyOptionLetter: 'A',
    modeEasyTitle: 'آسان استعمال',
    modeEasySubtitle: 'بڑے نمبر والے بٹن، بہت آسان اردو اور آواز میں رہنمائی کے لیے۔',
    modeEasyBadge: 'ابتدائی صارفین اور آواز کے لیے بہترین',
    modeFullOptionLetter: 'B',
    modeFullTitle: 'مکمل معلومات',
    modeFullSubtitle: 'گراف، سائنسی تفصیل، سرکاری انتباہات اور مکمل اے آئی فیچرز کے لیے۔',
    modeFullBadge: 'گراف اور تفصیلی معلومات',
    switchToEasyBtn: 'آسان استعمال',
    switchToFullBtn: 'مکمل معلومات',
    backToChoiceBtn: 'طریقہ بدلیں',
    easyPageTitle: 'آسان خلائی مینو',
    easyPageSubtitle: 'نیچے کسی بھی بڑے بٹن کو دبائیں، یا بول کر ۱ سے ۶ تک نمبر بتائیں۔',
    easyBackBtn: 'واپس',
    easyListenBtn: 'سنیں',
    easyStopBtn: 'آواز بند کریں',
    easyGuideVoiceBtn: 'بٹنوں کی آواز میں رہنمائی سنیں',
    easyGuideVoiceScript:
      'آج کا خلائی موسم جاننے کے لیے ایک دبائیں۔ سورج کی حالت جاننے کے لیے دو دبائیں۔ زمین اور موبائل پر اثرات جاننے کے لیے تین دبائیں۔ خطرے کی وارننگ کے لیے چار دبائیں۔ تمام معلومات آواز میں سننے کے لیے پانچ دبائیں۔ اے آئی سے سوال پوچھنے کے لیے چھ دبائیں۔',
    easyVoiceCmdBtn: 'بول کر نمبر بتائیں (۱ تا ۶)',
    easyVoiceCmdListening: 'سن رہے ہیں... بولیں "ایک دبائیں" یا "آج کا موسم بتائیں"',
    easyVoiceCmdHint: 'ہر فیچر ہاتھ سے دبا کر چلتا ہے؛ چاہیں تو بول کر "ایک دبائیں" یا "آج کا موسم بتائیں" بھی کہہ سکتے ہیں۔',
    easyVoiceCmdNotUnderstood: 'نمبر سمجھ نہیں آیا۔ براہِ کرم ۱ سے ۶ تک کوئی بٹن ہاتھ سے دبائیں۔',
    easyVoiceCmdMatched: (num, title) => `نمبر ${num} کھل رہا ہے: ${title}`,
    easyMenuItems: {
      today: {
        title: 'آج کا خلائی موسم',
        shortDesc: 'فوراً جانیں کہ آج خلا اور آسمان پرسکون ہیں یا طوفان آیا ہے۔',
      },
      sun: {
        title: 'سورج کی حالت',
        shortDesc: 'آسان لفظوں میں جانیں کہ سورج کی چمک اور ہوا کیسی چل رہی ہے۔',
      },
      earth: {
        title: 'زمین پر اثرات',
        shortDesc: 'جانیں کہ موبائل فون، نقشے، ریڈیو اور بجلی محفوظ ہیں یا نہیں۔',
      },
      warnings: {
        title: 'خطرے کی وارننگ',
        shortDesc: 'دیکھیں کہ سرکاری مرکز کی طرف سے کوئی خطرہ یا انتباہ تو نہیں۔',
      },
      'all-voice': {
        title: 'تمام معلومات آواز میں سنیں',
        shortDesc: 'آج کی پوری خبر آسان اردو میں آواز کے ساتھ سنیں۔',
      },
      ai: {
        title: 'AI سے سوال پوچھیں',
        shortDesc: 'لکھے بغیر بٹن دبا کر یا بول کر آسان اردو میں سوال پوچھیں۔',
      },
    },
    easyAiHeading: 'آسان سوال پوچھیں',
    easyAiSubheading: 'لکھنے کی ضرورت نہیں — نیچے کسی بھی سوال پر ہاتھ لگائیں یا بول کر پوچھیں۔',
    easyAiQuickPrompts: [
      'کیا آج موبائل کے نقشے اور سگنل محفوظ ہیں؟',
      'کیا ابھی سورج پر کوئی طوفان آیا ہوا ہے؟',
      'کیا کل کوئی خطرہ ہو سکتا ہے؟',
    ],
    easyAiVoiceAskBtn: 'دبائیں اور بول کر سوال پوچھیں',
    easyAllVoiceTitle: 'آج کی تمام معلومات کا خلاصہ',
    easyAllVoiceSub: 'سننے کے لیے نیچے "سنیں" کا بٹن دبائیں، یا یہاں آسان اردو میں پڑھیں۔',
    easyNoWarningsTitle: 'کوئی خطرے کی وارننگ نہیں ہے',
    easyNoWarningsBody: 'اس وقت حالات بالکل عام ہیں اور سرکاری مرکز کی طرف سے کوئی خطرے کی وارننگ جاری نہیں ہے۔',
    easyWarningsCountBody: (count) => `اس وقت سرکاری مرکز کی ${count} حالیہ اطلاعات موجود ہیں جن کا آسان مطلب نیچے لکھا ہے۔`,
    easyEarthCalmDetails: [
      'موبائل فون، انٹرنیٹ اور راستہ بتانے والے نقشے بالکل عام طرح کام کر رہے ہیں۔',
      'ہوائی جہاز، بحری سفر اور بجلی کی تاروں کے لیے آج کوئی خلائی خطرہ نہیں ہے۔',
    ],
    easyEarthMinorDetails: [
      'روزمرہ کے موبائل فون اور نقشے بالکل ٹھیک کام کرتے رہیں گے۔',
      'ہلکی ہلچل صرف زمین کے بہت دور شمالی قطبی علاقوں میں اثر دکھاتی ہے۔',
    ],
    easyEarthStrongDetails: [
      'دور دراز کے ریڈیو اور قطب کے اوپر اڑنے والے جہازوں کے سگنل میں رکاوٹ آ سکتی ہے۔',
      'زمین پر عام موبائل فون عموماً محفوظ رہتے ہیں؛ سرکاری ہدایات کا خیال رکھیں۔',
    ],
    easySunFlareLabel: 'سورج کی چمک کا درجہ',
    easySunWindLabel: 'سورج کی ہوا کی رفتار',
    easyTodayKpLabel: 'طوفان کا نمبر (۰ تا ۹)',
    easyForecastTomorrowPrefix: 'کل کا امکان',
  },

  hi: {
    brandName: 'अंतरिक्ष साथी',
    brandSubtitle: 'सूरज और सिग्नल की आसान जानकारी',
    welcomeIntroBtn: 'परिचय',

    welcomeTagline:
      'सूरज पर आने वाले तूफ़ान, फ़ोन के नक़्शों की सुरक्षा और पाँच भाषाओं में आसान आवाज़ व सवाल-जवाब।',
    welcomeWhatTitle: 'यह वेबसाइट क्या करती है?',
    welcomeWhatDesc:
      'यह सरकारी अंतरिक्ष केंद्र से ताज़ा जानकारी लाती है, आसान शब्दों में बताती है कि सूरज शांत है या तूफ़ान आया है, और आपके सवालों का जवाब देती है।',
    welcomeWhyTitle: 'यह जानना क्यों ज़रूरी है?',
    welcomeWhyDesc:
      'सूरज के बड़े तूफ़ान रेडियो, हवाई जहाज़, फ़ोन के रास्ता बताने वाले नक़्शों और बिजली पर असर डाल सकते हैं। पहले से पता हो तो सावधानी आसान हो जाती है।',
    enterCenterBtn: 'मुख्य पेज खोलें',
    enterCenterHint: 'अभी का हाल देखें और सवाल पूछें',
    listenIntroBtn: 'आवाज़ में सुनें',
    stopVoiceBtn: 'आवाज़ रोकें',
    voiceLoadingBtn: 'आवाज़ आ रही है...',
    introSpeech:
      'अंतरिक्ष साथी में आपका स्वागत है। यहाँ आप देख सकते हैं कि सूरज पर कोई तूफ़ान है या नहीं, रास्ता बताने वाले नक़्शे ठीक काम कर रहे हैं या नहीं, और आप हिन्दी में सवाल भी पूछ सकते हैं।',
    voiceUnavailableNotice: 'इस फ़ोन में हिन्दी बोलने की आवाज़ नहीं मिल रही। आप जवाब पढ़ सकते हैं।',
    voiceOfflineUnavailableNotice: 'इंटरनेट बंद है और इस फ़ोन में हिन्दी की आवाज़ नहीं है। आप जवाब पढ़ सकते हैं।',
    voiceAvailableBadge: 'इस फ़ोन में हिन्दी की आवाज़ मौजूद है',
    voiceOnlineAvailableBadge: 'इंटरनेट चालू होने पर हिन्दी आवाज़ ऑनलाइन चलेगी',

    navHome: 'होम',
    navWeather: 'सूरज मौसम',
    navHelper: 'सवाल पूछें',
    navAlerts: 'चेतावनी',
    navSettings: 'सेटिंग्स',

    headerLanguageLabel: 'भाषा',
    headerThemeLight: 'उजाला',
    headerThemeDark: 'गहरा',
    headerVoiceOn: 'आवाज़ चालू',
    headerVoiceMuted: 'आवाज़ बंद',
    refreshBtn: 'फिर से देखें',
    refreshBtnHint: 'अभी ताज़ा जानकारी मँगाएँ',
    refreshingBtn: 'देख रहे हैं...',
    retryBtn: 'फिर से कोशिश करें',
    dismissBtn: 'बंद करें',
    offlineBanner: 'इंटरनेट बंद है या जुड़ा नहीं है। पिछली बची हुई जानकारी दिखा रहे हैं।',
    connectionRestoredBanner: 'इंटरनेट वापस आ गया है। ताज़ा जानकारी मिल गई है।',
    fetchErrorNotice: 'अभी नई जानकारी नहीं मिल सकी। हम आपको पिछली जानकारी दिखा रहे हैं।',
    noaaCacheBanner: 'अभी नई जानकारी नहीं मिल सकी। हम आपको पिछली जानकारी दिखा रहे हैं।',
    noaaNoCacheBanner: 'अभी जानकारी नहीं मिल सकी। थोड़ी देर बाद फिर कोशिश करें।',
    cachedDataTimePrefix: 'आख़िरी जानकारी: ',
    notAvailableShort: 'उपलब्ध नहीं',
    expandDetailsBtn: 'और जानें',
    hideDetailsBtn: 'कम दिखाएँ',
    officialSourceLinkLabel: 'सरकारी अंतरिक्ष मौसम केंद्र',
    returnLiveBtn: 'ताज़ा हाल पर वापस जाएँ',

    dashPageTitle: 'आज का अंतरिक्ष मौसम',
    dashStatusHeading: 'अभी सूरज का हाल',
    dashRiskHeading: 'सुरक्षा जाँच',
    dashRiskTrustworthyHint: 'सीधे सरकारी अंतरिक्ष केंद्र के ताज़ा आँकड़ों पर आधारित',
    dashRiskUnavailableText: 'अभी ताज़ा जानकारी नहीं आई है। इंटरनेट देखकर फिर कोशिश करें।',
    dashAskAiBtn: 'एआई से पूछें',
    dashAskAiHint: 'आसान हिन्दी में लिखकर या बोलकर कोई भी सवाल पूछें',
    dashViewAlertsBtn: 'चेतावनी देखें',
    dashOpenWeatherBtn: 'सूरज और तूफ़ान को समझें',
    dashSolarActivityTitle: 'सूरज की चमक का स्तर',
    dashSolarActivityBrief: 'दिखाता है कि सूरज से निकलने वाली तेज़ रोशनी कितनी हल्की या तेज़ है।',
    dashSolarActivityDetail:
      'हल्की चमक सामान्य बात है। बहुत तेज़ चमक होने पर दिन के हिस्से में रेडियो सिग्नल थोड़ी देर कमज़ोर हो सकते हैं।',
    dashKpTitle: 'धरती का सुरक्षा घेरा',
    dashKpBrief: 'शून्य से नौ तक बताता है कि धरती का चुंबकीय घेरा कितना शांत या हिला हुआ है।',
    dashKpDetail:
      'पाँच से कम नंबर बिल्कुल सामान्य हैं। पाँच या उससे ज़्यादा का मतलब है कि तूफ़ान चल रहा है।',
    dashWindTitle: 'सूरज की हवा की रफ़्तार',
    dashWindBrief: 'सूरज से आने वाली तेज़ हवा कितनी तेज़ी से धरती की तरफ़ आ रही है।',
    dashWindDetail:
      'आम तौर पर रफ़्तार तीन सौ से साढ़े चार सौ किमी प्रति सेकंड होती है। छह सौ से ऊपर जाने पर तूफ़ान की संभावना बढ़ती है।',
    dashDensityLabel: 'कणों का घनत्व',
    dashGpsTitle: 'रास्ते और सिग्नल का हाल',
    dashGpsBrief: 'बताता है कि आज फ़ोन के नक़्शों और सिग्नल पर कोई असर पड़ सकता है या नहीं।',
    dashGpsDetail:
      'सरकारी केंद्र आपके घर के ठीक मीटर की ग़लती नहीं नापता; यह सलाह विश्व स्तर के तूफ़ान नंबरों पर आधारित है।',
    dashChartHeading: 'पिछले छह घंटों का बदलाव',
    dashChartSub: 'पिछले घंटों का हाल देखने के लिए लाइन पर उँगली या माउस रखें।',
    dashProvenanceHeading: 'जानकारी का समय और स्रोत',

    summarySunTitle: 'सूरज की चमक',
    summaryStormTitle: 'तूफ़ान नंबर',
    summaryGpsTitle: 'सिग्नल सलाह',
    solarWindTitle: 'सूरज की हवा',
    summaryUpdatedTitle: 'आख़िरी समय',
    summarySourceTitle: 'स्रोत',
    gpsMeasuredNote: 'यहाँ स्थानीय मीटर ग़लती नहीं नापी जाती; स्थिति सरकारी तूफ़ान पैमाने पर आधारित है।',
    sampleGpsNote: (drift, lock) => `केवल सीखने का उदाहरण (असली नहीं): ±${drift} मीटर, ${lock}% जुड़ाव`,
    sourceStatus: {
      'live-noaa': 'ताज़ा सरकारी जानकारी',
      'offline-cache': 'पिछली बची जानकारी',
      simulated: 'सीखने का उदाहरण (असली नहीं)',
    },
    severityLabels: {
      nominal: 'बिल्कुल ठीक और शांत',
      minor: 'हल्की सी हलचल',
      strong: 'तेज़ तूफ़ान आया है',
      extreme: 'बहुत बड़ा तूफ़ान',
    },
    severityDescriptions: {
      nominal: 'सूरज और धरती का माहौल शांत है। फ़ोन के नक़्शे और सिग्नल आराम से काम कर रहे हैं।',
      minor: 'हल्की सी हलचल देखी गई है। रोज़मर्रा के फ़ोन और नक़्शे ठीक चलते रहेंगे।',
      strong: 'सूरज का तेज़ तूफ़ान चल रहा है। हवाई रास्तों और ज़रूरी रेडियो कामों में सावधानी रखें।',
      extreme: 'अभी बहुत बड़ा अंतरिक्ष तूफ़ान आया हुआ है। सरकारी सलाह का ध्यान रखें।',
    },
    unitMeters: 'मीटर',
    unitKmSec: 'किमी/सेकंड',
    unitProtonDensity: 'कण/घन सेमी',
    unitPercent: '%',

    weatherPageTitle: 'सूरज और तूफ़ान को आसानी से समझें',
    weatherPageSubtitle: 'नीचे किसी भी बटन को दबाएँ और आसान भाषा में समझें।',
    weatherTopicSelectorLabel: 'विषय चुनें',
    weatherTopics: {
      flares: {
        title: 'सूरज की चमक',
        summary: 'सूरज से अचानक निकलने वाली तेज़ रोशनी और ऊर्जा की लहर।',
        scientificExplain:
          'अंतरिक्ष में लगे उपग्रह इस पर लगातार नज़र रखते हैं। यह रोशनी लगभग आठ मिनट में धरती तक पहुँचती है।',
        impactExplain:
          'बहुत तेज़ चमक होने पर दिन वाले हिस्से में दूर के रेडियो सिग्नल थोड़ी देर कमज़ोर हो सकते हैं।',
      },
      storms: {
        title: 'अंतरिक्ष तूफ़ान',
        summary: 'सूरज से आने वाले कण जब धरती के सुरक्षा घेरे से टकराते हैं।',
        scientificExplain:
          'इसे शून्य से पाँच तक नापा जाता है। जब सूरज की लहर धरती से ज़ोर से टकराती है तो तूफ़ान बनता है।',
        impactExplain:
          'बड़े तूफ़ानों से आसमान में रंगीन रोशनी दिखती है और उपग्रहों या बिजली की लाइनों पर दबाव बढ़ सकता है।',
      },
      kp: {
        title: 'तूफ़ान नंबर (० से ९)',
        summary: 'शून्य से नौ तक का आसान नंबर जो बताता है धरती का माहौल कितना हिल रहा है।',
        scientificExplain:
          'दुनिया भर के केंद्र मिलकर यह नंबर निकालते हैं: शून्य से चार तक शांत, पाँच से नौ तक तूफ़ान होता है।',
        impactExplain:
          'नंबर जितना ज़्यादा होगा, ऊपर आसमान में सिग्नल के रास्ते में हल्की रुकावट आ सकती है।',
      },
      wind: {
        title: 'सूरज की हवा',
        summary: 'सूरज से लगातार बहने वाली तेज़ हवा जिसमें छोटे-छोटे कण होते हैं।',
        scientificExplain:
          'धरती से दूर अंतरिक्ष में लगी मशीनें इसे पहले देख लेती हैं और पंद्रह से साठ मिनट पहले खबर दे देती हैं।',
        impactExplain:
          'जब यह हवा छह सौ किमी प्रति सेकंड से तेज़ हो जाए तो तूफ़ान की संभावना बढ़ जाती है।',
      },
      gps: {
        title: 'नक़्शे और उपग्रह',
        summary: 'सूरज के तूफ़ान से रास्ता बताने वाले सिग्नल पर क्या असर पड़ सकता है।',
        scientificExplain:
          'उपग्रहों के सिग्नल ऊपरी हवा से होकर आते हैं। बड़े तूफ़ान में ये सिग्नल थोड़े धीमे हो सकते हैं।',
        impactExplain:
          'सामान्य दिनों में फ़ोन के नक़्शे ठीक चलते हैं, लेकिन बड़े तूफ़ान में ध्रुवीय उड़ानों और ख़ास मशीनों पर असर पड़ सकता है।',
      },
    },
    weatherVisualSectionTitle: 'छह घंटों का ग्राफ़ और सूरज-धरती चित्र',
    trendChartTitle: 'पिछले छह घंटों का ग्राफ़',
    trendChartExplain: 'नीली लाइन सूरज की चमक और हरी लाइन शून्य से नौ तक तूफ़ान नंबर दिखाती है।',
    orbitTitle: 'सूरज, धरती का घेरा और उपग्रह',
    orbitExplain: 'दिखाता है कि सूरज की हवा धरती के सुरक्षा घेरे से कैसे टकराती है।',
    saveSnapshotBtn: 'यह हाल सहेजें',
    saveSnapshotHint: 'अभी का हाल अपनी सहेजी गई सूची में रखें',
    exportHtmlBtn: 'बिना इंटरनेट की फ़ाइल उतारें',
    exportHtmlHint: 'एक पेज डाउनलोड करें जो इंटरनेट के बिना भी खुले',
    savedSnapshotsTitle: 'आपकी सहेजी गई जानकारी',
    noSnapshotsText: 'अभी आपने कुछ सहेजा नहीं है।',
    weatherSourcesHeading: 'जानकारी कहाँ से आती है?',

    alertsPageTitle: 'चेतावनी और सूचनाएँ',
    alertsPageSubtitle: 'सरकारी अंतरिक्ष केंद्र की सूचनाएँ और आवाज़ में सुनने का बटन।',
    alertsCurrentConditionTitle: 'अभी का हाल',
    alertsVoiceCardTitle: 'आवाज़ में सुरक्षा सूचना सुनें',
    alertsVoiceCardDesc: 'अभी के हालात और सुरक्षा की बात आसान हिन्दी में सुनें।',
    card3Action: 'आवाज़ में सूचना सुनें',
    card3Stop: 'आवाज़ रोकें',
    alertsOfficialFeedTitle: 'सरकारी सूचनाएँ',
    alertsRecentLabel: 'ताज़ा और हाल की सूचनाएँ',
    alertsEmptyText: 'अभी कोई नई चेतावनी या ख़तरा नहीं है। सब सामान्य है।',
    alertsIssuedLabel: 'जारी समय',
    alertsGpsImpactTitle: 'रास्ते और सिग्नल का हाल',
    alertsGpsImpactDesc: 'यह केवल सरकारी नंबरों पर आधारित है, कोई अंदाज़े से बना नंबर नहीं है।',
    alertsSavedSectionTitle: 'सहेजी गई सूचनाएँ',
    saveFavoriteBtn: 'सहेजें',
    savedFavoriteBadge: 'सहेजा गया',
    favoritesEmptyText: 'अभी कोई सूचना सहेजी नहीं गई है। ऊपर किसी भी सूचना को सहेजें।',
    removeFavoriteBtn: 'हटाएँ',
    alertsTrainingTitle: 'तूफ़ान का उदाहरण देखें (सिर्फ़ समझने के लिए)',
    alertsTrainingDesc: 'देखें कि तूफ़ान में स्क्रीन और आवाज़ कैसी लगती है। यह केवल उदाहरण है, असली मौसम नहीं।',
    alertsTrainingShowBtn: 'उदाहरण खोलें',
    alertsTrainingHideBtn: 'उदाहरण छिपाएँ',
    testSampleWarning: 'अभ्यास उदाहरण चालू है — ये नंबर सिर्फ़ समझने के लिए हैं, असली चेतावनी नहीं।',
    scenarioLabels: {
      nominal: 'शांत उदाहरण',
      minor: 'हल्की हलचल उदाहरण',
      strong: 'तेज़ तूफ़ान उदाहरण',
      extreme: 'बड़ा तूफ़ान उदाहरण',
    },
    emergencySpeech: {
      nominal: (sourceDesc) =>
        `अंतरिक्ष साथी की ताज़ा खबर, ${sourceDesc} के अनुसार। अभी सूरज बिल्कुल शांत है और रास्ते व सिग्नल सुरक्षित हैं।`,
      minor: (sourceDesc) =>
        `अंतरिक्ष साथी की खबर, ${sourceDesc} के अनुसार। आज हल्की सी हलचल है, नई खबरों पर ध्यान रखें।`,
      strong: (sourceDesc) =>
        `अंतरिक्ष साथी की चेतावनी, ${sourceDesc} के अनुसार। अभी तेज़ तूफ़ान चल रहा है; ज़रूरी सफ़र में दूसरा रास्ता भी तैयार रखें।`,
      extreme: (sourceDesc) =>
        `अंतरिक्ष साथी की ज़रूरी चेतावनी, ${sourceDesc} के अनुसार। अभी बहुत बड़ा अंतरिक्ष तूफ़ान आया हुआ है; सावधानी रखें और सरकारी निर्देश मानें।`,
    },

    helperTitle: 'एआई से सवाल पूछें',
    helperSubtitle: 'आसान हिन्दी में लिखकर या बोलकर पूछें, आपकी बातें यहाँ सहेजी रहेंगी।',
    helperGreeting: 'नमस्ते! सूरज के तूफ़ान, फ़ोन के नक़्शों या इस ऐप के बारे में कोई भी आसान सवाल पूछें।',
    helperPlaceholder: 'अपना सवाल यहाँ लिखें...',
    helperSendBtn: 'भेजें',
    helperRecordStart: 'बोलकर पूछें',
    helperRecordStop: 'माइक बंद करें',
    helperNewChatBtn: 'नई बात शुरू करें',
    chatListBtn: 'पुरानी बातें',
    chatCloseListBtn: 'बंद करें',
    chatSearchPlaceholder: 'पुरानी बातें खोजें...',
    chatNoMatches: 'ऐसी कोई पुरानी बात नहीं मिली।',
    chatEmptyList: 'अभी कोई पुरानी बात सहेजी नहीं गई है।',
    chatModeNewBadge: 'नई बात',
    chatModeSavedBadge: 'सहेजी गई',
    chatUntitledFallback: 'नया सवाल',
    chatRenameBtn: 'नाम बदलें',
    chatSaveRenameBtn: 'सहेजें',
    chatCancelBtn: 'रद्द',
    chatDeleteBtn: 'मिटाएँ',
    chatOriginalLangNote: 'अपनी मूल भाषा में सुरक्षित',
    chatCreatedLabel: 'शुरू',
    chatLastMsgLabel: 'आख़िरी संदेश',
    helperListenReply: 'सुनें',
    helperReplayReply: 'फिर सुनें',
    helperStopReplyVoice: 'रोकें',
    helperThinking: 'जवाब तैयार हो रहा है...',
    helperVoiceUnsupported: 'इस फ़ोन या ब्राउज़र में बोलकर लिखने की सुविधा नहीं चल रही। नीचे लिखकर भेजें।',
    offlineAiUnavailableMsg: (solar) => {
      const age = solar?.fetchedAtIso ? formatAgeForLanguage(solar.fetchedAtIso, 'hi') : '';
      return `इंटरनेट बंद है और इस फ़ोन में अपनी एआई नहीं है, इसलिए अभी नया जवाब नहीं बन सकता। ${
        solar?.flareClass
          ? `पिछली बची जानकारी${age ? ` (${age})` : ''} में चमक ${formatDigits(solar.flareClass, 'hi')} और तूफ़ान नंबर ${solar.kpIndex !== null ? formatDigits(solar.kpIndex, 'hi') : 'उपलब्ध नहीं'} था।`
          : 'अभी कोई पिछली जानकारी भी सहेजी नहीं गई है।'
      }`;
    },
    offlineGuideActiveNote:
      'इंटरनेट बंद है — ऑफ़लाइन स्थानीय गाइड चालू है, आप सहेजी जानकारी से बुनियादी सवाल अभी भी पूछ सकते हैं।',
    offlineNanoAndGuideNote:
      'इंटरनेट बंद है — छोटे नए अंग्रेज़ी सवाल स्थानीय Gemini Nano पर और बुनियादी सवाल ऑफ़लाइन स्थानीय गाइड पर चल सकते हैं।',
    askAiNanoPromptNote:
      'इस Desktop Chrome में छोटे अंग्रेज़ी जवाबों के लिए Gemini Nano उपलब्ध है। आप इसे यहीं से तैयार कर सकते हैं।',
    networkAiUnavailableMsg:
      'अभी एआई से संपर्क नहीं हो रहा है। इंटरनेट जाँचकर फिर से कोशिश करें।',
    timeoutAiUnavailableMsg:
      'जवाब आने में ज़्यादा समय लग गया। फिर से कोशिश करें।',
    rateLimitAiUnavailableMsg:
      'अभी बहुत ज़्यादा सवाल पूछे जा रहे हैं या आज की सीमा पूरी हो गई है। थोड़ी देर बाद फिर कोशिश करें।',
    providerLabels: {
      'firebase-ai-on-device': 'ON_DEVICE — Gemini Nano',
      'firebase-ai-cloud': 'IN_CLOUD — Firebase AI Logic',
      'server-gemini': 'SERVER BACKUP — /api/gemini/chat',
      'on-device-browser': 'पुराना ब्राउज़र स्थानीय मोड',
      'offline-local-guide': 'OFFLINE LOCAL GUIDE — सहेजी स्थानीय जानकारी',
      'offline-unavailable': 'जवाब नहीं मिल सका',
    },
    starterQuestions: [
      'क्या सूरज पर अभी कोई तूफ़ान आया हुआ है?',
      'क्या आज फ़ोन के नक़्शे और रास्ता बताने वाला सिस्टम ठीक चलेगा?',
      'तूफ़ान नंबर हमें क्या बताता है?',
      'इंटरनेट बंद हो जाए तो क्या-क्या काम करेगा?',
    ],

    settingsTitle: 'सेटिंग्स',
    settingsSubtitle: 'भाषा, आवाज़, स्क्रीन का रंग या अपना खाता आसानी से बदलें।',
    languageCardTitle: 'भाषा',
    languageCardDesc: 'बटन और नई बात तुरंत चुनी हुई भाषा में बदल जाएँगी; पुरानी बातें अपनी भाषा में रहेंगी।',
    voiceCardTitle: 'आवाज़',
    voiceCardDesc: 'बोलने वाली आवाज़ चालू या बंद करें और बोलने की गति चुनें।',
    speedSlow: 'धीमी',
    speedNormal: 'सामान्य',
    speedFast: 'तेज़',
    alertsDisplaySectionTitle: 'स्क्रीन और लिखाई',
    alertsDisplaySectionDesc: 'स्क्रीन का रंग गहरा या उजला रखें और अक्षरों का आकार बड़ा करें।',
    themeLabel: 'स्क्रीन',
    textSizeLabel: 'लिखाई',
    textSizeNormal: 'सामान्य',
    textSizeLarge: 'बड़ी',
    accountCardTitle: 'आपका खाता',
    accountSignedOutDesc: 'अपनी बातें और सहेजी गई सूचनाएँ बचाकर रखने के लिए गूगल से प्रवेश करें।',
    accountSignedInDesc: (email) => `आप इस खाते से जुड़े हैं: ${email}। आपकी बातें अपने आप सहेजी रहेंगी।`,
    accountSignInBtn: 'गूगल से प्रवेश करें',
    accountSignOutBtn: 'बाहर निकलें',
    accountErrorMsg: 'प्रवेश नहीं हो सका। पॉप-अप अनुमति जाँचकर फिर कोशिश करें।',
    privacyCardTitle: 'इस फ़ोन में सहेजा गया डेटा',
    privacyCardDesc: 'तय करें कि बातें इस फ़ोन में सहेजी रहें या मिटा दी जाएँ।',
    saveConsentLabel: 'अपने आप सहेजें',
    toggleOn: 'चालू',
    toggleOff: 'बंद',
    clearSavedDataBtn: 'सहेजा डेटा साफ़ करें',
    aiOfflineSectionTitle: 'हाइब्रिड एआई और इंटरनेट',
    aiOfflineSectionDesc: 'देखें कि कंप्यूटर और फ़ोन पर स्थानीय व ऑनलाइन एआई कैसे काम करती है।',
    aiOnlineExplain: 'अंग्रेज़ी के छोटे नए सवालों में उपलब्ध होने पर Gemini Nano, वरना Firebase AI Logic Cloud चलता है। हिन्दी, उर्दू, तेलुगु, कन्नड़ और लंबी बातचीत ऑनलाइन क्लाउड से चलती है।',
    aiLocalExplain: 'Chrome Prompt API (Gemini Nano) अभी केवल चुनिंदा Desktop Chrome पर काम करता है, Android मोबाइल Chrome पर उपलब्ध नहीं है। इंटरनेट बंद होने पर ऑफ़लाइन स्थानीय गाइड सहेजी जानकारी से बुनियादी जवाब देता है।',
    card2CheckBtn: 'Gemini Nano जाँचें',
    prepareDeviceModelBtn: 'Gemini Nano तैयार / डाउनलोड करें',
    preparingDeviceModelBtn: 'Gemini Nano तैयार हो रहा है...',
    deviceModelProgressLabel: (percent) => `डाउनलोड प्रगति: ${formatDigits(percent, 'hi')}%`,
    deviceModelReadyNotice: 'इस Desktop Chrome में छोटे अंग्रेज़ी सवालों के लिए Gemini Nano तैयार है।',
    deviceModelUnsupportedNotice: 'इस मोबाइल या ब्राउज़र में Chrome Prompt API (Gemini Nano) उपलब्ध नहीं है। यह अभी केवल चुनिंदा Desktop Chrome पर चलता है। ऑनलाइन एआई और ऑफ़लाइन स्थानीय गाइड सामान्य रूप से काम कर रहे हैं।',
    deviceModelIncompleteNotice: 'प्रक्रिया पूरी हुई, पर Gemini Nano अभी तैयार नहीं दिख रहा। Desktop Chrome की सेटिंग्स जाँचकर फिर कोशिश करें।',
    deviceModelErrorNotice: (detail) =>
      `Gemini Nano तैयार नहीं हो सका${detail ? `: ${detail}` : '।'}`,
    card2SimulateBtn: 'बिना इंटरनेट स्थिति आज़माएँ',
    card2SimulateActive: 'बिना इंटरनेट स्थिति चालू है',
    localModelLabels: {
      available: 'Desktop Chrome में Gemini Nano तैयार है (छोटे अंग्रेज़ी सवाल)',
      downloadable: 'Gemini Nano यहाँ उपलब्ध है — डाउनलोड बटन दबाएँ',
      unsupported: 'इस मोबाइल या ब्राउज़र में Gemini Nano उपलब्ध नहीं (केवल Desktop Chrome)',
    },
    hybridPreferLocalBtn: 'पहले Gemini Nano आज़माएँ (छोटे EN)',
    hybridPreferCloudBtn: 'पहले ऑनलाइन एआई आज़माएँ',
    techDetailsShowBtn: 'और तकनीकी जानकारी',
    techDetailsHideBtn: 'तकनीकी जानकारी छिपाएँ',
    appCheckActiveText: 'ऐप की अतिरिक्त सुरक्षा चालू है।',
    appCheckPendingText: 'अतिरिक्त सुरक्षा कुंजी अभी कंसोल में नहीं जोड़ी गई है।',
    sourcesTitle: 'जानकारी के मुख्य स्रोत',
    sourcesNoaaTitle: 'राष्ट्रीय अंतरिक्ष मौसम केंद्र',
    sourcesNoaaDesc: 'सूरज की चमक, तूफ़ान नंबर, सूरज की हवा और चेतावनियाँ।',
    sourcesNasaTitle: 'तूफ़ान नापने के पैमाने',
    sourcesNasaDesc: 'हल्के, तेज़ और बड़े तूफ़ान को समझने के सरकारी चार्ट।',
    consoleTodoTitle: 'एडमिन के लिए शेष काम',
    consoleTodoItems: [
      'फ़ायरबेस में गूगल प्रवेश चालू करें।',
      'फ़ायरबेस कंसोल में एआई सेवा चालू करें।',
      'सुरक्षा कुंजी कंसोल में जोड़ें।',
    ],

    noaaAgencyName: 'अमेरिकी राष्ट्रीय अंतरिक्ष मौसम केंद्र (सरकारी एजेंसी)',
    observedAtLabel: 'माप का समय',
    cachedAgePrefix: 'डेटा की उम्र',
    flarePlainMeaning: (flareClass) => {
      if (!flareClass) return 'अभी सूरज की चमक का आँकड़ा उपलब्ध नहीं है।';
      const prefix = flareClass.charAt(0).toUpperCase();
      if (prefix === 'X') return 'बहुत बड़ी चमक — दिन के हिस्से में रेडियो सिग्नल बंद हो सकते हैं।';
      if (prefix === 'M') return 'मध्यम चमक — रेडियो सिग्नल थोड़ी देर कमज़ोर हो सकते हैं।';
      if (prefix === 'C') return 'छोटी और सामान्य चमक — रोज़मर्रा के फ़ोन और नक़्शों के लिए बिल्कुल सुरक्षित।';
      return 'बहुत हल्की चमक — सूरज अभी बिल्कुल शांत है।';
    },
    kpPlainMeaning: (kp) => {
      if (kp === null) return 'तूफ़ान नंबर अभी उपलब्ध नहीं है।';
      if (kp >= 9) return 'पाँचवाँ अंतिम स्तर (नंबर ९) — बहुत बड़ा अंतरिक्ष तूफ़ान।';
      if (kp >= 8) return 'चौथा स्तर (नंबर ८) — गंभीर तूफ़ान चल रहा है।';
      if (kp >= 7) return 'तीसरा स्तर (नंबर ७) — तेज़ तूफ़ान चल रहा है।';
      if (kp >= 6) return 'दूसरा स्तर (नंबर ६) — मध्यम तूफ़ान चल रहा है।';
      if (kp >= 5) return 'पहला स्तर (नंबर ५ से तूफ़ान शुरू होता है) — हल्का तूफ़ान है।';
      if (kp >= 4) return 'सक्रिय हलचल (नंबर ४ तूफ़ान नहीं है; हल्का तूफ़ान नंबर ५ से शुरू होता है)।';
      return `शांत माहौल (नंबर ${localizeDigits(kp, 'hi')} पाँच से कम है, यानी अभी कोई तूफ़ान नहीं)।`;
    },
    windPlainMeaning: (speed) => {
      if (speed === null) return 'सूरज की हवा का ताज़ा आँकड़ा अभी उपलब्ध नहीं है।';
      if (speed >= 650) return 'बहुत तेज़ हवा — इससे धरती पर तूफ़ान की संभावना बढ़ती है।';
      if (speed >= 480) return 'थोड़ी तेज़ हवा — हल्की हलचल आ सकती है।';
      return 'सामान्य रफ़्तार (३०० से ४५० किमी/सेकंड आम बात है)।';
    },
    gpsPlainScaleNote: (level) => {
      if (level === 'extreme' || level === 'strong') {
        return 'तेज़ तूफ़ान में उपग्रह सिग्नल थोड़े प्रभावित हो सकते हैं, ख़ासकर ध्रुवीय उड़ानों और विशेष मशीनों में।';
      }
      if (level === 'minor') {
        return 'हल्की हलचल मुख्य रूप से ध्रुवीय आसमान में दिखती है; रोज़मर्रा के फ़ोन नक़्शे ठीक चलते हैं।';
      }
      return 'ऊपरी आसमान शांत है — फ़ोन के नक़्शे, रास्ते और सिग्नल सामान्य काम कर रहे हैं।';
    },
    feedDiscrepancyTitle: 'अभी के नंबर और चेतावनी में अंतर क्यों है?',
    feedDiscrepancyExplain: {
      'warning-higher-than-live': (liveKp, warningKp) =>
        `अभी इस मिनट का ताज़ा आँकड़ा शांत है (तूफ़ान नंबर ${liveKp}, कोई तूफ़ान नहीं), लेकिन सरकारी केंद्र की एक खुली चेतावनी चल रही है जिसमें तय समय के दौरान नंबर ${warningKp ?? localizeDigits(4, 'hi')} तक जाने की संभावना बताई गई है। ताज़ा नंबर इसी मिनट का है, जबकि चेतावनी कई घंटों के लिए होती है।`,
      'forecast-higher-than-live': (liveKp, _wKp, forecastG) =>
        `अभी इसी मिनट का आँकड़ा शांत है (नंबर ${liveKp}), जबकि आज के पूरे दिन के अनुमान में बाद में ${forecastG ? 'हल्के तूफ़ान' : 'हल्की हलचल'} की संभावना है। अनुमान पूरे दिन का होता है और ताज़ा नंबर अभी के पल का।`,
      'partial-feed': () =>
        'इस जाँच में एक अंतरिक्ष सेंसर से जवाब नहीं मिला, इसलिए सिर्फ़ प्रमाणित उपलब्ध आँकड़े दिखाए जा रहे हैं।',
      none: () => '',
    },
    forecastSectionTitle: 'अगले तीन दिनों का अनुमान और कल का हाल',
    forecastSectionSubtitle: 'सरकारी केंद्र का २४ घंटे का अनुमान, अभी के लाइव नंबर से अलग दिखाया गया है।',
    forecastDayLabels: { today: 'आज', tomorrow: 'कल', dayAfter: 'परसों' },
    forecastStormScaleLabel: 'तूफ़ान का अनुमान',
    forecastRadioChanceLabel: 'रेडियो चमक की संभावना',
    forecastRadiationChanceLabel: 'कण तूफ़ान की संभावना',
    forecastNoStormText: 'शांत (कोई तूफ़ान अपेक्षित नहीं)',
    yesterdayPeakLabel: 'कल का सबसे ऊँचा सरकारी स्तर',
    alertCategoryLabels: {
      warning: 'चेतावनी',
      watch: 'पूर्व निगरानी',
      alert: 'जारी सूचना',
      summary: 'सारांश',
    },
    alertTimingLabels: {
      activeWindow: 'अभी लागू',
      continuing: 'लगातार जारी',
      completed: 'समय समाप्त',
      notice: 'सरकारी सूचना',
    },
    alertAgencyLabel: 'जारी करने वाली एजेंसी',
    alertValidFromLabel: 'शुरू समय',
    alertValidToLabel: 'अंतिम समय',
    alertBeginTimeLabel: 'शुरुआत',
    alertImpactsLabel: 'रोज़मर्रा पर असर',
    localizedAlertContent: (alert) => {
      const code = alert.noticeCode ?? 'OTHER';
      switch (code) {
        case 'K04W':
          return {
            title: 'चेतावनी: चुंबकीय हलचल नंबर ४ तक जाने की संभावना',
            summary:
              'सरकारी केंद्र का अनुमान है कि तय समय में चुंबकीय नंबर ४ तक पहुँच सकता है। ध्यान दें: नंबर ४ सिर्फ़ हलचल है, पहला तूफ़ान नहीं (तूफ़ान नंबर ५ से शुरू होता है)।',
            impact:
              'आम लोगों के फ़ोन और नक़्शे सामान्य चलेंगे। केवल ध्रुवीय इलाकों में हल्की रोशनी और बिजली की लाइनों में बहुत हल्का उतार-चढ़ाव संभव है।',
          };
        case 'K05W':
        case 'K06W':
        case 'K07W': {
          const kpStr = localizeDigits(alert.kpThreshold ?? 5, 'hi');
          return {
            title: `चेतावनी: अंतरिक्ष तूफ़ान की संभावना (नंबर ${kpStr})`,
            summary: `सरकारी केंद्र ने नीचे दिए समय के बीच चुंबकीय तूफ़ान नंबर ${kpStr} तक पहुँचने की चेतावनी दी है।`,
            impact:
              'ध्रुवीय आसमान में रंगीन रोशनी, उपग्रहों पर हल्का दबाव और लंबी बिजली लाइनों पर मामूली असर संभव है।',
          };
        }
        case 'K04A':
        case 'K05A':
        case 'K06A':
        case 'K07A': {
          const kpVal = alert.kpThreshold ?? 4;
          const kpStr = localizeDigits(kpVal, 'hi');
          return {
            title: `ताज़ा सूचना: चुंबकीय नंबर ${kpStr} तक पहुँचा`,
            summary: `ज़मीनी केंद्रों ने चुंबकीय नंबर ${kpStr} दर्ज किया है।`,
            impact:
              kpVal >= 5
                ? 'ध्रुवीय उड़ानों, रेडियो और ख़ास सर्वे उपकरणों पर हल्का असर संभव है; आम फ़ोन सामान्य रहते हैं।'
                : 'रोज़मर्रा के जीवन पर कोई ख़ास असर नहीं; केवल ध्रुवीय इलाकों में हल्की रोशनी दिख सकती है।',
          };
        }
        case 'EF3A': {
          const peakText = alert.electronPeakPfu
            ? ` कल अधिकतम स्तर ${localizeDigits(alert.electronPeakPfu, 'hi')} दर्ज हुआ।`
            : '';
          return {
            title: 'जारी सूचना: उपग्रहों के पास तेज़ इलेक्ट्रॉन कण',
            summary: `ऊँचाई पर मौजूद उपग्रहों के रास्ते में तेज़ ऊर्जा वाले कण तय सीमा से अधिक बने हुए हैं।${peakText}`,
            impact:
              'धरती पर आम लोगों, फ़ोन नक़्शों और इंटरनेट को कोई ख़तरा नहीं है। उपग्रह केंद्र सावधानी से निगरानी रखते हैं।',
          };
        }
        case 'WATA_G1':
        case 'WATA_G2':
        case 'WATA_G3': {
          const lvl = alert.gScaleTarget?.replace('G', '') ?? '1';
          return {
            title: `पूर्व निगरानी: स्तर ${localizeDigits(lvl, 'hi')} के अंतरिक्ष तूफ़ान की संभावना`,
            summary: `सरकारी केंद्र ने आने वाले दिनों में स्तर ${localizeDigits(lvl, 'hi')} के संभावित तूफ़ान के लिए पूर्व सूचना दी है।`,
            impact:
              'रोज़मर्रा के फ़ोन और नक़्शे सामान्य चलते रहते हैं; उत्तरी आसमान में रोशनी और उपग्रहों पर हल्का असर संभव है।',
          };
        }
        case 'PROTON_WARN':
        case 'PROTON_ALERT':
          return {
            title: 'सौर कण सूचना (उपग्रह व ध्रुवीय उड़ानें)',
            summary: 'ऊँचे ध्रुवीय रास्तों के पास सूरज के तेज़ कण दर्ज या अपेक्षित हैं।',
            impact: 'यह मुख्यतः ध्रुवीय उड़ानों और उपग्रहों के लिए है; ज़मीन पर आम लोग सुरक्षित हैं।',
          };
        case 'FLARE_SUM':
          return {
            title: 'सूरज की ताज़ा चमक का सरकारी सारांश',
            summary: 'अंतरिक्ष मौसम उपग्रहों ने सूरज की एक तेज़ चमक दर्ज की है।',
            impact: 'बड़ी चमक से दिन के हिस्से में रेडियो सिग्नल थोड़े समय कमज़ोर हो सकते हैं; फ़ोन नक़्शे ठीक रहते हैं।',
          };
        default:
          return {
            title: 'सरकारी अंतरिक्ष मौसम सूचना',
            summary: 'अमेरिकी राष्ट्रीय अंतरिक्ष मौसम केंद्र द्वारा नई सरकारी सूचना जारी की गई है। पूरी जानकारी के लिए आधिकारिक लिंक देखें।',
            impact: 'विस्तृत जानकारी के लिए नीचे दिए आधिकारिक लिंक को खोलें।',
          };
      }
    },
    chartLegendFlare: 'नीली रेखा: सूरज की चमक की ताक़त',
    chartLegendKp: 'हरी टूटी रेखा: तूफ़ान नंबर (० से ९)',
    chartAxisStrong: 'बहुत तेज़',
    chartAxisMedium: 'मध्यम',
    chartAxisQuiet: 'शांत',
    aiOfficialSourcePromptLabel: 'सरकारी जानकारी के लिंक:',

    welcomeEnglishSubtitle: 'Space Sentinel Hybrid AI',
    welcomeChooseHeading: 'आप किस तरीके से इस्तेमाल करना चाहते हैं?',
    modeEasyOptionLetter: 'A',
    modeEasyTitle: 'आसान इस्तेमाल',
    modeEasySubtitle: 'बड़े नंबर वाले बटन, बहुत आसान भाषा और आवाज़ में जानकारी के लिए।',
    modeEasyBadge: 'शुरुआत और आवाज़ के लिए',
    modeFullOptionLetter: 'B',
    modeFullTitle: 'पूरी जानकारी',
    modeFullSubtitle: 'ग्राफ़, वैज्ञानिक नंबर, सरकारी चेतावनी और पूरे AI फ़ीचर के लिए।',
    modeFullBadge: 'चार्ट और पूरी जानकारी',
    switchToEasyBtn: 'आसान मोड',
    switchToFullBtn: 'पूरी जानकारी',
    backToChoiceBtn: 'मोड बदलें',
    easyPageTitle: 'आसान अंतरिक्ष मेनू',
    easyPageSubtitle: 'नीचे कोई भी बड़ा बटन दबाएँ, या बोलकर १ से ६ नंबर चुनें।',
    easyBackBtn: 'वापस',
    easyListenBtn: 'सुनें',
    easyStopBtn: 'आवाज़ बंद करें',
    easyGuideVoiceBtn: 'हर बटन का मतलब आवाज़ में सुनें',
    easyGuideVoiceScript:
      'आज का अंतरिक्ष मौसम जानने के लिए एक दबाएँ। सूरज की हालत के लिए दो दबाएँ। धरती और मोबाइल पर असर के लिए तीन दबाएँ। खतरे की चेतावनी के लिए चार दबाएँ। सारी जानकारी आवाज़ में सुनने के लिए पाँच दबाएँ। AI से सवाल पूछने के लिए छह दबाएँ।',
    easyVoiceCmdBtn: 'बोलकर नंबर चुनें (१–६)',
    easyVoiceCmdListening: 'सुन रहे हैं... बोलें "एक दबाएँ" या "आज का मौसम"',
    easyVoiceCmdHint: 'आप बटन दबाकर या बोलकर "एक दबाएँ" कहकर भी चुन सकते हैं।',
    easyVoiceCmdNotUnderstood: 'नंबर समझ नहीं आया। कृपया नीचे दिए गए बटन को दबाएँ।',
    easyVoiceCmdMatched: (num, title) => `नंबर ${num} खुल रहा है: ${title}`,
    easyMenuItems: {
      today: {
        title: 'आज का अंतरिक्ष मौसम',
        shortDesc: 'तुरंत जानें कि आज अंतरिक्ष शांत है या तूफ़ान है।',
      },
      sun: {
        title: 'सूरज की हालत',
        shortDesc: 'सरल शब्दों में जानें कि सूरज की चमक और हवा कैसी है।',
      },
      earth: {
        title: 'धरती पर असर',
        shortDesc: 'जानें कि मोबाइल, नक़्शे, रेडियो और बिजली सुरक्षित हैं या नहीं।',
      },
      warnings: {
        title: 'ख़तरे की चेतावनी',
        shortDesc: 'देखें कि कोई सरकारी चेतावनी या आने वाला ख़तरा तो नहीं।',
      },
      'all-voice': {
        title: 'पूरी जानकारी आवाज़ में सुनें',
        shortDesc: 'आज की पूरी रिपोर्ट आसान भाषा में सुनें।',
      },
      ai: {
        title: 'AI से सवाल पूछें',
        shortDesc: 'बिना लिखे बटन दबाकर या बोलकर सवाल पूछें।',
      },
    },
    easyAiHeading: 'आसान सवाल पूछें',
    easyAiSubheading: 'नीचे किसी भी सवाल को दबाएँ या माइक दबाकर बोलें।',
    easyAiQuickPrompts: [
      'क्या आज मोबाइल के नक़्शे और सिग्नल सुरक्षित हैं?',
      'क्या अभी सूरज पर कोई तूफ़ान आया है?',
      'क्या कल कोई ख़तरा हो सकता है?',
    ],
    easyAiVoiceAskBtn: 'दबाएँ और बोलकर सवाल पूछें',
    easyAllVoiceTitle: 'आज की पूरी सरल रिपोर्ट',
    easyAllVoiceSub: 'आवाज़ में सुनने के लिए नीचे "सुनें" दबाएँ।',
    easyNoWarningsTitle: 'कोई ख़तरे की चेतावनी नहीं है',
    easyNoWarningsBody: 'अभी हालात सामान्य हैं और सरकारी केंद्र से कोई चेतावनी नहीं है।',
    easyWarningsCountBody: (count) => `अभी सरकारी केंद्र की ${count} ताज़ा सूचनाएँ नीचे सरल भाषा में हैं।`,
    easyEarthCalmDetails: [
      'मोबाइल फ़ोन, इंटरनेट और नक़्शे बिल्कुल सामान्य चल रहे हैं।',
      'हवाई जहाज़ और बिजली की लाइनों को आज कोई अंतरिक्ष परेशानी नहीं है।',
    ],
    easyEarthMinorDetails: [
      'आम मोबाइल फ़ोन और नक़्शे ठीक काम करते रहेंगे।',
      'हल्की हलचल केवल ध्रुवीय ऊपरी आसमान तक सीमित रहती है।',
    ],
    easyEarthStrongDetails: [
      'लंबी दूरी के रेडियो और ध्रुवीय उड़ानों में थोड़ी रुकावट आ सकती है।',
      'ज़मीन पर आम फ़ोन सुरक्षित रहते हैं; सरकारी निर्देश देखें।',
    ],
    easySunFlareLabel: 'सूरज की चमक का स्तर',
    easySunWindLabel: 'सूरज की हवा की रफ़्तार',
    easyTodayKpLabel: 'तूफ़ान का नंबर (० से ९)',
    easyForecastTomorrowPrefix: 'कल का अनुमान',
  },

  te: {
    brandName: 'అంతరిక్ష నేస్తం',
    brandSubtitle: 'సూర్యుడు మరియు సిగ్నల్ సులభ సమాచారం',
    welcomeIntroBtn: 'పరిచయం',

    welcomeTagline:
      'సూర్యునిపై తుఫాను ఉందా లేదా, ఫోన్ మ్యాప్స్ సేఫ్‌గా ఉన్నాయా అని ఐదు భాషలలో సులభంగా తెలుసుకోండి.',
    welcomeWhatTitle: 'ఈ వెబ్‌సైట్ ఏమి చేస్తుంది?',
    welcomeWhatDesc:
      'ప్రభుత్వ అంతరిక్ష కేంద్రం నుండి తాజా వార్తలు తెచ్చి, సూర్యుడు ప్రశాంతంగా ఉన్నాడా తుఫాను ఉందా అని సులభమైన మాటల్లో చెబుతుంది. మీ ప్రశ్నలకు సమాధానాలు ఇస్తుంది.',
    welcomeWhyTitle: 'ఇది తెలుసుకోవడం ఎందుకు అవసరం?',
    welcomeWhyDesc:
      'పెద్ద సౌర తుఫానులు రేడియో, విమానాలు, ఫోన్ దారి చూపే మ్యాప్స్ మరియు కరెంట్‌పై ప్రభావం చూపగలవు. ముందే తెలిస్తే జాగ్రత్త పడవచ్చు.',
    enterCenterBtn: 'ప్రధాన పేజీ తెరవండి',
    enterCenterHint: 'ఇప్పటి పరిస్థితి చూడండి మరియు ప్రశ్నలు అడగండి',
    listenIntroBtn: 'మాటలో వినండి',
    stopVoiceBtn: 'మాట ఆపండి',
    voiceLoadingBtn: 'మాట వస్తోంది...',
    introSpeech:
      'అంతరిక్ష నేస్తానికి స్వాగతం. ఇక్కడ సూర్యునిపై ఇప్పుడు తుఫాను ఉందా లేదా, ఫోన్ మ్యాప్స్ సరిగ్గా పనిచేస్తాయా లేదా అని చూడవచ్చు. అలాగే తెలుగులో ప్రశ్నలు కూడా అడగవచ్చు.',
    voiceUnavailableNotice: 'ఈ ఫోన్‌లో తెలుగు మాట్లాడే స్వరం దొరకడం లేదు. మీరు సమాధానం చదువుకోవచ్చు.',
    voiceOfflineUnavailableNotice: 'ఇంటర్నెట్ లేదు మరియు ఈ ఫోన్‌లో తెలుగు స్వరం లేదు. మీరు రాసింది చదువుకోవచ్చు.',
    voiceAvailableBadge: 'ఈ ఫోన్‌లో తెలుగు స్వరం ఉంది',
    voiceOnlineAvailableBadge: 'ఇంటర్నెట్ ఉన్నప్పుడు తెలుగు మాట ఆన్‌లైన్‌లో వినిపిస్తుంది',

    navHome: 'హోమ్',
    navWeather: 'సూర్యుడి వాతావరణం',
    navHelper: 'ప్రశ్న అడగండి',
    navAlerts: 'హెచ్చరికలు',
    navSettings: 'సెట్టింగ్‌లు',

    headerLanguageLabel: 'భాష',
    headerThemeLight: 'వెలుగు',
    headerThemeDark: 'చీకటి',
    headerVoiceOn: 'మాట ఆన్',
    headerVoiceMuted: 'మాట ఆఫ్',
    refreshBtn: 'మళ్ళీ చూడండి',
    refreshBtnHint: 'ఇప్పుడే తాజా సమాచారం తెచ్చుకోండి',
    refreshingBtn: 'చూస్తున్నాము...',
    retryBtn: 'మళ్ళీ ప్రయత్నించండి',
    dismissBtn: 'మూసివేయండి',
    offlineBanner: 'ఇంటర్నెట్ లేదు లేదా కలవడం లేదు. ముందు సేవ్ చేసిన సమాచారం చూపిస్తున్నాము.',
    connectionRestoredBanner: 'ఇంటర్నెట్ మళ్ళీ వచ్చింది. తాజా సమాచారం కనిపిస్తోంది.',
    fetchErrorNotice: 'ఇప్పుడు కొత్త సమాచారం రాలేదు. మేము మీకు పాత సమాచారం చూపిస్తున్నాము.',
    noaaCacheBanner: 'ఇప్పుడు కొత్త సమాచారం రాలేదు. మేము మీకు పాత సమాచారం చూపిస్తున్నాము.',
    noaaNoCacheBanner: 'ఇప్పుడు సమాచారం అందలేదు. కాసేపయ్యాక మళ్ళీ ప్రయత్నించండి.',
    cachedDataTimePrefix: 'చివరి సమాచారం: ',
    notAvailableShort: 'అందుబాటులో లేదు',
    expandDetailsBtn: 'మరింత తెలుసుకోండి',
    hideDetailsBtn: 'తక్కువ చూపించు',
    officialSourceLinkLabel: 'ప్రభుత్వ అంతరిక్ష వాతావరణ కేంద్రం',
    returnLiveBtn: 'తాజా సమాచారానికి వెళ్ళండి',

    dashPageTitle: 'ఇప్పటి అంతరిక్ష వాతావరణం',
    dashStatusHeading: 'ప్రస్తుతం సూర్యుడి పరిస్థితి',
    dashRiskHeading: 'భద్రతా తనిఖీ',
    dashRiskTrustworthyHint: 'ప్రభుత్వ అంతరిక్ష కేంద్రం తాజా అంకెలపై ఆధారపడింది',
    dashRiskUnavailableText: 'ఇంకా తాజా సమాచారం రాలేదు. ఇంటర్నెట్ చూసి మళ్ళీ ప్రయత్నించండి.',
    dashAskAiBtn: 'ఏఐని అడగండి',
    dashAskAiHint: 'సులభమైన తెలుగులో రాసి లేదా మాట్లాడి ఏదైనా అడగండి',
    dashViewAlertsBtn: 'హెచ్చరికలు చూడండి',
    dashOpenWeatherBtn: 'సూర్యుడు మరియు తుఫాను గురించి తెలుసుకోండి',
    dashSolarActivityTitle: 'సూర్యుడి మెరుపు స్థాయి',
    dashSolarActivityBrief: 'సూర్యుని నుండి వచ్చే వెలుగు ఎంత తక్కువగా లేదా ఎక్కువగా ఉందో చూపుతుంది.',
    dashSolarActivityDetail:
      'చిన్న మెరుపులు సాధారణం. చాలా పెద్ద మెరుపు వస్తే పగటి వైపు రేడియో సిగ్నల్ కొద్దిసేపు బలహీనపడవచ్చు.',
    dashKpTitle: 'భూమి రక్షణ కవచం',
    dashKpBrief: 'సున్నా నుండి తొమ్మిది వరకు భూమి చుట్టూ ఉన్న కవచం ఎంత ప్రశాంతంగా ఉందో చెబుతుంది.',
    dashKpDetail: 'ఐదు కంటే తక్కువ ఉంటే సాధారణం. ఐదు లేదా అంతకంటే ఎక్కువ ఉంటే తుఫాను ఉన్నట్లు అర్థం.',
    dashWindTitle: 'సూర్యుడి గాలి వేగం',
    dashWindBrief: 'సూర్యుని నుండి భూమి వైపు గాలి ఎంత వేగంగా వస్తుందో చూపుతుంది.',
    dashWindDetail: 'సాధారణ వేగం ౩౦౦ నుండి ౪౫౦ కిమీ/సెకను. ౬౦౦ దాటితే తుఫాను వచ్చే అవకాశం పెరుగుతుంది.',
    dashDensityLabel: 'కణాల సాంద్రత',
    dashGpsTitle: 'దారి చూపే మ్యాప్స్ & సిగ్నల్',
    dashGpsBrief: 'ఈరోజు ఫోన్ మ్యాప్స్ మరియు సిగ్నల్‌పై ప్రభావం ఉంటుందా లేదా అని చెబుతుంది.',
    dashGpsDetail:
      'ప్రభుత్వ కేంద్రం మీ ఇంటి వద్ద కచ్చితమైన మీటర్ తప్పును కొలవదు; ఇది ప్రపంచ తుఫాను అంకెల ఆధారంగా ఇస్తుంది.',
    dashChartHeading: 'గత ఆరు గంటల మార్పు',
    dashChartSub: 'ముందు గంటల వివరాలు చూడటానికి గీతపై తాకండి.',
    dashProvenanceHeading: 'సమాచారం సమయం మరియు మూలం',

    summarySunTitle: 'సూర్యుడి మెరుపు',
    summaryStormTitle: 'తుఫాను సంఖ్య',
    summaryGpsTitle: 'సిగ్నల్ సలహా',
    solarWindTitle: 'సూర్యుడి గాలి',
    summaryUpdatedTitle: 'చివరి సమయం',
    summarySourceTitle: 'మూలం',
    gpsMeasuredNote: 'ఇక్కడ స్థానిక మీటర్ తప్పు కొలవబడదు; ఇది ప్రభుత్వ తుఫాను అంకెలపై ఆధారపడింది.',
    sampleGpsNote: (drift, lock) => `ఇది నేర్చుకునే ఉదాహరణ మాత్రమే (నిజం కాదు): ±${drift} మీటర్లు, ${lock}% సిగ్నల్`,
    sourceStatus: {
      'live-noaa': 'తాజా ప్రభుత్వ సమాచారం',
      'offline-cache': 'పాత నిల్వ సమాచారం',
      simulated: 'ఉదాహరణ మాత్రమే (నిజం కాదు)',
    },
    severityLabels: {
      nominal: 'ప్రశాంతంగా మరియు సేఫ్‌గా ఉంది',
      minor: 'చిన్న కదలిక',
      strong: 'బలమైన తుఫాను ఉంది',
      extreme: 'చాలా పెద్ద తుఫాను',
    },
    severityDescriptions: {
      nominal: 'సూర్యుడు మరియు భూమి వాతావరణం ప్రశాంతంగా ఉన్నాయి. ఫోన్ మ్యాప్స్ బాగానే పనిచేస్తున్నాయి.',
      minor: 'చిన్న కదలిక కనిపించింది. మామూలు ఫోన్లు మరియు మ్యాప్స్ బాగానే పనిచేస్తాయి.',
      strong: 'బలమైన సౌర తుఫాను ఉంది. విమాన ప్రయాణాలు మరియు ముఖ్యమైన రేడియో పనుల్లో జాగ్రత్త అవసరం.',
      extreme: 'ఇప్పుడు చాలా పెద్ద అంతరిక్ష తుఫాను ఉంది. ప్రభుత్వ సూచనలు పాటించండి.',
    },
    unitMeters: 'మీటర్లు',
    unitKmSec: 'కిమీ/సెకను',
    unitProtonDensity: 'కణాలు/ఘన సెం.మీ',
    unitPercent: '%',

    weatherPageTitle: 'సూర్యుడు మరియు తుఫాను గురించి సులభంగా తెలుసుకోండి',
    weatherPageSubtitle: 'కింద ఉన్న ఏదైనా బటన్ నొక్కి సులభమైన తెలుగులో చదవండి.',
    weatherTopicSelectorLabel: 'విషయాన్ని ఎంచుకోండి',
    weatherTopics: {
      flares: {
        title: 'సూర్యుడి మెరుపులు',
        summary: 'సూర్యునిపై ఒక్కసారిగా వచ్చే పెద్ద వెలుగు మరియు వేడి.',
        scientificExplain:
          'అంతరిక్ష ఉపగ్రహాలు దీనిని ఎప్పుడూ గమనిస్తాయి. ఈ వెలుగు సుమారు ఎనిమిది నిమిషాల్లో భూమికి వస్తుంది.',
        impactExplain:
          'చాలా పెద్ద మెరుపు వస్తే పగటి వైపు దూరపు రేడియో సిగ్నల్ కాసేపు తగ్గిపోవచ్చు.',
      },
      storms: {
        title: 'అంతరిక్ష తుఫానులు',
        summary: 'సూర్యుని నుండి వచ్చే కణాలు భూమి రక్షణ కవచాన్ని తాకినప్పుడు.',
        scientificExplain:
          'దీనిని ౦ నుండి ౫ వరకు కొలుస్తారు. సూర్యుని గాలి గట్టిగా తాకినప్పుడు తుఫాను మొదలవుతుంది.',
        impactExplain:
          'పెద్ద తుఫానుల వల్ల ఆకాశంలో రంగుల వెలుగులు కనిపిస్తాయి, ఉపగ్రహాలపై ఒత్తిడి పెరుగుతుంది.',
      },
      kp: {
        title: 'తుఫాను సంఖ్య (౦ నుండి ౯)',
        summary: 'సున్నా నుండి తొమ్మిది వరకు ఉండే సులభమైన అంకె.',
        scientificExplain:
          'ప్రపంచంలోని కేంద్రాలు కలిసి ఈ సంఖ్య చెబుతాయి: ౦–౪ ప్రశాంతం, ౫–౯ అంటే తుఫాను.',
        impactExplain:
          'ఈ సంఖ్య ఎక్కువైతే ఆకాశం పైభాగంలో సిగ్నల్ కొంచెం ఆలస్యం కావచ్చు.',
      },
      wind: {
        title: 'సూర్యుడి గాలి',
        summary: 'సూర్యుని నుండి ఎప్పుడూ వచ్చే వేగమైన గాలి.',
        scientificExplain:
          'భూమికి దూరంగా ఉన్న యంత్రాలు ఈ గాలిని ముందే చూసి ౧౫ నుండి ౬౦ నిమిషాల ముందే హెచ్చరిస్తాయి.',
        impactExplain:
          'ఈ గాలి ౬౦౦ కిమీ/సెకను కంటే వేగంగా వస్తే తుఫాను వచ్చే అవకాశం పెరుగుతుంది.',
      },
      gps: {
        title: 'మ్యాప్స్ మరియు ఉపగ్రహాలు',
        summary: 'సౌర తుఫాను వల్ల దారి చూపే సిగ్నల్‌లో వచ్చే మార్పులు.',
        scientificExplain:
          'ఉపగ్రహ సిగ్నల్స్ ఆకాశం పై పొర ద్వారా వస్తాయి. పెద్ద తుఫానులో అవి కొంచెం నెమ్మదించవచ్చు.',
        impactExplain:
          'మామూలు రోజుల్లో ఫోన్ మ్యాప్స్ బాగా పనిచేస్తాయి, పెద్ద తుఫానులో ప్రత్యేక యంత్రాలపై ప్రభావం పడవచ్చు.',
      },
    },
    weatherVisualSectionTitle: 'ఆరు గంటల గ్రాఫ్ మరియు సూర్య-భూమి బొమ్మ',
    trendChartTitle: 'గత ఆరు గంటల గ్రాఫ్',
    trendChartExplain: 'నీలం గీత సూర్యుడి మెరుపును, ఆకుపచ్చ గీత ౦ నుండి ౯ వరకు తుఫాను సంఖ్యను చూపుతుంది.',
    orbitTitle: 'సూర్యుడు, భూమి కవచం మరియు ఉపగ్రహాలు',
    orbitExplain: 'సూర్యుడి గాలి భూమి రక్షణ కవచాన్ని ఎలా తాకుతుందో చూపుతుంది.',
    saveSnapshotBtn: 'దీనిని సేవ్ చేయండి',
    saveSnapshotHint: 'ఈ సమాచారాన్ని మీ జాబితాలో దాచండి',
    exportHtmlBtn: 'ఆఫ్‌లైన్ పేజీ డౌన్‌లోడ్',
    exportHtmlHint: 'ఇంటర్నెట్ లేకపోయినా తెరిచే పేజీని సేవ్ చేయండి',
    savedSnapshotsTitle: 'మీరు సేవ్ చేసిన సమాచారం',
    noSnapshotsText: 'ఇంకా ఏ సమాచారం సేవ్ చేయలేదు.',
    weatherSourcesHeading: 'సమాచారం ఎక్కడి నుండి వస్తుంది?',

    alertsPageTitle: 'హెచ్చరికలు మరియు సూచనలు',
    alertsPageSubtitle: 'ప్రభుత్వ అంతరిక్ష కేంద్రం సమాచారం మరియు మాటలో వినే బటన్.',
    alertsCurrentConditionTitle: 'ఇప్పటి పరిస్థితి',
    alertsVoiceCardTitle: 'మాటలో భద్రతా సమాచారం వినండి',
    alertsVoiceCardDesc: 'ఇప్పటి పరిస్థితి మరియు జాగ్రత్తల గురించి సులభమైన తెలుగులో వినండి.',
    card3Action: 'మాటలో వినండి',
    card3Stop: 'మాట ఆపండి',
    alertsOfficialFeedTitle: 'ప్రభుత్వ ప్రకటనలు',
    alertsRecentLabel: 'తాజా మరియు ఇటీవలి ప్రకటనలు',
    alertsEmptyText: 'ఇప్పుడు కొత్త హెచ్చరికలు ఏవీ లేవు. అంతా సాధారణంగా ఉంది.',
    alertsIssuedLabel: 'వచ్చిన సమయం',
    alertsGpsImpactTitle: 'దారి మరియు సిగ్నల్ స్థితి',
    alertsGpsImpactDesc: 'కేవలం ప్రభుత్వ అంకెల ఆధారంగా మాత్రమే, ఊహాజనిత సంఖ్యలు లేవు.',
    alertsSavedSectionTitle: 'సేవ్ చేసిన హెచ్చరికలు',
    saveFavoriteBtn: 'సేవ్ చేయండి',
    savedFavoriteBadge: 'సేవ్ అయింది',
    favoritesEmptyText: 'ఇంకా ఏ హెచ్చరిక సేవ్ చేయలేదు. పైన ఉన్న దానిని సేవ్ చేయండి.',
    removeFavoriteBtn: 'తీసివేయండి',
    alertsTrainingTitle: 'తుఫాను ఉదాహరణ చూడండి (నేర్చుకోవడానికి మాత్రమే)',
    alertsTrainingDesc: 'తుఫాను సమయంలో స్క్రీన్ మరియు మాట ఎలా ఉంటాయో చూడండి. ఇది ఉదాహరణ మాత్రమే, నిజం కాదు.',
    alertsTrainingShowBtn: 'ఉదాహరణలు చూపించు',
    alertsTrainingHideBtn: 'ఉదాహరణలు దాచు',
    testSampleWarning: 'ఇది అభ్యాస ఉదాహరణ మాత్రమే — నిజమైన హెచ్చరిక కాదు.',
    scenarioLabels: {
      nominal: 'ప్రశాంత ఉదాహరణ',
      minor: 'చిన్న కదలిక ఉదాహరణ',
      strong: 'బలమైన తుఫాను ఉదాహరణ',
      extreme: 'పెద్ద తుఫాను ఉదాహరణ',
    },
    emergencySpeech: {
      nominal: (sourceDesc) =>
        `అంతరిక్ష నేస్తం తాజా వార్త, ${sourceDesc} ప్రకారం. ఇప్పుడు సూర్యుడు ప్రశాంతంగా ఉన్నాడు మరియు మ్యాప్స్ సేఫ్‌గా ఉన్నాయి.`,
      minor: (sourceDesc) =>
        `అంతరిక్ష నేస్తం వార్త, ${sourceDesc} ప్రకారం. ఈరోజు చిన్న కదలిక ఉంది, కొత్త వార్తలు గమనించండి.`,
      strong: (sourceDesc) =>
        `అంతరిక్ష నేస్తం హెచ్చరిక, ${sourceDesc} ప్రకారం. బలమైన తుఫాను ఉంది; ముఖ్యమైన ప్రయాణాలలో ప్రత్యామ్నాయ దారి సిద్ధంగా ఉంచుకోండి.`,
      extreme: (sourceDesc) =>
        `అంతరిక్ష నేస్తం ముఖ్య హెచ్చరిక, ${sourceDesc} ప్రకారం. ఇప్పుడు చాలా పెద్ద సౌర తుఫాను ఉంది; జాగ్రత్తగా ఉండండి మరియు ప్రభుత్వ సూచనలు పాటించండి.`,
    },

    helperTitle: 'ఏఐని ప్రశ్న అడగండి',
    helperSubtitle: 'సులభమైన తెలుగులో రాసి లేదా మాట్లాడి అడగండి, మీ మాటలు ఇక్కడ దాచబడతాయి.',
    helperGreeting: 'నమస్కారం! సూర్యుని తుఫాను, ఫోన్ మ్యాప్స్ లేదా ఈ యాప్ గురించి ఏదైనా సులభమైన ప్రశ్న అడగండి.',
    helperPlaceholder: 'మీ ప్రశ్న ఇక్కడ రాయండి...',
    helperSendBtn: 'పంపండి',
    helperRecordStart: 'మాట్లాడి అడగండి',
    helperRecordStop: 'మైక్ ఆపండి',
    helperNewChatBtn: 'కొత్త మాట మొదలుపెట్టండి',
    chatListBtn: 'పాత మాటలు',
    chatCloseListBtn: 'మూసివేయండి',
    chatSearchPlaceholder: 'పాత మాటలు వెతకండి...',
    chatNoMatches: 'అటువంటి పాత మాటలు దొరకలేదు.',
    chatEmptyList: 'ఇంకా పాత మాటలు ఏవీ సేవ్ కాలేదు.',
    chatModeNewBadge: 'కొత్తది',
    chatModeSavedBadge: 'సేవ్ చేసినది',
    chatUntitledFallback: 'కొత్త ప్రశ్న',
    chatRenameBtn: 'పేరు మార్చు',
    chatSaveRenameBtn: 'సేవ్',
    chatCancelBtn: 'రద్దు',
    chatDeleteBtn: 'తొలగించు',
    chatOriginalLangNote: 'అసలు భాషలో ఉంది',
    chatCreatedLabel: 'మొదలు',
    chatLastMsgLabel: 'చివరి మెసేజ్',
    helperListenReply: 'వినండి',
    helperReplayReply: 'మళ్ళీ వినండి',
    helperStopReplyVoice: 'ఆపండి',
    helperThinking: 'సమాధానం సిద్ధమవుతోంది...',
    helperVoiceUnsupported: 'ఈ ఫోన్ లేదా బ్రౌజర్‌లో మాట్లాడి అడగడం పనిచేయడం లేదు. కింద రాసి పంపండి.',
    offlineAiUnavailableMsg: (solar) => {
      const age = solar?.fetchedAtIso ? formatAgeForLanguage(solar.fetchedAtIso, 'te') : '';
      return `ఇంటర్నెట్ లేదు మరియు ఈ ఫోన్‌లో సొంత ఏఐ లేదు, కాబట్టి ఇప్పుడు కొత్త సమాధానం రాదు. ${
        solar?.flareClass
          ? `చివరిగా సేవ్ చేసిన వివరాలు${age ? ` (${age})` : ''}: మెరుపు ${formatDigits(solar.flareClass, 'te')}, తుఫాను సంఖ్య ${solar.kpIndex !== null ? formatDigits(solar.kpIndex, 'te') : 'అందుబాటులో లేదు'}.`
          : 'ఇంకా పాత సమాచారం కూడా సేవ్ కాలేదు.'
      }`;
    },
    offlineGuideActiveNote:
      'ఇంటర్నెట్ ఆఫ్‌లో ఉంది — ఆఫ్‌లైన్ స్థానిక గైడ్ సిద్ధంగా ఉంది, సేవ్ చేసిన వివరాలతో ప్రాథమిక ప్రశ్నలు అడగవచ్చు.',
    offlineNanoAndGuideNote:
      'ఇంటర్నెట్ ఆఫ్‌లో ఉంది — చిన్న ఆంగ్ల ప్రశ్నలు స్థానిక Gemini Nano లో మరియు ప్రాథమిక ప్రశ్నలు ఆఫ్‌లైన్ స్థానిక గైడ్‌లో పనిచేస్తాయి.',
    askAiNanoPromptNote:
      'ఈ Desktop Chrome లో చిన్న ఆంగ్ల సమాధానాల కోసం Gemini Nano అందుబాటులో ఉంది. ఇక్కడే దాన్ని సిద్ధం చేయవచ్చు.',
    networkAiUnavailableMsg:
      'ఇప్పుడు ఏఐతో కలవడం లేదు. ఇంటర్నెట్ చూసి మళ్ళీ ప్రయత్నించండి.',
    timeoutAiUnavailableMsg:
      'సమాధానం రావడానికి చాలా సమయం పట్టింది. మళ్ళీ ప్రయత్నించండి.',
    rateLimitAiUnavailableMsg:
      'ఇప్పుడు చాలా ఎక్కువ ప్రశ్నలు వస్తున్నాయి లేదా ఈరోజు పరిమితి పూర్తయింది. కొంచెం ఆగి మళ్ళీ ప్రయత్నించండి.',
    providerLabels: {
      'firebase-ai-on-device': 'ON_DEVICE — Gemini Nano',
      'firebase-ai-cloud': 'IN_CLOUD — Firebase AI Logic',
      'server-gemini': 'SERVER BACKUP — /api/gemini/chat',
      'on-device-browser': 'పాత బ్రౌజర్ స్థానిక మోడ్',
      'offline-local-guide': 'OFFLINE LOCAL GUIDE — సేవ్ చేసిన స్థానిక వివరాలు',
      'offline-unavailable': 'సమాధానం రాలేదు',
    },
    starterQuestions: [
      'ఇప్పుడు సూర్యునిపై ఏదైనా తుఫాను ఉందా?',
      'ఈరోజు ఫోన్ మ్యాప్స్ సరిగ్గా పనిచేస్తాయా?',
      'తుఫాను సంఖ్య మనకు ఏమి చెబుతుంది?',
      'ఇంటర్నెట్ పోతే ఏమి పనిచేస్తాయి?',
    ],

    settingsTitle: 'సెట్టింగ్‌లు',
    settingsSubtitle: 'భాష, మాట, స్క్రీన్ రంగు లేదా మీ ఖాతాను సులభంగా మార్చుకోండి.',
    languageCardTitle: 'భాష',
    languageCardDesc: 'బటన్లు మరియు కొత్త మాటలు వెంటనే మారతాయి; పాత మాటలు వాటి అసలు భాషలోనే ఉంటాయి.',
    voiceCardTitle: 'మాట',
    voiceCardDesc: 'మాట్లాడే స్వరాన్ని ఆన్ లేదా ఆఫ్ చేసి వేగాన్ని ఎంచుకోండి.',
    speedSlow: 'నెమ్మది',
    speedNormal: 'సాధారణం',
    speedFast: 'వేగం',
    alertsDisplaySectionTitle: 'స్క్రీన్ మరియు రాత',
    alertsDisplaySectionDesc: 'వెలుగు లేదా చీకటి రంగు మరియు పెద్ద అక్షరాలను ఎంచుకోండి.',
    themeLabel: 'స్క్రీన్',
    textSizeLabel: 'అక్షరాలు',
    textSizeNormal: 'సాధారణం',
    textSizeLarge: 'పెద్దది',
    accountCardTitle: 'మీ ఖాతా',
    accountSignedOutDesc: 'మీ మాటలు మరియు సేవ్ చేసిన వివరాలు భద్రంగా ఉండటానికి గూగుల్‌తో లాగిన్ అవ్వండి.',
    accountSignedInDesc: (email) => `మీరు ఈ ఖాతాలో ఉన్నారు: ${email}. మీ మాటలు వాటంతట అవే సేవ్ అవుతాయి.`,
    accountSignInBtn: 'గూగుల్‌తో ప్రవేశించండి',
    accountSignOutBtn: 'బయటకు వెళ్ళండి',
    accountErrorMsg: 'ప్రవేశం కాలేదు. పాప్-అప్ అనుమతి చూసి మళ్ళీ ప్రయత్నించండి.',
    privacyCardTitle: 'ఈ ఫోన్‌లో సేవ్ చేసిన వివరాలు',
    privacyCardDesc: 'మాటలు ఈ ఫోన్‌లో సేవ్ కావాలా లేదా తొలగించాలా అని ఎంచుకోండి.',
    saveConsentLabel: 'వాటంతట అవే సేవ్ చేయి',
    toggleOn: 'ఆన్',
    toggleOff: 'ఆఫ్',
    clearSavedDataBtn: 'సేవ్ చేసినవి తుడిచివేయి',
    aiOfflineSectionTitle: 'హైబ్రిడ్ ఏఐ మరియు ఇంటర్నెట్',
    aiOfflineSectionDesc: 'డెస్క్‌టాప్ మరియు మొబైల్‌లో స్థానిక మరియు ఆన్‌లైన్ ఏఐ ఎలా పనిచేస్తాయో చూడండి.',
    aiOnlineExplain: 'చిన్న కొత్త ఆంగ్ల ప్రశ్నలలో అందుబాటులో ఉంటే Gemini Nano, లేకపోతే Firebase AI Logic Cloud నడుస్తుంది. తెలుగు, ఉర్దూ, హిందీ, కన్నడ మరియు సంభాషణలు ఎల్లప్పుడూ క్లౌడ్ ద్వారా నడుస్తాయి.',
    aiLocalExplain: 'Chrome Prompt API (Gemini Nano) ప్రస్తుతం ఎంపిక చేసిన Desktop Chrome లో మాత్రమే పనిచేస్తుంది, Android మొబైల్ Chrome లో కాదు. ఇంటర్నెట్ లేకపోతే ఆఫ్‌లైన్ స్థానిక గైడ్ సేవ్ చేసిన వివరాలతో ప్రాథమిక ప్రశ్నలకు సమాధానం ఇస్తుంది.',
    card2CheckBtn: 'Gemini Nano చూడండి',
    prepareDeviceModelBtn: 'Gemini Nano సిద్ధం / డౌన్‌లోడ్ చేయి',
    preparingDeviceModelBtn: 'Gemini Nano సిద్ధమవుతోంది...',
    deviceModelProgressLabel: (percent) => `డౌన్‌లోడ్ పురోగతి: ${formatDigits(percent, 'te')}%`,
    deviceModelReadyNotice: 'ఈ Desktop Chrome లో చిన్న ఆంగ్ల ప్రశ్నల కోసం Gemini Nano సిద్ధంగా ఉంది.',
    deviceModelUnsupportedNotice: 'ఈ మొబైల్ లేదా బ్రౌజర్‌లో Chrome Prompt API (Gemini Nano) లేదు. ఇది ప్రస్తుతం ఎంపిక చేసిన Desktop Chrome లో మాత్రమే పనిచేస్తుంది. ఆన్‌లైన్ ఏఐ మరియు ఆఫ్‌లైన్ స్థానిక గైడ్ యథావిధిగా పనిచేస్తాయి.',
    deviceModelIncompleteNotice: 'ప్రక్రియ పూర్తయింది, కానీ Gemini Nano ఇంకా సిద్ధంగా లేదు. Desktop Chrome సెట్టింగ్‌లు చూసి మళ్ళీ ప్రయత్నించండి.',
    deviceModelErrorNotice: (detail) =>
      `Gemini Nano సిద్ధం కాలేదు${detail ? `: ${detail}` : '.'}`,
    card2SimulateBtn: 'ఇంటర్నెట్ లేని స్థితి చూడండి',
    card2SimulateActive: 'ఇంటర్నెట్ లేని స్థితి ఆన్‌లో ఉంది',
    localModelLabels: {
      available: 'Desktop Chrome లో Gemini Nano సిద్ధంగా ఉంది (చిన్న ఆంగ్ల ప్రశ్నలు)',
      downloadable: 'Gemini Nano ఇక్కడ అందుబాటులో ఉంది — డౌన్‌లోడ్ బటన్ నొక్కండి',
      unsupported: 'ఈ మొబైల్ లేదా బ్రౌజర్‌లో Gemini Nano లేదు (Desktop Chrome మాత్రమే)',
    },
    hybridPreferLocalBtn: 'ముందు Gemini Nano ప్రయత్నించు (చిన్న EN)',
    hybridPreferCloudBtn: 'ముందు ఆన్‌లైన్ ఏఐ ప్రయత్నించు',
    techDetailsShowBtn: 'మరింత సాంకేతిక సమాచారం',
    techDetailsHideBtn: 'సాంకేతిక సమాచారం దాచు',
    appCheckActiveText: 'యాప్ అదనపు భద్రత ఆన్‌లో ఉంది.',
    appCheckPendingText: 'అదనపు భద్రత కీ ఇంకా కన్సోల్‌లో చేర్చలేదు.',
    sourcesTitle: 'సమాచార మూలాలు',
    sourcesNoaaTitle: 'జాతీయ అంతరిక్ష వాతావరణ కేంద్రం',
    sourcesNoaaDesc: 'సూర్యుడి మెరుపులు, తుఫాను సంఖ్య, గాలి మరియు హెచ్చరికలు.',
    sourcesNasaTitle: 'తుఫాను కొలమానాలు',
    sourcesNasaDesc: 'చిన్న, బలమైన మరియు పెద్ద తుఫానులను వివరించే పట్టికలు.',
    consoleTodoTitle: 'నిర్వాహకుల పనులు',
    consoleTodoItems: [
      'ఫైర్‌బేస్‌లో గూగుల్ ప్రవేశం ఆన్ చేయండి.',
      'ఫైర్‌బేస్ కన్సోల్‌లో ఏఐ సేవ ఆన్ చేయండి.',
      'భద్రతా కీ కన్సోల్‌లో చేర్చండి.',
    ],

    noaaAgencyName: 'అమెరికా జాతీయ అంతరిక్ష వాతావరణ కేంద్రం (ప్రభుత్వ సంస్థ)',
    observedAtLabel: 'కొలిచిన సమయం',
    cachedAgePrefix: 'సమాచారం వయసు',
    flarePlainMeaning: (flareClass) => {
      if (!flareClass) return 'ప్రస్తుతం సూర్యుని మెరుపు విలువ అందుబాటులో లేదు.';
      const prefix = flareClass.charAt(0).toUpperCase();
      if (prefix === 'X') return 'చాలా పెద్ద మెరుపు — పగటి వైపు రేడియో సిగ్నల్స్ ఆగిపోవచ్చు.';
      if (prefix === 'M') return 'మధ్యస్థ మెరుపు — రేడియో సిగ్నల్స్ కాసేపు తగ్గిపోవచ్చు.';
      if (prefix === 'C') return 'చిన్న సాధారణ మెరుపు — ఫోన్లు మరియు మ్యాప్స్‌కు పూర్తిగా సురక్షితం.';
      return 'చాలా చిన్న మెరుపు — సూర్యుడు ఇప్పుడు ప్రశాంతంగా ఉన్నాడు.';
    },
    kpPlainMeaning: (kp) => {
      if (kp === null) return 'తుఫాను సంఖ్య ఇప్పుడు అందుబాటులో లేదు.';
      if (kp >= 9) return 'ఐదవ గరిష్ట స్థాయి (సంఖ్య ౯) — చాలా పెద్ద సౌర తుఫాను.';
      if (kp >= 8) return 'నాలుగవ స్థాయి (సంఖ్య ౮) — తీవ్రమైన తుఫాను ఉంది.';
      if (kp >= 7) return 'మూడవ స్థాయి (సంఖ్య ౭) — బలమైన తుఫాను ఉంది.';
      if (kp >= 6) return 'రెండవ స్థాయి (సంఖ్య ౬) — మధ్యస్థ తుఫాను ఉంది.';
      if (kp >= 5) return 'మొదటి స్థాయి (సంఖ్య ౫ నుండి తుఫాను మొదలవుతుంది) — చిన్న తుఫాను.';
      if (kp >= 4) return 'చిన్న కదలిక (సంఖ్య ౪ తుఫాను కాదు; తుఫాను సంఖ్య ౫ నుండి మొదలవుతుంది).';
      return `ప్రశాంత స్థితి (సంఖ్య ${localizeDigits(kp, 'te')} ఐదు కంటే తక్కువ, అంటే తుఫాను లేదు).`;
    },
    windPlainMeaning: (speed) => {
      if (speed === null) return 'సూర్యుడి గాలి వేగం ఇప్పుడు అందడం లేదు.';
      if (speed >= 650) return 'చాలా వేగవంతమైన గాలి — భూమిపై తుఫాను అవకాశం పెరుగుతుంది.';
      if (speed >= 480) return 'కొంచెం వేగమైన గాలి — చిన్న కదలికలు రావచ్చు.';
      return 'సాధారణ వేగం (౩౦౦ నుండి ౪౫౦ కిమీ/సెకను సాధారణం).';
    },
    gpsPlainScaleNote: (level) => {
      if (level === 'extreme' || level === 'strong') {
        return 'పెద్ద తుఫాను సమయంలో ఉపగ్రహ సిగ్నల్స్ కొంచెం ఆలస్యం కావచ్చు, ముఖ్యంగా ధ్రువ విమానాలు మరియు ప్రత్యేక యంత్రాలలో.';
      }
      if (level === 'minor') {
        return 'చిన్న కదలిక ఎక్కువగా ధ్రువ ప్రాంతాలలో కనిపిస్తుంది; సాధారణ ఫోన్ మ్యాప్స్ బాగానే పనిచేస్తాయి.';
      }
      return 'పై ఆకాశం ప్రశాంతంగా ఉంది — ఫోన్ మ్యాప్స్, దారి మరియు సిగ్నల్స్ సాధారణంగా పనిచేస్తున్నాయి.';
    },
    feedDiscrepancyTitle: 'ప్రస్తుత అంకె మరియు హెచ్చరికలో తేడా ఎందుకు ఉంది?',
    feedDiscrepancyExplain: {
      'warning-higher-than-live': (liveKp, warningKp) =>
        `ఈ నిమిషం కొలత ప్రశాంతంగా ఉంది (తుఫాను సంఖ్య ${liveKp}, తుఫాను లేదు), కానీ ప్రభుత్వ కేంద్రం జారీ చేసిన హెచ్చరిక ఇంకా అమలులో ఉంది — అందులో ఈ సమయంలో సంఖ్య ${warningKp ?? localizeDigits(4, 'te')} వరకు వెళ్ళవచ్చని తెలిపారు. తాజా సంఖ్య ఈ ఒక్క నిమిషానికి, హెచ్చరిక కొన్ని గంటల కాలానికి సంబంధించినది.`,
      'forecast-higher-than-live': (liveKp, _wKp, forecastG) =>
        `ఈ క్షణం కొలత ప్రశాంతంగా ఉంది (సంఖ్య ${liveKp}), కానీ ఈరోజు పూర్తి అంచనాలో తరువాత ${forecastG ? 'చిన్న తుఫాను' : 'చిన్న కదలిక'} రావచ్చని చెప్పారు. అంచనా పూర్తి రోజుకు, తాజా అంకె ప్రస్తుత క్షణానికి సంబంధించినవి.`,
      'partial-feed': () =>
        'ఈ తనిఖీలో ఒక అంతరిక్ష సెన్సార్ సమాధానం ఇవ్వలేదు, అందుకే ధృవీకరించిన సమాచారం మాత్రమే చూపిస్తున్నాము.',
      none: () => '',
    },
    forecastSectionTitle: 'రాబోయే మూడు రోజుల అంచనా మరియు నిన్నటి స్థితి',
    forecastSectionSubtitle: 'ప్రభుత్వ కేంద్రం ౨౪ గంటల అంచనా, ప్రస్తుత నిమిషం కొలత నుండి వేరుగా చూపబడింది.',
    forecastDayLabels: { today: 'ఈరోజు', tomorrow: 'రేపు', dayAfter: 'ఎల్లుండి' },
    forecastStormScaleLabel: 'తుఫాను అంచనా',
    forecastRadioChanceLabel: 'రేడియో మెరుపు అవకాశం',
    forecastRadiationChanceLabel: 'కణ తుఫాను అవకాశం',
    forecastNoStormText: 'ప్రశాంతం (తుఫాను అంచనా లేదు)',
    yesterdayPeakLabel: 'నిన్నటి అత్యధిక ప్రభుత్వ స్థాయిలు',
    alertCategoryLabels: {
      warning: 'హెచ్చరిక',
      watch: 'ముందస్తు గమనిక',
      alert: 'కొనసాగుతున్న సూచన',
      summary: 'సారాంశం',
    },
    alertTimingLabels: {
      activeWindow: 'ఇప్పుడు అమలులో ఉంది',
      continuing: 'కొనసాగుతోంది',
      completed: 'సమయం ముగిసింది',
      notice: 'ప్రభుత్వ ప్రకటన',
    },
    alertAgencyLabel: 'విడుదల చేసిన సంస్థ',
    alertValidFromLabel: 'ప్రారంభ సమయం',
    alertValidToLabel: 'చివరి సమయం',
    alertBeginTimeLabel: 'మొదలైనది',
    alertImpactsLabel: 'రోజువారీ ప్రభావం',
    localizedAlertContent: (alert) => {
      const code = alert.noticeCode ?? 'OTHER';
      switch (code) {
        case 'K04W':
          return {
            title: 'హెచ్చరిక: అయస్కాంత కదలిక సంఖ్య ౪ వరకు వచ్చే అవకాశం',
            summary:
              'నిర్దేశిత సమయంలో అయస్కాంత సంఖ్య ౪ వరకు చేరవచ్చని ప్రభుత్వ కేంద్రం అంచనా వేసింది. గమనిక: సంఖ్య ౪ అంటే కదలిక మాత్రమే, మొదటి తుఫాను కాదు (తుఫాను సంఖ్య ౫ నుండి మొదలవుతుంది).',
            impact:
              'సాధారణ ఫోన్లు మరియు మ్యాప్స్ బాగానే పనిచేస్తాయి. ధ్రువ ప్రాంతాలలో స్వల్ప ఆకాశ వెలుగులు, విద్యుత్ లైన్లలో చిన్న మార్పులు ఉండవచ్చు.',
          };
        case 'K05W':
        case 'K06W':
        case 'K07W': {
          const kpStr = localizeDigits(alert.kpThreshold ?? 5, 'te');
          return {
            title: `హెచ్చరిక: సౌర తుఫాను అవకాశం (సంఖ్య ${kpStr})`,
            summary: `కింద ఇచ్చిన సమయంలో అయస్కాంత తుఫాను సంఖ్య ${kpStr} వరకు చేరవచ్చని ప్రభుత్వ కేంద్రం హెచ్చరించింది.`,
            impact:
              'ధ్రువ ప్రాంతాలలో రంగుల వెలుగులు, ఉపగ్రహాలపై స్వల్ప ఒత్తిడి మరియు పొడవైన విద్యుత్ లైన్లపై చిన్న ప్రభావం ఉండవచ్చు.',
          };
        }
        case 'K04A':
        case 'K05A':
        case 'K06A':
        case 'K07A': {
          const kpVal = alert.kpThreshold ?? 4;
          const kpStr = localizeDigits(kpVal, 'te');
          return {
            title: `ప్రస్తుత సూచన: అయస్కాంత సంఖ్య ${kpStr} చేరింది`,
            summary: `భూమి కొలత కేంద్రాలు అయస్కాంత సంఖ్య ${kpStr} నమోదు చేశాయి.`,
            impact:
              kpVal >= 5
                ? 'ధ్రువ విమానాలు, రేడియో మరియు ప్రత్యేక యంత్రాలపై స్వల్ప ప్రభావం ఉండవచ్చు; సాధారణ ఫోన్లు సురక్షితం.'
                : 'రోజువారీ జీవితంపై ప్రత్యేక ప్రభావం లేదు; ధ్రువ ఆకాశంలో వెలుగులు కనిపించవచ్చు.',
          };
        }
        case 'EF3A': {
          const peakText = alert.electronPeakPfu
            ? ` నిన్న గరిష్ట స్థాయి ${localizeDigits(alert.electronPeakPfu, 'te')} నమోదైంది.`
            : '';
          return {
            title: 'కొనసాగుతున్న సూచన: ఉపగ్రహాల చుట్టూ వేగవంతమైన కణాలు',
            summary: `ఎత్తైన కక్ష్యలోని ఉపగ్రహాల వద్ద అధిక శక్తి ఎలక్ట్రాన్ కణాలు నిర్ణీత పరిమితి కంటే ఎక్కువగా ఉన్నాయి.${peakText}`,
            impact:
              'భూమిపై ప్రజలకు, ఫోన్ మ్యాప్స్‌కు మరియు ఇంటర్నెట్‌కు ఎటువంటి ప్రమాదం లేదు. ఉపగ్రహ సంస్థలు జాగ్రత్తగా గమనిస్తాయి.',
          };
        }
        case 'WATA_G1':
        case 'WATA_G2':
        case 'WATA_G3': {
          const lvl = alert.gScaleTarget?.replace('G', '') ?? '1';
          return {
            title: `ముందస్తు గమనిక: స్థాయి ${localizeDigits(lvl, 'te')} సౌర తుఫాను అవకాశం`,
            summary: `రాబోయే రోజులలో స్థాయి ${localizeDigits(lvl, 'te')} తుఫాను రావచ్చని ప్రభుత్వ కేంద్రం ముందస్తు సూచన ఇచ్చింది.`,
            impact:
              'సాధారణ ఫోన్లు మరియు మ్యాప్స్ బాగానే పనిచేస్తాయి; ఉత్తర ఆకాశంలో వెలుగులు మరియు ఉపగ్రహాలపై స్వల్ప ప్రభావం ఉండవచ్చు.',
          };
        }
        case 'PROTON_WARN':
        case 'PROTON_ALERT':
          return {
            title: 'సౌర కణాల సూచన (ఉపగ్రహాలు & ధ్రువ విమానాలు)',
            summary: 'ఎత్తైన ధ్రువ మార్గాల వద్ద వేగవంతమైన సౌర కణాలు నమోదయ్యాయి లేదా అంచనా వేయబడ్డాయి.',
            impact: 'ఇది ప్రధానంగా ధ్రువ విమానాలు మరియు ఉపగ్రహాలకు సంబంధించినది; భూమిపై సాధారణ ప్రజలు సురక్షితంగా ఉంటారు.',
          };
        case 'FLARE_SUM':
          return {
            title: 'తాజా సూర్య మెరుపు ప్రభుత్వ సారాంశం',
            summary: 'అంతరిక్ష వాతావరణ ఉపగ్రహాలు సూర్యునిపై ఒక పెద్ద మెరుపును నమోదు చేశాయి.',
            impact: 'పెద్ద మెరుపు వల్ల పగటి వైపు రేడియో సిగ్నల్ కాసేపు తగ్గవచ్చు; ఫోన్ మ్యాప్స్ సాధారణంగా ఉంటాయి.',
          };
        default:
          return {
            title: 'ప్రభుత్వ అంతరిక్ష వాతావరణ ప్రకటన',
            summary: 'అమెరికా జాతీయ అంతరిక్ష వాతావరణ కేంద్రం నుండి తాజా ప్రభుత్వ సమాచారం వచ్చింది. పూర్తి వివరాల కోసం అధికారిక లింక్ చూడండి.',
            impact: 'పూర్తి వివరాల కోసం కింద ఉన్న ప్రభుత్వ లింక్ తెరవండి.',
          };
      }
    },
    chartLegendFlare: 'నీలం గీత: సూర్యుడి మెరుపు బలం',
    chartLegendKp: 'ఆకుపచ్చ చుక్కల గీత: తుఫాను సంఖ్య (౦–౯)',
    chartAxisStrong: 'చాలా ఎక్కువ',
    chartAxisMedium: 'మధ్యస్థం',
    chartAxisQuiet: 'ప్రశాంతం',
    aiOfficialSourcePromptLabel: 'అధికారిక సమాచార లింకులు:',

    welcomeEnglishSubtitle: 'Space Sentinel Hybrid AI',
    welcomeChooseHeading: 'మీరు ఎలా ఉపయోగించాలనుకుంటున్నారు?',
    modeEasyOptionLetter: 'A',
    modeEasyTitle: 'సులభ ఉపయోగం',
    modeEasySubtitle: 'పెద్ద సంఖ్య బటన్లు, సరళమైన మాటలు మరియు వాయిస్ మార్గదర్శకంతో.',
    modeEasyBadge: 'కొత్తవారికి & వాయిస్‌కు ఉత్తమం',
    modeFullOptionLetter: 'B',
    modeFullTitle: 'పూర్తి సమాచారం',
    modeFullSubtitle: 'గ్రాఫ్‌లు, పూర్తి డేటా, హెచ్చరికలు మరియు అన్ని AI ఫీచర్ల కోసం.',
    modeFullBadge: 'చార్ట్‌లు & పూర్తి వివరాలు',
    switchToEasyBtn: 'సులభ మోడ్',
    switchToFullBtn: 'పూర్తి సమాచారం',
    backToChoiceBtn: 'మోడ్ మార్చండి',
    easyPageTitle: 'సులభ అంతరిక్ష మెనూ',
    easyPageSubtitle: 'కింద ఉన్న పెద్ద బటన్‌ను నొక్కండి లేదా 1 నుండి 6 వరకు చెప్పండి.',
    easyBackBtn: 'వెనక్కి',
    easyListenBtn: 'వినండి',
    easyStopBtn: 'ఆపండి',
    easyGuideVoiceBtn: 'బటన్ల వివరాలు వాయిస్‌లో వినండి',
    easyGuideVoiceScript:
      'ఈరోజు అంతరిక్ష వాతావరణం కోసం 1 నొక్కండి. సూర్యుని స్థితి కోసం 2 నొక్కండి. భూమిపై ప్రభావం కోసం 3 నొక్కండి. ప్రమాద హెచ్చరికల కోసం 4 నొక్కండి. మొత్తం సమాచారం వినడానికి 5 నొక్కండి. AIని ప్రశ్న అడగడానికి 6 నొక్కండి.',
    easyVoiceCmdBtn: 'మాట్లాడి ఎంచుకోండి (1–6)',
    easyVoiceCmdListening: 'వింటున్నాము... "1 నొక్కండి" లేదా "ఈరోజు వాతావరణం" అని చెప్పండి',
    easyVoiceCmdHint: 'అన్ని బటన్లను తాకి ఉపయోగించవచ్చు లేదా మైక్‌తో నంబర్ చెప్పవచ్చు.',
    easyVoiceCmdNotUnderstood: 'నంబర్ అర్థం కాలేదు. దయచేసి కింద బటన్‌ను తాకండి.',
    easyVoiceCmdMatched: (num, title) => `${num} తెరుస్తున్నాము: ${title}`,
    easyMenuItems: {
      today: {
        title: 'ఈరోజు అంతరిక్ష వాతావరణం',
        shortDesc: 'ఈరోజు అంతరిక్షం ప్రశాంతంగా ఉందా లేదా తుఫాను ఉందా తెలుసుకోండి.',
      },
      sun: {
        title: 'సూర్యుని పరిస్థితి',
        shortDesc: 'సూర్యుని మెరుపులు మరియు గాలి వేగాన్ని సరళంగా తెలుసుకోండి.',
      },
      earth: {
        title: 'భూమిపై ప్రభావాలు',
        shortDesc: 'మొబైల్, మ్యాప్స్, రేడియో మరియు విద్యుత్ సురక్షితమా తెలుసుకోండి.',
      },
      warnings: {
        title: 'ప్రమాద హెచ్చరిక',
        shortDesc: 'అధికారిక తుఫాను హెచ్చరికలు ఉన్నాయా లేదో చూడండి.',
      },
      'all-voice': {
        title: 'మొత్తం సమాచారం వాయిస్‌లో వినండి',
        shortDesc: 'ఈరోజు పూర్తి నివేదికను సరళంగా వినండి.',
      },
      ai: {
        title: 'AIని ప్రశ్న అడగండి',
        shortDesc: 'టైప్ చేయకుండా బటన్ నొక్కి లేదా మాట్లాడి అడగండి.',
      },
    },
    easyAiHeading: 'సరళమైన ప్రశ్న అడగండి',
    easyAiSubheading: 'కింద ఉన్న ప్రశ్నను నొక్కండి లేదా మైక్ నొక్కి మాట్లాడండి.',
    easyAiQuickPrompts: [
      'ఈరోజు మొబైల్ మ్యాప్స్ మరియు సిగ్నల్స్ సురక్షితంగా ఉన్నాయా?',
      'ప్రస్తుతం సూర్యునిపై ఏదైనా తుఫాను ఉందా?',
      'రేపు ఏదైనా ప్రమాదం ఉందా?',
    ],
    easyAiVoiceAskBtn: 'నొక్కి మీ ప్రశ్న మాట్లాడండి',
    easyAllVoiceTitle: 'ఈరోజు పూర్తి సరళ సారాంశం',
    easyAllVoiceSub: 'వినడానికి కింద "వినండి" బటన్ నొక్కండి.',
    easyNoWarningsTitle: 'ప్రమాద హెచ్చరిక లేదు',
    easyNoWarningsBody: 'ప్రస్తుతం అంతా సాధారణంగా ఉంది. అధికారిక ప్రమాద హెచ్చరిక లేదు.',
    easyWarningsCountBody: (count) => `ప్రస్తుతం ${count} అధికారిక ప్రకటనలు కింద సరళంగా ఉన్నాయి.`,
    easyEarthCalmDetails: [
      'మొబైల్ ఫోన్లు, ఇంటర్నెట్ మరియు మ్యాప్స్ సాధారణంగా పనిచేస్తాయి.',
      'విమానాలు మరియు విద్యుత్ లైన్లకు ఈరోజు ఇబ్బంది లేదు.',
    ],
    easyEarthMinorDetails: [
      'సాధారణ ఫోన్లు మరియు మ్యాప్స్ బాగా పనిచేస్తాయి.',
      'చిన్న తరంగాలు ఉత్తర ధ్రువ ఆకాశంలో మాత్రమే ఉంటాయి.',
    ],
    easyEarthStrongDetails: [
      'దూర ప్రాంత రేడియో మరియు ధ్రువ విమానాల్లో స్వల్ప అంతరాయం ఉండవచ్చు.',
      'భూమిపై సాధారణ ఫోన్లు సురక్షితం; అధికారిక సూచనలు చూడండి.',
    ],
    easySunFlareLabel: 'సూర్యుని మెరుపు స్థాయి',
    easySunWindLabel: 'సూర్య గాలి వేగం',
    easyTodayKpLabel: 'తుఫాను సంఖ్య (౦ నుండి ౯)',
    easyForecastTomorrowPrefix: 'రేపటి అంచనా',
  },

  kn: {
    brandName: 'ಬಾಹ್ಯಾಕಾಶ ಗೆಳೆಯ',
    brandSubtitle: 'ಸೂರ್ಯ ಮತ್ತು ಸಿಗ್ನಲ್ ಸುಲಭ ಮಾಹಿತಿ',
    welcomeIntroBtn: 'ಪರಿಚಯ',

    welcomeTagline:
      'ಸೂರ್ಯನ ಮೇಲೆ ಬಿರುಗಾಳಿ ಇದೆಯೇ, ಫೋನ್ ನಕ್ಷೆಗಳು ಸರಿಯಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತವೆಯೇ ಎಂದು ಐದು ಭಾಷೆಗಳಲ್ಲಿ ಸುಲಭವಾಗಿ ತಿಳಿಯಿರಿ.',
    welcomeWhatTitle: 'ಈ ಜಾಲತಾಣ ಏನು ಮಾಡುತ್ತದೆ?',
    welcomeWhatDesc:
      'ಸರ್ಕಾರಿ ಬಾಹ್ಯಾಕಾಶ ಕೇಂದ್ರದಿಂದ ತಾಜಾ ಸುದ್ದಿ ತಂದು, ಸೂರ್ಯ ಶಾಂತವಾಗಿದ್ದಾನೋ ಅಥವಾ ಬಿರುಗಾಳಿ ಇದೆಯೋ ಎಂದು ಸರಳ ಮಾತುಗಳಲ್ಲಿ ಹೇಳುತ್ತದೆ. ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರ ಕೊಡುತ್ತದೆ.',
    welcomeWhyTitle: 'ಇದನ್ನು ತಿಳಿಯುವುದು ಏಕೆ ಮುಖ್ಯ?',
    welcomeWhyDesc:
      'ದೊಡ್ಡ ಸೌರ ಬಿರುಗಾಳಿಗಳು ರೇಡಿಯೋ, ವಿಮಾನಗಳು, ಫೋನ್ ದಾರಿ ತೋರುವ ನಕ್ಷೆಗಳು ಮತ್ತು ವಿದ್ಯುತ್ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರಬಹುದು. ಮೊದಲೇ ತಿಳಿದರೆ ಎಚ್ಚರ ವಹಿಸಬಹುದು.',
    enterCenterBtn: 'ಮುಖ್ಯ ಪುಟ ತೆರೆಯಿರಿ',
    enterCenterHint: 'ಈಗಿನ ಸ್ಥಿತಿ ನೋಡಿ ಮತ್ತು ಪ್ರಶ್ನೆ ಕೇಳಿ',
    listenIntroBtn: 'ಮಾತಿನಲ್ಲಿ ಕೇಳಿ',
    stopVoiceBtn: 'ಮಾತು ನಿಲ್ಲಿಸಿ',
    voiceLoadingBtn: 'ಧ್ವನಿ ಬರುತ್ತಿದೆ...',
    introSpeech:
      'ಬಾಹ್ಯಾಕಾಶ ಗೆಳೆಯನಿಗೆ ಸ್ವಾಗತ. ಇಲ್ಲಿ ಸೂರ್ಯನ ಮೇಲೆ ಈಗ ಬಿರುಗಾಳಿ ಇದೆಯೇ, ಫೋನ್ ನಕ್ಷೆಗಳು ಸುರಕ್ಷಿತವಾಗಿವೆಯೇ ಎಂದು ನೋಡಬಹುದು. ಕನ್ನಡದಲ್ಲಿ ಪ್ರಶ್ನೆಗಳನ್ನೂ ಕೇಳಬಹುದು.',
    voiceUnavailableNotice: 'ಈ ಫೋನ್‌ನಲ್ಲಿ ಕನ್ನಡ ಮಾತನಾಡುವ ಧ್ವನಿ ಸಿಗುತ್ತಿಲ್ಲ. ನೀವು ಉತ್ತರವನ್ನು ಓದಬಹುದು.',
    voiceOfflineUnavailableNotice: 'ಇಂಟರ್ನೆಟ್ ಇಲ್ಲ ಮತ್ತು ಈ ಫೋನ್‌ನಲ್ಲಿ ಕನ್ನಡ ಧ್ವನಿ ಇಲ್ಲ. ನೀವು ಬರೆದಿರುವುದನ್ನು ಓದಬಹುದು.',
    voiceAvailableBadge: 'ಈ ಫೋನ್‌ನಲ್ಲಿ ಕನ್ನಡ ಧ್ವನಿ ಇದೆ',
    voiceOnlineAvailableBadge: 'ಇಂಟರ್ನೆಟ್ ಇದ್ದಾಗ ಕನ್ನಡ ಧ್ವನಿ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಕೇಳಿಸುತ್ತದೆ',

    navHome: 'ಮನೆ',
    navWeather: 'ಸೂರ್ಯ ಹವಾಮಾನ',
    navHelper: 'ಪ್ರಶ್ನೆ ಕೇಳಿ',
    navAlerts: 'ಎಚ್ಚರಿಕೆ',
    navSettings: 'ಸೆಟ್ಟಿಂಗ್ಸ್',

    headerLanguageLabel: 'ಭಾಷೆ',
    headerThemeLight: 'ಬೆಳಕು',
    headerThemeDark: 'ಕತ್ತಲೆ',
    headerVoiceOn: 'ಧ್ವನಿ ಆನ್',
    headerVoiceMuted: 'ಧ್ವನಿ ಆಫ್',
    refreshBtn: 'ಮತ್ತೆ ನೋಡಿ',
    refreshBtnHint: 'ಈಗಲೇ ತಾಜಾ ಮಾಹಿತಿ ಪಡೆಯಿರಿ',
    refreshingBtn: 'ನೋಡುತ್ತಿದೆ...',
    retryBtn: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    dismissBtn: 'ಮುಚ್ಚಿ',
    offlineBanner: 'ಇಂಟರ್ನೆಟ್ ಇಲ್ಲ ಅಥವಾ ಸಂಪರ್ಕ ಸಿಗುತ್ತಿಲ್ಲ. ಹಿಂದಿನ ಉಳಿಸಿದ ಮಾಹಿತಿ ತೋರಿಸುತ್ತಿದ್ದೇವೆ.',
    connectionRestoredBanner: 'ಇಂಟರ್ನೆಟ್ ಮತ್ತೆ ಬಂದಿದೆ. ತಾಜಾ ಮಾಹಿತಿ ಸಿಕ್ಕಿದೆ.',
    fetchErrorNotice: 'ಈಗ ಹೊಸ ಮಾಹಿತಿ ಸಿಗಲಿಲ್ಲ. ನಾವು ನಿಮಗೆ ಹಿಂದಿನ ಮಾಹಿತಿ ತೋರಿಸುತ್ತಿದ್ದೇವೆ.',
    noaaCacheBanner: 'ಈಗ ಹೊಸ ಮಾಹಿತಿ ಸಿಗಲಿಲ್ಲ. ನಾವು ನಿಮಗೆ ಹಿಂದಿನ ಮಾಹಿತಿ ತೋರಿಸುತ್ತಿದ್ದೇವೆ.',
    noaaNoCacheBanner: 'ಈಗ ಮಾಹಿತಿ ಸಿಗಲಿಲ್ಲ. ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    cachedDataTimePrefix: 'ಕೊನೆಯ ಮಾಹಿತಿ: ',
    notAvailableShort: 'ಲಭ್ಯವಿಲ್ಲ',
    expandDetailsBtn: 'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ',
    hideDetailsBtn: 'ಕಡಿಮೆ ತೋರಿಸಿ',
    officialSourceLinkLabel: 'ಸರ್ಕಾರಿ ಬಾಹ್ಯಾಕಾಶ ಹವಾಮಾನ ಕೇಂದ್ರ',
    returnLiveBtn: 'ತಾಜಾ ಸ್ಥಿತಿಗೆ ಹಿಂತಿರುಗಿ',

    dashPageTitle: 'ಇಂದಿನ ಬಾಹ್ಯಾಕಾಶ ಹವಾಮಾನ',
    dashStatusHeading: 'ಈಗ ಸೂರ್ಯನ ಸ್ಥಿತಿ',
    dashRiskHeading: 'ಸುರಕ್ಷತಾ ಪರಿಶೀಲನೆ',
    dashRiskTrustworthyHint: 'ನೇರ ಸರ್ಕಾರಿ ಬಾಹ್ಯಾಕಾಶ ಕೇಂದ್ರದ ತಾಜಾ ಅಂಕೆಗಳ ಆಧಾರದ ಮೇಲೆ',
    dashRiskUnavailableText: 'ಇನ್ನೂ ತಾಜಾ ಮಾಹಿತಿ ಬಂದಿಲ್ಲ. ಇಂಟರ್ನೆಟ್ ನೋಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    dashAskAiBtn: 'ಎಐಯನ್ನು ಕೇಳಿ',
    dashAskAiHint: 'ಸರಳ ಕನ್ನಡದಲ್ಲಿ ಬರೆದು ಅಥವಾ ಮಾತನಾಡಿ ಏನಾದರೂ ಕೇಳಿ',
    dashViewAlertsBtn: 'ಎಚ್ಚರಿಕೆ ನೋಡಿ',
    dashOpenWeatherBtn: 'ಸೂರ್ಯ ಮತ್ತು ಬಿರುಗಾಳಿ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ',
    dashSolarActivityTitle: 'ಸೂರ್ಯನ ಹೊಳಪಿನ ಮಟ್ಟ',
    dashSolarActivityBrief: 'ಸೂರ್ಯನಿಂದ ಬರುವ ತೀಕ್ಷ್ಣ ಬೆಳಕು ಎಷ್ಟು ಕಡಿಮೆ ಅಥವಾ ಹೆಚ್ಚು ಇದೆ ಎಂದು ತೋರಿಸುತ್ತದೆ.',
    dashSolarActivityDetail:
      'ಸಣ್ಣ ಹೊಳಪು ಸಾಮಾನ್ಯ. ತುಂಬಾ ದೊಡ್ಡ ಹೊಳಪು ಬಂದರೆ ಹಗಲು ಭಾಗದಲ್ಲಿ ರೇಡಿಯೋ ಸಿಗ್ನಲ್ ಸ್ವಲ್ಪ ಹೊತ್ತು ದುರ್ಬಲವಾಗಬಹುದು.',
    dashKpTitle: 'ಭೂಮಿಯ ರಕ್ಷಣಾ ಕವಚ',
    dashKpBrief: 'ಸೊನ್ನೆಯಿಂದ ಒಂಬತ್ತರ ವರೆಗೆ ಭೂಮಿಯ ಕವಚ ಎಷ್ಟು ಶಾಂತವಾಗಿದೆ ಎಂದು ಹೇಳುತ್ತದೆ.',
    dashKpDetail: 'ಐದಕ್ಕಿಂತ ಕಡಿಮೆ ಇದ್ದರೆ ಸಾಮಾನ್ಯ. ಐದು ಅಥವಾ ಹೆಚ್ಚು ಇದ್ದರೆ ಬಿರುಗಾಳಿ ನಡೆಯುತ್ತಿದೆ ಎಂದು ಅರ್ಥ.',
    dashWindTitle: 'ಸೂರ್ಯನ ಗಾಳಿಯ ವೇಗ',
    dashWindBrief: 'ಸೂರ್ಯನಿಂದ ಭೂಮಿಯ ಕಡೆ ಗಾಳಿ ಎಷ್ಟು ವೇಗವಾಗಿ ಬರುತ್ತಿದೆ ಎಂದು ತೋರಿಸುತ್ತದೆ.',
    dashWindDetail: 'ಸಾಮಾನ್ಯ ವೇಗ ೩೦೦ ರಿಂದ ೪೫೦ ಕಿಮೀ/ಸೆಕೆಂಡ್. ೬೦೦ ದಾಟಿದರೆ ಬಿರುಗಾಳಿ ಸಾಧ್ಯತೆ ಹೆಚ್ಚುತ್ತದೆ.',
    dashDensityLabel: 'ಕಣಗಳ ಸಾಂದ್ರತೆ',
    dashGpsTitle: 'ದಾರಿ ತೋರುವ ನಕ್ಷೆ & ಸಿಗ್ನಲ್',
    dashGpsBrief: 'ಇಂದು ಫೋನ್ ನಕ್ಷೆಗಳು ಮತ್ತು ಸಿಗ್ನಲ್ ಮೇಲೆ ಪರಿಣಾಮ ಬೀಳಬಹುದೇ ಎಂದು ಹೇಳುತ್ತದೆ.',
    dashGpsDetail:
      'ಸರ್ಕಾರಿ ಕೇಂದ್ರವು ನಿಮ್ಮ ಮನೆಯ ಹತ್ತಿರದ ನಿಖರ ಮೀಟರ್ ದೋಷವನ್ನು ಅಳೆಯುವುದಿಲ್ಲ; ಇದು ಜಾಗತಿಕ ಬಿರುಗಾಳಿ ಅಂಕೆಗಳ ಆಧಾರದ ಮೇಲಿದೆ.',
    dashChartHeading: 'ಕಳೆದ ಆರು ಗಂಟೆಗಳ ಬದಲಾವಣೆ',
    dashChartSub: 'ಹಿಂದಿನ ಗಂಟೆಗಳ ವಿವರ ನೋಡಲು ಗೆರೆಯ ಮೇಲೆ ಸ್ಪರ್ಶಿಸಿ.',
    dashProvenanceHeading: 'ಮಾಹಿತಿಯ ಸಮಯ ಮತ್ತು ಮೂಲ',

    summarySunTitle: 'ಸೂರ್ಯನ ಹೊಳಪು',
    summaryStormTitle: 'ಬಿರುಗಾಳಿ ಸಂಖ್ಯೆ',
    summaryGpsTitle: 'ಸಿಗ್ನಲ್ ಸಲಹೆ',
    solarWindTitle: 'ಸೂರ್ಯನ ಗಾಳಿ',
    summaryUpdatedTitle: 'ಕೊನೆಯ ಸಮಯ',
    summarySourceTitle: 'ಮೂಲ',
    gpsMeasuredNote: 'ಇಲ್ಲಿ ಸ್ಥಳೀಯ ಮೀಟರ್ ದೋಷ ಅಳೆಯಲಾಗುವುದಿಲ್ಲ; ಇದು ಸರ್ಕಾರಿ ಬಿರುಗಾಳಿ ಅಂಕೆಗಳ ಆಧಾರದ ಮೇಲಿದೆ.',
    sampleGpsNote: (drift, lock) => `ಕಲಿಕೆಯ ಉದಾಹರಣೆ ಮಾತ್ರ (ನಿಜವಲ್ಲ): ±${drift} ಮೀಟರ್, ${lock}% ಸಿಗ್ನಲ್`,
    sourceStatus: {
      'live-noaa': 'ತಾಜಾ ಸರ್ಕಾರಿ ಮಾಹಿತಿ',
      'offline-cache': 'ಹಿಂದಿನ ಉಳಿಸಿದ ಮಾಹಿತಿ',
      simulated: 'ಉದಾಹರಣೆ ಮಾತ್ರ (ನಿಜವಲ್ಲ)',
    },
    severityLabels: {
      nominal: 'ಶಾಂತ ಮತ್ತು ಸುರಕ್ಷಿತವಾಗಿದೆ',
      minor: 'ಸಣ್ಣ ಅಲುಗಾಟ',
      strong: 'ಬಲವಾದ ಬಿರುಗಾಳಿ ಇದೆ',
      extreme: 'ತುಂಬಾ ದೊಡ್ಡ ಬಿರುಗಾಳಿ',
    },
    severityDescriptions: {
      nominal: 'ಸೂರ್ಯ ಮತ್ತು ಭೂಮಿಯ ವಾತಾವರಣ ಶಾಂತವಾಗಿವೆ. ಫೋನ್ ನಕ್ಷೆಗಳು ಚೆನ್ನಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತಿವೆ.',
      minor: 'ಸಣ್ಣ ಅಲುಗಾಟ ಕಂಡುಬಂದಿದೆ. ಸಾಮಾನ್ಯ ಫೋನ್ ಮತ್ತು ನಕ್ಷೆಗಳು ಸರಿಯಾಗಿ ನಡೆಯುತ್ತವೆ.',
      strong: 'ಬಲವಾದ ಸೌರ ಬಿರುಗಾಳಿ ಇದೆ. ವಿಮಾನ ಪ್ರಯಾಣ ಮತ್ತು ಮುಖ್ಯ ರೇಡಿಯೋ ಕೆಲಸಗಳಲ್ಲಿ ಎಚ್ಚರ ಇರಲಿ.',
      extreme: 'ಈಗ ತುಂಬಾ ದೊಡ್ಡ ಬಾಹ್ಯಾಕಾಶ ಬಿರುಗಾಳಿ ಇದೆ. ಸರ್ಕಾರಿ ಸೂಚನೆಗಳನ್ನು ಪಾಲಿಸಿ.',
    },
    unitMeters: 'ಮೀಟರ್',
    unitKmSec: 'ಕಿಮೀ/ಸೆಕೆಂಡ್',
    unitProtonDensity: 'ಕಣಗಳು/ಘನ ಸೆಂ.ಮೀ',
    unitPercent: '%',

    weatherPageTitle: 'ಸೂರ್ಯ ಮತ್ತು ಬಿರುಗಾಳಿಯನ್ನು ಸುಲಭವಾಗಿ ತಿಳಿಯಿರಿ',
    weatherPageSubtitle: 'ಕೆಳಗಿನ ಯಾವುದೇ ಬಟನ್ ಒತ್ತಿ ಸರಳ ಕನ್ನಡದಲ್ಲಿ ಓದಿ.',
    weatherTopicSelectorLabel: 'ವಿಷಯ ಆರಿಸಿ',
    weatherTopics: {
      flares: {
        title: 'ಸೂರ್ಯನ ಹೊಳಪುಗಳು',
        summary: 'ಸೂರ್ಯನಿಂದ ಒಮ್ಮೆಲೇ ಬರುವ ದೊಡ್ಡ ಬೆಳಕು ಮತ್ತು ಶಕ್ತಿ.',
        scientificExplain:
          'ಬಾಹ್ಯಾಕಾಶ ಉಪಗ್ರಹಗಳು ಇದನ್ನು ಸದಾ ಗಮನಿಸುತ್ತವೆ. ಈ ಬೆಳಕು ಸುಮಾರು ಎಂಟು ನಿಮಿಷದಲ್ಲಿ ಭೂಮಿಗೆ ಬರುತ್ತದೆ.',
        impactExplain:
          'ತುಂಬಾ ದೊಡ್ಡ ಹೊಳಪು ಬಂದರೆ ಹಗಲು ಭಾಗದ ದೂರದ ರೇಡಿಯೋ ಸಿಗ್ನಲ್ ಸ್ವಲ್ಪ ಸಮಯ ಕಡಿಮೆಯಾಗಬಹುದು.',
      },
      storms: {
        title: 'ಬಾಹ್ಯಾಕಾಶ ಬಿರುಗಾಳಿ',
        summary: 'ಸೂರ್ಯನಿಂದ ಬರುವ ಕಣಗಳು ಭೂಮಿಯ ರಕ್ಷಣಾ ಕವಚಕ್ಕೆ ಬಡಿದಾಗ.',
        scientificExplain:
          'ಇದನ್ನು ೦ ಯಿಂದ ೫ ರವರೆಗೆ ಅಳೆಯುತ್ತಾರೆ. ಸೂರ್ಯನ ಗಾಳಿ ಜೋರಾಗಿ ಬಡಿದಾಗ ಬಿರುಗಾಳಿ ಶುರುವಾಗುತ್ತದೆ.',
        impactExplain:
          'ದೊಡ್ಡ ಬಿರುಗಾಳಿಗಳಿಂದ ಆಕಾಶದಲ್ಲಿ ಬಣ್ಣದ ಬೆಳಕು ಕಾಣುತ್ತದೆ ಮತ್ತು ಉಪಗ್ರಹಗಳ ಮೇಲೆ ಒತ್ತಡ ಬೀಳಬಹುದು.',
      },
      kp: {
        title: 'ಬಿರುಗಾಳಿ ಸಂಖ್ಯೆ (೦ ರಿಂದ ೯)',
        summary: 'ಸೊನ್ನೆಯಿಂದ ಒಂಬತ್ತರ ವರೆಗೆ ಇರುವ ಸರಳ ಸಂಖ್ಯೆ.',
        scientificExplain:
          'ಜಗತ್ತಿನ ಕೇಂದ್ರಗಳು ಸೇರಿ ಈ ಸಂಖ್ಯೆ ಹೇಳುತ್ತವೆ: ೦–೪ ಶಾಂತ, ೫–೯ ಅಂದರೆ ಬಿರುಗಾಳಿ.',
        impactExplain:
          'ಈ ಸಂಖ್ಯೆ ಹೆಚ್ಚಾದರೆ ಮೇಲಿನ ಆಕಾಶದಲ್ಲಿ ಸಿಗ್ನಲ್ ಸ್ವಲ್ಪ ನಿಧಾನವಾಗಬಹುದು.',
      },
      wind: {
        title: 'ಸೂರ್ಯನ ಗಾಳಿ',
        summary: 'ಸೂರ್ಯನಿಂದ ಸದಾ ಬೀಸುವ ವೇಗದ ಗಾಳಿ.',
        scientificExplain:
          'ಭೂಮಿಯಿಂದ ದೂರ ಇರುವ ಯಂತ್ರಗಳು ಈ ಗಾಳಿಯನ್ನು ಮೊದಲೇ ನೋಡಿ ೧೫ ರಿಂದ ೬೦ ನಿಮಿಷ ಮೊದಲೇ ಸುದ್ದಿ ನೀಡುತ್ತವೆ.',
        impactExplain:
          'ಈ ಗಾಳಿ ೬೦೦ ಕಿಮೀ/ಸೆಕೆಂಡ್‌ಗಿಂತ ವೇಗವಾಗಿದ್ದರೆ ಬಿರುಗಾಳಿ ಬರುವ ಸಾಧ್ಯತೆ ಹೆಚ್ಚುತ್ತದೆ.',
      },
      gps: {
        title: 'ನಕ್ಷೆಗಳು ಮತ್ತು ಉಪಗ್ರಹಗಳು',
        summary: 'ಸೌರ ಬಿರುಗಾಳಿಯಿಂದ ದಾರಿ ತೋರುವ ಸಿಗ್ನಲ್‌ನಲ್ಲಿ ಆಗುವ ಬದಲಾವಣೆ.',
        scientificExplain:
          'ಉಪಗ್ರಹ ಸಿಗ್ನಲ್‌ಗಳು ಆಕಾಶದ ಮೇಲ್ಪದರದ ಮೂಲಕ ಬರುತ್ತವೆ. ದೊಡ್ಡ ಬಿರುಗಾಳಿಯಲ್ಲಿ ಅವು ಸ್ವಲ್ಪ ನಿಧಾನವಾಗಬಹುದು.',
        impactExplain:
          'ಸಾಮಾನ್ಯ ದಿನಗಳಲ್ಲಿ ಫೋನ್ ನಕ್ಷೆಗಳು ಚೆನ್ನಾಗಿ ನಡೆಯುತ್ತವೆ, ದೊಡ್ಡ ಬಿರುಗಾಳಿಯಲ್ಲಿ ವಿಶೇಷ ಯಂತ್ರಗಳ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರಬಹುದು.',
      },
    },
    weatherVisualSectionTitle: 'ಆರು ಗಂಟೆಗಳ ಗ್ರಾಫ್ ಮತ್ತು ಸೂರ್ಯ-ಭೂಮಿ ಚಿತ್ರ',
    trendChartTitle: 'ಕಳೆದ ಆರು ಗಂಟೆಗಳ ಗ್ರಾಫ್',
    trendChartExplain: 'ನೀಲಿ ಗೆರೆ ಸೂರ್ಯನ ಹೊಳಪು ಮತ್ತು ಹಸಿರು ಗೆರೆ ೦ ರಿಂದ ೯ ರವರೆಗೆ ಬಿರುಗಾಳಿ ಸಂಖ್ಯೆ ತೋರಿಸುತ್ತದೆ.',
    orbitTitle: 'ಸೂರ್ಯ, ಭೂಮಿಯ ಕವಚ ಮತ್ತು ಉಪಗ್ರಹಗಳು',
    orbitExplain: 'ಸೂರ್ಯನ ಗಾಳಿ ಭೂಮಿಯ ರಕ್ಷಣಾ ಕವಚಕ್ಕೆ ಹೇಗೆ ಬಡಿಯುತ್ತದೆ ಎಂದು ತೋರಿಸುತ್ತದೆ.',
    saveSnapshotBtn: 'ಇದನ್ನು ಉಳಿಸಿ',
    saveSnapshotHint: 'ಈಗಿನ ಮಾಹಿತಿಯನ್ನು ನಿಮ್ಮ ಪಟ್ಟಿಯಲ್ಲಿ ಇಡಿ',
    exportHtmlBtn: 'ಆಫ್‌ಲೈನ್ ಪುಟ ಇಳಿಸಿ',
    exportHtmlHint: 'ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದಿದ್ದರೂ ತೆರೆಯುವ ಪುಟವನ್ನು ಉಳಿಸಿ',
    savedSnapshotsTitle: 'ನೀವು ಉಳಿಸಿದ ಮಾಹಿತಿ',
    noSnapshotsText: 'ಇನ್ನೂ ಯಾವ ಮಾಹಿತಿಯನ್ನೂ ಉಳಿಸಿಲ್ಲ.',
    weatherSourcesHeading: 'ಮಾಹಿತಿ ಎಲ್ಲಿಂದ ಬರುತ್ತದೆ?',

    alertsPageTitle: 'ಎಚ್ಚರಿಕೆ ಮತ್ತು ಸೂಚನೆಗಳು',
    alertsPageSubtitle: 'ಸರ್ಕಾರಿ ಬಾಹ್ಯಾಕಾಶ ಕೇಂದ್ರದ ಸುದ್ದಿ ಮತ್ತು ಮಾತಿನಲ್ಲಿ ಕೇಳುವ ಬಟನ್.',
    alertsCurrentConditionTitle: 'ಈಗಿನ ಸ್ಥಿತಿ',
    alertsVoiceCardTitle: 'ಮಾತಿನಲ್ಲಿ ಸುರಕ್ಷತಾ ಸುದ್ದಿ ಕೇಳಿ',
    alertsVoiceCardDesc: 'ಈಗಿನ ಪರಿಸ್ಥಿತಿ ಮತ್ತು ಎಚ್ಚರಿಕೆ ಬಗ್ಗೆ ಸರಳ ಕನ್ನಡದಲ್ಲಿ ಕೇಳಿ.',
    card3Action: 'ಮಾತಿನಲ್ಲಿ ಕೇಳಿ',
    card3Stop: 'ಮಾತು ನಿಲ್ಲಿಸಿ',
    alertsOfficialFeedTitle: 'ಸರ್ಕಾರಿ ಪ್ರಕಟಣೆಗಳು',
    alertsRecentLabel: 'ತಾಜಾ ಮತ್ತು ಇತ್ತೀಚಿನ ಪ್ರಕಟಣೆಗಳು',
    alertsEmptyText: 'ಈಗ ಹೊಸ ಎಚ್ಚರಿಕೆಗಳೇನೂ ಇಲ್ಲ. ಎಲ್ಲಾ ಸಾಮಾನ್ಯವಾಗಿದೆ.',
    alertsIssuedLabel: 'ಬಂದ ಸಮಯ',
    alertsGpsImpactTitle: 'ದಾರಿ ಮತ್ತು ಸಿಗ್ನಲ್ ಸ್ಥಿತಿ',
    alertsGpsImpactDesc: 'ಕೇವಲ ಸರ್ಕಾರಿ ಅಂಕೆಗಳ ಆಧಾರದ ಮೇಲೆ ಮಾತ್ರ, ಯಾವುದೇ ಊಹೆಯ ಅಂಕೆಗಳಿಲ್ಲ.',
    alertsSavedSectionTitle: 'ಉಳಿಸಿದ ಎಚ್ಚರಿಕೆಗಳು',
    saveFavoriteBtn: 'ಉಳಿಸಿ',
    savedFavoriteBadge: 'ಉಳಿಸಲಾಗಿದೆ',
    favoritesEmptyText: 'ಇನ್ನೂ ಯಾವ ಎಚ್ಚರಿಕೆಯನ್ನೂ ಉಳಿಸಿಲ್ಲ. ಮೇಲಿನದನ್ನು ಉಳಿಸಿ.',
    removeFavoriteBtn: 'ತೆಗೆಯಿರಿ',
    alertsTrainingTitle: 'ಬಿರುಗಾಳಿ ಉದಾಹರಣೆ ನೋಡಿ (ತಿಳಿಯಲು ಮಾತ್ರ)',
    alertsTrainingDesc: 'ಬಿರುಗಾಳಿಯ ಸಮಯದಲ್ಲಿ ಪರದೆ ಮತ್ತು ಧ್ವನಿ ಹೇಗಿರುತ್ತದೆಂದು ನೋಡಿ. ಇದು ಉದಾಹರಣೆ ಮಾತ್ರ, ನಿಜವಲ್ಲ.',
    alertsTrainingShowBtn: 'ಉದಾಹರಣೆ ತೋರಿಸಿ',
    alertsTrainingHideBtn: 'ಉದಾಹರಣೆ ಮುಚ್ಚಿ',
    testSampleWarning: 'ಇದು ಕಲಿಕೆಯ ಉದಾಹರಣೆ ಮಾತ್ರ — ನಿಜವಾದ ಎಚ್ಚರಿಕೆಯಲ್ಲ.',
    scenarioLabels: {
      nominal: 'ಶಾಂತ ಉದಾಹರಣೆ',
      minor: 'ಸಣ್ಣ ಅಲುಗಾಟ ಉದಾಹರಣೆ',
      strong: 'ಬಲವಾದ ಬಿರುಗಾಳಿ ಉದಾಹರಣೆ',
      extreme: 'ದೊಡ್ಡ ಬಿರುಗಾಳಿ ಉದಾಹರಣೆ',
    },
    emergencySpeech: {
      nominal: (sourceDesc) =>
        `ಬಾಹ್ಯಾಕಾಶ ಗೆಳೆಯನ ತಾಜಾ ಸುದ್ದಿ, ${sourceDesc} ಪ್ರಕಾರ. ಈಗ ಸೂರ್ಯ ಶಾಂತವಾಗಿದ್ದಾನೆ ಮತ್ತು ನಕ್ಷೆಗಳು ಸುರಕ್ಷಿತವಾಗಿವೆ.`,
      minor: (sourceDesc) =>
        `ಬಾಹ್ಯಾಕಾಶ ಗೆಳೆಯನ ಸುದ್ದಿ, ${sourceDesc} ಪ್ರಕಾರ. ಇಂದು ಸಣ್ಣ ಅಲುಗಾಟ ಇದೆ, ಹೊಸ ಸುದ್ದಿಗಳನ್ನು ಗಮನಿಸಿ.`,
      strong: (sourceDesc) =>
        `ಬಾಹ್ಯಾಕಾಶ ಗೆಳೆಯನ ಎಚ್ಚರಿಕೆ, ${sourceDesc} ಪ್ರಕಾರ. ಬಲವಾದ ಬಿರುಗಾಳಿ ಇದೆ; ಮುಖ್ಯ ಪ್ರಯಾಣಗಳಲ್ಲಿ ಪರ್ಯಾಯ ದಾರಿ ಸಿದ್ಧವಿರಲಿ.`,
      extreme: (sourceDesc) =>
        `ಬಾಹ್ಯಾಕಾಶ ಗೆಳೆಯನ ತುರ್ತು ಎಚ್ಚರಿಕೆ, ${sourceDesc} ಪ್ರಕಾರ. ಈಗ ತುಂಬಾ ದೊಡ್ಡ ಸೌರ ಬಿರುಗಾಳಿ ಇದೆ; ಎಚ್ಚರವಿರಲಿ ಮತ್ತು ಸರ್ಕಾರಿ ಸೂಚನೆ ಪಾಲಿಸಿ.`,
    },

    helperTitle: 'ಎಐಯನ್ನು ಪ್ರಶ್ನೆ ಕೇಳಿ',
    helperSubtitle: 'ಸರಳ ಕನ್ನಡದಲ್ಲಿ ಬರೆದು ಅಥವಾ ಮಾತನಾಡಿ ಕೇಳಿ, ನಿಮ್ಮ ಮಾತುಗಳು ಇಲ್ಲಿ ಉಳಿಯುತ್ತವೆ.',
    helperGreeting: 'ನಮಸ್ಕಾರ! ಸೂರ್ಯನ ಬಿರುಗಾಳಿ, ಫೋನ್ ನಕ್ಷೆಗಳು ಅಥವಾ ಈ ಆ್ಯಪ್ ಬಗ್ಗೆ ಯಾವುದೇ ಸರಳ ಪ್ರಶ್ನೆ ಕೇಳಿ.',
    helperPlaceholder: 'ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಇಲ್ಲಿ ಬರೆಯಿರಿ...',
    helperSendBtn: 'ಕಳುಹಿಸಿ',
    helperRecordStart: 'ಮಾತನಾಡಿ ಕೇಳಿ',
    helperRecordStop: 'ಮೈಕ್ ನಿಲ್ಲಿಸಿ',
    helperNewChatBtn: 'ಹೊಸ ಮಾತು ಶುರುಮಾಡಿ',
    chatListBtn: 'ಹಳೆಯ ಮಾತುಗಳು',
    chatCloseListBtn: 'ಮುಚ್ಚಿ',
    chatSearchPlaceholder: 'ಹಳೆಯ ಮಾತು ಹುಡುಕಿ...',
    chatNoMatches: 'ಅಂತಹ ಹಳೆಯ ಮಾತು ಸಿಗಲಿಲ್ಲ.',
    chatEmptyList: 'ಇನ್ನೂ ಯಾವ ಹಳೆಯ ಮಾತೂ ಉಳಿದಿಲ್ಲ.',
    chatModeNewBadge: 'ಹೊಸದು',
    chatModeSavedBadge: 'ಉಳಿಸಿದ',
    chatUntitledFallback: 'ಹೊಸ ಪ್ರಶ್ನೆ',
    chatRenameBtn: 'ಹೆಸರು ಬದಲಿಸಿ',
    chatSaveRenameBtn: 'ಉಳಿಸಿ',
    chatCancelBtn: 'ರದ್ದು',
    chatDeleteBtn: 'ಅಳಿಸಿ',
    chatOriginalLangNote: 'ಮೂಲ ಭಾಷೆಯಲ್ಲೇ ಇದೆ',
    chatCreatedLabel: 'ಪ್ರಾರಂಭ',
    chatLastMsgLabel: 'ಕೊನೆಯ ಸಂದೇಶ',
    helperListenReply: 'ಕೇಳಿ',
    helperReplayReply: 'ಮತ್ತೆ ಕೇಳಿ',
    helperStopReplyVoice: 'ನಿಲ್ಲಿಸಿ',
    helperThinking: 'ಉತ್ತರ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...',
    helperVoiceUnsupported: 'ಈ ಫೋನ್ ಅಥವಾ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮಾತನಾಡಿ ಕೇಳುವುದು ನಡೆಯುತ್ತಿಲ್ಲ. ಕೆಳಗೆ ಬರೆದು ಕಳುಹಿಸಿ.',
    offlineAiUnavailableMsg: (solar) => {
      const age = solar?.fetchedAtIso ? formatAgeForLanguage(solar.fetchedAtIso, 'kn') : '';
      return `ಇಂಟರ್ನೆಟ್ ಇಲ್ಲ ಮತ್ತು ಈ ಫೋನ್‌ನಲ್ಲಿ ಸ್ವಂತ ಎಐ ಇಲ್ಲ, ಆದ್ದರಿಂದ ಈಗ ಹೊಸ ಉತ್ತರ ಬರಲು ಸಾಧ್ಯವಿಲ್ಲ. ${
        solar?.flareClass
          ? `ಕೊನೆಯದಾಗಿ ಉಳಿಸಿದ ಮಾಹಿತಿ${age ? ` (${age})` : ''}: ಹೊಳಪು ${formatDigits(solar.flareClass, 'kn')}, ಬಿರುಗಾಳಿ ಸಂಖ್ಯೆ ${solar.kpIndex !== null ? formatDigits(solar.kpIndex, 'kn') : 'ಲಭ್ಯವಿಲ್ಲ'}.`
          : 'ಇನ್ನೂ ಹಳೆಯ ಮಾಹಿತಿಯೂ ಉಳಿದಿಲ್ಲ.'
      }`;
    },
    offlineGuideActiveNote:
      'ಇಂಟರ್ನೆಟ್ ಆಫ್ ಆಗಿದೆ — ಆಫ್‌ಲೈನ್ ಸ್ಥಳೀಯ ಮಾರ್ಗದರ್ಶಿ ಸಕ್ರಿಯವಾಗಿದೆ, ಉಳಿಸಿದ ಮಾಹಿತಿಯಿಂದ ಮೂಲ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು.',
    offlineNanoAndGuideNote:
      'ಇಂಟರ್ನೆಟ್ ಆಫ್ ಆಗಿದೆ — ಸಣ್ಣ ಇಂಗ್ಲಿಷ್ ಪ್ರಶ್ನೆಗಳು ಸ್ಥಳೀಯ Gemini Nano ಮೂಲಕ ಮತ್ತು ಮೂಲ ಪ್ರಶ್ನೆಗಳು ಆಫ್‌ಲೈನ್ ಸ್ಥಳೀಯ ಮಾರ್ಗದರ್ಶಿಯಲ್ಲಿ ನಡೆಯುತ್ತವೆ.',
    askAiNanoPromptNote:
      'ಈ Desktop Chrome ನಲ್ಲಿ ಸಣ್ಣ ಇಂಗ್ಲಿಷ್ ಉತ್ತರಗಳಿಗೆ Gemini Nano ಲಭ್ಯವಿದೆ. ನೀವು ಇಲ್ಲಿಂದಲೇ ಅದನ್ನು ಸಿದ್ಧಪಡಿಸಬಹುದು.',
    networkAiUnavailableMsg:
      'ಈಗ ಎಐ ಜೊತೆ ಸಂಪರ್ಕ ಆಗುತ್ತಿಲ್ಲ. ಇಂಟರ್ನೆಟ್ ನೋಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    timeoutAiUnavailableMsg:
      'ಉತ್ತರ ಬರಲು ಹೆಚ್ಚು ಸಮಯ ಹಿಡಿಯಿತು. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    rateLimitAiUnavailableMsg:
      'ಈಗ ತುಂಬಾ ಪ್ರಶ್ನೆಗಳು ಬರುತ್ತಿವೆ ಅಥವಾ ಇಂದಿನ ಮಿತಿ ಮುಗಿದಿದೆ. ಸ್ವಲ್ಪ ಸಮಯ ಬಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    providerLabels: {
      'firebase-ai-on-device': 'ON_DEVICE — Gemini Nano',
      'firebase-ai-cloud': 'IN_CLOUD — Firebase AI Logic',
      'server-gemini': 'SERVER BACKUP — /api/gemini/chat',
      'on-device-browser': 'ಹಳೆಯ ಬ್ರೌಸರ್ ಸ್ಥಳೀಯ ಮೋಡ್',
      'offline-local-guide': 'OFFLINE LOCAL GUIDE — ಉಳಿಸಿದ ಸ್ಥಳೀಯ ಮಾಹಿತಿ',
      'offline-unavailable': 'ಉತ್ತರ ಸಿಗಲಿಲ್ಲ',
    },
    starterQuestions: [
      'ಈಗ ಸೂರ್ಯನ ಮೇಲೆ ಏನಾದರೂ ಬಿರುಗಾಳಿ ಇದೆಯೇ?',
      'ಇಂದು ಫೋನ್ ನಕ್ಷೆಗಳು ಸರಿಯಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತವೆಯೇ?',
      'ಬಿರುಗಾಳಿ ಸಂಖ್ಯೆ ನಮಗೆ ಏನು ಹೇಳುತ್ತದೆ?',
      'ಇಂಟರ್ನೆಟ್ ನಿಂತರೆ ಏನು ಕೆಲಸ ಮಾಡುತ್ತದೆ?',
    ],

    settingsTitle: 'ಸೆಟ್ಟಿಂಗ್ಸ್',
    settingsSubtitle: 'ಭಾಷೆ, ಧ್ವನಿ, ಪರದೆ ಬಣ್ಣ ಅಥವಾ ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಸುಲಭವಾಗಿ ಬದಲಿಸಿ.',
    languageCardTitle: 'ಭಾಷೆ',
    languageCardDesc: 'ಬಟನ್ ಮತ್ತು ಹೊಸ ಮಾತು ತಕ್ಷಣ ಬದಲಾಗುತ್ತವೆ; ಹಳೆಯ ಮಾತುಗಳು ಮೂಲ ಭಾಷೆಯಲ್ಲೇ ಇರುತ್ತವೆ.',
    voiceCardTitle: 'ಧ್ವನಿ',
    voiceCardDesc: 'ಮಾತನಾಡುವ ಧ್ವನಿ ಆನ್ ಅಥವಾ ಆಫ್ ಮಾಡಿ ವೇಗ ಆರಿಸಿ.',
    speedSlow: 'ನಿಧಾನ',
    speedNormal: 'ಸಾಮಾನ್ಯ',
    speedFast: 'ವೇಗ',
    alertsDisplaySectionTitle: 'ಪರದೆ ಮತ್ತು ಬರಹ',
    alertsDisplaySectionDesc: 'ಬೆಳಕು ಅಥವಾ ಕತ್ತಲೆ ಬಣ್ಣ ಹಾಗೂ ದೊಡ್ಡ ಅಕ್ಷರ ಆರಿಸಿ.',
    themeLabel: 'ಪರದೆ',
    textSizeLabel: 'ಅಕ್ಷರಗಳು',
    textSizeNormal: 'ಸಾಮಾನ್ಯ',
    textSizeLarge: 'ದೊಡ್ಡದು',
    accountCardTitle: 'ನಿಮ್ಮ ಖಾತೆ',
    accountSignedOutDesc: 'ನಿಮ್ಮ ಮಾತು ಮತ್ತು ಉಳಿಸಿದ ಮಾಹಿತಿ ಸುರಕ್ಷಿತವಾಗಿರಲು ಗೂಗಲ್‌ನಿಂದ ಪ್ರವೇಶಿಸಿ.',
    accountSignedInDesc: (email) => `ನೀವು ಈ ಖಾತೆಯಲ್ಲಿದ್ದೀರಿ: ${email}. ನಿಮ್ಮ ಮಾತುಗಳು ತಾನಾಗಿಯೇ ಉಳಿಯುತ್ತವೆ.`,
    accountSignInBtn: 'ಗೂಗಲ್‌ನಿಂದ ಪ್ರವೇಶಿಸಿ',
    accountSignOutBtn: 'ಹೊರಬನ್ನಿ',
    accountErrorMsg: 'ಪ್ರವೇಶ ಆಗಲಿಲ್ಲ. ಪಾಪ್-ಅಪ್ ಅನುಮತಿ ನೋಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    privacyCardTitle: 'ಈ ಫೋನ್‌ನಲ್ಲಿ ಉಳಿಸಿದ ಮಾಹಿತಿ',
    privacyCardDesc: 'ಮಾತುಗಳು ಈ ಫೋನ್‌ನಲ್ಲಿ ಉಳಿಯಬೇಕೇ ಅಥವಾ ಅಳಿಸಬೇಕೇ ಎಂದು ಆರಿಸಿ.',
    saveConsentLabel: 'ತಾನಾಗಿಯೇ ಉಳಿಸಿ',
    toggleOn: 'ಆನ್',
    toggleOff: 'ಆಫ್',
    clearSavedDataBtn: 'ಉಳಿಸಿದ ಮಾಹಿತಿ ಅಳಿಸಿ',
    aiOfflineSectionTitle: 'ಹೈಬ್ರಿಡ್ ಎಐ ಮತ್ತು ಇಂಟರ್ನೆಟ್',
    aiOfflineSectionDesc: 'ಡೆಸ್ಕ್‌ಟಾಪ್ ಮತ್ತು ಮೊಬೈಲ್‌ನಲ್ಲಿ ಸ್ಥಳೀಯ ಹಾಗೂ ಆನ್‌ಲೈನ್ ಎಐ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತವೆ ನೋಡಿ.',
    aiOnlineExplain: 'ಸಣ್ಣ ಹೊಸ ಇಂಗ್ಲಿಷ್ ಪ್ರಶ್ನೆಗಳಲ್ಲಿ ಲಭ್ಯವಿದ್ದರೆ Gemini Nano, ಇಲ್ಲದಿದ್ದರೆ Firebase AI Logic Cloud ನಡೆಯುತ್ತದೆ. ಕನ್ನಡ, ಉರ್ದು, ಹಿಂದಿ, ತೆಲುಗು ಮತ್ತು ದೀರ್ಘ ಸಂಭಾಷಣೆಗಳು ಯಾವಾಗಲೂ ಕ್ಲೌಡ್‌ನಿಂದ ನಡೆಯುತ್ತವೆ.',
    aiLocalExplain: 'Chrome Prompt API (Gemini Nano) ಸದ್ಯ ಆಯ್ದ Desktop Chrome ನಲ್ಲಿ ಮಾತ್ರ ಕೆಲಸ ಮಾಡುತ್ತದೆ, Android ಮೊಬೈಲ್ Chrome ನಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ. ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದಿದ್ದಾಗ ಆಫ್‌ಲೈನ್ ಸ್ಥಳೀಯ ಮಾರ್ಗದರ್ಶಿ ಉಳಿಸಿದ ಮಾಹಿತಿಯಿಂದ ಮೂಲ ಉತ್ತರಗಳನ್ನು ನೀಡುತ್ತದೆ.',
    card2CheckBtn: 'Gemini Nano ನೋಡಿ',
    prepareDeviceModelBtn: 'Gemini Nano ಸಿದ್ಧ / ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    preparingDeviceModelBtn: 'Gemini Nano ಸಿದ್ಧವಾಗುತ್ತಿದೆ...',
    deviceModelProgressLabel: (percent) => `ಡೌನ್‌ಲೋಡ್ ಪ್ರಗತಿ: ${formatDigits(percent, 'kn')}%`,
    deviceModelReadyNotice: 'ಈ Desktop Chrome ನಲ್ಲಿ ಸಣ್ಣ ಇಂಗ್ಲಿಷ್ ಪ್ರಶ್ನೆಗಳಿಗೆ Gemini Nano ಸಿದ್ಧವಾಗಿದೆ.',
    deviceModelUnsupportedNotice: 'ಈ ಮೊಬೈಲ್ ಅಥವಾ ಬ್ರೌಸರ್‌ನಲ್ಲಿ Chrome Prompt API (Gemini Nano) ಲಭ್ಯವಿಲ್ಲ. ಇದು ಸದ್ಯ ಆಯ್ದ Desktop Chrome ನಲ್ಲಿ ಮಾತ್ರ ನಡೆಯುತ್ತದೆ. ಆನ್‌ಲೈನ್ ಎಐ ಮತ್ತು ಆಫ್‌ಲೈನ್ ಸ್ಥಳೀಯ ಮಾರ್ಗದರ್ಶಿ ಎಂದಿನಂತೆ ಕೆಲಸ ಮಾಡುತ್ತವೆ.',
    deviceModelIncompleteNotice: 'ಪ್ರಕ್ರಿಯೆ ಪೂರ್ಣಗೊಂಡಿದೆ, ಆದರೆ Gemini Nano ಇನ್ನೂ ಸಿದ್ಧವಾಗಿಲ್ಲ. Desktop Chrome ಸೆಟ್ಟಿಂಗ್ಸ್ ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    deviceModelErrorNotice: (detail) =>
      `Gemini Nano ಸಿದ್ಧವಾಗಲಿಲ್ಲ${detail ? `: ${detail}` : '.'}`,
    card2SimulateBtn: 'ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದ ಸ್ಥಿತಿ ನೋಡಿ',
    card2SimulateActive: 'ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದ ಸ್ಥಿತಿ ಆನ್ ಇದೆ',
    localModelLabels: {
      available: 'Desktop Chrome ನಲ್ಲಿ Gemini Nano ಸಿದ್ಧವಾಗಿದೆ (ಸಣ್ಣ ಇಂಗ್ಲಿಷ್ ಪ್ರಶ್ನೆಗಳು)',
      downloadable: 'Gemini Nano ಇಲ್ಲಿ ಲಭ್ಯವಿದೆ — ಡೌನ್‌ಲೋಡ್ ಬಟನ್ ಒತ್ತಿ',
      unsupported: 'ಈ ಮೊಬೈಲ್ ಅಥವಾ ಬ್ರೌಸರ್‌ನಲ್ಲಿ Gemini Nano ಇಲ್ಲ (Desktop Chrome ಮಾತ್ರ)',
    },
    hybridPreferLocalBtn: 'ಮೊದಲು Gemini Nano ಪ್ರಯತ್ನಿಸಿ (ಸಣ್ಣ EN)',
    hybridPreferCloudBtn: 'ಮೊದಲು ಆನ್‌ಲೈನ್ ಎಐ ಪ್ರಯತ್ನಿಸಿ',
    techDetailsShowBtn: 'ಇನ್ನಷ್ಟು ತಾಂತ್ರಿಕ ಮಾಹಿತಿ',
    techDetailsHideBtn: 'ತಾಂತ್ರಿಕ ಮಾಹಿತಿ ಮುಚ್ಚಿ',
    appCheckActiveText: 'ಆ್ಯಪ್ ಹೆಚ್ಚುವರಿ ಭದ್ರತೆ ಆನ್ ಇದೆ.',
    appCheckPendingText: 'ಹೆಚ್ಚುವರಿ ಭದ್ರತಾ ಕೀ ಇನ್ನೂ ಕನ್ಸೋಲ್‌ನಲ್ಲಿ ಸೇರಿಸಿಲ್ಲ.',
    sourcesTitle: 'ಮಾಹಿತಿ ಮೂಲಗಳು',
    sourcesNoaaTitle: 'ರಾಷ್ಟ್ರೀಯ ಬಾಹ್ಯಾಕಾಶ ಹವಾಮಾನ ಕೇಂದ್ರ',
    sourcesNoaaDesc: 'ಸೂರ್ಯನ ಹೊಳಪು, ಬಿರುಗಾಳಿ ಸಂಖ್ಯೆ, ಗಾಳಿ ಮತ್ತು ಎಚ್ಚರಿಕೆಗಳು.',
    sourcesNasaTitle: 'ಬಿರುಗಾಳಿ ಮಾಪನಗಳು',
    sourcesNasaDesc: 'ಸಣ್ಣ, ಬಲವಾದ ಮತ್ತು ದೊಡ್ಡ ಬಿರುಗಾಳಿಯನ್ನು ವಿವರಿಸುವ ಪಟ್ಟಿಗಳು.',
    consoleTodoTitle: 'ನಿರ್ವಾಹಕರ ಕೆಲಸಗಳು',
    consoleTodoItems: [
      'ಫೈರ್‌ಬೇಸ್‌ನಲ್ಲಿ ಗೂಗಲ್ ಪ್ರವೇಶ ಆನ್ ಮಾಡಿ.',
      'ಫೈರ್‌ಬೇಸ್ ಕನ್ಸೋಲ್‌ನಲ್ಲಿ ಎಐ ಸೇವೆ ಆನ್ ಮಾಡಿ.',
      'ಭದ್ರತಾ ಕೀ ಕನ್ಸೋಲ್‌ನಲ್ಲಿ ಸೇರಿಸಿ.',
    ],

    noaaAgencyName: 'ಅಮೆರಿಕಾ ರಾಷ್ಟ್ರೀಯ ಬಾಹ್ಯಾಕಾಶ ಹವಾಮಾನ ಕೇಂದ್ರ (ಸರ್ಕಾರಿ ಸಂಸ್ಥೆ)',
    observedAtLabel: 'ಅಳೆದ ಸಮಯ',
    cachedAgePrefix: 'ಮಾಹಿತಿ ವಯಸ್ಸು',
    flarePlainMeaning: (flareClass) => {
      if (!flareClass) return 'ಸದ್ಯಕ್ಕೆ ಸೂರ್ಯನ ಹೊಳಪಿನ ಅಂಕೆ ಲಭ್ಯವಿಲ್ಲ.';
      const prefix = flareClass.charAt(0).toUpperCase();
      if (prefix === 'X') return 'ತುಂಬಾ ದೊಡ್ಡ ಹೊಳಪು — ಹಗಲು ಭಾಗದ ರೇಡಿಯೋ ಸಿಗ್ನಲ್ ನಿಲ್ಲಬಹುದು.';
      if (prefix === 'M') return 'ಮಧ್ಯಮ ಹೊಳಪು — ರೇಡಿಯೋ ಸಿಗ್ನಲ್ ಸ್ವಲ್ಪ ಹೊತ್ತು ದುರ್ಬಲವಾಗಬಹುದು.';
      if (prefix === 'C') return 'ಸಣ್ಣ ಸಾಮಾನ್ಯ ಹೊಳಪು — ಫೋನ್ ಮತ್ತು ನಕ್ಷೆಗಳಿಗೆ ಸಂಪೂರ್ಣ ಸುರಕ್ಷಿತ.';
      return 'ತುಂಬಾ ಸಣ್ಣ ಹೊಳಪು — ಸೂರ್ಯ ಈಗ ಶಾಂತವಾಗಿದ್ದಾನೆ.';
    },
    kpPlainMeaning: (kp) => {
      if (kp === null) return 'ಬಿರುಗಾಳಿ ಸಂಖ್ಯೆ ಈಗ ಲಭ್ಯವಿಲ್ಲ.';
      if (kp >= 9) return 'ಐದನೇ ಗರಿಷ್ಠ ಮಟ್ಟ (ಸಂಖ್ಯೆ ೯) — ತುಂಬಾ ದೊಡ್ಡ ಬಾಹ್ಯಾಕಾಶ ಬಿರುಗಾಳಿ.';
      if (kp >= 8) return 'ನಾಲ್ಕನೇ ಮಟ್ಟ (ಸಂಖ್ಯೆ ೮) — ತೀವ್ರ ಬಿರುಗಾಳಿ ಇದೆ.';
      if (kp >= 7) return 'ಮೂರನೇ ಮಟ್ಟ (ಸಂಖ್ಯೆ ೭) — ಬಲವಾದ ಬಿರುಗಾಳಿ ಇದೆ.';
      if (kp >= 6) return 'ಎರಡನೇ ಮಟ್ಟ (ಸಂಖ್ಯೆ ೬) — ಮಧ್ಯಮ ಬಿರುಗಾಳಿ ಇದೆ.';
      if (kp >= 5) return 'ಮೊದಲ ಮಟ್ಟ (ಸಂಖ್ಯೆ ೫ ರಿಂದ ಬಿರುಗಾಳಿ ಶುರುವಾಗುತ್ತದೆ) — ಸಣ್ಣ ಬಿರುಗಾಳಿ.';
      if (kp >= 4) return 'ಸಣ್ಣ ಅಲುಗಾಟ (ಸಂಖ್ಯೆ ೪ ಬಿರುಗಾಳಿಯಲ್ಲ; ಬಿರುಗಾಳಿ ಸಂಖ್ಯೆ ೫ ರಿಂದ ಶುರುವಾಗುತ್ತದೆ).';
      return `ಶಾಂತ ಸ್ಥಿತಿ (ಸಂಖ್ಯೆ ${localizeDigits(kp, 'kn')} ಐದಕ್ಕಿಂತ ಕಡಿಮೆ ಇದೆ, ಅಂದರೆ ಬಿರುಗಾಳಿ ಇಲ್ಲ).`;
    },
    windPlainMeaning: (speed) => {
      if (speed === null) return 'ಸೂರ್ಯನ ಗಾಳಿಯ ತಾಜಾ ವೇಗ ಈಗ ಸಿಗುತ್ತಿಲ್ಲ.';
      if (speed >= 650) return 'ತುಂಬಾ ವೇಗದ ಗಾಳಿ — ಭೂಮಿಯ ಮೇಲೆ ಬಿರುಗಾಳಿ ಸಾಧ್ಯತೆ ಹೆಚ್ಚುತ್ತದೆ.';
      if (speed >= 480) return 'ಸ್ವಲ್ಪ ವೇಗದ ಗಾಳಿ — ಸಣ್ಣ ಅಲುಗಾಟ ಬರಬಹುದು.';
      return 'ಸಾಮಾನ್ಯ ವೇಗ (೩೦೦ ರಿಂದ ೪೫೦ ಕಿಮೀ/ಸೆಕೆಂಡ್ ಸಹಜವಾಗಿದೆ).';
    },
    gpsPlainScaleNote: (level) => {
      if (level === 'extreme' || level === 'strong') {
        return 'ದೊಡ್ಡ ಬಿರುಗಾಳಿಯಲ್ಲಿ ಉಪಗ್ರಹ ಸಿಗ್ನಲ್ ಸ್ವಲ್ಪ ನಿಧಾನವಾಗಬಹುದು, ವಿಶೇಷವಾಗಿ ಧ್ರುವ ವಿಮಾನಗಳು ಮತ್ತು ವಿಶೇಷ ಯಂತ್ರಗಳಲ್ಲಿ.';
      }
      if (level === 'minor') {
        return 'ಸಣ್ಣ ಅಲುಗಾಟ ಹೆಚ್ಚಾಗಿ ಧ್ರುವ ಪ್ರದೇಶಗಳಲ್ಲಿ ಕಾಣುತ್ತದೆ; ಸಾಮಾನ್ಯ ಫೋನ್ ನಕ್ಷೆಗಳು ಸರಿಯಾಗಿ ನಡೆಯುತ್ತವೆ.';
      }
      return 'ಮೇಲಿನ ಆಕಾಶ ಶಾಂತವಾಗಿದೆ — ಫೋನ್ ನಕ್ಷೆಗಳು, ದಾರಿ ಮತ್ತು ಸಿಗ್ನಲ್ ಸಹಜವಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತಿವೆ.';
    },
    feedDiscrepancyTitle: 'ಈಗಿನ ಸಂಖ್ಯೆ ಮತ್ತು ಎಚ್ಚರಿಕೆಯಲ್ಲಿ ವ್ಯತ್ಯಾಸ ಏಕೆ ಇದೆ?',
    feedDiscrepancyExplain: {
      'warning-higher-than-live': (liveKp, warningKp) =>
        `ಈ ನಿಮಿಷದ ತಾಜಾ ಅಳತೆ ಶಾಂತವಾಗಿದೆ (ಬಿರುಗಾಳಿ ಸಂಖ್ಯೆ ${liveKp}, ಬಿರುಗಾಳಿ ಇಲ್ಲ), ಆದರೆ ಸರ್ಕಾರಿ ಕೇಂದ್ರದ ಒಂದು ತೆರೆದ ಎಚ್ಚರಿಕೆ ಇನ್ನೂ ಚಾಲ್ತಿಯಲ್ಲಿದೆ — ಅದರಲ್ಲಿ ಈ ಅವಧಿಯಲ್ಲಿ ಸಂಖ್ಯೆ ${warningKp ?? localizeDigits(4, 'kn')} ತಲುಪಬಹುದು ಎಂದು ತಿಳಿಸಲಾಗಿದೆ. ತಾಜಾ ಸಂಖ್ಯೆ ಈ ಒಂದು ನಿಮಿಷದ್ದು, ಎಚ್ಚರಿಕೆ ಹಲವು ಗಂಟೆಗಳ ಅವಧಿಗೆ ಇರುತ್ತದೆ.`,
      'forecast-higher-than-live': (liveKp, _wKp, forecastG) =>
        `ಈ ಕ್ಷಣದ ಅಳತೆ ಶಾಂತವಾಗಿದೆ (ಸಂಖ್ಯೆ ${liveKp}), ಆದರೆ ಇಂದಿನ ಪೂರ್ತಿ ಮುನ್ಸೂಚನೆಯಲ್ಲಿ ನಂತರ ${forecastG ? 'ಸಣ್ಣ ಬಿರುಗಾಳಿ' : 'ಸಣ್ಣ ಅಲುಗಾಟ'} ಬರಬಹುದೆಂದು ಹೇಳಲಾಗಿದೆ. ಮುನ್ಸೂಚನೆ ಪೂರ್ತಿ ದಿನಕ್ಕೆ, ತಾಜಾ ಸಂಖ್ಯೆ ಈಗಿನ ಕ್ಷಣಕ್ಕೆ ಸಂಬಂಧಿಸಿದೆ.`,
      'partial-feed': () =>
        'ಈ ಪರಿಶೀಲನೆಯಲ್ಲಿ ಒಂದು ಬಾಹ್ಯಾಕಾಶ ಸೆನ್ಸಾರ್ ಉತ್ತರಿಸಲಿಲ್ಲ, ಆದ್ದರಿಂದ ದೃಢಪಟ್ಟ ಲಭ್ಯ ಮಾಹಿತಿಯನ್ನು ಮಾತ್ರ ತೋರಿಸುತ್ತಿದ್ದೇವೆ.',
      none: () => '',
    },
    forecastSectionTitle: 'ಮುಂದಿನ ಮೂರು ದಿನಗಳ ಮುನ್ಸೂಚನೆ ಮತ್ತು ನಿನ್ನೆಯ ಸ್ಥಿತಿ',
    forecastSectionSubtitle: 'ಸರ್ಕಾರಿ ಕೇಂದ್ರದ ೨೪ ಗಂಟೆಗಳ ಮುನ್ಸೂಚನೆ, ಈಗಿನ ನಿಮಿಷದ ಅಳತೆಯಿಂದ ಪ್ರತ್ಯೇಕವಾಗಿ ತೋರಿಸಲಾಗಿದೆ.',
    forecastDayLabels: { today: 'ಇಂದು', tomorrow: 'ನಾಳೆ', dayAfter: 'ನಾಡಿದ್ದು' },
    forecastStormScaleLabel: 'ಬಿರುಗಾಳಿ ಮುನ್ಸೂಚನೆ',
    forecastRadioChanceLabel: 'ರೇಡಿಯೋ ಹೊಳಪು ಸಾಧ್ಯತೆ',
    forecastRadiationChanceLabel: 'ಕಣ ಬಿರುಗಾಳಿ ಸಾಧ್ಯತೆ',
    forecastNoStormText: 'ಶಾಂತ (ಬಿರುಗಾಳಿ ನಿರೀಕ್ಷೆಯಿಲ್ಲ)',
    yesterdayPeakLabel: 'ನಿನ್ನೆಯ ಅತ್ಯಧಿಕ ಸರ್ಕಾರಿ ಮಟ್ಟಗಳು',
    alertCategoryLabels: {
      warning: 'ಎಚ್ಚರಿಕೆ',
      watch: 'ಮುಂಚಿತ ನಿಗಾ',
      alert: 'ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಸೂಚನೆ',
      summary: 'ಸಾರಾಂಶ',
    },
    alertTimingLabels: {
      activeWindow: 'ಈಗ ಚಾಲ್ತಿಯಲ್ಲಿದೆ',
      continuing: 'ಮುಂದುವರಿಯುತ್ತಿದೆ',
      completed: 'ಅವಧಿ ಮುಗಿದಿದೆ',
      notice: 'ಸರ್ಕಾರಿ ಪ್ರಕಟಣೆ',
    },
    alertAgencyLabel: 'ಬಿಡುಗಡೆ ಮಾಡಿದ ಸಂಸ್ಥೆ',
    alertValidFromLabel: 'ಆರಂಭ ಸಮಯ',
    alertValidToLabel: 'ಕೊನೆಯ ಸಮಯ',
    alertBeginTimeLabel: 'ಶುರುವಾದದ್ದು',
    alertImpactsLabel: 'ದೈನಂದಿನ ಪರಿಣಾಮ',
    localizedAlertContent: (alert) => {
      const code = alert.noticeCode ?? 'OTHER';
      switch (code) {
        case 'K04W':
          return {
            title: 'ಎಚ್ಚರಿಕೆ: ಅಯಸ್ಕಾಂತೀಯ ಅಲುಗಾಟ ಸಂಖ್ಯೆ ೪ ತಲುಪುವ ನಿರೀಕ್ಷೆ',
            summary:
              'ನಿಗದಿತ ಅವಧಿಯಲ್ಲಿ ಅಯಸ್ಕಾಂತೀಯ ಸಂಖ್ಯೆ ೪ ತಲುಪಬಹುದು ಎಂದು ಸರ್ಕಾರಿ ಕೇಂದ್ರ ಅಂದಾಜಿಸಿದೆ. ಗಮನಿಸಿ: ಸಂಖ್ಯೆ ೪ ಕೇವಲ ಅಲುಗಾಟ ಮಾತ್ರ, ಮೊದಲ ಬಿರುಗಾಳಿಯಲ್ಲ (ಬಿರುಗಾಳಿ ಸಂಖ್ಯೆ ೫ ರಿಂದ ಶುರುವಾಗುತ್ತದೆ).',
            impact:
              'ಸಾಮಾನ್ಯ ಫೋನ್ ಮತ್ತು ನಕ್ಷೆಗಳು ಸರಿಯಾಗಿ ನಡೆಯುತ್ತವೆ. ಧ್ರುವ ಪ್ರದೇಶಗಳಲ್ಲಿ ಸಣ್ಣ ಆಕಾಶ ಬೆಳಕು ಮತ್ತು ವಿದ್ಯುತ್ ತಂತಿಗಳಲ್ಲಿ ಸ್ವಲ್ಪ ಏರಿಳಿತ ಇರಬಹುದು.',
          };
        case 'K05W':
        case 'K06W':
        case 'K07W': {
          const kpStr = localizeDigits(alert.kpThreshold ?? 5, 'kn');
          return {
            title: `ಎಚ್ಚರಿಕೆ: ಸೌರ ಬಿರುಗಾಳಿ ನಿರೀಕ್ಷೆ (ಸಂಖ್ಯೆ ${kpStr})`,
            summary: `ಕೆಳಗೆ ನೀಡಿರುವ ಅವಧಿಯಲ್ಲಿ ಅಯಸ್ಕಾಂತೀಯ ಬಿರುಗಾಳಿ ಸಂಖ್ಯೆ ${kpStr} ತಲುಪಬಹುದೆಂದು ಸರ್ಕಾರಿ ಕೇಂದ್ರ ಎಚ್ಚರಿಸಿದೆ.`,
            impact:
              'ಧ್ರುವ ಪ್ರದೇಶಗಳಲ್ಲಿ ಬಣ್ಣದ ಬೆಳಕು, ಉಪಗ್ರಹಗಳ ಮೇಲೆ ಸ್ವಲ್ಪ ಒತ್ತಡ ಮತ್ತು ಉದ್ದನೆಯ ವಿದ್ಯುತ್ ತಂತಿಗಳ ಮೇಲೆ ಸಣ್ಣ ಪರಿಣಾಮ ಇರಬಹುದು.',
          };
        }
        case 'K04A':
        case 'K05A':
        case 'K06A':
        case 'K07A': {
          const kpVal = alert.kpThreshold ?? 4;
          const kpStr = localizeDigits(kpVal, 'kn');
          return {
            title: `ಈಗಿನ ಸೂಚನೆ: ಅಯಸ್ಕಾಂತೀಯ ಸಂಖ್ಯೆ ${kpStr} ತಲುಪಿದೆ`,
            summary: `ಭೂಮಿಯ ಅಳತೆ ಕೇಂದ್ರಗಳು ಅಯಸ್ಕಾಂತೀಯ ಸಂಖ್ಯೆ ${kpStr} ದಾಖಲಿಸಿವೆ.`,
            impact:
              kpVal >= 5
                ? 'ಧ್ರುವ ವಿಮಾನಗಳು, ರೇಡಿಯೋ ಮತ್ತು ವಿಶೇಷ ಯಂತ್ರಗಳ ಮೇಲೆ ಸಣ್ಣ ಪರಿಣಾಮ ಇರಬಹುದು; ಸಾಮಾನ್ಯ ಫೋನ್ ಸುರಕ್ಷಿತವಾಗಿದೆ.'
                : 'ದೈನಂದಿನ ಜೀವನದ ಮೇಲೆ ವಿಶೇಷ ಪರಿಣಾಮವಿಲ್ಲ; ಧ್ರುವ ಆಕಾಶದಲ್ಲಿ ಬೆಳಕು ಕಾಣಬಹುದು.',
          };
        }
        case 'EF3A': {
          const peakText = alert.electronPeakPfu
            ? ` ನಿನ್ನೆ ಗರಿಷ್ಠ ಮಟ್ಟ ${localizeDigits(alert.electronPeakPfu, 'kn')} ದಾಖಲಾಗಿದೆ.`
            : '';
          return {
            title: 'ಮುಂದುವರಿದ ಸೂಚನೆ: ಉಪಗ್ರಹಗಳ ಸುತ್ತ ವೇಗದ ಕಣಗಳು',
            summary: `ಎತ್ತರದ ಕಕ್ಷೆಯಲ್ಲಿರುವ ಉಪಗ್ರಹಗಳ ಬಳಿ ಹೆಚ್ಚಿನ ಶಕ್ತಿಯ ಎಲೆಕ್ಟ್ರಾನ್ ಕಣಗಳು ನಿಗದಿತ ಮಿತಿಗಿಂತ ಹೆಚ್ಚಾಗಿವೆ.${peakText}`,
            impact:
              'ಭೂಮಿಯ ಮೇಲಿನ ಜನರಿಗೆ, ಫೋನ್ ನಕ್ಷೆಗಳಿಗೆ ಮತ್ತು ಇಂಟರ್ನೆಟ್‌ಗೆ ಯಾವುದೇ ಅಪಾಯವಿಲ್ಲ. ಉಪಗ್ರಹ ಸಂಸ್ಥೆಗಳು ಜಾಗರೂಕತೆಯಿಂದ ಗಮನಿಸುತ್ತವೆ.',
          };
        }
        case 'WATA_G1':
        case 'WATA_G2':
        case 'WATA_G3': {
          const lvl = alert.gScaleTarget?.replace('G', '') ?? '1';
          return {
            title: `ಮುಂಚಿತ ನಿಗಾ: ಮಟ್ಟ ${localizeDigits(lvl, 'kn')} ಸೌರ ಬಿರುಗಾಳಿ ಸಾಧ್ಯತೆ`,
            summary: `ಮುಂದಿನ ದಿನಗಳಲ್ಲಿ ಮಟ್ಟ ${localizeDigits(lvl, 'kn')} ಬಿರುಗಾಳಿ ಬರಬಹುದೆಂದು ಸರ್ಕಾರಿ ಕೇಂದ್ರ ಮುಂಚಿತ ಸೂಚನೆ ನೀಡಿದೆ.`,
            impact:
              'ಸಾಮಾನ್ಯ ಫೋನ್ ಮತ್ತು ನಕ್ಷೆಗಳು ಸಹಜವಾಗಿ ನಡೆಯುತ್ತವೆ; ಉತ್ತರ ಆಕಾಶದಲ್ಲಿ ಬೆಳಕು ಮತ್ತು ಉಪಗ್ರಹಗಳ ಮೇಲೆ ಸ್ವಲ್ಪ ಪರಿಣಾಮ ಸಾಧ್ಯ.',
          };
        }
        case 'PROTON_WARN':
        case 'PROTON_ALERT':
          return {
            title: 'ಸೌರ ಕಣಗಳ ಸೂಚನೆ (ಉಪಗ್ರಹಗಳು ಮತ್ತು ಧ್ರುವ ವಿಮಾನಗಳು)',
            summary: 'ಎತ್ತರದ ಧ್ರುವ ಮಾರ್ಗಗಳ ಬಳಿ ಸೂರ್ಯನ ವೇಗದ ಕಣಗಳು ದಾಖಲಾಗಿವೆ ಅಥವಾ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ.',
            impact: 'ಇದು ಮುಖ್ಯವಾಗಿ ಧ್ರುವ ವಿಮಾನಗಳು ಮತ್ತು ಉಪಗ್ರಹಗಳಿಗೆ ಸಂಬಂಧಿಸಿದೆ; ನೆಲದ ಮೇಲಿನ ಸಾಮಾನ್ಯ ಜನರು ಸುರಕ್ಷಿತವಾಗಿದ್ದಾರೆ.',
          };
        case 'FLARE_SUM':
          return {
            title: 'ಇತ್ತೀಚಿನ ಸೂರ್ಯನ ಹೊಳಪಿನ ಸರ್ಕಾರಿ ಸಾರಾಂಶ',
            summary: 'ಬಾಹ್ಯಾಕಾಶ ಹವಾಮಾನ ಉಪಗ್ರಹಗಳು ಸೂರ್ಯನ ಮೇಲೆ ದೊಡ್ಡ ಹೊಳಪನ್ನು ದಾಖಲಿಸಿವೆ.',
            impact: 'ದೊಡ್ಡ ಹೊಳಪಿನಿಂದ ಹಗಲು ಭಾಗದ ರೇಡಿಯೋ ಸಿಗ್ನಲ್ ಸ್ವಲ್ಪ ಸಮಯ ಕಡಿಮೆಯಾಗಬಹುದು; ಫೋನ್ ನಕ್ಷೆಗಳು ಸಾಮಾನ್ಯವಾಗಿರುತ್ತವೆ.',
          };
        default:
          return {
            title: 'ಸರ್ಕಾರಿ ಬಾಹ್ಯಾಕಾಶ ಹವಾಮಾನ ಪ್ರಕಟಣೆ',
            summary: 'ಅಮೆರಿಕಾ ರಾಷ್ಟ್ರೀಯ ಬಾಹ್ಯಾಕಾಶ ಹವಾಮಾನ ಕೇಂದ್ರದಿಂದ ಹೊಸ ಸರ್ಕಾರಿ ಮಾಹಿತಿ ಬಂದಿದೆ. ಸಂಪೂರ್ಣ ವಿವರಗಳಿಗಾಗಿ ಅಧಿಕೃತ ಲಿಂಕ್ ನೋಡಿ.',
            impact: 'ಸಂಪೂರ್ಣ ವಿವರಗಳಿಗಾಗಿ ಕೆಳಗಿನ ಸರ್ಕಾರಿ ಲಿಂಕ್ ತೆರೆಯಿರಿ.',
          };
      }
    },
    chartLegendFlare: 'ನೀಲಿ ಗೆರೆ: ಸೂರ್ಯನ ಹೊಳಪಿನ ಶಕ್ತಿ',
    chartLegendKp: 'ಹಸಿರು ಚುಕ್ಕೆ ಗೆರೆ: ಬಿರುಗಾಳಿ ಸಂಖ್ಯೆ (೦–೯)',
    chartAxisStrong: 'ತುಂಬಾ ಹೆಚ್ಚು',
    chartAxisMedium: 'ಮಧ್ಯಮ',
    chartAxisQuiet: 'ಶಾಂತ',
    aiOfficialSourcePromptLabel: 'ಅಧಿಕೃತ ಮಾಹಿತಿ ಲಿಂಕ್‌ಗಳು:',

    welcomeEnglishSubtitle: 'Space Sentinel Hybrid AI',
    welcomeChooseHeading: 'ನೀವು ಹೇಗೆ ಬಳಸಲು ಬಯಸುತ್ತೀರಿ?',
    modeEasyOptionLetter: 'A',
    modeEasyTitle: 'ಸುಲಭ ಬಳಕೆ',
    modeEasySubtitle: 'ದೊಡ್ಡ ಸಂಖ್ಯೆಯ ಬಟನ್‌ಗಳು, ಸರಳ ಮಾತುಗಳು ಮತ್ತು ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನದೊಂದಿಗೆ.',
    modeEasyBadge: 'ಆರಂಭಿಕರಿಗೆ ಮತ್ತು ಧ್ವನಿಗೆ ಉತ್ತಮ',
    modeFullOptionLetter: 'B',
    modeFullTitle: 'ಪೂರ್ಣ ಮಾಹಿತಿ',
    modeFullSubtitle: 'ಚಾರ್ಟ್‌ಗಳು, ವೈಜ್ಞಾನಿಕ ಡೇಟಾ, ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಪೂರ್ಣ AI ವೈಶಿಷ್ಟ್ಯಗಳಿಗಾಗಿ.',
    modeFullBadge: 'ಚಾರ್ಟ್‌ಗಳು ಮತ್ತು ಪೂರ್ಣ ವಿವರ',
    switchToEasyBtn: 'ಸುಲಭ ಮೋಡ್',
    switchToFullBtn: 'ಪೂರ್ಣ ಮಾಹಿತಿ',
    backToChoiceBtn: 'ವಿಧಾನ ಬದಲಿಸಿ',
    easyPageTitle: 'ಸುಲಭ ಬಾಹ್ಯಾಕಾಶ ಮೆನು',
    easyPageSubtitle: 'ಕೆಳಗಿನ ಯಾವುದೇ ದೊಡ್ಡ ಬಟನ್ ಒತ್ತಿ, ಅಥವಾ 1 ರಿಂದ 6 ಸಂಖ್ಯೆ ಹೇಳಿ.',
    easyBackBtn: 'ಹಿಂದಕ್ಕೆ',
    easyListenBtn: 'ಕೇಳಿ',
    easyStopBtn: 'ನಿಲ್ಲಿಸಿ',
    easyGuideVoiceBtn: 'ಬಟನ್‌ಗಳ ವಿವರ ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ',
    easyGuideVoiceScript:
      'ಇಂದಿನ ಬಾಹ್ಯಾಕಾಶ ಹವಾಮಾನಕ್ಕಾಗಿ 1 ಒತ್ತಿ. ಸೂರ್ಯನ ಸ್ಥಿತಿಗಾಗಿ 2 ಒತ್ತಿ. ಭೂಮಿಯ ಮೇಲಿನ ಪರಿಣಾಮಕ್ಕಾಗಿ 3 ಒತ್ತಿ. ಅಪಾಯದ ಎಚ್ಚರಿಕೆಗಾಗಿ 4 ಒತ್ತಿ. ಎಲ್ಲಾ ಮಾಹಿತಿ ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಲು 5 ಒತ್ತಿ. AIಗೆ ಪ್ರಶ್ನೆ ಕೇಳಲು 6 ಒತ್ತಿ.',
    easyVoiceCmdBtn: 'ಮಾತನಾಡಿ ಆಯ್ಕೆಮಾಡಿ (1–6)',
    easyVoiceCmdListening: 'ಕೇಳುತ್ತಿದ್ದೇವೆ... "1 ಒತ್ತಿ" ಅಥವಾ "ಇಂದಿನ ಹವಾಮಾನ" ಎಂದು ಹೇಳಿ',
    easyVoiceCmdHint: 'ಎಲ್ಲಾ ಬಟನ್‌ಗಳನ್ನು ಸ್ಪರ್ಶಿಸಿ ಬಳಸಬಹುದು ಅಥವಾ ಮೈಕ್‌ನಲ್ಲಿ ಸಂಖ್ಯೆ ಹೇಳಬಹುದು.',
    easyVoiceCmdNotUnderstood: 'ಸಂಖ್ಯೆ ತಿಳಿಯಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ.',
    easyVoiceCmdMatched: (num, title) => `${num} ತೆರೆಯಲಾಗುತ್ತಿದೆ: ${title}`,
    easyMenuItems: {
      today: {
        title: 'ಇಂದಿನ ಬಾಹ್ಯಾಕಾಶ ಹವಾಮಾನ',
        shortDesc: 'ಇಂದು ಬಾಹ್ಯಾಕಾಶ ಶಾಂತವಾಗಿದೆಯೇ ಅಥವಾ ಬಿರುಗಾಳಿ ಇದೆಯೇ ತಿಳಿಯಿರಿ.',
      },
      sun: {
        title: 'ಸೂರ್ಯನ ಸ್ಥಿತಿ',
        shortDesc: 'ಸೂರ್ಯನ ಹೊಳಪು ಮತ್ತು ಗಾಳಿಯ ವೇಗವನ್ನು ಸರಳವಾಗಿ ತಿಳಿಯಿರಿ.',
      },
      earth: {
        title: 'ಭೂಮಿಯ ಮೇಲಿನ ಪರಿಣಾಮಗಳು',
        shortDesc: 'ಮೊಬೈಲ್, ಮ್ಯಾಪ್ಸ್, ರೇಡಿಯೋ ಮತ್ತು ವಿದ್ಯುತ್ ಸುರಕ್ಷಿತವೇ ತಿಳಿಯಿರಿ.',
      },
      warnings: {
        title: 'ಅಪಾಯದ ಎಚ್ಚರಿಕೆ',
        shortDesc: 'ಅಧಿಕೃತ ಬಿರುಗಾಳಿ ಎಚ್ಚರಿಕೆಗಳಿವೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.',
      },
      'all-voice': {
        title: 'ಎಲ್ಲಾ ಮಾಹಿತಿಯನ್ನು ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ',
        shortDesc: 'ಇಂದಿನ ಪೂರ್ಣ ವರದಿಯನ್ನು ಸರಳವಾಗಿ ಕೇಳಿ.',
      },
      ai: {
        title: 'AIಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ',
        shortDesc: 'ಟೈಪ್ ಮಾಡದೆ ಬಟನ್ ಒತ್ತಿ ಅಥವಾ ಮಾತನಾಡಿ ಕೇಳಿ.',
      },
    },
    easyAiHeading: 'ಸರಳ ಪ್ರಶ್ನೆ ಕೇಳಿ',
    easyAiSubheading: 'ಕೆಳಗಿನ ಪ್ರಶ್ನೆಯನ್ನು ಒತ್ತಿ ಅಥವಾ ಮೈಕ್ ಒತ್ತಿ ಮಾತನಾಡಿ.',
    easyAiQuickPrompts: [
      'ಇಂದು ಮೊಬೈಲ್ ಮ್ಯಾಪ್ಸ್ ಮತ್ತು ಸಿಗ್ನಲ್‌ಗಳು ಸುರಕ್ಷಿತವಾಗಿವೆಯೇ?',
      'ಈಗ ಸೂರ್ಯನ ಮೇಲೆ ಯಾವುದೇ ಬಿರುಗಾಳಿ ಇದೆಯೇ?',
      'ನಾಳೆ ಏನಾದರೂ ಅಪಾಯವಿದೆಯೇ?',
    ],
    easyAiVoiceAskBtn: 'ಒತ್ತಿ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಮಾತನಾಡಿ',
    easyAllVoiceTitle: 'ಇಂದಿನ ಪೂರ್ಣ ಸರಳ ಸಾರಾಂಶ',
    easyAllVoiceSub: 'ಕೇಳಲು ಕೆಳಗಿನ "ಕೇಳಿ" ಬಟನ್ ಒತ್ತಿ.',
    easyNoWarningsTitle: 'ಯಾವುದೇ ಅಪಾಯದ ಎಚ್ಚರಿಕೆ ಇಲ್ಲ',
    easyNoWarningsBody: 'ಈಗ ಪರಿಸ್ಥಿತಿ ಸಾಮಾನ್ಯವಾಗಿದೆ. ಯಾವುದೇ ಅಧಿಕೃತ ಎಚ್ಚರಿಕೆ ಇಲ್ಲ.',
    easyWarningsCountBody: (count) => `ಈಗ ${count} ಅಧಿಕೃತ ಪ್ರಕಟಣೆಗಳು ಕೆಳಗೆ ಸರಳವಾಗಿವೆ.`,
    easyEarthCalmDetails: [
      'ಮೊಬೈಲ್ ಫೋನ್, ಇಂಟರ್ನೆಟ್ ಮತ್ತು ಮ್ಯಾಪ್ಸ್ ಸಾಮಾನ್ಯವಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತವೆ.',
      'ವಿಮಾನಗಳು ಮತ್ತು ವಿದ್ಯುತ್ ಮಾರ್ಗಗಳಿಗೆ ಇಂದು ಯಾವುದೇ ತೊಂದರೆಯಿಲ್ಲ.',
    ],
    easyEarthMinorDetails: [
      'ದೈನಂದಿನ ಫೋನ್‌ಗಳು ಮತ್ತು ಮ್ಯಾಪ್ಸ್ ಚೆನ್ನಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತವೆ.',
      'ಸಣ್ಣ ಅಲೆಗಳು ಉತ್ತರ ಧ್ರುವದ ಆಕಾಶದಲ್ಲಿ ಮಾತ್ರ ಕಾಣಿಸುತ್ತವೆ.',
    ],
    easyEarthStrongDetails: [
      'ದೂರದ ರೇಡಿಯೋ ಮತ್ತು ಧ್ರುವೀಯ ವಿಮಾನಗಳಲ್ಲಿ ಸ್ವಲ್ಪ ತೊಂದರೆಯಾಗಬಹುದು.',
      'ಭೂಮಿಯ ಮೇಲಿನ ಸಾಮಾನ್ಯ ಫೋನ್‌ಗಳು ಸುರಕ್ಷಿತ; ಅಧಿಕೃತ ಸೂಚನೆ ಗಮನಿಸಿ.',
    ],
    easySunFlareLabel: 'ಸೂರ್ಯನ ಹೊಳಪಿನ ಮಟ್ಟ',
    easySunWindLabel: 'ಸೂರ್ಯನ ಗಾಳಿಯ ವೇಗ',
    easyTodayKpLabel: 'ಬಿರುಗಾಳಿ ಸಂಖ್ಯೆ (೦ ರಿಂದ ೯)',
    easyForecastTomorrowPrefix: 'ನಾಳೆಯ ಮುನ್ಸೂಚನೆ',
  },
};
