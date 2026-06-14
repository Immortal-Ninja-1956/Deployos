import { useEffect, useRef, useState } from 'react';
import { RISK_META } from '../utils/risk';
import { hitTestAsteroids } from '../utils/hitTest';
import useOrbitalAnimation from '../hooks/useOrbitalAnimation';

const SIZE = 600;

export default function OrbitalCanvas({ asteroids, onSelect, isArcadeTheme }) {
  const canvasRef = useRef(null);
  const dotsRef = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const hoveredIndexRef = useRef(-1);
  const [isVisible, setIsVisible] = useState(true);

  // Performance: Pause animation loop when canvas is off-screen
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.05 });

    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Use custom hook to handle the drawing/RAF animation loop
  useOrbitalAnimation(
    asteroids,
    focusedIndex,
    canvasRef,
    dotsRef,
    isArcadeTheme,
    isVisible,
    hoveredIndexRef
  );

  function handleMouseMove(event) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * SIZE;
    const y = ((event.clientY - rect.top) / rect.height) * SIZE;

    const hitIndex = hitTestAsteroids(x, y, dotsRef.current);
    hoveredIndexRef.current = hitIndex;
    canvas.style.cursor = hitIndex >= 0 ? 'crosshair' : 'default';
  }

  function handleMouseLeave() {
    hoveredIndexRef.current = -1;
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = 'default';
  }

  function handleClick(event) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * SIZE;
    const y = ((event.clientY - rect.top) / rect.height) * SIZE;

    const hitIndex = hitTestAsteroids(x, y, dotsRef.current);
    if (hitIndex >= 0) {
      onSelect(dotsRef.current[hitIndex].asteroid);
    }
  }

  // Mobile Touch Control Selection
  function handleTouchStart(event) {
    const canvas = canvasRef.current;
    if (!canvas || event.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * SIZE;
    const y = ((touch.clientY - rect.top) / rect.height) * SIZE;

    const hitIndex = hitTestAsteroids(x, y, dotsRef.current);
    if (hitIndex >= 0) {
      event.preventDefault();
      onSelect(dotsRef.current[hitIndex].asteroid);
    }
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
    <section className="hidden sm:block my-10 select-none">
      <div className="flex items-baseline justify-between mb-4 border-b-2 border-edge/30 pb-2">
        <h2 className="font-display text-xs text-cyan-400 glow-cyan">
          {isArcadeTheme ? '[ ORBITAL RADAR MAP ]' : 'ORBITAL RADAR MAP'}
        </h2>
        <p className="font-mono text-sm text-dim">CLICK SENSOR NODE FOR TELEMETRY</p>
      </div>

      {/* Screen reader announcements for keyboard/focus navigation */}
      <div className="sr-only" aria-live="polite">
        {focusedIndex >= 0 && asteroids[focusedIndex] ? (
          `Radar locked on asteroid ${asteroids[focusedIndex].name}. Miss distance: ${asteroids[focusedIndex].missDistanceLD.toFixed(1)} lunar distances. Risk classification: ${asteroids[focusedIndex].riskLevel}.`
        ) : (
          'No asteroid selected.'
        )}
      </div>

      <div className="arcade-panel p-2 sm:p-4 flex justify-center bg-void">
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          tabIndex={0}
          role="application"
          aria-roledescription="interactive map"
          aria-label={`Radial map of ${asteroids.length} approaching asteroids. Use arrow keys to select an asteroid, and Enter to view details. Currently focused: ${focusedIndex >= 0 ? asteroids[focusedIndex].name : 'none'}`}
          className="w-full max-w-[460px] mx-auto aspect-square block focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4 bg-void"
        />
      </div>

      <div className="flex flex-wrap gap-4 mt-4 justify-center font-mono text-sm text-dim">
        {Object.entries(RISK_META).map(([key, meta]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span
              className={`inline-block w-3 h-3 border bg-${key}/30 border-${key} shadow-glow-${key}`}
            />
            {meta.label.toUpperCase()}
          </span>
        ))}
      </div>
    </section>
  );
}
