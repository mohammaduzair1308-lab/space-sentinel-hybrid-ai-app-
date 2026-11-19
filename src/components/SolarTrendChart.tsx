import React, { useState } from 'react';
import { formatDigits, LocalizationBundle } from '../data/localization';
import { LanguageCode, SolarDataPoint } from '../types/sentinel';

interface SolarTrendChartProps {
  history: SolarDataPoint[];
  language: LanguageCode;
  t: LocalizationBundle;
}

const FLUX_UNITS: Record<LanguageCode, string> = {
  en: 'W/m²',
  ur: 'واٹ/مربع میٹر',
  hi: 'वाट/वर्ग मी',
  te: 'వాట్/చ.మీ',
  kn: 'ವಾಟ್/ಚ.ಮೀ',
};

const SUPERSCRIPTS: Record<string, string> = {
  '-': '⁻',
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

function formatFluxForLanguage(flux: number, language: LanguageCode): string {
  const exp = flux.toExponential(1);
  if (language === 'en') return exp;
  const [coeff, power] = exp.split('e');
  const locCoeff = formatDigits(coeff, language);
  const supPower = (power ?? '')
    .replace('+', '')
    .split('')
    .map((c) => SUPERSCRIPTS[c] ?? c)
    .join('');
  return `${locCoeff} × ${formatDigits(10, language)}${supPower}`;
}

export const SolarTrendChart: React.FC<SolarTrendChartProps> = ({ history, language, t }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const width = 560;
  const height = 200;
  const padL = language === 'en' ? 54 : 68;
  const padR = 16;
  const padT = 18;
  const padB = 26;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const safeData =
    history.length > 1
      ? history
      : [
          { timestamp: '00:00', flux: 1e-6, kp: 2.0 },
          { timestamp: '00:20', flux: 1.5e-6, kp: 2.3 },
        ];

  const fluxToY = (flux: number) => {
    const logVal = Math.log10(Math.max(1e-8, Math.min(1e-3, flux)));
    const norm = (logVal - -8) / 5;
    return padT + plotH - norm * plotH;
  };

  const kpToY = (kp: number) => {
    const norm = Math.max(0, Math.min(9, kp)) / 9;
    return padT + plotH - norm * plotH;
  };

  const idxToX = (i: number) => padL + (i / (safeData.length - 1)) * plotW;

  const fluxPath = safeData
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${idxToX(i).toFixed(1)} ${fluxToY(pt.flux).toFixed(1)}`)
    .join(' ');

  const kpPath = safeData
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${idxToX(i).toFixed(1)} ${kpToY(pt.kp).toFixed(1)}`)
    .join(' ');

  const activePt = hoverIdx !== null ? safeData[hoverIdx] : safeData[safeData.length - 1];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] p-3.5">
      {/* Clear 2-Line Legend */}
      <div className="mb-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-700 dark:text-slate-300">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-0.5 w-5 rounded-full bg-cyan-500" aria-hidden="true" />
          <span>{t.chartLegendFlare}</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-0.5 w-5 border-t-2 border-dashed border-emerald-500"
            aria-hidden="true"
          />
          <span>{t.chartLegendKp}</span>
        </span>
      </div>

      {/* Live / Hovered Point Readout */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
        <span dir="ltr">{formatDigits(activePt.timestamp, language)}</span>
        <span dir="ltr">
          {formatFluxForLanguage(activePt.flux, language)} {FLUX_UNITS[language]} ·{' '}
          {formatDigits(activePt.kp, language)}/{formatDigits(9, language)}
        </span>
      </div>

      <div dir="ltr">
        <svg
          role="img"
          aria-label={t.trendChartTitle}
          viewBox={`0 0 ${width} ${height}`}
          className="h-48 w-full select-none cursor-crosshair"
          onMouseLeave={() => setHoverIdx(null)}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((step, idx) => {
            const y = padT + step * plotH;
            return (
              <line
                key={idx}
                x1={padL}
                x2={width - padR}
                y1={y}
                y2={y}
                stroke="rgba(148, 163, 184, 0.2)"
                strokeWidth="1"
              />
            );
          })}

          <text x={4} y={padT + 8} textAnchor="start" fill="#94a3b8" fontSize="11">
            {t.chartAxisStrong}
          </text>
          <text x={4} y={padT + plotH * 0.5 + 4} textAnchor="start" fill="#94a3b8" fontSize="11">
            {t.chartAxisMedium}
          </text>
          <text x={4} y={padT + plotH} textAnchor="start" fill="#94a3b8" fontSize="11">
            {t.chartAxisQuiet}
          </text>

          <path d={fluxPath} fill="none" stroke="#06b6d4" strokeWidth="2.4" strokeLinejoin="round" />
          <path
            d={kpPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.2"
            strokeDasharray="5 3"
            strokeLinejoin="round"
          />

          {hoverIdx !== null && (
            <g>
              <line
                x1={idxToX(hoverIdx)}
                x2={idxToX(hoverIdx)}
                y1={padT}
                y2={padT + plotH}
                stroke="rgba(6, 182, 212, 0.45)"
                strokeWidth="1"
              />
              <circle cx={idxToX(hoverIdx)} cy={fluxToY(activePt.flux)} r="4" fill="#06b6d4" />
              <circle cx={idxToX(hoverIdx)} cy={kpToY(activePt.kp)} r="4" fill="#10b981" />
            </g>
          )}

          {safeData.map((pt, i) => {
            const sliceW = plotW / safeData.length;
            return (
              <rect
                key={`${pt.timestamp}-${i}`}
                x={idxToX(i) - sliceW / 2}
                y={padT}
                width={sliceW}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHoverIdx(i)}
                onClick={() => setHoverIdx(i)}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

