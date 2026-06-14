import { useEffect, useState, useRef } from 'react';
import { RISK_META } from '../utils/risk';
import LiveCounter from './LiveCounter';
import SizeComparison from './SizeComparison';
import { SIZE_REFERENCE_HEIGHTS, formatMeters } from '../utils/sizeLabel';
import { findNearestHistoricalEvent } from '../utils/historicalEvents';

const badgeColors = {
  hazardous: 'bg-hazardous/20 border-hazardous text-hazardous shadow-glow-hazardous',
  watch: 'bg-watch/20 border-watch text-watch shadow-glow-watch',
  notable: 'bg-notable border-notable text-void font-bold shadow-glow-notable',
  routine: 'bg-routine/20 border-routine text-routine shadow-glow-routine',
};

function Stat({ label, value, subtext, title }) {
  return (
    <div className="border border-edge bg-void/50 p-3 select-none" title={title}>
      <p className="text-[10px] font-mono uppercase text-cyan-400 glow-cyan">{label}</p>
      <p className="text-ink mt-1.5 font-mono text-lg font-bold leading-none">{value}</p>
      {subtext && <p className="text-[9px] text-dim font-mono mt-1 uppercase tracking-wider">{subtext}</p>}
    </div>
  );
}

export default function DetailModal({ asteroid, onClose, isArcadeTheme, onNext, onPrev }) {
  const nearestHistorical = findNearestHistoricalEvent(asteroid.diameterMeters.max);
  const [report, setReport] = useState(null);
  const [reportNote, setReportNote] = useState(null);
  const [reportState, setReportState] = useState('loading');
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [shareStatus, setShareStatus] = useState('idle');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const controllerRef = useRef(null);
  const modalRef = useRef(null);
  const previousActiveElementRef = useRef(null);

  const lastFetchedAsteroidIdRef = useRef(null);
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    let intervalId;
    if (reportState === 'loading') {
      setLoadingProgress(0);
      intervalId = setInterval(() => {
        setLoadingProgress((p) => {
          if (p >= 100) {
            clearInterval(intervalId);
            return 100;
          }
          return p + 1;
        });
      }, 100);
    } else {
      setLoadingProgress(0);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [reportState]);

  const fetchReport = (userCoords = null, force = false) => {
    const requestId = asteroid.id;
    const now = Date.now();

    // 1. In-flight lock: block duplicate fetches for the same asteroid unless forced
    if (isFetchingRef.current && lastFetchedAsteroidIdRef.current === asteroid.id && !force) {
      console.log('> Duplicate fetch request locked (in-flight)');
      return;
    }

    // 2. Throttle manual retries (minimum 2 seconds between manual/retry requests)
    if (!force && lastFetchedAsteroidIdRef.current === asteroid.id && now - lastFetchTimeRef.current < 2000) {
      console.log('> Duplicate fetch request throttled (too fast)');
      return;
    }

    lastFetchTimeRef.current = now;
    isFetchingRef.current = true;
    lastFetchedAsteroidIdRef.current = asteroid.id;

    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    setReportState('loading');
    setReportNote(null);
    setReport(null);

    const controller = new AbortController();
    controllerRef.current = controller;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);

    const fetchPromise = fetch('/api/field-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        asteroid,
        latitude: userCoords?.latitude,
        longitude: userCoords?.longitude,
      }),
      signal: controller.signal,
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('TIMEOUT'));
      }, 10000);
    });

    Promise.race([fetchPromise, timeoutPromise])
      .then((res) => {
        clearTimeout(timeoutId);
        if (requestId !== asteroid.id) {
          isFetchingRef.current = false;
          return null;
        }
        if (!res.ok) {
          if (res.status === 429) {
            return res.json().then((body) => {
              throw new Error(body.message || 'RATE_LIMIT_EXCEEDED');
            });
          }
          throw new Error(`HTTP_${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (requestId !== asteroid.id) return;
        isFetchingRef.current = false;
        if (!data) return;
        if (data.report) {
          setReport(data.report);
          setReportState('done');
        } else {
          setReportNote(data.note || 'No report returned');
          setReportState('unavailable');
        }
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        controller.abort();
        if (requestId !== asteroid.id) return;
        isFetchingRef.current = false;
        if (err.name === 'AbortError' || err.message === 'TIMEOUT') {
          setReportNote('TIMEOUT');
        } else {
          setReportNote(err.message || 'Network error');
        }
        setReportState('unavailable');
      });
  };

  // Accessibility: Focus trap init and restore focus on close
  useEffect(() => {
    previousActiveElementRef.current = document.activeElement;
    if (modalRef.current) {
      const closeBtn = modalRef.current.querySelector('button[aria-label="Close details"]');
      if (closeBtn) {
        closeBtn.focus();
      } else {
        const focusable = modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }
    }
    return () => {
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        previousActiveElementRef.current.focus();
      }
    };
  }, []);

  useEffect(() => {
    setCoords(null);
    
    // Clear any pending debounced fetch
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce initial fetch on asteroid switch to prevent rapid selection quota drain
    debounceTimeoutRef.current = setTimeout(() => {
      fetchReport(null);
    }, 350);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [asteroid]);

  function handleScanSky() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoords(newCoords);
        setLocating(false);
        fetchReport(newCoords, true); // Force geolocation updates to bypass debounce/throttle
      },
      (error) => {
        setLocating(false);
        setReportNote(`GPS acquisition failed: ${error.message}`);
      }
    );
  }

  // Keyboard navigation & Focus Trapping inside modal
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && onPrev) {
        onPrev();
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext();
      } else if ((e.key === 'r' || e.key === 'R') && reportState === 'unavailable') {
        fetchReport(coords);
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = Array.from(
          modalRef.current.querySelectorAll(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusableElements.length === 0) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, reportState, coords, onNext, onPrev]);

  // Helper to wrap text inside a canvas context
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  // Generates and shares/downloads a visual canvas card
  function handleShareCard() {
    setShareStatus('generating');
    
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    const fontMono = 'IBM Plex Mono, Courier New, monospace';
    const fontDisplay = isArcadeTheme ? 'VT323, monospace' : 'system-ui, sans-serif';
    const fontHeading = isArcadeTheme ? 'Orbitron, sans-serif' : 'system-ui, sans-serif';

    const themeColors = {
      void: isArcadeTheme ? '#05050A' : '#0f172a',
      panel: isArcadeTheme ? '#0C0C16' : '#1e293b',
      edge: isArcadeTheme ? '#00F0FF' : '#475569',
      ink: isArcadeTheme ? '#E0E8FF' : '#f8fafc',
      dim: isArcadeTheme ? '#8ca3cb' : '#94a3b8',
      signal: isArcadeTheme ? '#FF007F' : '#3b82f6',
      hazardous: isArcadeTheme ? '#FF0055' : '#ef4444',
      watch: isArcadeTheme ? '#FF8800' : '#f97316',
      notable: isArcadeTheme ? '#FFD700' : '#eab308',
      routine: isArcadeTheme ? '#00FF99' : '#22c55e',
    };

    // 1. Background Fill
    ctx.fillStyle = themeColors.void;
    ctx.fillRect(0, 0, 800, 600);

    // 2. Vector Grid lines
    ctx.strokeStyle = isArcadeTheme ? 'rgba(0, 240, 255, 0.05)' : 'rgba(71, 85, 105, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 800; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 600);
      ctx.stroke();
    }
    for (let y = 0; y <= 600; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }

    // 3. Panel Borders
    ctx.strokeStyle = themeColors.edge;
    if (isArcadeTheme) {
      // Retro double border
      ctx.lineWidth = 4;
      ctx.strokeRect(15, 15, 770, 570);
      ctx.lineWidth = 1.5;
      ctx.strokeRect(23, 23, 754, 554);
    } else {
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
      ctx.strokeRect(15, 15, 770, 570);
    }

    // 4. Branding Header
    ctx.fillStyle = themeColors.edge;
    ctx.font = `10px ${fontMono}`;
    ctx.textAlign = 'left';
    ctx.fillText('NEARMISS // PLANETARY DEFENSE TELEMETRY', 40, 55);

    ctx.fillStyle = themeColors.dim;
    ctx.font = `9px ${fontMono}`;
    ctx.fillText(`SCAN EPOCH: ${new Date(asteroid.approachEpoch).toLocaleString().toUpperCase()}`, 40, 72);

    // 5. Procedural Brand Logo
    const cx = 720;
    const cy = 65;
    // Outer dashed ring
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Planet center
    ctx.fillStyle = themeColors.signal;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    // Curved bezier path
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(cx - 50, cy + 15);
    ctx.quadraticCurveTo(cx - 15, cy - 10, cx + 30, cy - 8);
    ctx.stroke();
    ctx.setLineDash([]);

    // Flying asteroid polygon
    ctx.fillStyle = themeColors.hazardous;
    ctx.beginPath();
    ctx.moveTo(cx - 15 - 3, cy - 1 - 3);
    ctx.lineTo(cx - 15 + 3, cy - 1 - 4);
    ctx.lineTo(cx - 15 + 5, cy - 1 - 1);
    ctx.lineTo(cx - 15 + 2, cy - 1 + 3);
    ctx.lineTo(cx - 15 - 3, cy - 1 + 2);
    ctx.closePath();
    ctx.fill();

    // 6. Asteroid Name Title
    ctx.fillStyle = themeColors.ink;
    ctx.font = `bold 28px ${fontDisplay}`;
    ctx.fillText(asteroid.name, 40, 115);

    // Line below title
    ctx.strokeStyle = isArcadeTheme ? themeColors.signal : 'rgba(71, 85, 105, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 130);
    ctx.lineTo(760, 130);
    ctx.stroke();

    // 7. Mass Comparative Scanner Box
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 150, 720, 235);
    
    ctx.fillStyle = themeColors.signal;
    ctx.font = `10px ${fontMono}`;
    ctx.fillText('MASS COMPARATIVE SCANNER', 55, 172);

    // Bars comparative math
    const objectSize = asteroid.diameterMeters.max;
    const refHeight = SIZE_REFERENCE_HEIGHTS[asteroid.sizeRef.label] || 10;
    const human = 1.7;
    const maxVal = Math.max(objectSize, refHeight, human) * 1.05;

    const bars = [
      { key: 'human', label: 'YOU', value: human, emoji: '\u{1F9CD}' },
      { key: 'ref', label: asteroid.sizeRef.label.toUpperCase(), value: refHeight, emoji: asteroid.sizeRef.emoji },
      { key: 'object', label: asteroid.name.toUpperCase(), value: objectSize, emoji: '\u2604\uFE0F' },
    ];

    const colX = [180, 400, 620];
    const colBottom = 330;

    bars.forEach((b, idx) => {
      const isObject = b.key === 'object';
      const isHuman = b.key === 'human';
      
      const x = colX[idx];
      const h = (Math.log10(b.value + 1) / Math.log10(maxVal + 1)) * 110;
      
      // Draw Gradient fill
      const grad = ctx.createLinearGradient(x, colBottom - h, x, colBottom);
      if (isObject) {
        grad.addColorStop(0, 'rgba(255, 0, 85, 0.8)');
        grad.addColorStop(1, 'rgba(255, 0, 85, 0.15)');
        ctx.strokeStyle = themeColors.hazardous;
      } else if (isHuman) {
        grad.addColorStop(0, 'rgba(71, 85, 105, 0.8)');
        grad.addColorStop(1, 'rgba(71, 85, 105, 0.15)');
        ctx.strokeStyle = themeColors.edge;
      } else {
        grad.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
        grad.addColorStop(1, 'rgba(255, 215, 0, 0.15)');
        ctx.strokeStyle = themeColors.notable;
      }
      ctx.fillStyle = grad;
      ctx.fillRect(x - 25, colBottom - h, 50, h);
      ctx.strokeRect(x - 25, colBottom - h, 50, h);

      // Value text above bar
      ctx.fillStyle = themeColors.dim;
      ctx.font = `11px ${fontMono}`;
      ctx.textAlign = 'center';
      ctx.fillText(formatMeters(b.value), x, colBottom - h - 8);

      // Label below bar
      ctx.fillStyle = themeColors.ink;
      ctx.font = `bold 9px ${fontMono}`;
      
      // Wrap long labels to fit inside column alignment
      let labelText = b.label;
      if (labelText.length > 25) {
        labelText = labelText.substring(0, 22) + '...';
      }
      ctx.fillText(labelText, x, colBottom + 32);

      // Emoji above label
      ctx.font = `14px Arial, sans-serif`;
      ctx.fillText(b.emoji, x, colBottom + 18);
    });

    // 8. AI Diagnostic Report Box
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 400, 720, 125);

    ctx.fillStyle = themeColors.signal;
    ctx.font = `10px ${fontMono}`;
    ctx.textAlign = 'left';
    ctx.fillText('AI DIAGNOSTIC REPORT', 55, 422);

    // Extraction of one sentence
    let aiSentence = '';
    if (report) {
      const match = report.match(/[^.!?]+[.!?]/);
      aiSentence = match ? match[0].trim() : report;
    } else {
      aiSentence = `PLANETARY SCAN: Object ${asteroid.name} is traveling at ${asteroid.velocityKmS.toFixed(2)} km/s and will safely pass Earth at a miss distance of ${asteroid.missDistanceLD.toFixed(2)} Lunar Distances (LD).`;
    }
    if (isArcadeTheme) {
      aiSentence = `> ${aiSentence.toUpperCase()}`;
    }

    ctx.fillStyle = themeColors.ink;
    ctx.font = `13px ${fontMono}`;
    wrapText(ctx, aiSentence, 55, 452, 690, 20);

    // 9. Watermark Footer
    ctx.fillStyle = themeColors.dim;
    ctx.font = `9px ${fontMono}`;
    ctx.textAlign = 'center';
    ctx.fillText('GENERATED AT NEARMISS.APP // COGNITIVE REPORT DATA VIA NASA JPL', 400, 565);

    // Revoke & Trigger download
    function triggerDownload(blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nearmiss-scan-${asteroid.name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShareStatus('downloaded');
      setTimeout(() => setShareStatus('idle'), 2000);
    }

    // Convert canvas to png blob
    canvas.toBlob((blob) => {
      if (!blob) {
        setShareStatus('error');
        setTimeout(() => setShareStatus('idle'), 2000);
        return;
      }

      const file = new File([blob], `nearmiss-scan-${asteroid.name.replace(/\s+/g, '-')}.png`, { type: 'image/png' });

      // Try native Share API
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: `NearMiss Scan: ${asteroid.name}`,
          text: `Check out this planetary defense telemetry for asteroid ${asteroid.name}!`,
        })
        .then(() => {
          setShareStatus('downloaded');
          setTimeout(() => setShareStatus('idle'), 2000);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            triggerDownload(blob);
          } else {
            setShareStatus('idle');
          }
        });
      } else {
        // Safe check for ClipboardItem and clipboard write compatibility to prevent ReferenceErrors in headless test runs or unsupported browsers
        let isClipboardImageSupported = false;
        try {
          isClipboardImageSupported = (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write);
        } catch (e) {
          console.warn('> Clipboard image support check failed:', e);
        }

        if (isClipboardImageSupported) {
          try {
            navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ])
            .then(() => {
              setShareStatus('copied');
              triggerDownload(blob);
            })
            .catch((err) => {
              console.warn('> Clipboard write promise failed, falling back to download:', err);
              triggerDownload(blob);
            });
          } catch (err) {
            console.warn('> Clipboard write sync failed, falling back to download:', err);
            triggerDownload(blob);
          }
        } else {
          triggerDownload(blob);
        }
      }
    }, 'image/png');
  }

  const meta = RISK_META[asteroid.riskLevel];
  const approachDate = new Date(asteroid.approachEpoch);

  const panelClass = 
    asteroid.riskLevel === 'hazardous' ? 'arcade-panel-hazardous shadow-glow-hazardous-lg' :
    asteroid.riskLevel === 'watch' ? 'arcade-panel-watch shadow-glow-watch-lg' :
    asteroid.riskLevel === 'notable' ? 'arcade-panel-notable shadow-glow-notable-lg' :
    'arcade-panel shadow-glow-cyan-lg';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-void/85 backdrop-blur-sm px-4"
      style={{ height: '100dvh', paddingTop: 'env(safe-area-inset-top)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Details for asteroid ${asteroid.name}`}
    >
      <div
        ref={modalRef}
        key={asteroid.id}
        className={`w-full sm:max-w-lg max-h-[85vh] overflow-y-auto p-5 sm:p-6 animate-fade-in ${panelClass}`}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="flex items-start justify-between mb-4 border-b border-edge/30 pb-3">
          <div>
            <span
              className={`font-mono text-[9px] px-2 py-0.5 border ${badgeColors[asteroid.riskLevel] || badgeColors.routine}`}
            >
              {meta.label.toUpperCase()}
            </span>
            <h2 className="font-arcade text-2xl text-ink font-bold tracking-wide uppercase mt-3">{asteroid.name}</h2>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Prev button */}
            <button
              onClick={onPrev}
              disabled={!onPrev}
              className={`bg-void border-2 ${onPrev ? 'border-edge text-ink hover:border-signal hover:text-signal cursor-pointer' : 'border-edge/20 text-edge/20 cursor-not-allowed'} px-2 py-1 font-mono text-[9px] select-none`}
              title="Previous Asteroid (Left Arrow)"
              aria-label="Previous asteroid"
            >
              {isArcadeTheme ? '[ < ]' : '◀'}
            </button>

            {/* Next button */}
            <button
              onClick={onNext}
              disabled={!onNext}
              className={`bg-void border-2 ${onNext ? 'border-edge text-ink hover:border-signal hover:text-signal cursor-pointer' : 'border-edge/20 text-edge/20 cursor-not-allowed'} px-2 py-1 font-mono text-[9px] select-none`}
              title="Next Asteroid (Right Arrow)"
              aria-label="Next asteroid"
            >
              {isArcadeTheme ? '[ > ]' : '▶'}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="bg-void border-2 border-edge text-edge hover:border-signal hover:text-signal px-2 py-1 font-display text-[9px] cursor-pointer select-none"
              aria-label="Close details"
            >
              {isArcadeTheme ? '[ X ]' : 'X'}
            </button>
          </div>
        </div>

        {/* Telemetry card */}
        <div className="border border-edge bg-void/60 p-4 mb-4 select-none">
          <p className="font-display text-[10px] uppercase text-cyan-400 glow-cyan mb-2">
            TELEMETRY: RANGE COUNTER
          </p>
          <LiveCounter asteroid={asteroid} />
        </div>

        {/* Comparative Scanner */}
        <div className="border border-edge bg-void/60 p-4 mb-4 select-none">
          <p className="font-display text-[10px] uppercase text-cyan-400 glow-cyan mb-3">
            MASS COMPARATIVE SCANNER
          </p>
          <SizeComparison asteroid={asteroid} />
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 select-none">
          <Stat label="EST DIAMETER" value={`${Math.round(asteroid.diameterMeters.min)}\u2013${Math.round(asteroid.diameterMeters.max)} M`} />
          <Stat label="VELOCITY" value={`${asteroid.velocityKmS.toFixed(2)} KM/S`} />
          <Stat 
            label="MISS DISTANCE" 
            value={`${asteroid.missDistanceLD.toFixed(2)} LD`} 
            subtext="1 LD ~ 384,400 KM" 
          />
          <Stat label="IN KILOMETERS" value={`${Math.round(asteroid.missDistanceKm).toLocaleString()} KM`} />
          <Stat
            label="CLOSEST CONTACT"
            value={approachDate.toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }).toUpperCase()}
          />
          <Stat 
            label="BRIGHTNESS (H)" 
            value={asteroid.absoluteMagnitude?.toFixed(1) ?? '\u2014'} 
            subtext="LOWER = LARGER/BRIGHTER"
            title="Lower H = larger object. H<18 is city-block scale." 
          />
        </div>

        {/* Historical Impact Analogue */}
        <div className="border border-edge bg-void/60 p-4 mb-4 select-none">
          <p className="font-display text-[10px] uppercase text-cyan-400 glow-cyan mb-2">
            {isArcadeTheme ? '[ HISTORICAL IMPACT ANALOGUE ]' : 'HISTORICAL IMPACT ANALOGUE'}
          </p>
          <div className="font-mono text-xs text-dim leading-relaxed">
            <div className="flex justify-between items-baseline mb-2 pb-1 border-b border-edge/10">
              <span className="text-ink font-bold uppercase">{nearestHistorical.name}</span>
              <span className="text-signal font-bold">{nearestHistorical.year} ({nearestHistorical.size})</span>
            </div>
            <p className="text-ink/85 text-xs sm:text-sm font-mono mt-1">
              {isArcadeTheme ? nearestHistorical.detail.toUpperCase() : nearestHistorical.detail}
            </p>
          </div>
        </div>

        {/* AI Report / Diagnostic */}
        <div className="border border-edge bg-void/60 p-4">
          <p className="font-display text-[10px] uppercase text-cyan-400 glow-cyan mb-2">
            AI DIAGNOSTIC REPORT
          </p>
          {reportState === 'loading' && (
            <div className="space-y-2 font-mono select-none">
              <p className="text-dim text-sm animate-pulse">
                {isArcadeTheme 
                  ? `> COMPILING SENSOR DATA READOUT... ${(loadingProgress / 10).toFixed(1)}S` 
                  : `Compiling sensor data readout... ${(loadingProgress / 10).toFixed(1)}s`}
              </p>
              <div className="w-full bg-void border border-edge h-2 overflow-hidden relative">
                <div 
                  className="bg-cyan-400 h-full transition-all duration-100 ease-linear shadow-glow-cyan" 
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>
          )}
          {reportState === 'done' && (
            <p className="text-ink/90 text-sm leading-relaxed font-mono font-bold">
              {isArcadeTheme ? `> ${report.toUpperCase()}` : report}
            </p>
          )}
          {reportState === 'unavailable' && (
            <div className="text-dim text-sm leading-relaxed space-y-2 font-mono">
              <div>
                <p>
                  {reportNote === 'TIMEOUT' ? (
                    isArcadeTheme ? '> SENSOR TIMEOUT — RETRY WITH [R]' : 'Sensor timeout — retry with [R]'
                  ) : (
                    isArcadeTheme ? '> ERROR: AI COGNITIVE SUBSYSTEM OFFLINE.' : 'Error: AI cognitive subsystem offline.'
                  )}
                </p>
                <p className="text-xs text-dim/80 italic mt-1 font-mono">
                  {isArcadeTheme ? '>> (AI REPORT UNAVAILABLE — ALL OTHER DATA IS LIVE FROM NASA)' : '(AI report unavailable — all other data is live from NASA)'}
                </p>
              </div>
              {reportNote !== 'TIMEOUT' && (
                <p className="text-xs text-dim">
                  {isArcadeTheme 
                    ? 'PROVIDE CLOUD COGNITIVE CREDENTIALS IN SERVER ENVIRONMENT TO ENABLE REPORTS.' 
                    : 'Provide cloud cognitive credentials in the server environment to enable live reports.'}
                </p>
              )}
              {reportNote && reportNote !== 'TIMEOUT' && (
                <p className="text-xs bg-void/80 p-2 border border-edge font-mono text-rose-500 max-h-32 overflow-y-auto uppercase">
                  STATUS: {
                    reportNote.toLowerCase().includes('gemini_api_key') || reportNote.toLowerCase().includes('not configured')
                      ? (isArcadeTheme ? 'COGNITIVE CREDENTIALS MISSING' : 'Cognitive credentials missing')
                      : (isArcadeTheme ? `RELAY ERROR (${reportNote.toUpperCase()})` : `Relay error (${reportNote})`)
                  }
                </p>
              )}
              <div className="mt-2.5">
                <button
                  onClick={() => fetchReport(coords)}
                  className="bg-void border border-edge hover:border-signal text-ink px-2.5 py-1 text-[11px] font-mono transition-colors cursor-pointer select-none"
                >
                  {isArcadeTheme ? '[R] RETRY — DATA RELAY UNSTABLE' : 'Retry Diagnostic'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Local Sky Correlator */}
        <div className="border border-edge bg-void/60 p-4 mt-4">
          <p className="font-display text-[10px] uppercase text-cyan-400 glow-cyan mb-2">
            {isArcadeTheme ? 'LOCAL SKY RADAR CORRELATOR' : 'Local Sky Radar Correlator'}
          </p>
          {!coords ? (
            <div className="space-y-2">
              <button
                onClick={handleScanSky}
                disabled={locating}
                className="w-full bg-void border border-edge hover:border-signal text-ink px-3 py-2 text-xs font-mono transition-colors cursor-pointer disabled:opacity-50 select-none"
              >
                {locating ? 'GPS LOCK ACQUIRING...' : (isArcadeTheme ? '[ ACTIVATE SKY SCANNER ]' : 'Scan Local Sky (Request GPS)')}
              </button>
              <p className="text-[10px] text-dim/80 font-mono leading-normal">
                {isArcadeTheme 
                  ? '>> STORES OBSERVER POSITION TO TAILOR AI VISIBILITY ANGLE CALCULATIONS.' 
                  : 'Locks your location to customize the AI report with local sky viewing angles.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 font-mono text-sm text-dim">
              <div className="flex justify-between border-b border-edge/20 pb-1">
                <span>GPS LOCK STATUS:</span>
                <span className="text-routine font-bold">
                  LAT {coords.latitude.toFixed(4)} &middot; LNG {coords.longitude.toFixed(4)}
                </span>
              </div>
              <p className="text-xs text-ink/80 leading-relaxed font-mono">
                {isArcadeTheme 
                  ? '>> GPS APPLIED. AI DIAGNOSTIC REPORT MODIFIED TO ESTIMATE VISIBILITY PATH FROM YOUR OBSERVER POSITION.' 
                  : 'GPS applied. The AI Diagnostic report has been updated to estimate asteroid visibility from your current position.'}
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-between items-center gap-4">
          <button
            onClick={handleShareCard}
            disabled={shareStatus !== 'idle'}
            className="bg-void border border-edge hover:border-signal disabled:border-edge/50 disabled:text-edge/50 text-edge hover:text-signal px-3 py-1 font-display text-[9px] cursor-pointer select-none transition-colors"
          >
            {shareStatus === 'generating' ? (isArcadeTheme ? '[ GENERATING... ]' : 'GENERATING...') :
             shareStatus === 'copied' ? (isArcadeTheme ? '[ CARD COPIED ]' : 'CARD COPIED!') :
             shareStatus === 'downloaded' ? (isArcadeTheme ? '[ DOWNLOADED ]' : 'DOWNLOADED!') :
             shareStatus === 'error' ? (isArcadeTheme ? '[ ERROR RETRY ]' : 'ERROR, RETRY') :
             (isArcadeTheme ? '[ SHARE TELEMETRY ]' : 'SHARE TELEMETRY')}
          </button>
          
          {asteroid.jplUrl && asteroid.jplUrl !== '#' && (
            <a
              href={asteroid.jplUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-void border border-edge hover:border-signal text-edge hover:text-signal px-3 py-1 font-display text-[9px]"
            >
              LAUNCH JPL DIAGNOSTICS &rarr;
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
