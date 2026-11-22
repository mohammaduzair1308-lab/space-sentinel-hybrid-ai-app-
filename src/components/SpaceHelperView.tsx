import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Edit2,
  ExternalLink,
  List,
  Loader2,
  MessageSquarePlus,
  Mic,
  MicOff,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Square,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import { LANGUAGE_LIST, LocalizationBundle } from '../data/localization';
import { ChatConversation, HelperMessage, LanguageCode } from '../types/sentinel';
import {
  formatShortDateForLanguage,
  formatTimeForLanguage,
} from '../utils/dateTime';

interface SpaceHelperViewProps {
  t: LocalizationBundle;
  language: LanguageCode;
  offlineMode?: boolean;
  conversations: ChatConversation[];
  activeConversationId: string | null;
  activeMessages: HelperMessage[];
  activeConversationLanguage: LanguageCode;
  isThinking: boolean;
  speakingMsgId: string | null;
  isVoiceLoading: boolean;
  voiceUnavailableMessage: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, title: string) => void;
  onDeleteConversation: (id: string) => void;
  onSendMessage: (text: string) => void;
  onRetryMessage: (msg: HelperMessage) => void;
  onSpeakReply: (msgId: string, text: string, msgLanguage: LanguageCode) => void;
  onStopVoice: () => void;
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

