import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  BarChart3,
  Bell,
  HandHelping,
  Home,
  LogIn,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  UserCheck,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AlertsView } from './components/AlertsView';
import { EasyUseView } from './components/EasyUseView';
import { HomeDashboardView } from './components/HomeDashboardView';
import { SentinelLogo } from './components/SentinelLogo';
import { SettingsView } from './components/SettingsView';
import { SpaceHelperView } from './components/SpaceHelperView';
import { SpaceWeatherView } from './components/SpaceWeatherView';
import { WelcomeView } from './components/WelcomeView';
import {
  buildConversationTitle,
  formatDigits,
  LANGUAGE_LIST,
  LOCALIZATION,
} from './data/localization';
import { appCheckStatus, auth, testFirestoreServerConnection } from './firebase';
import {
  AppUser,
  ChatConversation,
  FavoriteSpaceItem,
  HelperMessage,
  LanguageCode,
  LocalModelSupport,
  PageRoute,
  SeverityLevel,
  SolarWeatherState,
  SpaceAlertItem,
} from './types/sentinel';
import { formatFullTimestampForLanguage, formatTimeForLanguage } from './utils/dateTime';
import {
  addFirestoreFavorite,
  addFirestoreMessage,
  createFirestoreConversation,
  deleteFirestoreConversation,
  fetchConversationMessages,
  mapFirebaseUser,
  removeFirestoreFavorite,
  renameFirestoreConversation,
  signInWithGoogle,
  signOutUser,
  subscribeUserConversations,
  subscribeUserFavorites,
} from './utils/firestoreService';
import { exportStandaloneReportHtml } from './utils/htmlExporter';
import {
  askHybridSentinel,
  initializeDeviceGeminiNano,
  probeOnDeviceLocalModel,
} from './utils/hybridAi';
import {
  fetchLiveSolarWeather,
  generateScenarioState,
  loadCachedSolarState,
  NOAA_HOME_URL,
} from './utils/solarWeather';
import {
  checkVoiceAvailability,
  speakBroadcast,
  stopVoiceBroadcast,
} from './utils/voiceAlert';

