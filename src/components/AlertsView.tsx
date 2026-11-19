import React, { useState } from 'react';
import {
  AlertTriangle,
  Bookmark,
  Calendar,
  ChevronDown,
  ChevronUp,
  Compass,
  ExternalLink,
  Info,
  Loader2,
  RefreshCw,
  Trash2,
  Volume2,
  VolumeX,
  WifiOff,
} from 'lucide-react';
import { formatDigits, LocalizationBundle } from '../data/localization';
import {
  FavoriteSpaceItem,
  LanguageCode,
  SeverityLevel,
  SolarWeatherState,
  SpaceAlertItem,
} from '../types/sentinel';
import {
  formatAgeForLanguage,
  formatFullTimestampForLanguage,
  formatShortDateForLanguage,
} from '../utils/dateTime';

interface AlertsViewProps {
  t: LocalizationBundle;
  language: LanguageCode;
  solar: SolarWeatherState | null;
  isFetching: boolean;
  offlineMode: boolean;
  fetchError: boolean;
  isSpeakingAlert: boolean;
  isVoiceLoading: boolean;
  voiceUnavailableMessage: string | null;
  favorites: FavoriteSpaceItem[];
  onRefreshLive: () => void;
  onToggleEmergencyAlert: () => void;
  onSaveAlertFavorite: (alert: SpaceAlertItem) => void;
  onRemoveFavorite: (id: string) => void;
  onSelectSample: (level: SeverityLevel) => void;
  onReturnLive: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  t,
  language,
  solar,
  isFetching,
  offlineMode,
  fetchError,
  isSpeakingAlert,
  isVoiceLoading,
  voiceUnavailableMessage,
  favorites,
  onRefreshLive,
  onToggleEmergencyAlert,
  onSaveAlertFavorite,
  onRemoveFavorite,
  onSelectSample,
  onReturnLive,
}) => {
  const [trainingOpen, setTrainingOpen] = useState(false);

  const severity = solar?.severity ?? 'nominal';
  const savedTitles = new Set(favorites.map((f) => f.title));
  const formattedUpdated = solar
    ? formatFullTimestampForLanguage(solar.fetchedAtIso, language) || t.notAvailableShort
    : t.notAvailableShort;
  const cachedAgeText = solar ? formatAgeForLanguage(solar.fetchedAtIso, language) : '';
  const showWarning =
    offlineMode || fetchError || (solar !== null && solar.source === 'offline-cache');

  const discrepancyKind = solar?.feedDiscrepancyKind ?? 'none';
  const discrepancyText =
    solar && discrepancyKind !== 'none'
      ? t.feedDiscrepancyExplain[discrepancyKind](
          formatDigits(solar.kpIndex ?? 0, language),
          solar.activeWarningKp ? formatDigits(solar.activeWarningKp, language) : null,
          solar.forecastDays?.[0]?.gScale ?? null
        )
      : '';

  const getForecastDayName = (dayOffset: 1 | 2 | 3, dateIso: string): string => {
    const label =
      dayOffset === 1
        ? t.forecastDayLabels.today
        : dayOffset === 2
          ? t.forecastDayLabels.tomorrow
          : t.forecastDayLabels.dayAfter;
    const shortDate = formatShortDateForLanguage(dateIso, language);
    return shortDate ? `${label} · ${shortDate}` : label;
  };

  return (
    <div className="space-y-6">
      {showWarning && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-xs font-medium text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-2.5">
            <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
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
                    {formattedUpdated}
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
            className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-lg border border-amber-600/40 bg-white/80 dark:bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-amber-950 dark:text-amber-100 disabled:opacity-60 whitespace-nowrap cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? t.refreshingBtn : t.retryBtn}</span>
          </button>
        </div>
      )}

      {/* Header + Refresh */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t.alertsPageTitle}
          </h1>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
            {t.alertsPageSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {solar?.source === 'simulated' && (
            <button
              type="button"
              onClick={onReturnLive}
              className="inline-flex min-h-[42px] items-center rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 cursor-pointer"
            >
              {t.returnLiveBtn}
            </button>
          )}
          <button
            type="button"
            onClick={onRefreshLive}
            disabled={isFetching}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-cyan-500 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? t.refreshingBtn : t.refreshBtn}</span>
          </button>
        </div>
      </section>

      {/* Current Hazard Status & Voice Warning Card */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <AlertTriangle
                className={`h-4 w-4 ${
                  severity === 'extreme'
                    ? 'text-rose-500'
                    : severity === 'strong'
                      ? 'text-amber-500'
                      : severity === 'minor'
                        ? 'text-cyan-500'
                        : 'text-emerald-500'
                }`}
              />
              <span>{t.alertsCurrentConditionTitle}</span>
            </div>
            {solar && (
              <span dir="ltr" className="font-mono text-xs text-slate-600 dark:text-slate-300">
                {solar.geomagneticScale} · {solar.radioBlackoutScale} · {solar.radiationScale}
              </span>
            )}
          </div>

          <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-slate-100">
            {solar ? t.severityLabels[solar.severity] : t.notAvailableShort}
          </div>
          {solar && (
            <p className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-200">
              {t.kpPlainMeaning(solar.kpIndex)}
            </p>
          )}
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
            {solar ? t.severityDescriptions[solar.severity] : t.noaaNoCacheBanner}
          </p>

          {discrepancyText && (
            <div className="mt-3 rounded-xl border border-cyan-500/35 bg-cyan-50/70 dark:bg-cyan-950/25 p-3 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-cyan-200">
                <Info className="h-3.5 w-3.5 shrink-0 text-cyan-600 dark:text-cyan-400" />
                <span>{t.feedDiscrepancyTitle}</span>
              </div>
              <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300">
                {discrepancyText}
              </p>
            </div>
          )}

          <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <Compass className="h-3.5 w-3.5 text-cyan-500" />
              <span>{t.alertsGpsImpactTitle}</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {solar?.source === 'simulated' &&
              solar.sampleGpsDriftMeters !== undefined &&
              solar.sampleGpsLockPercent !== undefined
                ? t.sampleGpsNote(
                    formatDigits(solar.sampleGpsDriftMeters, language),
                    formatDigits(solar.sampleGpsLockPercent, language)
                  )
                : t.gpsPlainScaleNote(solar?.navigationRiskLevel ?? 'nominal')}
            </p>
          </div>
        </section>

        <section className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.alertsVoiceCardTitle}
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
              {t.alertsVoiceCardDesc}
            </p>
            {voiceUnavailableMessage && (
              <p className="mt-3 rounded-lg border border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
                {voiceUnavailableMessage}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleEmergencyAlert}
            disabled={isVoiceLoading}
            className={`mt-5 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer disabled:opacity-75 ${
              isSpeakingAlert
                ? 'bg-rose-600 text-white hover:bg-rose-500'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
            }`}
          >
            {isVoiceLoading ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            ) : isSpeakingAlert ? (
              <VolumeX className="h-4 w-4 shrink-0" />
            ) : (
              <Volume2 className="h-4 w-4 shrink-0" />
            )}
            <span>
              {isVoiceLoading
                ? t.voiceLoadingBtn
                : isSpeakingAlert
                  ? t.card3Stop
                  : t.card3Action}
            </span>
          </button>
        </section>
      </div>

      {/* 3-Day Official Forecast & Yesterday's Peak (Separated Clearly from Current Live Readings) */}
      {solar?.forecastDays && solar.forecastDays.length > 0 && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
                <Calendar className="h-4 w-4 text-cyan-500" />
                <span>{t.forecastSectionTitle}</span>
              </h2>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                {t.forecastSectionSubtitle}
              </p>
            </div>
            <a
              href="https://www.swpc.noaa.gov/noaa-scales-explanation"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:underline"
            >
              <span>{t.noaaAgencyName}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {solar.forecastDays.map((day) => {
              const hasStorm = day.gLevelNum >= 1;
              return (
                <div
                  key={day.dayOffset}
                  className={`rounded-xl border p-4 ${
                    hasStorm
                      ? 'border-amber-500/40 bg-amber-50/60 dark:bg-amber-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081022]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {getForecastDayName(day.dayOffset, day.dateIso)}
                    </span>
                    <span dir="ltr" className="font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300">
                      {day.gScale}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {t.forecastStormScaleLabel}:{' '}
                    {hasStorm
                      ? `${day.gScale} (${t.severityLabels[day.gLevelNum >= 3 ? 'strong' : 'minor']})`
                      : t.forecastNoStormText}
                  </div>

                  <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    {day.rMinorProb !== null && (
                      <div>
                        {t.forecastRadioChanceLabel}: {formatDigits(day.rMinorProb, language)}%
                        {day.rMajorProb !== null
                          ? ` / ${formatDigits(day.rMajorProb, language)}%`
                          : ''}
                      </div>
                    )}
                    {day.sProb !== null && (
                      <div>
                        {t.forecastRadiationChanceLabel}: {formatDigits(day.sProb, language)}%
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {solar.yesterdayPeak && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081022] px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300">
              <span className="font-semibold">{t.yesterdayPeakLabel}:</span>
              <span dir="ltr" className="font-mono tabular-nums">
                {solar.yesterdayPeak.gScale} · {solar.yesterdayPeak.rScale} · {solar.yesterdayPeak.sScale}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                ({formatShortDateForLanguage(solar.yesterdayPeak.dateIso, language)})
              </span>
            </div>
          )}
        </section>
      )}

      {/* Verified Official Bulletins Feed (100% Localized with Agency, Category, Valid Window & Impacts) */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.alertsOfficialFeedTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.alertsRecentLabel} · {t.noaaAgencyName}
            </p>
          </div>
          <a
            href="https://www.swpc.noaa.gov/products/alerts-watches-and-warnings"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[36px] items-center gap-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:underline"
          >
            <span>{t.officialSourceLinkLabel}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {!solar || solar.alerts.length === 0 ? (
          <p className="text-xs text-slate-600 dark:text-slate-400">{t.alertsEmptyText}</p>
        ) : (
          <div className="space-y-3">
            {solar.alerts.map((alert) => {
              const localized = t.localizedAlertContent(alert);
              const alreadySaved = savedTitles.has(localized.title) || savedTitles.has(alert.title);
              const issuedFormatted =
                formatFullTimestampForLanguage(alert.issuedAt, language) ||
                formatDigits(alert.issuedAt.slice(0, 16), language);
              const validFromFormatted = alert.validFromIso
                ? formatFullTimestampForLanguage(alert.validFromIso, language)
                : '';
              const validToFormatted = alert.validToIso
                ? formatFullTimestampForLanguage(alert.validToIso, language)
                : '';
              const beginTimeFormatted = alert.beginTimeIso
                ? formatFullTimestampForLanguage(alert.beginTimeIso, language)
                : '';

              const categoryLabel =
                t.alertCategoryLabels[alert.category ?? 'alert'];
              const timingLabel = alert.isActiveWindow
                ? t.alertTimingLabels.activeWindow
                : alert.isContinuing
                  ? t.alertTimingLabels.continuing
                  : alert.validToIso
                    ? t.alertTimingLabels.completed
                    : t.alertTimingLabels.notice;

              return (
                <article
                  key={alert.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081022] p-4 space-y-2.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        <span
                          className={
                            alert.category === 'warning'
                              ? 'text-amber-700 dark:text-amber-300'
                              : alert.category === 'watch'
                                ? 'text-cyan-700 dark:text-cyan-300'
                                : 'text-emerald-700 dark:text-emerald-300'
                          }
                        >
                          {categoryLabel}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-700 dark:text-slate-200">
                          {timingLabel}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-600 dark:text-slate-400">
                          {t.severityLabels[alert.severity]}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {localized.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                        <span>
                          {t.alertAgencyLabel}: {t.noaaAgencyName}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums whitespace-nowrap">
                          {t.alertsIssuedLabel}: {issuedFormatted}
                        </span>
                      </div>

                      {(validFromFormatted || validToFormatted || beginTimeFormatted) && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-700 dark:text-slate-300">
                          {validFromFormatted && (
                            <span className="font-mono tabular-nums whitespace-nowrap">
                              {t.alertValidFromLabel}: {validFromFormatted}
                            </span>
                          )}
                          {validToFormatted && (
                            <span className="font-mono tabular-nums whitespace-nowrap">
                              {t.alertValidToLabel}: {validToFormatted}
                            </span>
                          )}
                          {!validFromFormatted && beginTimeFormatted && (
                            <span className="font-mono tabular-nums whitespace-nowrap">
                              {t.alertBeginTimeLabel}: {beginTimeFormatted}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onSaveAlertFavorite({
                          ...alert,
                          title: localized.title,
                          summary: localized.summary,
                        })
                      }
                      disabled={alreadySaved}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-cyan-500 disabled:opacity-60 cursor-pointer"
                    >
                      <Bookmark className="h-3.5 w-3.5 text-cyan-500" />
                      <span>{alreadySaved ? t.savedFavoriteBadge : t.saveFavoriteBtn}</span>
                    </button>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 sm:text-sm">
                    {localized.summary}
                  </p>

                  <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 px-3 py-2 text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {t.alertImpactsLabel}:{' '}
                    </span>
                    <span>{localized.impact}</span>
                  </div>

                  <div>
                    <a
                      href={alert.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:underline"
                    >
                      <span>{t.officialSourceLinkLabel}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Bookmarked Alerts */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
        <h2 className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">
          {t.alertsSavedSectionTitle}
        </h2>

        {favorites.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.favoritesEmptyText}</p>
        ) : (
          <div className="space-y-2.5">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081022] p-3.5"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {fav.title}
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{fav.summary}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{t.sourceStatus[fav.source]}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums whitespace-nowrap">
                      {formatFullTimestampForLanguage(fav.createdAtIso, language) ||
                        formatDigits(fav.recordedAtLabel, language)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveFavorite(fav.id)}
                  aria-label={t.removeFavoriteBtn}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Collapsible Training Sample Section */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t.alertsTrainingTitle}
            </h2>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
              {t.alertsTrainingDesc}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTrainingOpen((o) => !o)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-cyan-500 cursor-pointer"
          >
            <span>{trainingOpen ? t.alertsTrainingHideBtn : t.alertsTrainingShowBtn}</span>
            {trainingOpen ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {trainingOpen && (
          <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
              {t.testSampleWarning}
            </p>
            <div className="flex flex-wrap gap-2">
              {(['nominal', 'minor', 'strong', 'extreme'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onSelectSample(lvl)}
                  className={`min-h-[42px] rounded-xl border px-3.5 py-2 text-xs font-semibold cursor-pointer ${
                    solar?.source === 'simulated' && solar.severity === lvl
                      ? 'border-amber-500 bg-amber-500 text-slate-950'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-amber-500'
                  }`}
                >
                  {t.scenarioLabels[lvl]}
                </button>
              ))}
              {solar?.source === 'simulated' && (
                <button
                  type="button"
                  onClick={onReturnLive}
                  className="min-h-[42px] rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 cursor-pointer"
                >
                  {t.returnLiveBtn}
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

