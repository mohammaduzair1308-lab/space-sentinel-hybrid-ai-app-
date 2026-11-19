import React, { useState } from 'react';
import { ArrowRight, Compass, Loader2, ShieldAlert, Volume2, VolumeX } from 'lucide-react';
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
  onEnterCenter: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  t,
  language,
  isSpeaking,
  isVoiceLoading,
  voiceUnavailableMessage,
  onSelectLanguage,
  onListenIntro,
  onEnterCenter,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#060913] text-slate-50 flex flex-col justify-between">
      {/* Calibrated Deep Space Backdrop */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at 22% 20%, rgba(14, 165, 233, 0.18), transparent 48%), radial-gradient(circle at 78% 72%, rgba(16, 185, 129, 0.12), transparent 46%), #060913',
        }}
        aria-hidden="true"
      >
        {!imgFailed && (
          <img
            src={nebulaBackdrop}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover opacity-45"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060913]/85 via-[#060913]/72 to-[#060913]/95" />
      </div>

      {/* Top Bar: Brand + Language Selector */}
      <header className="relative z-10 mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
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
                className={`min-h-[38px] rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'border-cyan-400 bg-cyan-400 text-slate-950'
                    : 'border-slate-700/80 bg-slate-900/70 text-slate-200 hover:border-cyan-400/60 hover:text-white'
                }`}
              >
                {lang.nativeName}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Concise Introduction */}
      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-5 py-6 sm:px-8">
        <div className="flex flex-col items-center text-center">
          <SentinelLogo size="lg" />
          <p className="mt-4 text-xs font-medium text-cyan-300/90">
            {t.brandSubtitle}
          </p>
          <h1
            className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-5xl"
            style={{ fontFamily: 'var(--font-display)', textWrap: 'balance' }}
          >
            {t.brandName}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
            {t.welcomeTagline}
          </p>
        </div>

        {/* Concise 2-Point Purpose Overview */}
        <div className="mt-7 grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-[#0B1120]/90 p-5 text-start">
            <div className="flex items-center gap-2 text-cyan-300">
              <Compass className="h-4 w-4 shrink-0" />
              <h2 className="text-sm font-bold text-white">{t.welcomeWhatTitle}</h2>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
              {t.welcomeWhatDesc}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-[#0B1120]/90 p-5 text-start">
            <div className="flex items-center gap-2 text-emerald-300">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <h2 className="text-sm font-bold text-white">{t.welcomeWhyTitle}</h2>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
              {t.welcomeWhyDesc}
            </p>
          </section>
        </div>

        {/* Primary & Secondary Actions */}
        <div className="mt-7 flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Primary Action */}
            <button
              type="button"
              onClick={onEnterCenter}
              className="inline-flex min-h-[48px] items-center gap-2.5 rounded-xl bg-cyan-400 px-7 py-3 text-sm font-bold text-slate-950 transition-transform duration-150 hover:bg-cyan-300 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 whitespace-nowrap cursor-pointer"
            >
              <span>{t.enterCenterBtn}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </button>

            {/* Secondary Action */}
            <button
              type="button"
              onClick={onListenIntro}
              disabled={isVoiceLoading}
              className={`inline-flex min-h-[48px] items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-colors duration-150 active:scale-[0.98] whitespace-nowrap cursor-pointer disabled:opacity-75 ${
                isSpeaking
                  ? 'border-emerald-400 bg-emerald-500/20 text-white'
                  : 'border-slate-700 bg-slate-900/80 text-slate-200 hover:border-cyan-400/60 hover:text-white'
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
          </div>

          <p className="text-xs text-slate-400 text-center">{t.enterCenterHint}</p>
        </div>

        {voiceUnavailableMessage && (
          <p className="mt-4 max-w-md rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-2.5 text-center text-xs text-amber-100">
            {voiceUnavailableMessage}
          </p>
        )}
      </main>

      <div className="relative z-10 h-4" />
    </div>
  );
};
