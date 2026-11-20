import React, { useEffect, useState } from 'react';
import {
  Activity,
  BookmarkPlus,
  Compass,
  Download,
  ExternalLink,
  RefreshCw,
  Sun,
  Trash2,
  Wind,
  WifiOff,
  Zap,
} from 'lucide-react';
import { formatDigits, LocalizationBundle } from '../data/localization';
import {
  FavoriteSpaceItem,
  LanguageCode,
  SolarWeatherState,
  SpaceWeatherTopic,
} from '../types/sentinel';
import {
  formatAgeForLanguage,
  formatFullTimestampForLanguage,
} from '../utils/dateTime';
import { OrbitalCanvas } from './OrbitalCanvas';
import { SolarTrendChart } from './SolarTrendChart';

interface SpaceWeatherViewProps {
  t: LocalizationBundle;
  language: LanguageCode;
  solar: SolarWeatherState | null;
  offlineMode: boolean;
  fetchError: boolean;
  isFetching: boolean;
  favorites: FavoriteSpaceItem[];
  onReturnLive: () => void;
  onSaveTelemetryFavorite: () => void;
  onRemoveFavorite: (id: string) => void;
  onExportHtml: () => void;
}

const TOPIC_ORDER: SpaceWeatherTopic[] = ['flares', 'storms', 'kp', 'wind', 'gps'];

