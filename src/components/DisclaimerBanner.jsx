export default function DisclaimerBanner({ isArcadeTheme }) {
  return (
    <div 
      className="bg-signal text-panel font-bold flex items-center justify-center py-2 px-6 text-[10px] sm:text-xs font-arcade tracking-wider select-none relative transition-all duration-300 ease-in-out max-h-20 opacity-100"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center text-center leading-relaxed">
        {isArcadeTheme ? (
          <>
            <span className="animate-pulse mr-2">⚠️</span>
            DATA SOURCED FROM NASA JPL'S NEAR-EARTH OBJECT PROGRAM. THESE OBJECTS WILL NOT IMPACT EARTH UNLESS EXPLICITLY CLASSIFIED AS HAZARDOUS AND STATED OTHERWISE.
            <span className="animate-pulse ml-2">⚠️</span>
          </>
        ) : (
          <>
            <span className="mr-2">ℹ️</span>
            This is an educational dashboard tracking near-Earth objects. Data is sourced live from NASA JPL.
          </>
        )}
      </div>
    </div>
  );
}
