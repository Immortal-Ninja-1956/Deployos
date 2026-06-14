import { SIZE_REFERENCE_HEIGHTS, formatMeters } from '../utils/sizeLabel';

export default function SizeComparison({ asteroid }) {
  const objectSize = asteroid.diameterMeters.max;
  const refHeight = SIZE_REFERENCE_HEIGHTS[asteroid.sizeRef.label];
  const human = 1.7;
  const maxVal = Math.max(objectSize, refHeight, human) * 1.05;

  const bars = [
    { key: 'human', label: 'You', value: human, emoji: '\u{1F9CD}' },
    { key: 'ref', label: asteroid.sizeRef.label, value: refHeight, emoji: asteroid.sizeRef.emoji },
    { key: 'object', label: asteroid.name, value: objectSize, emoji: '\u2604\uFE0F' },
  ];

  return (
    <div className="flex items-end justify-around gap-4 sm:gap-8 h-[200px] px-2 select-none font-mono">
      {bars.map((b) => {
        const isObject = b.key === 'object';
        const isHuman = b.key === 'human';
        const colorClass = isObject ? 'from-hazardous/30 to-hazardous border-hazardous shadow-glow-hazardous' : isHuman ? 'from-edge/30 to-edge border-edge shadow-glow-cyan' : 'from-notable/30 to-notable border-notable shadow-glow-notable';

        return (
          <div key={b.key} className="flex flex-col items-center justify-end h-full flex-1 min-w-0">
            <span className="font-mono text-xs text-dim mb-1.5 whitespace-nowrap">
              {formatMeters(b.value)}
            </span>
            <div
              className={`w-8 sm:w-12 border-2 bg-gradient-to-t ${colorClass}`}
              style={{ 
                height: `${Math.max(12, (Math.log10(b.value + 1) / Math.log10(maxVal + 1)) * 100)}%`
              }}
              aria-hidden="true"
            />
            <span
              className="mt-2 text-xs text-dim text-center max-w-full truncate uppercase tracking-wider font-bold"
              title={b.label}
            >
              {b.emoji} {b.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
