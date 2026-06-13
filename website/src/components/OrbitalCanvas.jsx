import { useEffect, useRef, useState } from 'react';
import { RISK_META } from '../utils/risk';
import { hashToAngle } from '../utils/hash';

const SIZE = 600;
const CENTER = SIZE / 2;
const MAX_RADIUS = 270;
const MIN_RADIUS = 50;

function radiusFor(missDistanceLD) {
  const r = MIN_RADIUS + Math.log10(missDistanceLD + 1) * 130;
  return Math.min(MAX_RADIUS, r);
}

export default function OrbitalCanvas({ asteroids, onSelect }) {
  const canvasRef = useRef(null);
  const dotsRef = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const focusedIndexRef = useRef(-1);

  useEffect(() => {
    focusedIndexRef.current = focusedIndex;
  }, [focusedIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let raf;
    let rotation = 0;

    function draw() {
      ctx.clearRect(0, 0, SIZE, SIZE);

      // Reference rings
      ctx.strokeStyle = 'rgba(139, 146, 168, 0.12)';
      ctx.lineWidth = 1;
      [0.4, 0.65, 0.9].forEach((f) => {
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, MAX_RADIUS * f, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Earth
      const earthGradient = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, 22);
      earthGradient.addColorStop(0, '#7FB8FF');
      earthGradient.addColorStop(1, '#1B3A66');
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, 14, 0, Math.PI * 2);
      ctx.fillStyle = earthGradient;
      ctx.fill();
      ctx.lineWidth = 8;
      ctx.strokeStyle = 'rgba(94, 168, 255, 0.25)';
      ctx.stroke();

      const dots = [];
      asteroids.forEach((a, i) => {
        const r = radiusFor(a.missDistanceLD);
        const angle = hashToAngle(a.id) + rotation;
        const x = CENTER + Math.cos(angle) * r;
        const y = CENTER + Math.sin(angle) * r;
        const dotR = Math.max(3, Math.min(9, Math.sqrt(a.diameterMeters.max) * 0.45));
        const color = RISK_META[a.riskLevel].color;

        // Focus ring
        if (i === focusedIndexRef.current) {
          ctx.beginPath();
          ctx.arc(x, y, dotR + 8, 0, Math.PI * 2);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Soft halo
        ctx.beginPath();
        ctx.arc(x, y, dotR + 5, 0, Math.PI * 2);
        ctx.fillStyle = `${color}26`;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(x, y, dotR, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        dots.push({ x, y, hitRadius: dotR + 6, asteroid: a });
      });
      dotsRef.current = dots;

      rotation += 0.0006;
      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf);
  }, [asteroids]);

  function handleClick(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * SIZE;
    const y = ((event.clientY - rect.top) / rect.height) * SIZE;

    const hit = dotsRef.current.find(
      (d) => Math.hypot(d.x - x, d.y - y) <= d.hitRadius
    );
    if (hit) onSelect(hit.asteroid);
  }

  function handleKeyDown(e) {
    if (!asteroids.length) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((i) => (i + 1) % asteroids.length);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((i) => (i - 1 + asteroids.length) % asteroids.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focusedIndex >= 0) onSelect(asteroids[focusedIndex]);
    }
  }

  function handleBlur() {
    setFocusedIndex(-1);
  }

  return (
    <section className="my-10">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-display text-lg text-ink">This week&apos;s approach map</h2>
        <p className="font-mono text-xs text-dim">Tap a dot for details</p>
      </div>

      <div className="rounded-2xl border border-edge bg-panel/40 p-2 sm:p-4">
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          tabIndex={0}
          role="application"
          aria-roledescription="interactive map"
          aria-label={`Radial map of ${asteroids.length} approaching asteroids. Use arrow keys to select an asteroid, and Enter to view details. Currently focused: ${focusedIndex >= 0 ? asteroids[focusedIndex].name : 'none'}`}
          className="w-full max-w-[460px] mx-auto aspect-square cursor-pointer block focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4 rounded-full"
        />
      </div>

      <div className="flex flex-wrap gap-4 mt-3 justify-center font-mono text-xs text-dim">
        {Object.entries(RISK_META).map(([key, meta]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ background: meta.color }}
            />
            {meta.label}
          </span>
        ))}
      </div>
    </section>
  );
}
