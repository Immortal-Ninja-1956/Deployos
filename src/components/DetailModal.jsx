import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { RISK_META } from '../utils/risk';
import LiveCounter from './LiveCounter';
import SizeComparison from './SizeComparison';

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-edge bg-void/30 px-3 py-2">
      <p className="text-[10px] uppercase tracking-widest text-dim">{label}</p>
      <p className="text-ink mt-0.5 font-mono text-sm">{value}</p>
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-void/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Details for asteroid ${asteroid.name}`}
    >
      <div
        className="w-full sm:max-w-lg max-h-[88vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-edge bg-panel2 p-5 sm:p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <span
              className="font-mono text-xs px-2 py-1 rounded-full border"
              style={{ color: meta.color, borderColor: `${meta.color}60` }}
            >
              {meta.label}
            </span>
            <h2 className="font-display text-2xl text-ink mt-2">{asteroid.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-dim hover:text-ink p-1 -mr-1 -mt-1 rounded"
            aria-label="Close details"
          >
            <X size={22} />
          </button>
        </div>

        <div className="rounded-xl border border-edge bg-void/40 p-4 mb-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-dim mb-1">
            Current distance
          </p>
          <LiveCounter asteroid={asteroid} />
        </div>

        <div className="mb-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-dim mb-2">
            Size, for scale
          </p>
          <SizeComparison asteroid={asteroid} />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <Stat label="Diameter" value={`${Math.round(asteroid.diameterMeters.min)}\u2013${Math.round(asteroid.diameterMeters.max)} m`} />
          <Stat label="Velocity" value={`${asteroid.velocityKmS.toFixed(2)} km/s`} />
          <Stat label="Miss distance" value={`${asteroid.missDistanceLD.toFixed(2)} LD`} />
          <Stat label="In kilometers" value={`${Math.round(asteroid.missDistanceKm).toLocaleString()} km`} />
          <Stat
            label="Closest approach"
            value={approachDate.toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          />
          <Stat label="Absolute magnitude" value={asteroid.absoluteMagnitude?.toFixed(1) ?? '\u2014'} />
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-dim mb-2">
            Field report
          </p>
          {reportState === 'loading' && (
            <p className="text-dim text-sm animate-pulse">Generating field report&hellip;</p>
          )}
          {reportState === 'done' && (
            <p className="text-ink/90 text-sm leading-relaxed">{report}</p>
          )}
          {reportState === 'unavailable' && (
            <div className="text-dim text-sm leading-relaxed space-y-2">
              <p>
                Field report unavailable &mdash; set{' '}
                <code className="font-mono text-signal">GEMINI_API_KEY</code> in your environment
                to enable AI-generated summaries here.
              </p>
              {reportNote && (
                <p className="text-xs bg-void/50 p-2 rounded border border-edge font-mono text-rose-400/90 max-h-32 overflow-y-auto">
                  Detail: {reportNote}
                </p>
              )}
            </div>
          )}
        </div>

        {asteroid.jplUrl && asteroid.jplUrl !== '#' && (
          <a
            href={asteroid.jplUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-5 text-xs font-mono text-signal hover:underline"
          >
            View on NASA JPL &rarr;
          </a>
        )}
      </div>
    </div>
  );
}
