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

// Helper to draw a procedurally irregular wireframe rock (vector style)
function drawAsteroidPolygon(ctx, x, y, radius, id, spin) {
  const seed = parseInt(id.replace(/[^0-9]/g, '').slice(-3)) || 100;
  const numPoints = 7 + (seed % 5); // 7 to 11 vertices
  ctx.beginPath();
  for (let j = 0; j <= numPoints; j++) {
    const angle = (j / numPoints) * Math.PI * 2 + spin;
    // Irregular rocky shape
    const factor = 0.75 + Math.abs(Math.sin(j * 1.7 + seed)) * 0.35;
    const px = x + Math.cos(angle) * radius * factor;
    const py = y + Math.sin(angle) * radius * factor;
    if (j === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
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
      ctx.shadowBlur = 0;

      // Draw vector radar sweep lines
      const sweepLength = MAX_RADIUS * 1.05;
      const sweepAngle = rotation * 1.2;
      
      ctx.beginPath();
      ctx.moveTo(CENTER, CENTER);
      ctx.lineTo(
        CENTER + Math.cos(sweepAngle) * sweepLength,
        CENTER + Math.sin(sweepAngle) * sweepLength
      );
      ctx.strokeStyle = 'rgba(0, 255, 153, 0.22)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Radar sweep trail
      const trailSteps = 20;
      for (let step = 0; step < trailSteps; step++) {
        const trailAngle = sweepAngle - (step * 0.015);
        ctx.beginPath();
        ctx.moveTo(CENTER, CENTER);
        ctx.lineTo(
          CENTER + Math.cos(trailAngle) * sweepLength,
          CENTER + Math.sin(trailAngle) * sweepLength
        );
        ctx.strokeStyle = `rgba(0, 255, 153, ${0.22 * (1 - step / trailSteps)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Concentric reference rings
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.setLineDash([3, 5]);
      ctx.lineWidth = 1;
      [0.35, 0.65, 0.95].forEach((f) => {
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, MAX_RADIUS * f, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.setLineDash([]); // Reset line dash

      // Draw Earth as a vector core with crosshairs
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(CENTER - 22, CENTER);
      ctx.lineTo(CENTER + 22, CENTER);
      ctx.moveTo(CENTER, CENTER - 22);
      ctx.lineTo(CENTER, CENTER + 22);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(CENTER, CENTER, 10, 0, Math.PI * 2);
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00F0FF';
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(CENTER, CENTER, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#E0E8FF';
      ctx.fill();

      // Label coordinate center
      ctx.fillStyle = '#00F0FF';
      ctx.font = '10px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText('EARTH', CENTER, CENTER - 16);

      const dots = [];
      asteroids.forEach((a, i) => {
        const r = radiusFor(a.missDistanceLD);
        const seed = parseInt(a.id.replace(/[^0-9]/g, '').slice(-3)) || 100;
        const spin = (seed % 2 === 0 ? 1 : -1) * (rotation * (1.8 + (seed % 3) * 0.4));
        const angle = hashToAngle(a.id) + rotation * 0.25;
        const x = CENTER + Math.cos(angle) * r;
        const y = CENTER + Math.sin(angle) * r;
        const dotR = Math.max(5, Math.min(14, Math.sqrt(a.diameterMeters.max) * 0.8));
        const color = RISK_META[a.riskLevel].color;

        // Target Lock overlay
        if (i === focusedIndexRef.current) {
          ctx.beginPath();
          ctx.rect(x - dotR - 6, y - dotR - 6, (dotR + 6) * 2, (dotR + 6) * 2);
          ctx.strokeStyle = '#FF007F';
          ctx.lineWidth = 2;
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#FF007F';
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Target lock vector crosshairs
          ctx.beginPath();
          ctx.moveTo(x - dotR - 12, y);
          ctx.lineTo(x - dotR - 6, y);
          ctx.moveTo(x + dotR + 6, y);
          ctx.lineTo(x + dotR + 12, y);
          ctx.moveTo(x, y - dotR - 12);
          ctx.lineTo(x, y - dotR - 6);
          ctx.moveTo(x, y + dotR + 6);
          ctx.lineTo(x, y + dotR + 12);
          ctx.strokeStyle = '#FF007F';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Target labels
          ctx.fillStyle = '#FF007F';
          ctx.font = 'bold 15px "VT323"';
          ctx.textAlign = 'left';
          ctx.fillText(`LOCK >> ${a.name}`, x + dotR + 15, y - 6);
          ctx.fillText(`RANGE >> ${a.missDistanceLD.toFixed(1)} LD`, x + dotR + 15, y + 8);
        }

        // Draw Asteroid procedural wireframe polygon
        ctx.beginPath();
        drawAsteroidPolygon(ctx, x, y, dotR, a.id, spin);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        ctx.stroke();
        
        ctx.fillStyle = `${color}18`;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw center core point
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = i === focusedIndexRef.current ? '#FF007F' : color;
        ctx.fill();

        dots.push({ x, y, hitRadius: dotR + 8, asteroid: a });
      });
      dotsRef.current = dots;

      rotation += 0.0012;
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
    <section className="my-10 select-none">
      <div className="flex items-baseline justify-between mb-4 border-b-2 border-edge/30 pb-2">
        <h2 className="font-display text-xs text-cyan-400 glow-cyan">[ ORBITAL RADAR MAP ]</h2>
        <p className="font-mono text-sm text-dim">CLICK SENSOR NODE FOR TELEMETRY</p>
      </div>

      <div className="arcade-panel p-2 sm:p-4 flex justify-center bg-void">
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
          className="w-full max-w-[460px] mx-auto aspect-square cursor-pointer block focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4 bg-[#05050A]"
        />
      </div>

      <div className="flex flex-wrap gap-4 mt-4 justify-center font-mono text-sm text-dim">
        {Object.entries(RISK_META).map(([key, meta]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 border"
              style={{ background: `${meta.color}30`, borderColor: meta.color, boxShadow: `0 0 5px ${meta.color}` }}
            />
            {meta.label.toUpperCase()}
          </span>
        ))}
      </div>
    </section>
  );
}
