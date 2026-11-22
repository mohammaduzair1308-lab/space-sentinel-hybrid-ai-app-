import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Compass,
  Cpu,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
  WifiOff,
} from 'lucide-react';
import { formatDigits, LANGUAGE_LIST, LocalizationBundle } from '../data/localization';
import {
  EasyMenuSection,
  HelperMessage,
  LanguageCode,
  LocalModelSupport,
  SolarWeatherState,
} from '../types/sentinel';
import {
  formatAgeForLanguage,
  formatFullTimestampForLanguage,
  formatTimeForLanguage,
} from '../utils/dateTime';

interface EasyUseViewProps {
  t: LocalizationBundle;
  language: LanguageCode;
  solar: SolarWeatherState | null;
  isFetching: boolean;
  offlineMode: boolean;
  fetchError: boolean;
  speakingKind: 'none' | 'intro' | 'alert' | 'reply' | 'easy';
  speakingMsgId: string | null;
  isVoiceLoading: boolean;
  voiceUnavailableMessage: string | null;
  activeMessages: HelperMessage[];
  isHelperThinking: boolean;
  localModelSupport?: LocalModelSupport;
  isPreparingDeviceModel?: boolean;
  deviceModelProgress?: number | null;
  deviceModelStatus?: {
    code: 'ready' | 'unsupported' | 'incomplete' | 'error';
    detail?: string;
  } | null;
  onPrepareDeviceModel?: () => void;
  onRefreshLive: () => void;
  onSpeakText: (text: string, options?: { kind?: 'easy' | 'reply'; msgId?: string }) => void;
  onStopVoice: () => void;
  onSendMessage: (text: string) => void;
  onRetryMessage: (msg: HelperMessage) => void;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

const SECTION_ORDER: EasyMenuSection[] = [
  'today',
  'sun',
  'earth',
  'warnings',
  'all-voice',
  'ai',
];

function matchVoiceMenuCommand(transcript: string): EasyMenuSection | 'back' | null {
  const txt = transcript.trim().toLowerCase();
  if (!txt) return null;

  if (/(واپس|پہلے|واپس جاؤ|back|return|menu|वापस|వెనక్కి|ಹಿಂದಕ್ಕೆ)/i.test(txt)) {
    return 'back';
  }
  if (/(^|\s)(1|۱|१|౧|೧)(\s|$)|ایک|پہلا|پہلی|آج کا|موسم|first|one|today|weather|एक|पहला|आज|ఒకటి|ఈరోజు|ಒಂದು|ಇಂದಿನ/i.test(txt)) {
    return 'today';
  }
  if (/(^|\s)(2|۲|२|౨|೨)(\s|$)|دو|دوسرا|دوسری|سورج|چمک|two|second|sun|flare|दो|दूसरा|सूरज|రెండు|సూర్యు|ಎರಡು|ಸೂರ್ಯ/i.test(txt)) {
    return 'sun';
  }
  if (/(^|\s)(3|۳|३|౩|೩)(\s|$)|تین|تیسرا|تیسری|زمین|موبائل|نقش|سگنل|three|third|earth|phone|map|gps|तीन|तीसरा|धरती|మూడు|భూమి|ಮೂರು|ಭೂಮಿ/i.test(txt)) {
    return 'earth';
  }
  if (/(^|\s)(4|۴|४|౪|೪)(\s|$)|چار|چوتھا|چوتھی|خطر|وارننگ|انتباہ|طوفان|four|fourth|warn|alert|danger|चार|चौथा|खतर|నాలుగు|ప్రమాద|ನಾಲ್ಕು|ಎಚ್ಚರಿಕೆ/i.test(txt)) {
    return 'warnings';
  }
  if (/(^|\s)(5|۵|५|౫|೫)(\s|$)|پانچ|پانچواں|پانچویں|تمام|پوری|سنیں|آواز|five|fifth|all|listen|summary|पांच|पाँच|सुनें|ఐదు|మొత్తం|ಐದು|ಎಲ್ಲಾ/i.test(txt)) {
    return 'all-voice';
  }
  if (/(^|\s)(6|۶|६|౬|೬)(\s|$)|چھ|چھٹا|چھٹی|سوال|پوچھ|اے آئی|ai|six|sixth|ask|question|help|छह|सवाल|ఆరు|ప్రశ్న|ಆರು|ಪ್ರಶ್ನೆ/i.test(txt)) {
    return 'ai';
  }
  return null;
}

export const EasyUseView: React.FC<EasyUseViewProps> = ({
  t,
  language,
  solar,
  isFetching,
  offlineMode,
  fetchError,
  speakingKind,
  speakingMsgId,
  isVoiceLoading,
  voiceUnavailableMessage,
  activeMessages,
  isHelperThinking,
  localModelSupport = 'unsupported',
  isPreparingDeviceModel = false,
  deviceModelProgress = null,
  deviceModelStatus = null,
  onPrepareDeviceModel,
  onRefreshLive,
  onSpeakText,
  onStopVoice,
  onSendMessage,
  onRetryMessage,
}) => {
  const [selectedSection, setSelectedSection] = useState<EasyMenuSection | null>(null);
  const [aiInput, setAiInput] = useState('');
  const [voiceCmdStatus, setVoiceCmdStatus] = useState<string | null>(null);
  const [isListeningCmd, setIsListeningCmd] = useState(false);
  const [isListeningAi, setIsListeningAi] = useState(false);
  const [aiMicError, setAiMicError] = useState<string | null>(null);
  const [, setAgeTick] = useState(0);

  const cmdRecRef = useRef<SpeechRecognitionInstance | null>(null);
  const aiRecRef = useRef<SpeechRecognitionInstance | null>(null);

  const showWarningBanner =
    offlineMode || fetchError || (solar !== null && solar.source === 'offline-cache');

  useEffect(() => {
    if (!showWarningBanner || !solar) return;
    const timer = setInterval(() => setAgeTick((n) => n + 1), 30000);
    return () => clearInterval(timer);
  }, [showWarningBanner, solar]);

  useEffect(() => {
    setVoiceCmdStatus(null);
    setAiMicError(null);
    if (cmdRecRef.current && isListeningCmd) {
      cmdRecRef.current.stop();
      setIsListeningCmd(false);
    }
    if (aiRecRef.current && isListeningAi) {
      aiRecRef.current.stop();
      setIsListeningAi(false);
    }
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  const getSectionIcon = (sec: EasyMenuSection) => {
    switch (sec) {
      case 'today':
        return <ShieldCheck className="h-6 w-6 shrink-0 text-emerald-400" />;
      case 'sun':
        return <Sun className="h-6 w-6 shrink-0 text-amber-400" />;
      case 'earth':
        return <Compass className="h-6 w-6 shrink-0 text-cyan-400" />;
      case 'warnings':
        return <AlertTriangle className="h-6 w-6 shrink-0 text-rose-400" />;
      case 'all-voice':
        return <Volume2 className="h-6 w-6 shrink-0 text-teal-300" />;
      case 'ai':
        return <MessageSquare className="h-6 w-6 shrink-0 text-cyan-300" />;
    }
  };

  const formattedUpdatedTime = solar
    ? formatFullTimestampForLanguage(solar.fetchedAtIso, language) || t.notAvailableShort
    : t.notAvailableShort;
  const cachedAgeText = solar ? formatAgeForLanguage(solar.fetchedAtIso, language) : '';

  const buildSectionText = (sec: Exclude<EasyMenuSection, 'ai'>): { heading: string; paragraphs: string[]; speech: string } => {
    if (!solar) {
      const msg = isFetching ? t.refreshingBtn : t.noaaNoCacheBanner;
      return {
        heading: t.easyMenuItems[sec].title,
        paragraphs: [msg],
        speech: msg,
      };
    }

    const sourceIntro =
      solar.source === 'offline-cache'
        ? `${t.sourceStatus['offline-cache']} (${formattedUpdatedTime}${cachedAgeText ? `، ${cachedAgeText}` : ''}).`
        : `${t.sourceStatus[solar.source]} (${formattedUpdatedTime}).`;

    const todayParas = [
      t.severityLabels[solar.severity],
      t.severityDescriptions[solar.severity],
      t.kpPlainMeaning(solar.kpIndex),
      sourceIntro,
    ];

    const sunParas = [
      t.flarePlainMeaning(solar.flareClass),
      t.windPlainMeaning(solar.solarWindSpeed),
    ];

    const earthList =
      solar.navigationRiskLevel === 'extreme' || solar.navigationRiskLevel === 'strong'
        ? t.easyEarthStrongDetails
        : solar.navigationRiskLevel === 'minor'
          ? t.easyEarthMinorDetails
          : t.easyEarthCalmDetails;
    const earthParas = [t.gpsPlainScaleNote(solar.navigationRiskLevel), ...earthList];

    const hasAlerts = solar.alerts.length > 0;
    const topAlertLocalized = hasAlerts ? t.localizedAlertContent(solar.alerts[0]) : null;
    const tomorrow = solar.forecastDays?.[1];
    const warningsParas = [
      hasAlerts
        ? t.easyWarningsCountBody(formatDigits(solar.alerts.length, language))
        : t.easyNoWarningsBody,
      ...(topAlertLocalized ? [`${topAlertLocalized.title}. ${topAlertLocalized.impact}`] : []),
      ...(tomorrow
        ? [
            `${t.easyForecastTomorrowPrefix}: ${
              tomorrow.gLevelNum >= 1 ? tomorrow.gScale : t.forecastNoStormText
            }`,
          ]
        : []),
    ];

    switch (sec) {
      case 'today':
        return {
          heading: t.easyMenuItems.today.title,
          paragraphs: todayParas,
          speech: todayParas.slice(0, 3).join(' '),
        };
      case 'sun':
        return {
          heading: t.easyMenuItems.sun.title,
          paragraphs: sunParas,
          speech: sunParas.join(' '),
        };
      case 'earth':
        return {
          heading: t.easyMenuItems.earth.title,
          paragraphs: earthParas,
          speech: earthParas.join(' '),
        };
      case 'warnings':
        return {
          heading: t.easyMenuItems.warnings.title,
          paragraphs: warningsParas,
          speech: warningsParas.join(' '),
        };
      case 'all-voice': {
        const combined = [
          `${t.severityLabels[solar.severity]}. ${t.severityDescriptions[solar.severity]}`,
          t.flarePlainMeaning(solar.flareClass),
          t.gpsPlainScaleNote(solar.navigationRiskLevel),
          hasAlerts && topAlertLocalized ? topAlertLocalized.title : t.easyNoWarningsTitle,
        ];
        return {
          heading: t.easyAllVoiceTitle,
          paragraphs: combined,
          speech: combined.join(' '),
        };
      }
    }
  };

  const handleSelectSection = (sec: EasyMenuSection) => {
    onStopVoice();
    setVoiceCmdStatus(null);
    setSelectedSection(sec);
    if (sec === 'all-voice') {
      const content = buildSectionText('all-voice');
      onSpeakText(content.speech, { kind: 'easy', msgId: 'easy-all' });
    }
  };

  const handleBackToMenu = () => {
    onStopVoice();
    setSelectedSection(null);
  };

  const handleVoiceCommandMenu = () => {
    setVoiceCmdStatus(null);
    if (isListeningCmd && cmdRecRef.current) {
      cmdRecRef.current.stop();
      setIsListeningCmd(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceCmdStatus(t.helperVoiceUnsupported);
      return;
    }

    try {
      const rec = new SpeechRec();
      const meta = LANGUAGE_LIST.find((l) => l.code === language) ?? LANGUAGE_LIST[0];
      rec.lang = meta.speechLang;
      rec.interimResults = false;
      rec.maxAlternatives = 3;

      rec.onresult = (event) => {
        let matched: EasyMenuSection | 'back' | null = null;
        const altList = event.results?.[0];
        if (altList) {
          for (let i = 0; i < altList.length; i++) {
            const tr = altList[i]?.transcript ?? '';
            matched = matchVoiceMenuCommand(tr);
            if (matched) break;
          }
        }
        if (matched === 'back') {
          handleBackToMenu();
          return;
        }
        if (matched) {
          const idx = SECTION_ORDER.indexOf(matched) + 1;
          setVoiceCmdStatus(
            t.easyVoiceCmdMatched(formatDigits(idx, language), t.easyMenuItems[matched].title)
          );
          handleSelectSection(matched);
        } else {
          setVoiceCmdStatus(t.easyVoiceCmdNotUnderstood);
        }
      };

      rec.onerror = () => {
        setIsListeningCmd(false);
        setVoiceCmdStatus(t.helperVoiceUnsupported);
      };
      rec.onend = () => {
        setIsListeningCmd(false);
      };

      cmdRecRef.current = rec;
      setIsListeningCmd(true);
      rec.start();
    } catch {
      setIsListeningCmd(false);
      setVoiceCmdStatus(t.helperVoiceUnsupported);
    }
  };

  const handleSpeakAiMicQuestion = () => {
    setAiMicError(null);
    if (isListeningAi && aiRecRef.current) {
      aiRecRef.current.stop();
      setIsListeningAi(false);
      return;
    }
    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) {
      setAiMicError(t.helperVoiceUnsupported);
      return;
    }
    try {
      const rec = new SpeechRec();
      const meta = LANGUAGE_LIST.find((l) => l.code === language) ?? LANGUAGE_LIST[0];
      rec.lang = meta.speechLang;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim();
        if (transcript) {
          onSendMessage(transcript);
        }
      };
      rec.onerror = () => {
        setIsListeningAi(false);
        setAiMicError(t.helperVoiceUnsupported);
      };
      rec.onend = () => {
        setIsListeningAi(false);
      };
      aiRecRef.current = rec;
      setIsListeningAi(true);
      rec.start();
    } catch {
      setIsListeningAi(false);
      setAiMicError(t.helperVoiceUnsupported);
    }
  };

  const isPlayingEasy = speakingKind === 'easy' || speakingKind === 'intro';

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Honest Cached / Offline Fallback Banner */}
      {showWarningBanner && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-4 py-3.5 text-sm font-medium text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-2.5">
            <WifiOff className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="space-y-1">
              <p>
                {offlineMode
                  ? t.offlineBanner
                  : solar
                    ? t.noaaCacheBanner
                    : t.noaaNoCacheBanner}
              </p>
              {solar && (
                <p className="text-xs opacity-90">
                  {t.cachedDataTimePrefix}
                  <span className="font-mono tabular-nums whitespace-nowrap">
                    {formattedUpdatedTime}
                  </span>
                  {cachedAgeText && (
                    <>
                      {' · '}
                      <span>
                        {t.cachedAgePrefix}: {cachedAgeText}
                      </span>
                    </>
                  )}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onRefreshLive}
            disabled={isFetching}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl border border-amber-600/40 bg-white/85 dark:bg-slate-900/80 px-4 py-2 text-xs font-bold text-amber-950 dark:text-amber-100 hover:border-amber-500 disabled:opacity-60 whitespace-nowrap cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? t.refreshingBtn : t.retryBtn}</span>
          </button>
        </div>
      )}

