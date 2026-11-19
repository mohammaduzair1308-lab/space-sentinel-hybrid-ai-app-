import React, { useEffect, useRef } from 'react';
import { SolarWeatherState } from '../types/sentinel';

interface OrbitalCanvasProps {
  solar: SolarWeatherState;
  offlineMode: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

export const OrbitalCanvas: React.FC<OrbitalCanvasProps> = ({ solar, offlineMode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frameId = 0;
    let angle = 0;

    const windSpeed = solar.solarWindSpeed ?? 400;
    const count = solar.severity === 'extreme' ? 56 : solar.severity === 'strong' ? 38 : 22;
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * 520,
      y: 35 + Math.random() * 170,
      vx: (windSpeed / 240) * (1.1 + Math.random() * 0.8),
      vy: (Math.random() - 0.5) * 0.3,
      size: 1.2 + Math.random() * 1.6,
      alpha: 0.4 + Math.random() * 0.5,
    }));

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(280, rect.width);
      const h = Math.max(190, rect.height);

      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const sunX = 48;
      const sunY = h * 0.5;
      const earthX = w * 0.74;
      const earthY = h * 0.5;

      const stormColor =
        solar.severity === 'extreme'
          ? 'rgba(239, 68, 68, 0.85)'
          : solar.severity === 'strong'
            ? 'rgba(245, 158, 11, 0.85)'
            : solar.severity === 'minor'
              ? 'rgba(56, 189, 248, 0.85)'
              : 'rgba(16, 185, 129, 0.85)';

      const glow = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, 54);
      glow.addColorStop(0, solar.severity === 'extreme' ? '#fca5a5' : '#fde047');
      glow.addColorStop(
        0.4,
        solar.severity === 'extreme' ? 'rgba(239,68,68,0.45)' : 'rgba(245,158,11,0.4)'
      );
      glow.addColorStop(1, 'rgba(245,158,11,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 54, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = solar.severity === 'extreme' ? '#ef4444' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
      ctx.fill();

      for (const p of particles) {
        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          const dx = p.x - earthX;
          const dy = p.y - earthY;
          if (Math.hypot(dx, dy) < 68) {
            p.y += dy >= 0 ? 1.25 : -1.25;
          }
          if (p.x > w + 10) {
            p.x = sunX + 16;
            p.y = earthY + (Math.random() - 0.5) * (h * 0.68);
          }
        }
        ctx.fillStyle = stormColor;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.strokeStyle = stormColor;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(earthX + 8, earthY, 60, Math.PI * 0.62, Math.PI * 1.38);
      ctx.stroke();

      const orbitR = 42;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.32)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(earthX, earthY, orbitR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const activeSats =
        solar.severity === 'extreme'
          ? 2
          : solar.severity === 'strong'
            ? 3
            : 4;

      for (let s = 0; s < 4; s++) {
        const theta = angle + (s * Math.PI) / 2;
        const sx = earthX + Math.cos(theta) * orbitR;
        const sy = earthY + Math.sin(theta) * orbitR;
        const steady = s < activeSats;

        ctx.strokeStyle = steady ? 'rgba(16, 185, 129, 0.45)' : 'rgba(245, 158, 11, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(earthX, earthY);
        ctx.stroke();

        ctx.fillStyle = steady ? '#10b981' : '#f59e0b';
        ctx.fillRect(sx - 3, sy - 3, 6, 6);
      }

      const earthGrad = ctx.createRadialGradient(earthX - 5, earthY - 5, 3, earthX, earthY, 16);
      earthGrad.addColorStop(0, '#38bdf8');
      earthGrad.addColorStop(0.7, '#0284c7');
      earthGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(earthX, earthY, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      if (!prefersReducedMotion) {
        angle += 0.008;
        frameId = requestAnimationFrame(render);
      }
    };

    render();
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [solar, offlineMode]);

  return (
    <div className="h-52 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-[#070B14]">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
};
