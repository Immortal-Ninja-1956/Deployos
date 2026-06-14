import { useEffect, useRef, useCallback } from 'react';
import { RISK_META } from '../utils/risk.js';
import { hashToAngle } from '../utils/hash.js';
import { generateAsteroidShape } from '../utils/asteroidShape.js';

const SIZE = 600;
const CENTER = SIZE / 2;
const MAX_RADIUS = 270;
const MIN_RADIUS = 50;

function radiusFor(missDistanceLD) {
  const r = MIN_RADIUS + Math.log10(missDistanceLD + 1) * 130;
  return Math.min(MAX_RADIUS, r);
}

function drawAsteroidPolygon(ctx, x, y, radius, id, spin) {
  const seed = parseInt(id.replace(/[^0-9]/g, '').slice(-3)) || 100;
  const numPoints = 7 + (seed % 5);
  const shape = generateAsteroidShape(id, numPoints);

  ctx.beginPath();
  shape.forEach((pt, j) => {
    const angle = pt.angleOffset + spin;
    const px = x + Math.cos(angle) * radius * pt.factor;
    const py = y + Math.sin(angle) * radius * pt.factor;
    if (j === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  });
  ctx.closePath();
}

/**
 * Custom hook managing the requestAnimationFrame loop and canvas drawing for the OrbitalRadarMap.
 */
export default function useOrbitalAnimation(
  asteroids,
  focusedIndex,
  canvasRef,
  dotsRef,
  isArcadeTheme,
  isVisible,
  hoveredIndexRef
) {
  const rafRef = useRef(null);
  const rotationRef = useRef(0);
  const focusedIndexRef = useRef(focusedIndex);

  // Sync focusedIndex with ref to avoid recreating draw loop on focus change
  useEffect(() => {
    focusedIndexRef.current = focusedIndex;
  }, [focusedIndex]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Get computed theme colors from canvas to inherit correct scoped variables
    const computedStyle = getComputedStyle(canvas);
    const cRoutine = computedStyle.getPropertyValue('--color-routine').trim() || '#00FF99';
    const cEdge = computedStyle.getPropertyValue('--color-edge').trim() || '#00F0FF';
    const cInk = computedStyle.getPropertyValue('--color-ink').trim() || '#E0E8FF';
    const cSignal = computedStyle.getPropertyValue('--color-signal').trim() || '#FF007F';

    const getColor = (riskKey) => computedStyle.getPropertyValue(`--color-${riskKey}`).trim() || cEdge;

    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.shadowBlur = 0;

    // Draw vector radar sweep lines
    const sweepLength = MAX_RADIUS * 1.05;
    const sweepAngle = rotationRef.current * 1.2;
    
    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER);
    ctx.lineTo(
      CENTER + Math.cos(sweepAngle) * sweepLength,
      CENTER + Math.sin(sweepAngle) * sweepLength
    );
    ctx.strokeStyle = cRoutine;
    ctx.globalAlpha = 0.22;
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
      ctx.globalAlpha = 0.22 * (1 - step / trailSteps);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Concentric reference rings and scale labels
    [
      { f: 0.35, label: '1.2 LD' },
      { f: 0.65, label: '8.2 LD' },
      { f: 0.95, label: '38 LD' }
    ].forEach(({ f, label }) => {
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = cEdge;
      ctx.setLineDash([3, 5]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, MAX_RADIUS * f, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.globalAlpha = 0.3;
      ctx.fillStyle = cEdge;
      ctx.font = isArcadeTheme ? '13px "VT323", monospace' : '9px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, CENTER, CENTER - (MAX_RADIUS * f) + 12);
    });

    // Draw Earth as a vector core with crosshairs
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = cEdge;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CENTER - 22, CENTER);
    ctx.lineTo(CENTER + 22, CENTER);
    ctx.moveTo(CENTER, CENTER - 22);
    ctx.lineTo(CENTER, CENTER + 22);
    ctx.stroke();

    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, 10, 0, Math.PI * 2);
    ctx.strokeStyle = cEdge;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = cEdge;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(CENTER, CENTER, 3, 0, Math.PI * 2);
    ctx.fillStyle = cInk;
    ctx.fill();

    ctx.fillStyle = cEdge;
    ctx.font = isArcadeTheme ? '14px "VT323", monospace' : '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EARTH', CENTER, CENTER - 16);

    const dots = [];
    asteroids.forEach((a, i) => {
      const r = radiusFor(a.missDistanceLD);
      const seed = parseInt(a.id.replace(/[^0-9]/g, '').slice(-3)) || 100;
      const spin = (seed % 2 === 0 ? 1 : -1) * (rotationRef.current * (1.8 + (seed % 3) * 0.4));
      const angle = hashToAngle(a.id) + rotationRef.current * 0.25;
      const x = CENTER + Math.cos(angle) * r;
      const y = CENTER + Math.sin(angle) * r;
      const dotR = Math.max(5, Math.min(14, Math.sqrt(a.diameterMeters.max) * 0.8));
      const color = getColor(a.riskLevel);

      // Target Lock overlay
      if (i === focusedIndexRef.current) {
        ctx.beginPath();
        ctx.rect(x - dotR - 6, y - dotR - 6, (dotR + 6) * 2, (dotR + 6) * 2);
        ctx.strokeStyle = cSignal;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 12;
        ctx.shadowColor = cSignal;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.moveTo(x - dotR - 12, y);
        ctx.lineTo(x - dotR - 6, y);
        ctx.moveTo(x + dotR + 6, y);
        ctx.lineTo(x + dotR + 12, y);
        ctx.moveTo(x, y - dotR - 12);
        ctx.lineTo(x, y - dotR - 6);
        ctx.moveTo(x, y + dotR + 6);
        ctx.lineTo(x, y + dotR + 12);
        ctx.strokeStyle = cSignal;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = cSignal;
        ctx.font = isArcadeTheme ? 'bold 15px "VT323", monospace' : 'bold 12px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(isArcadeTheme ? `LOCK >> ${a.name}` : `LOCK: ${a.name}`, x + dotR + 15, y - 6);
        ctx.fillText(isArcadeTheme ? `RANGE >> ${a.missDistanceLD.toFixed(1)} LD` : `RANGE: ${a.missDistanceLD.toFixed(1)} LD`, x + dotR + 15, y + 8);
      }

      // Draw Asteroid procedural wireframe polygon
      ctx.beginPath();
      drawAsteroidPolygon(ctx, x, y, dotR, a.id, spin);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = color;
      ctx.stroke();
      
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.1;
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      // Draw hover label if hovered and not focused
      if (i === hoveredIndexRef.current && i !== focusedIndexRef.current) {
        ctx.fillStyle = color;
        ctx.font = isArcadeTheme ? '14px "VT323", monospace' : '11px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.shadowBlur = 6;
        ctx.shadowColor = color;
        ctx.fillText(a.name, x + dotR + 10, y + 4);
        ctx.shadowBlur = 0;
      }

      // Draw center core point
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = i === focusedIndexRef.current ? cSignal : color;
      ctx.fill();

      dots.push({ x, y, hitRadius: dotR + 8, asteroid: a });
    });
    dotsRef.current = dots;

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isReducedMotion) {
      rotationRef.current += 0.0012;
    }
  }, [asteroids, canvasRef, dotsRef, isArcadeTheme, hoveredIndexRef]);

  useEffect(() => {
    if (!isVisible) return;
    let frameId;
    const loop = () => {
      draw();
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    rafRef.current = frameId;
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [draw, isVisible]);

  return { rafRef, draw };
}
