import { LocalizationBundle } from '../data/localization';
import { LanguageCode, SolarWeatherState } from '../types/sentinel';
import { formatFullTimestampForLanguage, localizeDigits } from './dateTime';

export function exportStandaloneReportHtml(
  solar: SolarWeatherState,
  language: LanguageCode,
  t: LocalizationBundle
): void {
  const dir = language === 'ur' ? 'rtl' : 'ltr';
  const sourceText = t.sourceStatus[solar.source];
  const summaryText = t.severityLabels[solar.severity];
  const flareVal = solar.flareClass ?? t.notAvailableShort;
  const kpVal =
    solar.kpIndex !== null
      ? `${localizeDigits(solar.kpIndex, language)} · ${solar.geomagneticScale}`
      : t.notAvailableShort;
  const windVal =
    solar.solarWindSpeed !== null
      ? `${localizeDigits(solar.solarWindSpeed, language)} ${t.unitKmSec}`
      : t.notAvailableShort;
  const navRisk = t.severityLabels[solar.navigationRiskLevel];
  const updatedText = formatFullTimestampForLanguage(solar.fetchedAtIso, language) || t.notAvailableShort;

  const html = `<!DOCTYPE html>
<html lang="${language}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${t.brandName}</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #070d1f; color: #f8fafc; margin: 0; padding: 24px; }
    .card { max-width: 720px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin: 20px 0; }
    .box { background: #020617; border: 1px solid #1e293b; border-radius: 10px; padding: 12px; }
    .val { font-size: 1.2rem; font-weight: 700; color: #38bdf8; margin-top: 4px; }
    .muted { color: #94a3b8; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1 style="margin-top:0;">${t.brandName}</h1>
    <p class="muted">${sourceText} · ${updatedText}</p>
    <div class="grid">
      <div class="box"><div class="muted">${t.summarySunTitle}</div><div class="val">${flareVal}</div></div>
      <div class="box"><div class="muted">${t.summaryStormTitle}</div><div class="val">${kpVal}</div></div>
      <div class="box"><div class="muted">${t.solarWindTitle}</div><div class="val">${windVal}</div></div>
      <div class="box"><div class="muted">${t.summaryGpsTitle}</div><div class="val">${navRisk}</div></div>
    </div>
    <p>${summaryText}</p>
    <p class="muted"><a href="${solar.officialSourceUrl}" style="color:#38bdf8;">${t.officialSourceLinkLabel}</a></p>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `space-sentinel-${language}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
