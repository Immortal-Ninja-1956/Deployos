export default function DisclaimerBanner() {
  return (
    <div className="relative z-10 border-b border-edge bg-panel/70">
      <p className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-2 text-center text-[11px] sm:text-xs font-mono text-dim">
        Data sourced from NASA JPL&apos;s Near-Earth Object program. These objects will{' '}
        <span className="text-ink">not</span> impact Earth unless explicitly classified as
        hazardous <span className="text-ink">and</span> stated otherwise.
      </p>
    </div>
  );
}
