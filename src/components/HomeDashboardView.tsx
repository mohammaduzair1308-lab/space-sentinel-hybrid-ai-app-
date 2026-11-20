import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  ExternalLink,
  Info,
  MessageSquare,
  RefreshCw,
  Sun,
  Wind,
  WifiOff,
  X,
} from 'lucide-react';
import { formatDigits, LocalizationBundle } from '../data/localization';
import { LanguageCode, SolarWeatherState } from '../types/sentinel';
import {
  formatAgeForLanguage,
  formatFullTimestampForLanguage,
  formatTimeForLanguage,
} from '../utils/dateTime';
import { SolarTrendChart } from './SolarTrendChart';

interface HomeDashboardViewProps {
  t: LocalizationBundle;
  language: LanguageCode;
  solar: SolarWeatherState | null;
  isFetching: boolean;
  offlineMode: boolean;
  fetchError: boolean;
  connectionRestored: boolean;
  onDismissRestored: () => void;
  onRefreshLive: () => void;
  onReturnLive: () => void;
  onAskAi: () => void;
  onOpenWeather: () => void;
  onOpenAlerts: () => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  t,
  language,
  solar,
  isFetching,
  offlineMode,
  fetchError,
  connectionRestored,
  onDismissRestored,
  onRefreshLive,
  onReturnLive,
  onAskAi,
  onOpenWeather,
  onOpenAlerts,
}) => {
  const [expandedCard, setExpandedCard] = useState<'flare' | 'kp' | 'wind' | 'gps' | null>(null);
  const [, setAgeTick] = useState(0);

  const showWarningBanner =
    offlineMode || fetchError || (solar !== null && solar.source === 'offline-cache');

  useEffect(() => {
    if (!showWarningBanner || !solar) return;
    const timer = setInterval(() => setAgeTick((n) => n + 1), 30000);
    return () => clearInterval(timer);
  }, [showWarningBanner, solar]);

  const toggleCard = (id: 'flare' | 'kp' | 'wind' | 'gps') => {
    setExpandedCard((prev) => (prev === id ? null : id));
  };

  const severity = solar?.severity ?? 'nominal';
  const hasTrustworthyData = Boolean(
    solar && (solar.kpIndex !== null || solar.flareClass !== null || solar.solarWindSpeed !== null)
  );

  const severityAccentClass =
    severity === 'extreme'
      ? 'text-rose-600 dark:text-rose-400 border-rose-500/35'
      : severity === 'strong'
        ? 'text-amber-600 dark:text-amber-400 border-amber-500/35'
        : severity === 'minor'
          ? 'text-cyan-700 dark:text-cyan-300 border-cyan-500/35'
          : 'text-emerald-700 dark:text-emerald-400 border-emerald-500/30';

  const kpPercent =
    solar?.kpIndex !== null && solar?.kpIndex !== undefined
      ? Math.min(100, Math.max(4, Math.round((solar.kpIndex / 9) * 100)))
      : 0;

  const formattedUpdatedTime = solar
    ? formatFullTimestampForLanguage(solar.fetchedAtIso, language) || t.notAvailableShort
    : t.notAvailableShort;
  const cachedAgeText = solar ? formatAgeForLanguage(solar.fetchedAtIso, language) : '';

  const discrepancyKind = solar?.feedDiscrepancyKind ?? 'none';
  const showDiscrepancyNote = Boolean(solar && discrepancyKind !== 'none' && solar.source !== 'simulated');
  const discrepancyText =
    solar && showDiscrepancyNote
      ? t.feedDiscrepancyExplain[discrepancyKind](
          formatDigits(solar.kpIndex ?? 0, language),
          solar.activeWarningKp ? formatDigits(solar.activeWarningKp, language) : null,
          solar.forecastDays?.[0]?.gScale ?? null
        )
      : '';

  const xrayTime = solar?.xrayObservedAtIso
    ? formatTimeForLanguage(solar.xrayObservedAtIso, language)
    : '';
  const kpTime = solar?.kpObservedAtIso ? formatTimeForLanguage(solar.kpObservedAtIso, language) : '';
  const windTime = solar?.windObservedAtIso
    ? formatTimeForLanguage(solar.windObservedAtIso, language)
    : '';

  return (
    <div className="space-y-5">
      {/* Single Clean Connection / Cache / Restored Status Banner */}
      {connectionRestored ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{t.connectionRestoredBanner}</span>
          </div>
          <button
            type="button"
            onClick={onDismissRestored}
            aria-label={t.dismissBtn}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-emerald-500/20 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : showWarningBanner ? (
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
            className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-lg border border-amber-600/40 bg-white/80 dark:bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-amber-950 dark:text-amber-100 hover:border-amber-500 disabled:opacity-60 whitespace-nowrap cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? t.refreshingBtn : t.retryBtn}</span>
          </button>
        </div>
      ) : null}

      {/* Primary Focal Anchor — Current Condition, Risk Level & Prominent AI CTA */}
      <section
        className={`rounded-2xl border bg-white dark:bg-[#0B1120] p-5 sm:p-6 ${
          solar ? severityAccentClass : 'border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{t.dashStatusHeading}</span>
              {solar && (
                <>
                  <span aria-hidden="true">·</span>
                  <span
                    className={
                      solar.source === 'simulated' || solar.source === 'offline-cache'
                        ? 'font-semibold text-amber-600 dark:text-amber-300'
                        : 'text-slate-600 dark:text-slate-300'
                    }
                  >
                    {t.sourceStatus[solar.source]}
                  </span>
                </>
              )}
            </div>

            {hasTrustworthyData && solar ? (
              <>
                <div className="flex flex-wrap items-baseline gap-3">
                  <h1
                    className={`text-2xl font-extrabold tracking-tight sm:text-3xl ${
                      severity === 'extreme'
                        ? 'text-rose-600 dark:text-rose-400'
                        : severity === 'strong'
                          ? 'text-amber-600 dark:text-amber-300'
                          : severity === 'minor'
                            ? 'text-cyan-700 dark:text-cyan-300'
                            : 'text-emerald-700 dark:text-emerald-400'
                    }`}
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {t.severityLabels[solar.severity]}
                  </h1>
                  <span
                    dir="ltr"
                    className="font-mono text-xs tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap"
                  >
                    {solar.geomagneticScale} · {solar.radioBlackoutScale} · {solar.radiationScale}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {t.severityDescriptions[solar.severity]}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {t.dashRiskHeading}: {t.dashRiskTrustworthyHint} · {t.noaaAgencyName}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {t.notAvailableShort}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t.noaaNoCacheBanner}
                </p>
              </>
            )}
          </div>

          {/* Clear 2-Level Action Cluster */}
          <div className="flex flex-col gap-2.5 lg:items-end shrink-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={onAskAi}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-400 active:scale-[0.98] whitespace-nowrap cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span>{t.dashAskAiBtn}</span>
              </button>

              <button
                type="button"
                onClick={onRefreshLive}
                disabled={isFetching}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors hover:border-cyan-500 disabled:opacity-60 whitespace-nowrap cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                <span>{isFetching ? t.refreshingBtn : t.refreshBtn}</span>
              </button>

              {solar?.source === 'simulated' && (
                <button
                  type="button"
                  onClick={onReturnLive}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 whitespace-nowrap cursor-pointer"
                >
                  {t.returnLiveBtn}
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.dashAskAiHint}
            </p>
          </div>
        </div>
      </section>

      {/* Transparent Feed Difference Note (when live reading differs from active warning or today's 24h outlook) */}
      {showDiscrepancyNote && discrepancyText && (
        <section className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-cyan-500/35 bg-cyan-50/70 dark:bg-cyan-950/25 p-4 text-xs">
          <div className="flex items-start gap-2.5 max-w-3xl">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
            <div className="space-y-1">
              <div className="font-bold text-slate-900 dark:text-cyan-200">
                {t.feedDiscrepancyTitle}
              </div>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                {discrepancyText}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenAlerts}
            className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl border border-cyan-600/40 bg-white/80 dark:bg-slate-900/70 px-3.5 py-2 text-xs font-semibold text-cyan-800 dark:text-cyan-200 hover:border-cyan-500 cursor-pointer"
          >
            <span>{t.dashViewAlertsBtn}</span>
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </button>
        </section>
      )}

      {/* Structured Telemetry Grid with Plain Meaning Right Beside Numbers */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Latest Solar Activity */}
        <article className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <Sun className="h-4 w-4 text-amber-500" />
                <span>{t.dashSolarActivityTitle}</span>
              </div>
              <span dir="ltr" className="font-mono text-xs text-slate-600 dark:text-slate-300">
                {solar?.radioBlackoutScale ?? 'R0'}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-baseline gap-2.5">
              <span
                dir="ltr"
                className="font-mono text-3xl font-bold tabular-nums text-slate-900 dark:text-cyan-300"
              >
                {solar?.flareClass ?? t.notAvailableShort}
              </span>
              {xrayTime && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t.observedAtLabel}: {xrayTime}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-800 dark:text-slate-200">
              {t.flarePlainMeaning(solar?.flareClass ?? null)}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t.dashSolarActivityBrief}
            </p>
            {expandedCard === 'flare' && (
              <p className="mt-3 border-t border-slate-100 dark:border-slate-800 pt-2.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {t.dashSolarActivityDetail}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => toggleCard('flare')}
            className="mt-3 inline-flex min-h-[36px] items-center gap-1 self-start text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:underline cursor-pointer"
          >
            <span>{expandedCard === 'flare' ? t.hideDetailsBtn : t.expandDetailsBtn}</span>
            {expandedCard === 'flare' ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </article>

        {/* Geomagnetic State & Kp Index */}
        <article className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <Activity className="h-4 w-4 text-emerald-500" />
                <span>{t.dashKpTitle}</span>
              </div>
              <span dir="ltr" className="font-mono text-xs text-slate-600 dark:text-slate-300">
                {solar?.geomagneticScale ?? 'G0'}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-baseline gap-2.5">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-3xl font-bold tabular-nums text-slate-900 dark:text-emerald-300">
                  {solar?.kpIndex !== null && solar?.kpIndex !== undefined
                    ? formatDigits(solar.kpIndex, language)
                    : t.notAvailableShort}
                </span>
                {solar?.kpIndex !== null && solar?.kpIndex !== undefined && (
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    / {formatDigits(9, language)}
                  </span>
                )}
              </div>
              {kpTime && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t.observedAtLabel}: {kpTime}
                </span>
              )}
            </div>

            {solar?.kpIndex !== null && solar?.kpIndex !== undefined && (
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
                  style={{ width: `${kpPercent}%` }}
                />
              </div>
            )}

            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-800 dark:text-slate-200">
              {t.kpPlainMeaning(solar?.kpIndex ?? null)}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t.dashKpBrief}
            </p>
            {expandedCard === 'kp' && (
              <p className="mt-3 border-t border-slate-100 dark:border-slate-800 pt-2.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {t.dashKpDetail}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => toggleCard('kp')}
            className="mt-3 inline-flex min-h-[36px] items-center gap-1 self-start text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:underline cursor-pointer"
          >
            <span>{expandedCard === 'kp' ? t.hideDetailsBtn : t.expandDetailsBtn}</span>
            {expandedCard === 'kp' ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </article>

        {/* Solar Wind Speed & Density */}
        <article className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <Wind className="h-4 w-4 text-sky-500" />
                <span>{t.dashWindTitle}</span>
              </div>
              {solar?.protonDensity !== null && solar?.protonDensity !== undefined && (
                <span className="font-mono text-xs tabular-nums text-slate-600 dark:text-slate-300">
                  {t.dashDensityLabel}: {formatDigits(solar.protonDensity, language)} {t.unitProtonDensity}
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-baseline gap-2.5">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {solar?.solarWindSpeed !== null && solar?.solarWindSpeed !== undefined
                    ? formatDigits(solar.solarWindSpeed, language)
                    : t.notAvailableShort}
                </span>
                {solar?.solarWindSpeed !== null && solar?.solarWindSpeed !== undefined && (
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {t.unitKmSec}
                  </span>
                )}
              </div>
              {windTime && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t.observedAtLabel}: {windTime}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-800 dark:text-slate-200">
              {t.windPlainMeaning(solar?.solarWindSpeed ?? null)}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t.dashWindBrief}
            </p>
            {expandedCard === 'wind' && (
              <p className="mt-3 border-t border-slate-100 dark:border-slate-800 pt-2.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {t.dashWindDetail}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => toggleCard('wind')}
            className="mt-3 inline-flex min-h-[36px] items-center gap-1 self-start text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:underline cursor-pointer"
          >
            <span>{expandedCard === 'wind' ? t.hideDetailsBtn : t.expandDetailsBtn}</span>
            {expandedCard === 'wind' ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </article>

        {/* GPS & Satellite Advisory */}
        <article className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <Compass className="h-4 w-4 text-cyan-500" />
                <span>{t.dashGpsTitle}</span>
              </div>
              {solar && (
                <span dir="ltr" className="font-mono text-xs text-slate-600 dark:text-slate-300">
                  {solar.geomagneticScale} · {solar.radioBlackoutScale}
                </span>
              )}
            </div>

            <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
              {solar ? t.severityLabels[solar.navigationRiskLevel] : t.notAvailableShort}
            </div>
            <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-800 dark:text-slate-200">
              {t.gpsPlainScaleNote(solar?.navigationRiskLevel ?? 'nominal')}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {solar?.source === 'simulated' &&
              solar.sampleGpsDriftMeters !== undefined &&
              solar.sampleGpsLockPercent !== undefined
                ? t.sampleGpsNote(
                    formatDigits(solar.sampleGpsDriftMeters, language),
                    formatDigits(solar.sampleGpsLockPercent, language)
                  )
                : t.dashGpsBrief}
            </p>
            {expandedCard === 'gps' && (
              <p className="mt-3 border-t border-slate-100 dark:border-slate-800 pt-2.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {t.dashGpsDetail}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => toggleCard('gps')}
            className="mt-3 inline-flex min-h-[36px] items-center gap-1 self-start text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:underline cursor-pointer"
          >
            <span>{expandedCard === 'gps' ? t.hideDetailsBtn : t.expandDetailsBtn}</span>
            {expandedCard === 'gps' ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </article>
      </section>

      {/* Last 6 Hours Activity Trend Chart */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.dashChartHeading}
            </h2>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
              {t.dashChartSub}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenWeather}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-cyan-500 cursor-pointer"
          >
            <span>{t.dashOpenWeatherBtn}</span>
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </button>
        </div>

        {solar ? (
          <SolarTrendChart history={solar.history} language={language} t={t} />
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] p-6 text-xs text-slate-500 dark:text-slate-400">
            {t.noaaNoCacheBanner}
          </div>
        )}
      </section>

      {/* Update Timestamp, Official Source & Alerts Link */}
      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] px-5 py-4 text-xs">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {t.dashProvenanceHeading}:
          </span>
          <span className="font-mono tabular-nums whitespace-nowrap">
            {formattedUpdatedTime}
          </span>
          <span aria-hidden="true">·</span>
          <a
            href={solar?.officialSourceUrl ?? 'https://www.swpc.noaa.gov/'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[40px] items-center gap-1 font-semibold text-cyan-700 dark:text-cyan-300 hover:underline"
          >
            <span>{t.noaaAgencyName}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <button
          type="button"
          onClick={onOpenAlerts}
          className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:underline cursor-pointer"
        >
          <span>{t.dashViewAlertsBtn}</span>
          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </button>
      </footer>
    </div>
  );
};