export const SpaceHelperView: React.FC<SpaceHelperViewProps> = ({
  t,
  language,
  offlineMode = false,
  conversations,
  activeConversationId,
  activeMessages,
  activeConversationLanguage,
  isThinking,
  speakingMsgId,
  isVoiceLoading,
  voiceUnavailableMessage,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onSendMessage,
  onRetryMessage,
  onSpeakReply,
  onStopVoice,
}) => {
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.lastMessagePreview.toLowerCase().includes(q) ||
        c.messages.some((m) => m.text.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, isThinking]);

  useEffect(() => {
    setVoiceError(null);
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitQuestion = () => {
    const cleaned = input.trim();
    if (!cleaned || isThinking) return;
    setVoiceError(null);
    onSendMessage(cleaned);
    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuestion();
  };

  const handleToggleRecord = () => {
    setVoiceError(null);

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setVoiceError(t.helperVoiceUnsupported);
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
        setIsRecording(false);
        setVoiceError(t.helperVoiceUnsupported);
      };
      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
      setIsRecording(true);
      rec.start();
    } catch {
      setIsRecording(false);
      setVoiceError(t.helperVoiceUnsupported);
    }
  };

  const getLangName = (code: LanguageCode) =>
    LANGUAGE_LIST.find((l) => l.code === code)?.nativeName ?? code;

  // Find fallback retry question for any failed assistant message that didn't store retryQuestion yet
  const resolveRetryQuestion = (idx: number, msg: HelperMessage): string | null => {
    if (msg.retryQuestion) return msg.retryQuestion;
    for (let i = idx - 1; i >= 0; i--) {
      if (activeMessages[i]?.sender === 'user') {
        return activeMessages[i].text;
      }
    }
    return null;
  };

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col gap-3">
      <button
        type="button"
        onClick={() => {
          onNewChat();
          setMobileDrawerOpen(false);
        }}
        className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 transition-all active:scale-[0.98] hover:bg-cyan-400 cursor-pointer"
      >
        <MessageSquarePlus className="h-4 w-4 shrink-0" />
        <span>{t.helperNewChatBtn}</span>
      </button>

      {/* Search Saved Conversations */}
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 start-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.chatSearchPlaceholder}
          className="min-h-[40px] w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081022] ps-9 pe-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
        />
      </div>

      {/* Saved Conversations List */}
      <div className="flex-1 space-y-2 overflow-y-auto pe-0.5">
        {conversations.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            {t.chatEmptyList}
          </p>
        ) : filteredConversations.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            {t.chatNoMatches}
          </p>
        ) : (
          filteredConversations.map((conv) => {
            const active = conv.id === activeConversationId;
            const isEditing = editingId === conv.id;
            const dateText = formatShortDateForLanguage(conv.lastMessageAtIso, language);
            const timeText = formatTimeForLanguage(conv.lastMessageAtIso, language);

            return (
              <div
                key={conv.id}
                className={`rounded-xl border p-2.5 transition-colors ${
                  active
                    ? 'border-cyan-500/60 bg-cyan-50/70 dark:bg-cyan-500/10'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#081022] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {isEditing ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && editingTitle.trim()) {
                          onRenameConversation(conv.id, editingTitle.trim());
                          setEditingId(null);
                        } else if (e.key === 'Escape') {
                          setEditingId(null);
                        }
                      }}
                      className="min-w-0 flex-1 rounded-lg border border-cyan-500 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (editingTitle.trim()) {
                          onRenameConversation(conv.id, editingTitle.trim());
                        }
                        setEditingId(null);
                      }}
                      aria-label={t.chatSaveRenameBtn}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      aria-label={t.chatCancelBtn}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectConversation(conv.id);
                        setMobileDrawerOpen(false);
                      }}
                      className="min-w-0 flex-1 text-start cursor-pointer"
                    >
                      <div className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                        {conv.title}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{getLangName(conv.language)}</span>
                        {dateText && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="whitespace-nowrap">{dateText}</span>
                          </>
                        )}
                        {timeText && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="whitespace-nowrap">{timeText}</span>
                          </>
                        )}
                      </div>
                    </button>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(conv.id);
                          setEditingTitle(conv.title);
                        }}
                        aria-label={t.chatRenameBtn}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteConversation(conv.id)}
                        aria-label={t.chatDeleteBtn}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/15 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 lg:grid-cols-[290px_1fr]">
      {/* Desktop Conversations Sidebar */}
      <aside className="hidden lg:flex lg:h-[76vh] lg:flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-4">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Overlay for Conversations */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative z-10 flex h-full w-80 max-w-[86vw] flex-col border-e border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1528] p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {t.chatListBtn}
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label={t.chatCloseListBtn}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">{renderSidebarContent()}</div>
          </div>
        </div>
      )}

      {/* Main Chat Pane */}
      <section className="flex flex-col gap-3">
        {/* Chat Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] px-4 py-3.5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                {activeConversation ? activeConversation.title : t.helperTitle}
              </h1>
              <span
                className={`text-xs font-semibold whitespace-nowrap ${
                  activeConversation
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-cyan-700 dark:text-cyan-300'
                }`}
              >
                · {activeConversation ? t.chatModeSavedBadge : t.chatModeNewBadge}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
              {activeConversation
                ? `${getLangName(activeConversationLanguage)} · ${t.chatOriginalLangNote}`
                : t.helperSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 lg:hidden cursor-pointer"
            >
              <List className="h-4 w-4" />
              <span>{t.chatListBtn}</span>
            </button>

            <button
              type="button"
              onClick={onNewChat}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-cyan-600/30 dark:border-cyan-500/40 bg-cyan-50 dark:bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-800 dark:text-cyan-200 transition-all active:scale-[0.98] hover:bg-cyan-100 dark:hover:bg-cyan-500/20 cursor-pointer"
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span>{t.helperNewChatBtn}</span>
            </button>
          </div>
        </div>

        {/* Reassuring Offline Local Guide Banner */}
        {offlineMode && (
          <div className="rounded-xl border border-cyan-500/35 bg-cyan-50/70 dark:bg-cyan-500/10 px-4 py-2.5 text-xs font-medium text-cyan-900 dark:text-cyan-200">
            {t.offlineGuideActiveNote}
          </div>
        )}

        {/* Starter Questions when in New Chat */}
        {!activeConversation && (
          <div className="flex flex-wrap gap-2">
            {t.starterQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onSendMessage(q)}
                disabled={isThinking}
                className="min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] px-3.5 py-2 text-start text-xs font-medium text-slate-700 dark:text-slate-200 transition-all active:scale-[0.98] hover:border-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-300 disabled:opacity-50 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Messages Feed + Composer */}
        <div className="flex min-h-[360px] max-h-[60vh] flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
            {activeMessages.length === 0 ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081022] p-4 text-sm text-slate-700 dark:text-slate-300">
                {t.helperGreeting}
              </div>
            ) : (
              activeMessages.map((msg, idx) => {
                const isSpeakingThis = speakingMsgId === msg.id;
                const isLoadingThisVoice = isVoiceLoading && speakingMsgId === msg.id;
                const replyLang = activeConversation ? activeConversationLanguage : language;
                const formattedMsgTime =
                  formatTimeForLanguage(msg.createdAtIso, language) || msg.timestamp;
                const isFailedAiMsg = msg.canRetry || msg.provider === 'offline-unavailable';
                const retryQ = resolveRetryQuestion(idx, msg);

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[82%] ${
                        msg.sender === 'user'
                          ? 'bg-cyan-500 text-slate-950 font-medium'
                          : isFailedAiMsg
                            ? 'border border-amber-500/40 bg-amber-50/70 dark:bg-amber-500/10 text-slate-900 dark:text-amber-100'
                            : 'border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081022] text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {msg.sender === 'assistant' && (
                        <>
                          {!isFailedAiMsg && (
                            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 px-2.5 py-2 text-xs text-slate-600 dark:text-slate-300">
                              <span className="font-semibold text-slate-700 dark:text-slate-200">
                                {t.aiOfficialSourcePromptLabel}
                              </span>
                              <a
                                href="https://www.swpc.noaa.gov/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-semibold text-cyan-700 dark:text-cyan-300 hover:underline"
                              >
                                <span>{t.officialSourceLinkLabel}</span>
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                              <a
                                href="https://www.swpc.noaa.gov/products/alerts-watches-and-warnings"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-semibold text-cyan-700 dark:text-cyan-300 hover:underline"
                              >
                                <span>{t.alertsOfficialFeedTitle}</span>
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            </div>
                          )}

                          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/70 dark:border-slate-800 pt-2 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {msg.provider && (
                                <span>{t.providerLabels[msg.provider]}</span>
                              )}
                              {msg.provider && formattedMsgTime && <span aria-hidden="true">·</span>}
                              {formattedMsgTime && (
                                <span className="font-mono tabular-nums whitespace-nowrap">
                                  {formattedMsgTime}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                              {isFailedAiMsg && retryQ && (
                                <button
                                  type="button"
                                  disabled={isThinking}
                                  onClick={() => onRetryMessage({ ...msg, retryQuestion: retryQ })}
                                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-500/20 px-3 py-1 font-semibold text-amber-950 dark:text-amber-100 hover:bg-amber-500/30 disabled:opacity-50 whitespace-nowrap cursor-pointer"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                  <span>{t.retryBtn}</span>
                                </button>
                              )}

                              {isLoadingThisVoice ? (
                                <span className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-cyan-500/35 bg-cyan-50 dark:bg-cyan-500/10 px-3 py-1 font-semibold text-cyan-800 dark:text-cyan-200 whitespace-nowrap">
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  <span>{t.voiceLoadingBtn}</span>
                                </span>
                              ) : isSpeakingThis ? (
                                <button
                                  type="button"
                                  onClick={onStopVoice}
                                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-rose-500/45 bg-rose-50 dark:bg-rose-500/15 px-3 py-1 font-semibold text-rose-700 dark:text-rose-200 whitespace-nowrap cursor-pointer"
                                >
                                  <Square className="h-3.5 w-3.5" />
                                  <span>{t.helperStopReplyVoice}</span>
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onSpeakReply(msg.id, msg.text, replyLang)}
                                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-cyan-500/35 bg-cyan-50 dark:bg-cyan-500/10 px-3 py-1 font-semibold text-cyan-800 dark:text-cyan-200 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 whitespace-nowrap cursor-pointer"
                                  >
                                    <Volume2 className="h-3.5 w-3.5" />
                                    <span>{t.helperListenReply}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onSpeakReply(msg.id, msg.text, replyLang)}
                                    aria-label={t.helperReplayReply}
                                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1 font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-500 whitespace-nowrap cursor-pointer"
                                  >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    <span>{t.helperReplayReply}</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {isThinking && (
              <div className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                {t.helperThinking}
              </div>
            )}

            {voiceError && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-3.5 py-2 text-xs text-amber-900 dark:text-amber-200">
                {voiceError}
              </div>
            )}

            {voiceUnavailableMessage && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-3.5 py-2 text-xs text-amber-900 dark:text-amber-200">
                {voiceUnavailableMessage}
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Composer + Mic Button */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081022] p-3"
          >
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submitQuestion();
                }
              }}
              placeholder={t.helperPlaceholder}
              className="w-full resize-none rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleToggleRecord}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer ${
                  isRecording
                    ? 'border-rose-500 bg-rose-600 text-white'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-cyan-500'
                }`}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4 shrink-0" />
                ) : (
                  <Mic className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
                )}
                <span>{isRecording ? t.helperRecordStop : t.helperRecordStart}</span>
              </button>

              <button
                type="submit"
                disabled={isThinking || !input.trim()}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 transition-all active:scale-[0.98] hover:bg-cyan-400 disabled:opacity-50 whitespace-nowrap cursor-pointer"
              >
                <Send className="h-4 w-4 rtl:rotate-180" />
                <span>{t.helperSendBtn}</span>
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};
