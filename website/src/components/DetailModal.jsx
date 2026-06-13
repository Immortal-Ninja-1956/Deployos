import { useEffect, useState } from 'react';
import { RISK_META } from '../utils/risk';
import LiveCounter from './LiveCounter';
import SizeComparison from './SizeComparison';

function Stat({ label, value }) {
  return (
    <div className="border border-edge bg-void/50 p-3 select-none">
      <p className="text-[10px] font-display uppercase text-cyan-400 glow-cyan">{label}</p>
      <p className="text-ink mt-1.5 font-mono text-lg font-bold">{value}</p>
    </div>
  );
}

export default function DetailModal({ asteroid, onClose }) {
  const [report, setReport] = useState(null);
  const [reportNote, setReportNote] = useState(null);
  const [reportState, setReportState] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    setReport(null);
    setReportNote(null);
    setReportState('loading');

    fetch('/api/field-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asteroid),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.report) {
          setReport(data.report);
          setReportState('done');
        } else {
          setReportNote(data.note || 'No report returned');
          setReportState('unavailable');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setReportNote(err?.message || 'Network error');
          setReportState('unavailable');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [asteroid]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const meta = RISK_META[asteroid.riskLevel];
  const approachDate = new Date(asteroid.approachEpoch);

  const panelClass = 
    asteroid.riskLevel === 'hazardous' ? 'arcade-panel-hazardous shadow-[0_0_25px_#FF0055]' :
    asteroid.riskLevel === 'watch' ? 'arcade-panel-watch shadow-[0_0_25px_#FF8800]' :
    asteroid.riskLevel === 'notable' ? 'arcade-panel-notable shadow-[0_0_25px_#FFD700]' :
    'arcade-panel shadow-[0_0_25px_#00F0FF]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-void/85 backdrop-blur-sm px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Details for asteroid ${asteroid.name}`}
    >
      <div
        className={`w-full sm:max-w-lg max-h-[85vh] overflow-y-auto p-5 sm:p-6 animate-fade-in ${panelClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4 border-b border-edge/30 pb-3">
          <div>
            <span
              className="font-display text-[9px] px-2 py-0.5 border"
              style={{ 
                color: meta.color, 
                borderColor: `${meta.color}80`, 
                boxShadow: `0 0 5px ${meta.color}`,
                background: `${meta.color}20` 
              }}
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
            [ X ]
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
          <Stat label="ABS MAGNITUDE" value={asteroid.absoluteMagnitude?.toFixed(1) ?? '\u2014'} />
        </div>

        {/* AI Report / Diagnostic */}
        <div className="border border-edge bg-void/60 p-4">
          <p className="font-display text-[10px] uppercase text-cyan-400 glow-cyan mb-2">
            AI DIAGNOSTIC REPORT
          </p>
          {reportState === 'loading' && (
            <p className="text-dim text-md animate-pulse font-mono">&gt; COMPILING SENSOR DATA READOUT...</p>
          )}
          {reportState === 'done' && (
            <p className="text-ink/90 text-md leading-relaxed font-mono">&gt; {report.toUpperCase()}</p>
          )}
          {reportState === 'unavailable' && (
            <div className="text-dim text-md leading-relaxed space-y-2 font-mono">
              <p>
                &gt; ERROR: AI COGNITIVE SUBSYSTEM OFFLINE.
              </p>
              <p className="text-xs text-dim">
                SET <code className="font-mono text-signal">GEMINI_API_KEY</code> ENVDETAILS TO CONNECT.
              </p>
              {reportNote && (
                <p className="text-xs bg-void/80 p-2 border border-edge font-mono text-rose-500 max-h-32 overflow-y-auto">
                  CODE: {reportNote.toUpperCase()}
                </p>
              )}
            </div>
          )}
        </div>

        {asteroid.jplUrl && asteroid.jplUrl !== '#' && (
          <div className="mt-5 text-right">
            <a
              href={asteroid.jplUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-void border border-edge hover:border-signal text-edge hover:text-signal px-3 py-1 font-display text-[9px]"
            >
              LAUNCH JPL DIAGNOSTICS &rarr;
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