const GUEST_CONVS_KEY = 'space_sentinel_guest_convs_v2';
const ACTIVE_CONV_KEY = 'space_sentinel_active_conv_v2';
const GUEST_FAVS_KEY = 'space_sentinel_guest_favs_v2';

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function App() {
  const [route, setRoute] = useState<PageRoute>('welcome');
  const [language, setLanguage] = useState<LanguageCode>('ur');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [largeText, setLargeText] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [voiceMuted, setVoiceMuted] = useState<boolean>(false);
  const [saveConsent, setSaveConsent] = useState<boolean>(true);

  const [offlineMode, setOfflineMode] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [manualOfflineTest, setManualOfflineTest] = useState<boolean>(false);
  const [preferOnDeviceFirst, setPreferOnDeviceFirst] = useState<boolean>(true);
  const [isFetchingSolar, setIsFetchingSolar] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<boolean>(false);
  const [connectionRestored, setConnectionRestored] = useState<boolean>(false);
  const [localModelSupport, setLocalModelSupport] = useState<LocalModelSupport>('unsupported');
  const [isPreparingDeviceModel, setIsPreparingDeviceModel] = useState<boolean>(false);
  const [deviceModelProgress, setDeviceModelProgress] = useState<number | null>(null);
  const [deviceModelStatus, setDeviceModelStatus] = useState<{
    code: 'ready' | 'unsupported' | 'incomplete' | 'error';
    detail?: string;
  } | null>(null);

  const [user, setUser] = useState<AppUser | null>(null);
  const [authError, setAuthError] = useState<boolean>(false);

  const [voiceAvailable, setVoiceAvailable] = useState<boolean>(true);
  const [voiceUnavailableReason, setVoiceUnavailableReason] = useState<
    'offline' | 'no-voice' | 'playback-failed' | null
  >(null);
  const [isVoiceLoading, setIsVoiceLoading] = useState<boolean>(false);
  const [speakingKind, setSpeakingKind] = useState<'none' | 'intro' | 'alert' | 'reply' | 'easy'>(
    'none'
  );
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isHelperThinking, setIsHelperThinking] = useState<boolean>(false);

  const [solar, setSolar] = useState<SolarWeatherState | null>(() => loadCachedSolarState());

  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try {
      const raw = localStorage.getItem(GUEST_CONVS_KEY);
      return raw ? (JSON.parse(raw) as ChatConversation[]) : [];
    } catch {
      return [];
    }
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_CONV_KEY);
    } catch {
      return null;
    }
  });

  const [favorites, setFavorites] = useState<FavoriteSpaceItem[]>(() => {
    try {
      const raw = localStorage.getItem(GUEST_FAVS_KEY);
      return raw ? (JSON.parse(raw) as FavoriteSpaceItem[]) : [];
    } catch {
      return [];
    }
  });

  const wasDisconnectedRef = useRef<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const restoredTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFetchingRef = useRef<boolean>(false);
  const solarRef = useRef<SolarWeatherState | null>(solar);

  useEffect(() => {
    solarRef.current = solar;
  }, [solar]);

  const t = LOCALIZATION[language];
  const langMeta = LANGUAGE_LIST.find((l) => l.code === language) ?? LANGUAGE_LIST[0];

  const triggerRestoredNotice = useCallback(() => {
    setConnectionRestored(true);
    if (restoredTimerRef.current) clearTimeout(restoredTimerRef.current);
    restoredTimerRef.current = setTimeout(() => {
      setConnectionRestored(false);
    }, 6000);
  }, []);

  const performLiveSync = useCallback(
    async (forceAttempt = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setIsFetchingSolar(true);
      try {
        const hadDisconnect = wasDisconnectedRef.current;
        const { state, ok, errorKind } = await fetchLiveSolarWeather(false, {
          forceNetworkAttempt: forceAttempt,
        });
        if (state) setSolar(state);
        setOfflineMode(errorKind === 'offline');
        setFetchError(!ok);

        if (ok) {
          if (hadDisconnect) {
            wasDisconnectedRef.current = false;
            triggerRestoredNotice();
          }
        } else {
          wasDisconnectedRef.current = true;
        }
      } finally {
        isFetchingRef.current = false;
        setIsFetchingSolar(false);
      }
    },
    [triggerRestoredNotice]
  );

  // Sync document direction & language
  useEffect(() => {
    document.documentElement.dir = langMeta.dir;
    document.documentElement.lang = language;
  }, [langMeta.dir, language]);

  // Sync dark/light theme & readable font size
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = largeText ? '17px' : '16px';
  }, [largeText]);

  // Check device TTS voice availability for selected language
  const refreshVoiceAvailability = useCallback((targetLang: LanguageCode) => {
    const info = checkVoiceAvailability(targetLang);
    setVoiceAvailable(info.available);
  }, []);

  useEffect(() => {
    refreshVoiceAvailability(language);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      const handler = () => refreshVoiceAvailability(language);
      synth.addEventListener?.('voiceschanged', handler);
      return () => synth.removeEventListener?.('voiceschanged', handler);
    }
  }, [language, refreshVoiceAvailability]);

  // Persist guest conversations & active conversation ID locally
  useEffect(() => {
    if (user || !saveConsent) return;
    try {
      localStorage.setItem(GUEST_CONVS_KEY, JSON.stringify(conversations.slice(0, 40)));
    } catch {
      // Ignore quota
    }
  }, [conversations, user, saveConsent]);

  useEffect(() => {
    if (!saveConsent) return;
    try {
      if (activeConversationId) {
        localStorage.setItem(ACTIVE_CONV_KEY, activeConversationId);
      } else {
        localStorage.removeItem(ACTIVE_CONV_KEY);
      }
    } catch {
      // Ignore
    }
  }, [activeConversationId, saveConsent]);

  useEffect(() => {
    if (user || !saveConsent) return;
    try {
      localStorage.setItem(GUEST_FAVS_KEY, JSON.stringify(favorites.slice(0, 30)));
    } catch {
      // Ignore
    }
  }, [favorites, user, saveConsent]);

  // Auth listener & per-user isolated Firestore sync
  useEffect(() => {
    testFirestoreServerConnection();

    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      const mapped = mapFirebaseUser(fbUser);
      setUser(mapped);
      if (!mapped) {
        try {
          const rawConvs = localStorage.getItem(GUEST_CONVS_KEY);
          setConversations(rawConvs ? (JSON.parse(rawConvs) as ChatConversation[]) : []);
          const rawFavs = localStorage.getItem(GUEST_FAVS_KEY);
          setFavorites(rawFavs ? (JSON.parse(rawFavs) as FavoriteSpaceItem[]) : []);
        } catch {
          setConversations([]);
          setFavorites([]);
        }
      }
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubConvs = subscribeUserConversations(
      user.uid,
      (remoteConvs) => {
        setConversations((prev) =>
          remoteConvs.map((rc) => {
            const existing = prev.find((p) => p.id === rc.id);
            return existing && existing.messages.length > 0
              ? { ...rc, messages: existing.messages }
              : rc;
          })
        );
      },
      () => {}
    );

    const unsubFavs = subscribeUserFavorites(
      user.uid,
      (remoteFavs) => setFavorites(remoteFavs),
      () => {}
    );

    return () => {
      unsubConvs();
      unsubFavs();
    };
  }, [user]);

  // Load conversation messages on demand from Firestore
  useEffect(() => {
    if (!user || !activeConversationId) return;
    const conv = conversations.find((c) => c.id === activeConversationId);
    if (!conv || conv.messages.length > 0 || conv.messageCount === 0) return;

    fetchConversationMessages(user.uid, activeConversationId)
      .then((msgs) => {
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConversationId ? { ...c, messages: msgs } : c))
        );
      })
      .catch(() => {});
  }, [user, activeConversationId, conversations]);

  // Network state, local model probe, and live NOAA fetch + automatic recovery & periodic refresh
  useEffect(() => {
    const onOnline = () => {
      setOfflineMode(manualOfflineTest);
      if (manualOfflineTest) return;
      void performLiveSync(true);
    };

    const onOffline = () => {
      wasDisconnectedRef.current = true;
      setConnectionRestored(false);
      setOfflineMode(true);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible' || manualOfflineTest || !navigator.onLine) return;
      const current = solarRef.current;
      if (current?.source === 'simulated') return;
      const fetchedMs = current?.fetchedAtIso ? Date.parse(current.fetchedAtIso) : 0;
      const isStale = !current || current.source === 'offline-cache' || Date.now() - fetchedMs > 120000;
      if (isStale) {
        void performLiveSync(false);
      }
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    document.addEventListener('visibilitychange', onVisibilityChange);

    probeOnDeviceLocalModel().then((res) => setLocalModelSupport(res.support));

    if (!manualOfflineTest && navigator.onLine) {
      void performLiveSync(false);
    } else {
      wasDisconnectedRef.current = true;
      setOfflineMode(true);
    }

    const refreshInterval = setInterval(() => {
      if (manualOfflineTest || !navigator.onLine) return;
      if (solarRef.current?.source === 'simulated') return;
      void performLiveSync(false);
    }, 180000);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearInterval(refreshInterval);
      if (restoredTimerRef.current) clearTimeout(restoredTimerRef.current);
      stopVoiceBroadcast();
    };
  }, [manualOfflineTest, performLiveSync]);

  const speakWithSettings = useCallback(
    async (
      text: string,
      targetLang: LanguageCode,
      kind: 'intro' | 'alert' | 'reply' | 'easy',
      options?: { msgId?: string; withChime?: boolean; isCritical?: boolean }
    ) => {
      setVoiceUnavailableReason(null);
      if (voiceMuted) return;

      setSpeakingKind(kind);
      setSpeakingMsgId(options?.msgId ?? null);

      const res = await speakBroadcast(text, targetLang, {
        rate: speechRate,
        muted: voiceMuted,
        offlineMode,
        withAlertChime: options?.withChime,
        isCritical: options?.isCritical,
        onLoadingChange: (loading) => setIsVoiceLoading(loading),
        onUnavailable: (reason) => {
          setVoiceUnavailableReason(reason);
        },
        onEnd: () => {
          setIsVoiceLoading(false);
          setSpeakingKind((prev) => (prev === kind ? 'none' : prev));
          setSpeakingMsgId(null);
        },
      });

      if (!res.started) {
        setIsVoiceLoading(false);
        setSpeakingKind('none');
        setSpeakingMsgId(null);
      }
    },
    [speechRate, voiceMuted, offlineMode]
  );

  const handleStopAllVoice = useCallback(() => {
    stopVoiceBroadcast();
    setIsVoiceLoading(false);
    setSpeakingKind('none');
    setSpeakingMsgId(null);
  }, []);

  const handleSelectLanguage = (nextLang: LanguageCode) => {
    setLanguage(nextLang);
    handleStopAllVoice();
    setVoiceUnavailableReason(null);
  };

  const handleListenIntro = () => {
    if (speakingKind === 'intro' || isVoiceLoading) {
      handleStopAllVoice();
      return;
    }
    void speakWithSettings(t.introSpeech, language, 'intro');
  };

  const handleRefreshLive = async () => {
    if (isFetchingRef.current) return;
    // Allow explicit user retry even if offline test flag or stale offline event was set
    const hadDisconnect = offlineMode || fetchError || wasDisconnectedRef.current;
    setManualOfflineTest(false);
    isFetchingRef.current = true;
    setIsFetchingSolar(true);
    try {
      const { state, ok, errorKind } = await fetchLiveSolarWeather(false, {
        forceNetworkAttempt: true,
      });
      if (state) setSolar(state);
      setOfflineMode(errorKind === 'offline');
      setFetchError(!ok);

      if (ok && hadDisconnect) {
        wasDisconnectedRef.current = false;
        triggerRestoredNotice();
      } else if (!ok) {
        wasDisconnectedRef.current = true;
      }
    } finally {
      isFetchingRef.current = false;
      setIsFetchingSolar(false);
    }
  };

  const handleCheckLocalModel = async () => {
    const probe = await probeOnDeviceLocalModel();
    setLocalModelSupport(probe.support);
    if (probe.support === 'available') {
      setDeviceModelStatus({ code: 'ready' });
    } else if (probe.support === 'unsupported') {
      setDeviceModelStatus({ code: 'unsupported' });
    } else {
      setDeviceModelStatus(null);
    }
  };

  const handlePrepareDeviceModel = async () => {
    if (isPreparingDeviceModel) return;
    setIsPreparingDeviceModel(true);
    setDeviceModelProgress(null);
    setDeviceModelStatus(null);
    try {
      const res = await initializeDeviceGeminiNano((pct) => {
        setDeviceModelProgress(pct);
      });
      setLocalModelSupport(res.support);
      setDeviceModelStatus({
        code: res.reasonCode,
        detail: res.reasonCode === 'error' ? res.detail : undefined,
      });
    } finally {
      setIsPreparingDeviceModel(false);
    }
  };

  const handleToggleEmergencyAlert = () => {
    if (speakingKind === 'alert' || isVoiceLoading) {
      handleStopAllVoice();
      return;
    }
    const sev: SeverityLevel = solar?.severity ?? 'nominal';
    const srcText = solar ? t.sourceStatus[solar.source] : t.sourceStatus['offline-cache'];
    const script = t.emergencySpeech[sev](srcText);
    const critical = sev === 'strong' || sev === 'extreme';
    void speakWithSettings(script, language, 'alert', { withChime: true, isCritical: critical });
  };

  const handleToggleManualOffline = () => {
    setManualOfflineTest((prev) => {
      const next = !prev;
      if (next) {
        wasDisconnectedRef.current = true;
        setConnectionRestored(false);
        setOfflineMode(true);
      } else {
        setOfflineMode(typeof navigator !== 'undefined' ? !navigator.onLine : false);
      }
      return next;
    });
  };

  const handleSignInGoogle = async () => {
    setAuthError(false);
    try {
      await signInWithGoogle();
    } catch {
      setAuthError(true);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setActiveConversationId(null);
  };

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );

  const activeMessages = activeConversation ? activeConversation.messages : [];
  const activeConversationLanguage = activeConversation ? activeConversation.language : language;

  const runAiRequest = async (
    questionText: string,
    targetLang: LanguageCode,
    historyMsgs: HelperMessage[]
  ) => {
    const targetBundle = LOCALIZATION[targetLang];
    return await askHybridSentinel({
      question: questionText,
      language: targetLang,
      solar,
      history: historyMsgs,
      offlineMode,
      preferOnDeviceFirst,
      localModelSupport,
      offlineUnavailableMsg: targetBundle.offlineAiUnavailableMsg(solar),
      networkUnavailableMsg: targetBundle.networkAiUnavailableMsg,
      timeoutUnavailableMsg: targetBundle.timeoutAiUnavailableMsg,
      rateLimitUnavailableMsg: targetBundle.rateLimitAiUnavailableMsg,
    });
  };

  const handleSendHelperMessage = async (question: string) => {
    const cleaned = question.trim();
    if (!cleaned || isHelperThinking) return;

    const now = new Date();
    const nowIso = now.toISOString();
    const targetLang = activeConversation ? activeConversation.language : language;
    const formattedTime = formatTimeForLanguage(now, targetLang);

    const userMsg: HelperMessage = {
      id: makeId('msg-u'),
      sender: 'user',
      text: cleaned,
      timestamp: formattedTime,
      createdAtIso: nowIso,
    };

    let convId = activeConversation?.id ?? null;
    let convTitle = activeConversation?.title ?? '';
    const priorHistory = activeConversation?.messages ?? [];

    if (!convId) {
      convId = makeId('conv');
      convTitle = buildConversationTitle(cleaned, LOCALIZATION[targetLang].chatUntitledFallback);
      const newConv: ChatConversation = {
        id: convId,
        title: convTitle,
        language: targetLang,
        createdAtIso: nowIso,
        updatedAtIso: nowIso,
        lastMessageAtIso: nowIso,
        lastMessagePreview: cleaned.slice(0, 140),
        messageCount: 1,
        messages: [userMsg],
      };

      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(convId);

      if (user) {
        await createFirestoreConversation(user.uid, convId, convTitle, targetLang, cleaned);
        await addFirestoreMessage(user.uid, convId, userMsg, targetLang, 1, convTitle);
      }
    } else {
      const nextMsgs = [...priorHistory, userMsg];
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                updatedAtIso: nowIso,
                lastMessageAtIso: nowIso,
                lastMessagePreview: cleaned.slice(0, 140),
                messageCount: nextMsgs.length,
                messages: nextMsgs,
              }
            : c
        )
      );

      if (user) {
        await addFirestoreMessage(user.uid, convId, userMsg, targetLang, nextMsgs.length);
      }
    }

    setIsHelperThinking(true);
    const aiRes = await runAiRequest(cleaned, targetLang, priorHistory);

    const replyNow = new Date();
    const replyIso = replyNow.toISOString();
    const aiMsg: HelperMessage = {
      id: makeId('msg-a'),
      sender: 'assistant',
      text: aiRes.text,
      provider: aiRes.provider,
      timestamp: formatTimeForLanguage(replyNow, targetLang),
      createdAtIso: replyIso,
      canRetry: aiRes.canRetry,
      retryQuestion: aiRes.canRetry ? cleaned : undefined,
    };

    const finalCount = priorHistory.length + 2;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              updatedAtIso: replyIso,
              lastMessageAtIso: replyIso,
              lastMessagePreview: aiMsg.text.slice(0, 140),
              messageCount: finalCount,
              messages: [...c.messages, aiMsg],
            }
          : c
      )
    );

    if (user && convId && !aiRes.canRetry) {
      await addFirestoreMessage(user.uid, convId, aiMsg, targetLang, finalCount);
    }

    setIsHelperThinking(false);
  };

  const handleRetryHelperMessage = async (failedMsg: HelperMessage) => {
    if (isHelperThinking || !activeConversation) return;
    const retryQ = failedMsg.retryQuestion?.trim();
    if (!retryQ) return;

    const convId = activeConversation.id;
    const targetLang = activeConversation.language;
    const historyBefore = activeConversation.messages.filter((m) => m.id !== failedMsg.id);

    setIsHelperThinking(true);
    const aiRes = await runAiRequest(retryQ, targetLang, historyBefore);

    const replyNow = new Date();
    const replyIso = replyNow.toISOString();
    const nextMsgId = aiRes.canRetry ? failedMsg.id : makeId('msg-a');
    const updatedMsg: HelperMessage = {
      id: nextMsgId,
      sender: 'assistant',
      text: aiRes.text,
      provider: aiRes.provider,
      timestamp: formatTimeForLanguage(replyNow, targetLang),
      createdAtIso: replyIso,
      canRetry: aiRes.canRetry,
      retryQuestion: aiRes.canRetry ? retryQ : undefined,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              updatedAtIso: replyIso,
              lastMessageAtIso: replyIso,
              lastMessagePreview: updatedMsg.text.slice(0, 140),
              messages: c.messages.map((m) => (m.id === failedMsg.id ? updatedMsg : m)),
            }
          : c
      )
    );

    if (user && convId && !aiRes.canRetry) {
      await addFirestoreMessage(user.uid, convId, updatedMsg, targetLang, historyBefore.length + 1);
    }

    setIsHelperThinking(false);
  };

  const handleNewChat = () => {
    handleStopAllVoice();
    setActiveConversationId(null);
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    const cleaned = newTitle.trim();
    if (!cleaned) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, title: cleaned, updatedAtIso: new Date().toISOString() } : c
      )
    );
    if (user) {
      await renameFirestoreConversation(user.uid, id, cleaned);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
    if (user) {
      await deleteFirestoreConversation(user.uid, id);
    }
  };

  const handleSaveTelemetryFavorite = async () => {
    if (!solar) return;
    const nowIso = new Date().toISOString();
    const item: FavoriteSpaceItem = {
      id: makeId('fav'),
      kind: 'telemetry',
      title: `${solar.flareClass ?? t.notAvailableShort} · ${solar.geomagneticScale}`,
      summary: `${t.severityLabels[solar.severity]} — ${t.summaryStormTitle}: ${
        solar.kpIndex !== null ? formatDigits(solar.kpIndex, language) : t.notAvailableShort
      }`,
      source: solar.source,
      sourceUrl: solar.officialSourceUrl || NOAA_HOME_URL,
      flareClass: solar.flareClass ?? undefined,
      kpIndex: solar.kpIndex ?? undefined,
      recordedAtLabel: formatFullTimestampForLanguage(solar.fetchedAtIso, language),
      createdAtIso: nowIso,
    };
    setFavorites((prev) => [item, ...prev].slice(0, 30));
    if (user) {
      await addFirestoreFavorite(user.uid, item);
    }
  };

  const handleSaveAlertFavorite = async (alert: SpaceAlertItem) => {
    const localized = t.localizedAlertContent(alert);
    const item: FavoriteSpaceItem = {
      id: makeId('fav'),
      kind: 'alert',
      title: localized.title,
      summary: localized.summary,
      source: 'live-noaa',
      sourceUrl: alert.sourceUrl,
      recordedAtLabel: formatFullTimestampForLanguage(alert.issuedAt, language),
      createdAtIso: alert.issuedAt || new Date().toISOString(),
    };
    setFavorites((prev) => [item, ...prev].slice(0, 30));
    if (user) {
      await addFirestoreFavorite(user.uid, item);
    }
  };

  const handleRemoveFavorite = async (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    if (user) {
      await removeFirestoreFavorite(user.uid, id);
    }
  };

  const handleClearLocalData = () => {
    if (!user) {
      setConversations([]);
      setFavorites([]);
    }
    setActiveConversationId(null);
    try {
      localStorage.removeItem(GUEST_CONVS_KEY);
      localStorage.removeItem(ACTIVE_CONV_KEY);
      localStorage.removeItem(GUEST_FAVS_KEY);
    } catch {
      // Ignore
    }
  };

  const navigateTo = (target: PageRoute) => {
    handleStopAllVoice();
    setVoiceUnavailableReason(null);
    setRoute(target);
  };

  const voiceUnavailableMessage =
    voiceUnavailableReason === 'offline'
      ? t.voiceOfflineUnavailableNotice
      : voiceUnavailableReason
        ? t.voiceUnavailableNotice
        : null;

  if (route === 'welcome') {
    return (
      <WelcomeView
        t={t}
        language={language}
        isSpeaking={speakingKind === 'intro'}
        isVoiceLoading={isVoiceLoading && speakingKind === 'intro'}
        voiceUnavailableMessage={voiceUnavailableMessage}
        onSelectLanguage={handleSelectLanguage}
        onListenIntro={handleListenIntro}
        onChooseEasyMode={() => navigateTo('easy')}
        onChooseFullMode={() => navigateTo('home')}
      />
    );
  }

  if (route === 'easy') {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#060913] text-slate-900 dark:text-slate-100 flex flex-col">
        {/* Clean Uncluttered Easy Mode Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-3 sm:px-6">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => navigateTo('welcome')}
                title={t.backToChoiceBtn}
                className="flex items-center gap-2 text-start cursor-pointer shrink-0"
              >
                <SentinelLogo size="sm" />
                <span
                  className="hidden sm:inline text-sm font-bold tracking-tight text-slate-900 dark:text-white truncate"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {t.brandName}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo('home')}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-teal-500/45 bg-teal-500/10 px-2.5 py-1.5 text-xs font-bold text-teal-800 dark:text-teal-200 hover:bg-teal-500/20 whitespace-nowrap cursor-pointer"
              >
                <BarChart3 className="h-3.5 w-3.5 shrink-0" />
                <span>{t.switchToFullBtn}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Desktop 5-Button Language Switcher */}
              <div
                className="hidden md:flex items-center gap-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 p-0.5"
                role="group"
                aria-label={t.headerLanguageLabel}
              >
                {LANGUAGE_LIST.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      lang.code === language
                        ? 'bg-cyan-500 text-slate-950'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {lang.nativeName}
                  </button>
                ))}
              </div>

              {/* Mobile Compact Language Dropdown */}
              <select
                value={language}
                onChange={(e) => handleSelectLanguage(e.target.value as LanguageCode)}
                aria-label={t.headerLanguageLabel}
                className="md:hidden min-h-[38px] rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-cyan-500 focus:outline-none cursor-pointer"
              >
                {LANGUAGE_LIST.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  if (!voiceMuted) handleStopAllVoice();
                  setVoiceMuted((m) => !m);
                }}
                aria-label={voiceMuted ? t.headerVoiceMuted : t.headerVoiceOn}
                className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 px-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-cyan-500 cursor-pointer"
              >
                {voiceMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4 text-cyan-500" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                aria-label={theme === 'dark' ? t.headerThemeLight : t.headerThemeDark}
                className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 px-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-cyan-500 cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-5 pb-12 sm:px-6">
          <EasyUseView
            t={t}
            language={language}
            solar={solar}
            isFetching={isFetchingSolar}
            offlineMode={offlineMode}
            fetchError={fetchError}
            speakingKind={speakingKind}
            speakingMsgId={speakingMsgId}
            isVoiceLoading={isVoiceLoading}
            voiceUnavailableMessage={voiceUnavailableMessage}
            activeMessages={activeMessages}
            isHelperThinking={isHelperThinking}
            onRefreshLive={handleRefreshLive}
            onSpeakText={(txt, opts) =>
              void speakWithSettings(txt, language, opts?.kind ?? 'easy', { msgId: opts?.msgId })
            }
            onStopVoice={handleStopAllVoice}
            onSendMessage={handleSendHelperMessage}
            onRetryMessage={handleRetryHelperMessage}
          />
        </main>
      </div>
    );
  }

  const navItems: Array<{
    id: Exclude<PageRoute, 'welcome' | 'easy'>;
    label: string;
    Icon: typeof Home;
    badge?: string;
  }> = [
    { id: 'home', label: t.navHome, Icon: Home },
    { id: 'weather', label: t.navWeather, Icon: Sun },
    { id: 'helper', label: t.navHelper, Icon: MessageSquare },
    {
      id: 'alerts',
      label: t.navAlerts,
      Icon: Bell,
      badge:
        solar && solar.alerts.length > 0
          ? formatDigits(solar.alerts.length, language)
          : undefined,
    },
    { id: 'settings', label: t.navSettings, Icon: Settings },
  ];

  const activeNavLabel = navItems.find((n) => n.id === route)?.label ?? t.dashPageTitle;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#060913] text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row">
      {/* Desktop Persistent Sidebar Navigation */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:justify-between border-e border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-4 sticky top-0 h-screen">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between gap-2 px-1">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2.5 text-start cursor-pointer"
            >
              <SentinelLogo size="sm" />
              <span
                className="text-base font-bold tracking-tight text-slate-900 dark:text-white truncate"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {t.brandName}
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo('welcome')}
              className="text-[11px] font-semibold text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-300 cursor-pointer"
            >
              {t.welcomeIntroBtn}
            </button>
          </div>

          {/* 5 Primary Navigation Links */}
          <nav className="space-y-1" aria-label={t.brandName}>
            {navItems.map(({ id, label, Icon, badge }) => {
              const active = route === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => navigateTo(id)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-200 border border-cyan-500/35'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        active ? 'text-cyan-600 dark:text-cyan-300' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    />
                    <span className="truncate">{label}</span>
                  </span>
                  {badge && (
                    <span className="font-mono text-[11px] tabular-nums text-amber-600 dark:text-amber-300">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* One-Tap Return to Easy Use Mode */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => navigateTo('easy')}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/45 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-800 dark:text-cyan-200 hover:bg-cyan-500/20 cursor-pointer"
            >
              <HandHelping className="h-4 w-4 shrink-0" />
              <span className="truncate">{t.switchToEasyBtn}</span>
            </button>
          </div>
        </div>

        {/* Bottom Account Summary */}
        <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-800 pt-4">
          {user ? (
            <button
              type="button"
              onClick={() => navigateTo('settings')}
              className="flex min-h-[42px] w-full items-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 text-start text-xs font-semibold text-emerald-800 dark:text-emerald-200 cursor-pointer"
            >
              <UserCheck className="h-4 w-4 shrink-0" />
              <span className="truncate">{user.email ?? user.uid}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSignInGoogle}
              className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 cursor-pointer"
            >
              <LogIn className="h-4 w-4 shrink-0" />
              <span className="truncate">{t.accountSignInBtn}</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Compact Top Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md">
          <div className="mx-auto flex h-13 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => navigateTo('welcome')}
                title={t.backToChoiceBtn}
                className="flex items-center gap-2 lg:hidden cursor-pointer shrink-0"
              >
                <SentinelLogo size="sm" />
                <span className="hidden sm:inline text-sm font-bold text-slate-900 dark:text-white truncate">
                  {t.brandName}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo('easy')}
                className="inline-flex lg:hidden min-h-[38px] items-center gap-1.5 rounded-lg border border-cyan-500/45 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-bold text-cyan-800 dark:text-cyan-200 hover:bg-cyan-500/20 whitespace-nowrap cursor-pointer"
              >
                <HandHelping className="h-3.5 w-3.5 shrink-0" />
                <span>{t.switchToEasyBtn}</span>
              </button>

              <span className="hidden lg:block text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {activeNavLabel}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Desktop 5-Button Language Switcher */}
              <div
                className="hidden md:flex items-center gap-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 p-0.5"
                role="group"
                aria-label={t.headerLanguageLabel}
              >
                {LANGUAGE_LIST.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      lang.code === language
                        ? 'bg-cyan-500 text-slate-950'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {lang.nativeName}
                  </button>
                ))}
              </div>

              {/* Mobile Compact Language Dropdown */}
              <select
                value={language}
                onChange={(e) => handleSelectLanguage(e.target.value as LanguageCode)}
                aria-label={t.headerLanguageLabel}
                className="md:hidden min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-cyan-500 focus:outline-none cursor-pointer"
              >
                {LANGUAGE_LIST.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  if (!voiceMuted) handleStopAllVoice();
                  setVoiceMuted((m) => !m);
                }}
                aria-label={voiceMuted ? t.headerVoiceMuted : t.headerVoiceOn}
                className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 px-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-cyan-500 cursor-pointer"
              >
                {voiceMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4 text-cyan-500" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                aria-label={theme === 'dark' ? t.headerThemeLight : t.headerThemeDark}
                className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 px-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-cyan-500 cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Active Page Canvas */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-5 pb-24 lg:px-6 lg:pb-8">
          {route === 'home' && (
            <HomeDashboardView
              t={t}
              language={language}
              solar={solar}
              isFetching={isFetchingSolar}
              offlineMode={offlineMode}
              fetchError={fetchError}
              connectionRestored={connectionRestored}
              onDismissRestored={() => setConnectionRestored(false)}
              onRefreshLive={handleRefreshLive}
              onReturnLive={handleRefreshLive}
              onAskAi={() => navigateTo('helper')}
              onOpenWeather={() => navigateTo('weather')}
              onOpenAlerts={() => navigateTo('alerts')}
            />
          )}

          {route === 'weather' && (
            <SpaceWeatherView
              t={t}
              language={language}
              solar={solar}
              offlineMode={offlineMode}
              fetchError={fetchError}
              isFetching={isFetchingSolar}
              favorites={favorites}
              onReturnLive={handleRefreshLive}
              onSaveTelemetryFavorite={handleSaveTelemetryFavorite}
              onRemoveFavorite={handleRemoveFavorite}
              onExportHtml={() => solar && exportStandaloneReportHtml(solar, language, t)}
            />
          )}

          {route === 'helper' && (
            <SpaceHelperView
              t={t}
              language={language}
              offlineMode={offlineMode}
              conversations={conversations}
              activeConversationId={activeConversation?.id ?? null}
              activeMessages={activeMessages}
              activeConversationLanguage={activeConversationLanguage}
              isThinking={isHelperThinking}
              speakingMsgId={speakingMsgId}
              isVoiceLoading={isVoiceLoading && speakingKind === 'reply'}
              voiceUnavailableMessage={voiceUnavailableMessage}
              onSelectConversation={(id) => {
                handleStopAllVoice();
                setVoiceUnavailableReason(null);
                setActiveConversationId(id);
              }}
              onNewChat={handleNewChat}
              onRenameConversation={handleRenameConversation}
              onDeleteConversation={handleDeleteConversation}
              onSendMessage={handleSendHelperMessage}
              onRetryMessage={handleRetryHelperMessage}
              onSpeakReply={(msgId, txt, msgLang) =>
                void speakWithSettings(txt, msgLang, 'reply', { msgId })
              }
              onStopVoice={handleStopAllVoice}
            />
          )}

          {route === 'alerts' && (
            <AlertsView
              t={t}
              language={language}
              solar={solar}
              isFetching={isFetchingSolar}
              offlineMode={offlineMode}
              fetchError={fetchError}
              isSpeakingAlert={speakingKind === 'alert'}
              isVoiceLoading={isVoiceLoading && speakingKind === 'alert'}
              voiceUnavailableMessage={voiceUnavailableMessage}
              favorites={favorites}
              onRefreshLive={handleRefreshLive}
              onToggleEmergencyAlert={handleToggleEmergencyAlert}
              onSaveAlertFavorite={handleSaveAlertFavorite}
              onRemoveFavorite={handleRemoveFavorite}
              onSelectSample={(lvl: SeverityLevel) =>
                setSolar(generateScenarioState(lvl, 'simulated'))
              }
              onReturnLive={handleRefreshLive}
            />
          )}

          {route === 'settings' && (
            <SettingsView
              t={t}
              language={language}
              user={user}
              authError={authError}
              voiceAvailable={voiceAvailable}
              speechRate={speechRate}
              voiceMuted={voiceMuted}
              theme={theme}
              largeText={largeText}
              offlineMode={offlineMode}
              preferOnDeviceFirst={preferOnDeviceFirst}
              localModelSupport={localModelSupport}
              isPreparingDeviceModel={isPreparingDeviceModel}
              deviceModelProgress={deviceModelProgress}
              deviceModelStatus={deviceModelStatus}
              appCheckActive={appCheckStatus.active}
              saveConsent={saveConsent}
              onSignInGoogle={handleSignInGoogle}
              onSignOut={handleSignOut}
              onSelectLanguage={handleSelectLanguage}
              onChangeSpeechRate={setSpeechRate}
              onToggleMute={() => setVoiceMuted((m) => !m)}
              onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              onToggleLargeText={() => setLargeText((prev) => !prev)}
              onToggleOfflineMode={handleToggleManualOffline}
              onTogglePreferOnDevice={() => setPreferOnDeviceFirst((p) => !p)}
              onCheckLocalModel={handleCheckLocalModel}
              onPrepareDeviceModel={handlePrepareDeviceModel}
              onToggleSaveConsent={() => setSaveConsent((c) => !c)}
              onClearAllSaved={handleClearLocalData}
            />
          )}
        </main>
      </div>

      {/* Mobile Fixed 5-Tab Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 grid h-16 grid-cols-5 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md lg:hidden"
        aria-label={t.brandName}
      >
        {navItems.map(({ id, label, Icon, badge }) => {
          const active = route === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => navigateTo(id)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-1 text-center transition-colors cursor-pointer ${
                active
                  ? 'text-cyan-600 dark:text-cyan-300 font-bold'
                  : 'text-slate-500 dark:text-slate-400 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className="h-[18px] w-[18px]" />
                {badge && (
                  <span className="absolute -top-1.5 -end-2.5 text-[10px] font-mono font-bold text-amber-500">
                    {badge}
                  </span>
                )}
              </div>
              <span className="w-full truncate text-[11px] leading-tight">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
