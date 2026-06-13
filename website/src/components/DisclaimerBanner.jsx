export default function DisclaimerBanner() {
  return (
    <div className="relative z-10 border-b-2 border-edge/30 bg-panel/90 select-none">
      <p className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-2 text-center text-xs font-mono text-dim tracking-wider uppercase">
        [ DIAGNOSTIC NOTICE: NASA JPL DATA FEED ] OBJECTS WILL <span className="text-routine glow-green font-bold">NOT</span> IMPACT EARTH UNLESS RADAR TRAJECTORY CLASSIFIES COLLISION.
      </p>
    </div>
  );
}