      {/* Main Menu: 6 Large Numbered Buttons */}
      {selectedSection === null && (
        <div className="space-y-5">
          {/* Header + Optional Voice Guidance & Voice Number Command */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
                  {t.easyPageTitle}
                </h1>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 sm:text-base">
                  {t.easyPageSubtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={onRefreshLive}
                disabled={isFetching}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-cyan-500 disabled:opacity-60 cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                <span>{isFetching ? t.refreshingBtn : t.refreshBtn}</span>
              </button>
            </div>

            {/* Optional Voice Guidance & Telephone-Style Voice Command Buttons */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (isPlayingEasy || isVoiceLoading) {
                    onStopVoice();
                  } else {
                    onSpeakText(t.easyGuideVoiceScript, { kind: 'easy', msgId: 'easy-guide' });
                  }
                }}
                className={`inline-flex min-h-[48px] items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors cursor-pointer ${
                  isPlayingEasy && speakingMsgId === 'easy-guide'
                    ? 'border-rose-500 bg-rose-600 text-white'
                    : 'border-cyan-500/45 bg-cyan-50 dark:bg-cyan-500/15 text-cyan-900 dark:text-cyan-200 hover:bg-cyan-100 dark:hover:bg-cyan-500/25'
                }`}
              >
                {isVoiceLoading && speakingMsgId === 'easy-guide' ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                ) : isPlayingEasy && speakingMsgId === 'easy-guide' ? (
                  <VolumeX className="h-4 w-4 shrink-0" />
                ) : (
                  <Volume2 className="h-4 w-4 shrink-0" />
                )}
                <span>
                  {isVoiceLoading && speakingMsgId === 'easy-guide'
                    ? t.voiceLoadingBtn
                    : isPlayingEasy && speakingMsgId === 'easy-guide'
                      ? t.easyStopBtn
                      : t.easyGuideVoiceBtn}
                </span>
              </button>

              <button
                type="button"
                onClick={handleVoiceCommandMenu}
                className={`inline-flex min-h-[48px] items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors cursor-pointer ${
                  isListeningCmd
                    ? 'border-rose-500 bg-rose-600 text-white'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:border-cyan-500'
                }`}
              >
                {isListeningCmd ? (
                  <MicOff className="h-4 w-4 shrink-0" />
                ) : (
                  <Mic className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
                )}
                <span>{isListeningCmd ? t.easyVoiceCmdListening : t.easyVoiceCmdBtn}</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">{t.easyVoiceCmdHint}</p>

            {voiceCmdStatus && (
              <div className="rounded-xl border border-cyan-500/40 bg-cyan-50 dark:bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-900 dark:text-cyan-200">
                {voiceCmdStatus}
              </div>
            )}

            {voiceUnavailableMessage && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200">
                {voiceUnavailableMessage}
              </div>
            )}
          </section>

          {/* 6 Large Touch-Friendly Numbered Menu Buttons */}
          <section className="grid grid-cols-1 gap-3.5 md:grid-cols-2" aria-label={t.easyPageTitle}>
            {SECTION_ORDER.map((sec, idx) => {
              const numStr = formatDigits(idx + 1, language);
              const item = t.easyMenuItems[sec];
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => handleSelectSection(sec)}
                  className="group flex min-h-[104px] w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5 text-start transition-all hover:border-cyan-400 dark:hover:border-cyan-400/70 hover:bg-cyan-50/40 dark:hover:bg-[#0E182D] active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500 text-xl font-extrabold text-slate-950 font-mono">
                      {numStr}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {getSectionIcon(sec)}
                        <span className="text-lg font-extrabold text-slate-900 dark:text-white sm:text-xl">
                          {item.title}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {item.shortDesc}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="h-6 w-6 shrink-0 text-slate-400 group-hover:text-cyan-500 rtl:rotate-180" />
                </button>
              );
            })}
          </section>
        </div>
      )}

      {/* Detail Screen for Sections 1–5 */}
      {selectedSection !== null && selectedSection !== 'ai' && (() => {
        const content = buildSectionText(selectedSection);
        const secNum = formatDigits(SECTION_ORDER.indexOf(selectedSection) + 1, language);

        return (
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5 sm:p-7 space-y-5">
            {/* Prominent Top Bar: Back + Listen */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <button
                type="button"
                onClick={handleBackToMenu}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-5 py-2.5 text-base font-bold text-slate-800 dark:text-slate-100 hover:border-cyan-500 cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
                <span>{t.easyBackBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isPlayingEasy || isVoiceLoading) {
                    onStopVoice();
                  } else {
                    onSpeakText(content.speech, { kind: 'easy', msgId: `easy-${selectedSection}` });
                  }
                }}
                className={`inline-flex min-h-[48px] items-center gap-2.5 rounded-xl px-6 py-2.5 text-base font-extrabold transition-colors cursor-pointer ${
                  isPlayingEasy
                    ? 'bg-rose-600 text-white hover:bg-rose-500'
                    : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                }`}
              >
                {isVoiceLoading ? (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
                ) : isPlayingEasy ? (
                  <VolumeX className="h-5 w-5 shrink-0" />
                ) : (
                  <Volume2 className="h-5 w-5 shrink-0" />
                )}
                <span>
                  {isVoiceLoading
                    ? t.voiceLoadingBtn
                    : isPlayingEasy
                      ? t.easyStopBtn
                      : t.easyListenBtn}
                </span>
              </button>
            </div>

            {voiceUnavailableMessage && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
                <span>{voiceUnavailableMessage}</span>
                {!offlineMode && (
                  <button
                    type="button"
                    onClick={() =>
                      onSpeakText(content.speech, { kind: 'easy', msgId: `easy-${selectedSection}` })
                    }
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-amber-500/50 bg-white/80 dark:bg-slate-900/75 px-3 py-1.5 text-xs font-bold text-amber-950 dark:text-amber-100 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>{t.retryBtn}</span>
                  </button>
                )}
              </div>
            )}

            {/* Heading */}
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-lg font-extrabold text-cyan-700 dark:text-cyan-300 font-mono">
                {secNum}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {content.heading}
              </h2>
            </div>

            {selectedSection === 'all-voice' && (
              <p className="text-sm text-slate-600 dark:text-slate-300">{t.easyAllVoiceSub}</p>
            )}

            {/* Key Simple Metric Boxes */}
            {solar && selectedSection === 'today' && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081022] p-4">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {t.easyTodayKpLabel}
                  </div>
                  <div className="mt-1 font-mono text-2xl font-extrabold text-emerald-600 dark:text-emerald-300">
                    {solar.kpIndex !== null
                      ? `${formatDigits(solar.kpIndex, language)} / ${formatDigits(9, language)}`
                      : t.notAvailableShort}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081022] p-4">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {t.summaryUpdatedTitle}
                  </div>
                  <div className="mt-1 text-base font-bold text-slate-800 dark:text-slate-100">
                    {formattedUpdatedTime}
                  </div>
                </div>
              </div>
            )}

            {solar && selectedSection === 'sun' && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081022] p-4">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {t.easySunFlareLabel}
                  </div>
                  <div dir="ltr" className="mt-1 font-mono text-2xl font-extrabold text-cyan-700 dark:text-cyan-300">
                    {solar.flareClass ?? t.notAvailableShort}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081022] p-4">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {t.easySunWindLabel}
                  </div>
                  <div className="mt-1 font-mono text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                    {solar.solarWindSpeed !== null
                      ? `${formatDigits(solar.solarWindSpeed, language)} ${t.unitKmSec}`
                      : t.notAvailableShort}
                  </div>
                </div>
              </div>
            )}

            {/* Simple Large Written Explanation (Always Visible) */}
            <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081022] p-5">
              {content.paragraphs.map((para, i) => (
                <p
                  key={i}
                  className={`leading-relaxed text-slate-800 dark:text-slate-100 ${
                    i === 0 ? 'text-lg font-bold sm:text-xl' : 'text-base sm:text-lg'
                  }`}
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Extra Warnings List when in section 4 */}
            {selectedSection === 'warnings' && solar && solar.alerts.length > 0 && (
              <div className="space-y-3">
                {solar.alerts.slice(0, 3).map((alert) => {
                  const loc = t.localizedAlertContent(alert);
                  return (
                    <div
                      key={alert.id}
                      className="rounded-xl border border-amber-500/35 bg-amber-50/60 dark:bg-amber-950/20 p-4 space-y-1.5"
                    >
                      <div className="text-base font-bold text-slate-900 dark:text-white">
                        {loc.title}
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                        {loc.summary}
                      </p>
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                        {loc.impact}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Back + Refresh Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleBackToMenu}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-5 py-2.5 text-base font-bold text-slate-800 dark:text-slate-100 hover:border-cyan-500 cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
                <span>{t.easyBackBtn}</span>
              </button>

              <button
                type="button"
                onClick={onRefreshLive}
                disabled={isFetching}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-cyan-500 disabled:opacity-60 cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                <span>{isFetching ? t.refreshingBtn : t.refreshBtn}</span>
              </button>
            </div>
          </section>
        );
      })()}

      {/* Detail Screen for Section 6: Simple One-Tap + Voice Ask AI */}
      {selectedSection === 'ai' && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5 sm:p-7 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <button
              type="button"
              onClick={handleBackToMenu}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-5 py-2.5 text-base font-bold text-slate-800 dark:text-slate-100 hover:border-cyan-500 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
              <span>{t.easyBackBtn}</span>
            </button>

            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {t.easyAiHeading}
              </h2>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 sm:text-base">
            {t.easyAiSubheading}
          </p>

          {offlineMode && (
            <div className="rounded-xl border border-cyan-500/35 bg-cyan-50/70 dark:bg-cyan-500/10 px-4 py-2.5 text-sm font-medium text-cyan-900 dark:text-cyan-200">
              {localModelSupport === 'available' && language === 'en'
                ? t.offlineNanoAndGuideNote
                : t.offlineGuideActiveNote}
            </div>
          )}

          {language === 'en' &&
            (localModelSupport === 'downloadable' ||
              isPreparingDeviceModel ||
              (deviceModelStatus !== null && deviceModelStatus.code !== 'unsupported')) && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/35 bg-emerald-50/70 dark:bg-emerald-500/10 px-4 py-3 text-xs sm:text-sm">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-semibold text-emerald-950 dark:text-emerald-100">
                    {deviceModelStatus?.code === 'ready'
                      ? t.deviceModelReadyNotice
                      : deviceModelStatus?.code === 'incomplete'
                        ? t.deviceModelIncompleteNotice
                        : deviceModelStatus?.code === 'error'
                          ? t.deviceModelErrorNotice(deviceModelStatus.detail)
                          : t.askAiNanoPromptNote}
                  </p>
                  {isPreparingDeviceModel && deviceModelProgress !== null && (
                    <div className="space-y-1 pt-0.5">
                      <span className="text-xs font-semibold text-cyan-800 dark:text-cyan-200">
                        {t.deviceModelProgressLabel(deviceModelProgress)}
                      </span>
                      <progress
                        value={deviceModelProgress}
                        max={100}
                        className="block h-2 w-full overflow-hidden rounded-full accent-cyan-500"
                      />
                    </div>
                  )}
                </div>

                {onPrepareDeviceModel && localModelSupport !== 'available' && (
                  <button
                    type="button"
                    disabled={isPreparingDeviceModel}
                    onClick={onPrepareDeviceModel}
                    className="inline-flex min-h-[42px] shrink-0 items-center gap-2 rounded-xl border border-cyan-500/60 bg-cyan-500/20 px-4 py-2 text-xs font-bold text-cyan-950 dark:text-cyan-100 hover:bg-cyan-500/30 disabled:opacity-60 cursor-pointer"
                  >
                    {isPreparingDeviceModel ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Cpu className="h-4 w-4" />
                    )}
                    <span>
                      {isPreparingDeviceModel ? t.preparingDeviceModelBtn : t.prepareDeviceModelBtn}
                    </span>
                  </button>
                )}
              </div>
            )}

          {/* Large Voice Ask Mic Button (No Typing Required) */}
          <button
            type="button"
            onClick={handleSpeakAiMicQuestion}
            disabled={isHelperThinking}
            className={`flex min-h-[56px] w-full items-center justify-center gap-3 rounded-2xl px-5 py-3 text-base font-extrabold transition-colors cursor-pointer disabled:opacity-60 ${
              isListeningAi
                ? 'bg-rose-600 text-white'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
            }`}
          >
            {isListeningAi ? (
              <MicOff className="h-5 w-5 shrink-0" />
            ) : (
              <Mic className="h-5 w-5 shrink-0" />
            )}
            <span>{isListeningAi ? t.helperRecordStop : t.easyAiVoiceAskBtn}</span>
          </button>

          {aiMicError && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-4 py-2.5 text-sm text-amber-900 dark:text-amber-200">
              {aiMicError}
            </div>
          )}

          {/* One-Tap Quick Questions (No Typing Required) */}
          <div className="grid grid-cols-1 gap-2.5">
            {t.easyAiQuickPrompts.map((promptText) => (
              <button
                key={promptText}
                type="button"
                disabled={isHelperThinking}
                onClick={() => onSendMessage(promptText)}
                className="min-h-[52px] w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081022] px-4 py-3 text-start text-base font-semibold text-slate-800 dark:text-slate-100 hover:border-cyan-500 disabled:opacity-50 cursor-pointer"
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Optional Simple Text Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = aiInput.trim();
              if (!q || isHelperThinking) return;
              onSendMessage(q);
              setAiInput('');
            }}
            className="flex flex-wrap gap-2"
          >
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder={t.helperPlaceholder}
              className="min-h-[48px] min-w-[200px] flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isHelperThinking || !aiInput.trim()}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-cyan-500/50 bg-cyan-500/15 px-5 py-2 text-sm font-bold text-cyan-800 dark:text-cyan-200 hover:bg-cyan-500/25 disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-4 w-4 rtl:rotate-180" />
              <span>{t.helperSendBtn}</span>
            </button>
          </form>

          {voiceUnavailableMessage && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200">
              {voiceUnavailableMessage}
            </div>
          )}

          {/* Latest Easy-to-Read Messages with Prominent Listen Button */}
          <div className="space-y-3 pt-2">
            {isHelperThinking && (
              <div className="rounded-xl border border-cyan-500/35 bg-cyan-50 dark:bg-cyan-500/10 px-4 py-3 text-base font-bold text-cyan-800 dark:text-cyan-200">
                {t.helperThinking}
              </div>
            )}

            {activeMessages.slice(-4).map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              const isSpeakingThis = speakingMsgId === msg.id;
              const isLoadingThis = isVoiceLoading && speakingMsgId === msg.id;
              const timeStr = formatTimeForLanguage(msg.createdAtIso, language) || msg.timestamp;
              const isFailed = msg.canRetry || msg.provider === 'offline-unavailable';

              return (
                <div
                  key={msg.id}
                  className={`rounded-2xl border p-4 space-y-2.5 ${
                    isAssistant
                      ? isFailed
                        ? 'border-amber-500/45 bg-amber-50/70 dark:bg-amber-500/10 text-slate-900 dark:text-amber-100'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081022] text-slate-900 dark:text-slate-100'
                      : 'border-cyan-500/40 bg-cyan-500/15 text-slate-900 dark:text-cyan-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-base leading-relaxed sm:text-lg">
                    {msg.text}
                  </p>

                  {isAssistant && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {msg.provider && (
                          <span
                            dir="ltr"
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                              msg.provider === 'firebase-ai-on-device'
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                                : msg.provider === 'firebase-ai-cloud'
                                  ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-800 dark:text-cyan-200'
                                  : msg.provider === 'server-gemini'
                                    ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-800 dark:text-indigo-200'
                                    : msg.provider === 'offline-local-guide'
                                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200'
                                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {t.providerLabels[msg.provider]}
                          </span>
                        )}
                        {msg.provider && timeStr && <span aria-hidden="true">·</span>}
                        {timeStr && <span>{timeStr}</span>}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {isFailed && msg.retryQuestion && (
                          <button
                            type="button"
                            disabled={isHelperThinking}
                            onClick={() => onRetryMessage(msg)}
                            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-amber-500/50 bg-amber-500/20 px-4 py-2 text-sm font-bold text-amber-950 dark:text-amber-100 cursor-pointer"
                          >
                            <RefreshCw className="h-4 w-4" />
                            <span>{t.retryBtn}</span>
                          </button>
                        )}

                        {isSpeakingThis || isLoadingThis ? (
                          <button
                            type="button"
                            onClick={onStopVoice}
                            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white cursor-pointer"
                          >
                            {isLoadingThis ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <VolumeX className="h-4 w-4" />
                            )}
                            <span>{isLoadingThis ? t.voiceLoadingBtn : t.easyStopBtn}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSpeakText(msg.text, { kind: 'reply', msgId: msg.id })}
                            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-400 cursor-pointer"
                          >
                            <Volume2 className="h-4 w-4" />
                            <span>{t.easyListenBtn}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
