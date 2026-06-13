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
    <div className="flex items-end justify-around gap-3 sm:gap-6 h-40 px-1">
      {bars.map((b) => (
        <div key={b.key} className="flex flex-col items-center justify-end h-full flex-1 min-w-0">
          <span className="font-mono text-[11px] text-dim mb-1 whitespace-nowrap">
            {formatMeters(b.value)}
          </span>
          <div
            className="w-7 sm:w-10 rounded-t-md bg-gradient-to-t from-signal/15 to-signal/70"
            style={{ height: `${Math.max(4, (b.value / maxVal) * 100)}%` }}
            aria-hidden="true"
          />
          <span
            className="mt-2 text-[11px] sm:text-xs text-dim text-center max-w-full truncate"
            title={b.label}
          >
            {b.emoji} {b.label}
          </span>
        </div>
      ))}
    </div>
  );
}
