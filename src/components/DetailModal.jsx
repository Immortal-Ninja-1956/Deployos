import { useEffect, useState, useRef } from 'react';
import { RISK_META } from '../utils/risk';
import LiveCounter from './LiveCounter';
import SizeComparison from './SizeComparison';

const badgeColors = {
  hazardous: 'bg-hazardous/20 border-hazardous text-hazardous shadow-glow-hazardous',
  watch: 'bg-watch/20 border-watch text-watch shadow-glow-watch',
  notable: 'bg-notable border-notable text-void font-bold shadow-glow-notable',
  routine: 'bg-routine/20 border-routine text-routine shadow-glow-routine',
};

function Stat({ label, value, title }) {
  return (
    <div className="border border-edge bg-void/50 p-3 select-none" title={title}>
      <p className="text-[10px] font-mono uppercase text-cyan-400 glow-cyan">{label}</p>
      <p className="text-ink mt-1.5 font-mono text-lg font-bold">{value}</p>
    </div>
  );
}

export default function DetailModal({ asteroid, onClose, isArcadeTheme }) {
  const [report, setReport] = useState(null);
  const [reportNote, setReportNote] = useState(null);
  const [reportState, setReportState] = useState('loading');
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [copied, setCopied] = useState(false);
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
  }, [onClose, reportState, coords]);

  // Copy telemetry helper
  function handleCopyTelemetry() {
    const text = `NearMiss Telemetry Alert:
Object: ${asteroid.name}
Max Estimated Diameter: ${Math.round(asteroid.diameterMeters.max)} meters (${asteroid.sizeRef.label})
Velocity: ${asteroid.velocityKmS.toFixed(2)} km/s
Miss Distance: ${asteroid.missDistanceLD.toFixed(2)} LD (${Math.round(asteroid.missDistanceKm).toLocaleString()} km)
Closest Contact: ${new Date(asteroid.approachEpoch).toLocaleString()}
${report ? `AI Diagnostic: ${report}` : ''}
Data sourced from NASA JPL.`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
          <button
            onClick={onClose}
            className="bg-void border-2 border-edge text-edge hover:border-signal hover:text-signal px-2 py-1 font-display text-[9px] cursor-pointer select-none"
            aria-label="Close details"
          >
            {isArcadeTheme ? '[ X ]' : 'X'}
          </button>
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
          <Stat label="MISS DISTANCE" value={`${asteroid.missDistanceLD.toFixed(2)} LD`} />
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
          <Stat label="BRIGHTNESS (H)" value={asteroid.absoluteMagnitude?.toFixed(1) ?? '\u2014'} title="Lower H = larger object. H<18 is city-block scale." />
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
                  SET <code className="font-mono text-signal">GEMINI_API_KEY</code> ENVDETAILS TO CONNECT.
                </p>
              )}
              {reportNote && reportNote !== 'TIMEOUT' && (
                <p className="text-xs bg-void/80 p-2 border border-edge font-mono text-rose-500 max-h-32 overflow-y-auto">
                  CODE: {reportNote.toUpperCase()}
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
            onClick={handleCopyTelemetry}
            className="bg-void border border-edge hover:border-signal text-edge hover:text-signal px-3 py-1 font-display text-[9px] cursor-pointer select-none transition-colors"
          >
            {copied ? '[ TELEMETRY COPIED ]' : (isArcadeTheme ? '[ SHARE TELEMETRY ]' : 'SHARE TELEMETRY')}
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
