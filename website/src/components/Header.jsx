export default function Header({ isArcadeTheme, onToggleTheme }) {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between py-6 border-b border-edge/20 mb-8 gap-4 select-none">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3">
        <svg 
          viewBox="0 0 100 40" 
          className="w-16 h-10 fill-none stroke-current text-dim transition-colors duration-300"
          aria-hidden="true"
        >
          {/* Earth / Target Planet */}
          <circle 
            cx="65" 
            cy="20" 
            r="6" 
            className="stroke-2 text-signal animate-pulse" 
            style={{
              filter: isArcadeTheme ? 'drop-shadow(0 0 4px var(--color-signal))' : 'none'
            }}
          />
          <circle 
            cx="65" 
            cy="20" 
            r="11" 
            className="stroke-1 text-signal/20" 
            strokeDasharray="2 3" 
          />
          
          {/* Curved trajectory of the flyby */}
          <path 
            d="M 10 32 Q 45 10 90 12" 
            className="stroke-[1.5] text-edge/40" 
            strokeDasharray="2 2"
          />
          
          {/* Asteroid flying by */}
          <g transform="translate(42, 13)">
            <path 
              d="M -3 -3 L 3 -4 L 5 -1 L 2 3 L -3 2 Z" 
              className="fill-void stroke-hazardous stroke-[1.5] animate-pulse"
              style={{
                filter: isArcadeTheme ? 'drop-shadow(0 0 4px var(--color-hazardous))' : 'none'
              }}
            />
            {/* Trail / speed line */}
            <path 
              d="M -8 -1 L -5 -1" 
              className="stroke-hazardous/60 stroke-[1]" 
            />
          </g>
        </svg>
        
        <div className="flex flex-col">
          <span className="font-arcade text-xl sm:text-2xl font-black tracking-wider text-ink uppercase">
            Near<span className="text-signal glow-magenta">Miss</span>
          </span>
          <span className="font-mono text-[9px] text-dim tracking-widest -mt-1 uppercase">
            Planetary Defense Telemetry
          </span>
        </div>
      </div>

      {/* Theme Toggle Button */}
      <div>
        {isArcadeTheme ? (
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-3 bg-void border-4 border-double border-edge text-edge hover:text-signal hover:border-signal hover:shadow-glow-cyan px-5 py-2 sm:px-6 sm:py-2.5 font-display text-[10px] sm:text-xs tracking-widest cursor-pointer select-none transition-all hover:scale-[1.03] active:scale-95"
            aria-label="Switch to readable mode"
          >
            <span className="animate-text-blink text-routine text-sm sm:text-base">●</span>
            <span>READABLE MODE</span>
          </button>
        ) : (
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-3 bg-panel hover:bg-panel2 border-2 border-edge text-ink px-5 py-2.5 rounded-full shadow-md transition-all text-xs sm:text-sm font-bold cursor-pointer group hover:border-signal hover:scale-[1.03] active:scale-[0.98]"
            aria-label="Switch to retro arcade mode"
          >
            <svg 
              viewBox="0 0 24 24" 
              className="w-5 h-5 text-signal fill-none stroke-current stroke-2 transition-transform group-hover:rotate-12 duration-200"
              aria-hidden="true"
            >
              {/* Joystick Base */}
              <path d="M4 19h16l-3-4H7L4 19z" className="fill-void stroke-current" />
              {/* Slanted Shaft (Lever style) */}
              <line x1="12" y1="16" x2="8" y2="8" strokeWidth="3" />
              {/* Ball / Plunger Top */}
              <circle cx="8" cy="5" r="3.5" className="fill-signal stroke-current stroke-1 animate-pulse" />
            </svg>
            <span className="font-mono tracking-widest group-hover:text-signal transition-colors">
              ARCADE MODE
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
