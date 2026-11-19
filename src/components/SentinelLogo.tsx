import React from 'react';

interface SentinelLogoProps {
  size?: 'sm' | 'lg';
}

export const SentinelLogo: React.FC<SentinelLogoProps> = ({ size = 'sm' }) => {
  const dims = size === 'lg' ? 'h-14 w-14' : 'h-9 w-9';
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl border border-cyan-500/40 bg-slate-900/90 dark:bg-slate-900/90 shadow-sm ${dims}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" className="h-[72%] w-[72%]">
        <circle
          cx="24"
          cy="24"
          r="17"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2.2"
          strokeDasharray="7 4"
        />
        <ellipse
          cx="24"
          cy="24"
          rx="20"
          ry="8.5"
          transform="rotate(-25 24 24)"
          fill="none"
          stroke="#10b981"
          strokeWidth="1.8"
          opacity="0.9"
        />
        <circle cx="24" cy="24" r="6.5" fill="#fbbf24" />
        <circle cx="38" cy="15" r="2.8" fill="#38bdf8" />
      </svg>
    </div>
  );
};