export const SpaceWeatherView: React.FC<SpaceWeatherViewProps> = ({
  t,
  language,
  solar,
  offlineMode,
  fetchError,
  isFetching,
  favorites,
  onReturnLive,
  onSaveTelemetryFavorite,
  onRemoveFavorite,
  onExportHtml,
}) => {
  const [activeTopic, setActiveTopic] = useState<SpaceWeatherTopic>('flares');
  const [, setAgeTick] = useState(0);

  const showWarning =
    offlineMode || fetchError || (solar !== null && solar.source === 'offline-cache');

  useEffect(() => {
    if (!showWarning || !solar) return;
    const timer = setInterval(() => setAgeTick((n) => n + 1), 30000);
    return () => clearInterval(timer);
  }, [showWarning, solar]);

  const getTopicIcon = (topic: SpaceWeatherTopic) => {
    switch (topic) {
      case 'flares':
        return <Sun className="h-4 w-4 shrink-0 text-amber-500" />;
      case 'storms':
        return <Zap className="h-4 w-4 shrink-0 text-cyan-500" />;
      case 'kp':
        return <Activity className="h-4 w-4 shrink-0 text-emerald-500" />;
      case 'wind':
        return <Wind className="h-4 w-4 shrink-0 text-sky-500" />;
      case 'gps':
        return <Compass className="h-4 w-4 shrink-0 text-indigo-400" />;
    }
  };

  const getTopicMetric = (topic: SpaceWeatherTopic): { label: string; value: string } => {
    if (!solar) return { label: t.summarySourceTitle, value: t.notAvailableShort };
    switch (topic) {
      case 'flares':
        return {
          label: `${t.summarySunTitle} · ${solar.radioBlackoutScale}`,
          value: solar.flareClass ?? t.notAvailableShort,
        };
      case 'storms':
        return {
          label: t.summaryStormTitle,
          value: `${solar.geomagneticScale} · ${t.severityLabels[solar.severity]}`,
        };
      case 'kp':
        return {
          label: t.summaryStormTitle,
          value:
            solar.kpIndex !== null
              ? `${formatDigits(solar.kpIndex, language)} / ${formatDigits(9, language)}`
              : t.notAvailableShort,
        };
      case 'wind':
        return {
          label: t.solarWindTitle,
          value:
            solar.solarWindSpeed !== null
              ? `${formatDigits(solar.solarWindSpeed, language)} ${t.unitKmSec}`
              : t.notAvailableShort,
        };
      case 'gps':
        return {
          label: t.summaryGpsTitle,
          value: t.severityLabels[solar.navigationRiskLevel],
        };
    }
  };

  const topicContent = t.weatherTopics[activeTopic];
  const topicMetric = getTopicMetric(activeTopic);
  const formattedUpdated = solar
    ? formatFullTimestampForLanguage(solar.fetchedAtIso, language) || t.notAvailableShort
    : t.notAvailableShort;
  const cachedAgeText = solar ? formatAgeForLanguage(solar.fetchedAtIso, language) : '';

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
            onClick={onReturnLive}
            disabled={isFetching}
            className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-lg border border-amber-600/40 bg-white/80 dark:bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-amber-950 dark:text-amber-100 disabled:opacity-60 whitespace-nowrap cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? t.refreshingBtn : t.retryBtn}</span>
          </button>
        </div>
      )}

      {/* Page Header & Utility Exports */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
        <div className="max-w-2xl">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t.weatherPageTitle}
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
            {t.weatherPageSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {solar?.source === 'simulated' && (
            <button
              type="button"
              onClick={onReturnLive}
              className="inline-flex min-h-[42px] items-center rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 whitespace-nowrap cursor-pointer"
            >
              {t.returnLiveBtn}
            </button>
          )}

          {solar && (
            <button
              type="button"
              onClick={onSaveTelemetryFavorite}
              title={t.saveSnapshotHint}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 whitespace-nowrap cursor-pointer"
            >
              <BookmarkPlus className="h-4 w-4 shrink-0" />
              <span>{t.saveSnapshotBtn}</span>
            </button>
          )}

          {solar && (
            <button
              type="button"
              onClick={onExportHtml}
              title={t.exportHtmlHint}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-cyan-500 whitespace-nowrap cursor-pointer"
            >
              <Download className="h-4 w-4 shrink-0" />
              <span>{t.exportHtmlBtn}</span>
            </button>
          )}
        </div>
      </section>

      {/* Interactive Topic Explorer */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {t.weatherTopicSelectorLabel}
        </p>

        <div
          className="mt-3 flex flex-wrap gap-2"
          role="tablist"
          aria-label={t.weatherTopicSelectorLabel}
        >
          {TOPIC_ORDER.map((topicId) => {
            const selected = activeTopic === topicId;
            return (
              <button
                key={topicId}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTopic(topicId)}
                className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  selected
                    ? 'border-cyan-500 bg-cyan-500/15 text-cyan-800 dark:text-cyan-200'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081022] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {getTopicIcon(topicId)}
                <span>{t.weatherTopics[topicId].title}</span>
              </button>
            );
          })}
        </div>

        {/* Focused Topic Detail Panel */}
        <div className="mt-5 grid grid-cols-1 gap-5 border-t border-slate-100 dark:border-slate-800 pt-5 lg:grid-cols-[260px_1fr]">
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081022] p-4">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{topicMetric.label}</div>
              <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-cyan-300">
                {topicMetric.value}
              </div>
            </div>
            {solar && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>{t.sourceStatus[solar.source]}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums whitespace-nowrap">{formattedUpdated}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {topicContent.title}
            </h2>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {topicContent.summary}
            </p>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
              {topicContent.scientificExplain}
            </p>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 sm:text-sm">
              {topicContent.impactExplain}
            </p>
          </div>
        </div>
      </section>

      {/* Telemetry Charts & Magnetosphere Simulation Canvas */}
      {solar ? (
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t.trendChartTitle}
              </h2>
              <span className="font-mono text-xs tabular-nums whitespace-nowrap text-slate-500 dark:text-slate-400">
                {formattedUpdated}
              </span>
            </div>
            <SolarTrendChart history={solar.history} language={language} t={t} />
            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t.trendChartExplain}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t.orbitTitle}
              </h2>
              <span className="font-mono text-xs tabular-nums whitespace-nowrap text-slate-500 dark:text-slate-400">
                {solar.solarWindSpeed !== null
                  ? `${formatDigits(solar.solarWindSpeed, language)} ${t.unitKmSec}`
                  : t.notAvailableShort}
              </span>
            </div>
            <OrbitalCanvas solar={solar} offlineMode={offlineMode} />
            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t.orbitExplain}
            </p>
          </div>
        </section>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5 text-sm text-slate-600 dark:text-slate-400">
          {t.noaaNoCacheBanner}
        </div>
      )}

      {/* Historical / Saved Snapshots & Official Sources */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {t.savedSnapshotsTitle}
          </h2>

          {favorites.length === 0 ? (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t.noSnapshotsText}</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-2 pe-4 font-medium">{t.summaryUpdatedTitle}</th>
                    <th className="py-2 pe-4 font-medium">{t.summarySunTitle}</th>
                    <th className="py-2 pe-4 font-medium">{t.summaryStormTitle}</th>
                    <th className="py-2 pe-4 font-medium">{t.summarySourceTitle}</th>
                    <th className="py-2 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 tabular-nums">
                  {favorites.map((fav) => (
                    <tr key={fav.id}>
                      <td className="py-2.5 pe-4 font-mono whitespace-nowrap text-slate-700 dark:text-slate-300">
                        {formatFullTimestampForLanguage(fav.createdAtIso, language) ||
                          formatDigits(fav.recordedAtLabel, language)}
                      </td>
                      <td className="py-2.5 pe-4 font-mono font-bold text-cyan-700 dark:text-cyan-300">
                        {fav.flareClass ?? fav.title}
                      </td>
                      <td className="py-2.5 pe-4 font-mono text-emerald-700 dark:text-emerald-300">
                        {typeof fav.kpIndex === 'number'
                          ? formatDigits(fav.kpIndex, language)
                          : fav.summary.slice(0, 60)}
                      </td>
                      <td className="py-2.5 pe-4 text-slate-600 dark:text-slate-400">
                        <a
                          href={fav.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:text-cyan-600 dark:hover:text-cyan-300 hover:underline"
                        >
                          <span>{t.sourceStatus[fav.source]}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                      <td className="py-2.5 text-end">
                        <button
                          type="button"
                          onClick={() => onRemoveFavorite(fav.id)}
                          aria-label={t.removeFavoriteBtn}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {t.weatherSourcesHeading}
          </h2>
          <div>
            <a
              href="https://www.swpc.noaa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 dark:text-cyan-300 hover:underline"
            >
              <span>{t.sourcesNoaaTitle}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t.sourcesNoaaDesc}
            </p>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <a
              href="https://www.swpc.noaa.gov/noaa-scales-explanation"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
            >
              <span>{t.sourcesNasaTitle}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t.sourcesNasaDesc}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
