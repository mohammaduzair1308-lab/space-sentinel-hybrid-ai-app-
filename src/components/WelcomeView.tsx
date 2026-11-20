import React, { useState } from 'react';
import { ArrowRight, BarChart3, HandHelping, Loader2, Volume2, VolumeX } from 'lucide-react';
import nebulaBackdrop from '../assets/images/cosmic_nebula_backdrop_1794795785483.jpg';
import { LANGUAGE_LIST, LocalizationBundle } from '../data/localization';
import { LanguageCode } from '../types/sentinel';
import { SentinelLogo } from './SentinelLogo';

interface WelcomeViewProps {
  t: LocalizationBundle;
  language: LanguageCode;
  isSpeaking: boolean;
  isVoiceLoading: boolean;
  voiceUnavailableMessage: string | null;
  onSelectLanguage: (lang: LanguageCode) => void;
  onListenIntro: () => void;
  onChooseEasyMode: () => void;
  onChooseFullMode: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  t,
  language,
  isSpeaking,
  isVoiceLoading,
  voiceUnavailableMessage,
  onSelectLanguage,
  onListenIntro,
  onChooseEasyMode,
  onChooseFullMode,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#060913] text-slate-50 flex flex-col justify-between">
      {/* Deep Space Backdrop */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at 22% 20%, rgba(14, 165, 233, 0.2), transparent 48%), radial-gradient(circle at 78% 72%, rgba(20, 184, 166, 0.14), transparent 46%), #060913',
        }}
        aria-hidden="true"
      >
        {!imgFailed && (
          <img
            src={nebulaBackdrop}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060913]/85 via-[#060913]/75 to-[#060913]/95" />
      </div>

      {/* Top Bar: Brand + 5-Language Switcher */}
      <header className="relative z-10 mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8">
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <SentinelLogo size="sm" />
          <span
            className="text-base font-bold tracking-tight text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t.brandName}
          </span>
        </div>

        <div
          className="flex flex-wrap items-center gap-1"
          role="group"
          aria-label={t.headerLanguageLabel}
        >
          {LANGUAGE_LIST.map((lang) => {
            const active = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => onSelectLanguage(lang.code)}
                className={`min-h-[40px] rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'border-cyan-400 bg-cyan-400 text-slate-950'
                    : 'border-slate-700/80 bg-slate-900/75 text-slate-200 hover:border-cyan-400/60 hover:text-white'
                }`}
              >
                {lang.nativeName}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Clean Choice Screen */}
      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-6 sm:px-8">
        <div className="flex flex-col items-center text-center">
          <SentinelLogo size="lg" />

          <h1
            className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl"
            style={{ fontFamily: 'var(--font-display)', textWrap: 'balance' }}
          >
            {t.brandName}
          </h1>

          <p
            dir="ltr"
            className="mt-1.5 text-sm font-semibold tracking-wide text-cyan-300 sm:text-base"
          >
            {t.welcomeEnglishSubtitle}
          </p>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            {t.welcomeTagline}
          </p>
        </div>

        {/* Clear Mode Selection Question + Two Large Touch Options */}
        <section className="mt-7 w-full space-y-4">
          <h2 className="text-center text-lg font-bold text-white sm:text-2xl">
            {t.welcomeChooseHeading}
          </h2>

          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
            {/* Option A: Easy Use */}
            <button
              type="button"
              onClick={onChooseEasyMode}
              className="group flex min-h-[148px] w-full flex-col justify-between rounded-2xl border-2 border-cyan-400/75 bg-[#0B1426]/95 p-5 sm:p-6 text-start transition-all duration-150 hover:border-cyan-300 hover:bg-[#0E1B33] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 cursor-pointer shadow-lg shadow-cyan-950/30"
            >
              <div className="flex items-start justify-between gap-3 w-full">
                <div className="flex items-center gap-3">
                  <span
                    dir="ltr"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-lg font-extrabold text-slate-950"
                  >
                    {t.modeEasyOptionLetter}
                  </span>
                  <div>
                    <div className="text-xl font-extrabold text-white sm:text-2xl">
                      {t.modeEasyTitle}
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-cyan-300">
                      {t.modeEasyBadge}
                    </div>
                  </div>
                </div>
                <HandHelping className="h-6 w-6 shrink-0 text-cyan-300" />
              </div>

              <div className="mt-4 flex items-end justify-between gap-3 w-full">
                <p className="text-sm leading-relaxed text-slate-200">
                  {t.modeEasySubtitle}
                </p>
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-colors">
                  <ArrowRight className="h-5 w-5 rtl:rotate-180" />
                </span>
              </div>
            </button>

            {/* Option B: Full Information */}
            <button
              type="button"
              onClick={onChooseFullMode}
              className="group flex min-h-[148px] w-full flex-col justify-between rounded-2xl border border-slate-700/90 bg-[#0B1120]/95 p-5 sm:p-6 text-start transition-all duration-150 hover:border-teal-400/75 hover:bg-[#0F172A] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3 w-full">
                <div className="flex items-center gap-3">
                  <span
                    dir="ltr"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-teal-400/50 bg-teal-500/15 text-lg font-extrabold text-teal-200"
                  >
                    {t.modeFullOptionLetter}
                  </span>
                  <div>
                    <div className="text-xl font-extrabold text-white sm:text-2xl">
                      {t.modeFullTitle}
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-teal-300">
                      {t.modeFullBadge}
                    </div>
                  </div>
                </div>
                <BarChart3 className="h-6 w-6 shrink-0 text-teal-300" />
              </div>

              <div className="mt-4 flex items-end justify-between gap-3 w-full">
                <p className="text-sm leading-relaxed text-slate-300">
                  {t.modeFullSubtitle}
                </p>
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-teal-300 group-hover:bg-teal-400 group-hover:text-slate-950 transition-colors">
                  <ArrowRight className="h-5 w-5 rtl:rotate-180" />
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* Secondary Voice Intro Button */}
        <div className="mt-6 flex flex-col items-center gap-2.5">
          <button
            type="button"
            onClick={onListenIntro}
            disabled={isVoiceLoading}
            className={`inline-flex min-h-[48px] items-center gap-2.5 rounded-xl border px-6 py-2.5 text-sm font-semibold transition-colors duration-150 active:scale-[0.98] whitespace-nowrap cursor-pointer disabled:opacity-75 ${
              isSpeaking
                ? 'border-emerald-400 bg-emerald-500/20 text-white'
                : 'border-slate-700 bg-slate-900/85 text-slate-200 hover:border-cyan-400/60 hover:text-white'
            }`}
          >
            {isVoiceLoading ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-cyan-300" />
            ) : isSpeaking ? (
              <VolumeX className="h-4 w-4 shrink-0" />
            ) : (
              <Volume2 className="h-4 w-4 shrink-0 text-cyan-300" />
            )}
            <span>
              {isVoiceLoading
                ? t.voiceLoadingBtn
                : isSpeaking
                  ? t.stopVoiceBtn
                  : t.listenIntroBtn}
            </span>
          </button>

          {voiceUnavailableMessage && (
            <p className="max-w-md rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-2.5 text-center text-xs text-amber-100">
              {voiceUnavailableMessage}
            </p>
          )}
        </div>
      </main>

      <div className="relative z-10 h-4" />
    </div>
  );
};
