export default function Footer() {
  return (
    <footer className="relative z-10 mt-16 border-t-2 border-edge/30 bg-panel/75 select-none font-mono">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-dim">
        <p>[ NEARMISS CABINET v1.0 ] &middot; ARCNIGHT 2026, MIC VIT CHENNAI.</p>
        <p className="font-mono text-cyan-400 glow-cyan">TELEMETRY: NASA NEOWS &middot; GEN: GEMINI 2.5</p>
      </div>
    </footer>
  );
}
