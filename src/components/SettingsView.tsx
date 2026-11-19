import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  LogIn,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { LANGUAGE_LIST, LocalizationBundle } from '../data/localization';
import {
  AppUser,
  LanguageCode,
  LocalModelSupport,
} from '../types/sentinel';

interface SettingsViewProps {
  t: LocalizationBundle;
  language: LanguageCode;
  user: AppUser | null;
  authError: boolean;
  voiceAvailable: boolean;
  speechRate: number;
  voiceMuted: boolean;
  theme: 'dark' | 'light';
  largeText: boolean;
  offlineMode: boolean;
  preferOnDeviceFirst: boolean;
  localModelSupport: LocalModelSupport;
  appCheckActive: boolean;
  saveConsent: boolean;
  onSignInGoogle: () => void;
  onSignOut: () => void;
  onSelectLanguage: (lang: LanguageCode) => void;
  onChangeSpeechRate: (rate: number) => void;
  onToggleMute: () => void;
  onToggleTheme: () => void;
  onToggleLargeText: () => void;
  onToggleOfflineMode: () => void;
  onTogglePreferOnDevice: () => void;
  onCheckLocalModel: () => void;
  onToggleSaveConsent: () => void;
  onClearAllSaved: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  t,
  language,
  user,
  authError,
  voiceAvailable,
  speechRate,
  voiceMuted,
  theme,
  largeText,
  offlineMode,
  preferOnDeviceFirst,
  localModelSupport,
  appCheckActive,
  saveConsent,
  onSignInGoogle,
  onSignOut,
  onSelectLanguage,
  onChangeSpeechRate,
  onToggleMute,
  onToggleTheme,
  onToggleLargeText,
  onToggleOfflineMode,
  onTogglePreferOnDevice,
  onCheckLocalModel,
  onToggleSaveConsent,
  onClearAllSaved,
}) => {
  const [techOpen, setTechOpen] = useState(false);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] px-5 py-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {t.settingsTitle}
        </h1>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
          {t.settingsSubtitle}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 1. Language */}
        <section className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.languageCardTitle}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t.languageCardDesc}
            </p>
            <p
              className={`mt-2 text-xs font-medium ${
                voiceAvailable || !offlineMode
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-amber-700 dark:text-amber-300'
              }`}
            >
              {voiceAvailable
                ? t.voiceAvailableBadge
                : !offlineMode
                  ? t.voiceOnlineAvailableBadge
                  : t.voiceOfflineUnavailableNotice}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {LANGUAGE_LIST.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => onSelectLanguage(lang.code)}
                className={`min-h-[40px] rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  lang.code === language
                    ? 'border-cyan-500 bg-cyan-500 text-slate-950'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-cyan-500'
                }`}
              >
                {lang.nativeName}
              </button>
            ))}
          </div>
        </section>

        {/* 2. Voice */}
        <section className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.voiceCardTitle}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t.voiceCardDesc}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onToggleMute}
              className={`min-h-[40px] rounded-xl border px-3.5 py-1.5 text-xs font-semibold cursor-pointer ${
                !voiceMuted
                  ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
              }`}
            >
              {voiceMuted ? t.headerVoiceMuted : t.headerVoiceOn}
            </button>

            <div className="flex flex-1 gap-1.5">
              {[
                { rate: 0.8, label: t.speedSlow },
                { rate: 1.0, label: t.speedNormal },
                { rate: 1.25, label: t.speedFast },
              ].map((opt) => (
                <button
                  key={opt.rate}
                  type="button"
                  onClick={() => onChangeSpeechRate(opt.rate)}
                  className={`min-h-[40px] flex-1 rounded-xl border px-2 py-1.5 text-xs font-semibold cursor-pointer ${
                    speechRate === opt.rate
                      ? 'border-cyan-500 bg-cyan-500 text-slate-950'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Alerts & Display */}
        <section className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.alertsDisplaySectionTitle}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t.alertsDisplaySectionDesc}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              className="min-h-[40px] flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-cyan-500 cursor-pointer"
            >
              {t.themeLabel}: {theme === 'dark' ? t.headerThemeDark : t.headerThemeLight}
            </button>

            <button
              type="button"
              onClick={onToggleLargeText}
              className={`min-h-[40px] flex-1 rounded-xl border px-3 py-2 text-xs font-semibold cursor-pointer ${
                largeText
                  ? 'border-cyan-500 bg-cyan-500 text-slate-950'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200'
              }`}
            >
              {t.textSizeLabel}: {largeText ? t.textSizeLarge : t.textSizeNormal}
            </button>
          </div>
        </section>

        {/* 4. Account */}
        <section className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.accountCardTitle}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {user ? t.accountSignedInDesc(user.email ?? user.uid) : t.accountSignedOutDesc}
            </p>
            {authError && (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                {t.accountErrorMsg}
              </p>
            )}
          </div>

          <div className="mt-4">
            {user ? (
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-rose-400 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>{t.accountSignOutBtn}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onSignInGoogle}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span>{t.accountSignInBtn}</span>
              </button>
            )}
          </div>
        </section>

        {/* 5. Privacy */}
        <section className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.privacyCardTitle}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t.privacyCardDesc}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onToggleSaveConsent}
              className={`min-h-[40px] flex-1 rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                saveConsent
                  ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
              }`}
            >
              {t.saveConsentLabel}: {saveConsent ? t.toggleOn : t.toggleOff}
            </button>

            <button
              type="button"
              onClick={onClearAllSaved}
              className="min-h-[40px] rounded-xl border border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-500/20 cursor-pointer"
            >
              {t.clearSavedDataBtn}
            </button>
          </div>
        </section>

        {/* 6. AI & Offline Mode */}
        <section className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.aiOfflineSectionTitle}
            </h2>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t.aiOfflineSectionDesc}
            </p>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {t.aiOnlineExplain}
            </p>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t.aiLocalExplain}
            </p>
            <p className="pt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              {t.localModelLabels[localModelSupport]}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onToggleOfflineMode}
              className={`min-h-[40px] rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                offlineMode
                  ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200'
              }`}
            >
              {offlineMode ? t.card2SimulateActive : t.card2SimulateBtn}
            </button>
            <button
              type="button"
              onClick={onTogglePreferOnDevice}
              className="min-h-[40px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-cyan-500 cursor-pointer"
            >
              {preferOnDeviceFirst ? t.hybridPreferLocalBtn : t.hybridPreferCloudBtn}
            </button>
            <button
              type="button"
              onClick={onCheckLocalModel}
              className="min-h-[40px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-cyan-500 cursor-pointer"
            >
              {t.card2CheckBtn}
            </button>
          </div>
        </section>
      </div>

      {/* Expandable Technical Details Disclosure (Keeps Default Settings Clean for Everyday Users) */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
        <button
          type="button"
          onClick={() => setTechOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 text-start text-sm font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-500" />
            <span>{techOpen ? t.techDetailsHideBtn : t.techDetailsShowBtn}</span>
          </span>
          {techOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {techOpen && (
          <div className="mt-4 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
            <p className="font-medium text-slate-700 dark:text-slate-300">
              {appCheckActive ? t.appCheckActiveText : t.appCheckPendingText}
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  {t.sourcesTitle}
                </div>
                <div>
                  <a
                    href="https://www.swpc.noaa.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-cyan-700 dark:text-cyan-300 hover:underline"
                  >
                    <span>{t.sourcesNoaaTitle}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                    {t.sourcesNoaaDesc}
                  </p>
                </div>
                <div>
                  <a
                    href="https://www.swpc.noaa.gov/noaa-scales-explanation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
                  >
                    <span>{t.sourcesNasaTitle}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                    {t.sourcesNasaDesc}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  {t.consoleTodoTitle}
                </div>
                <ul className="list-disc space-y-1 ps-5 text-slate-600 dark:text-slate-400">
                  {t.consoleTodoItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
