import { useEffect, useState } from 'react';

const MOCK_APOD = {
  title: 'The Crab Nebula Pulsar Core',
  url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800&auto=format&fit=crop&q=80',
  explanation: 'The Crab Nebula is the remnant of a supernova explosion recorded by astronomers in 1054. Today, a rapidly spinning pulsar at its core powers intense radiation across ultraviolet and visible light bands, lighting up the expanding debris cloud.',
  mediaType: 'image',
};

export default function APODWidget({ isArcadeTheme }) {
  const [apod, setApod] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApod() {
      try {
        const res = await fetch('/api/apod');
        if (!res.ok) throw new Error('API responded with error');
        const data = await res.json();
        // If data returns video or is incomplete, use mock
        if (data.mediaType !== 'image' || !data.url) {
          setApod(MOCK_APOD);
        } else {
          setApod(data);
        }
      } catch (err) {
        setApod(MOCK_APOD);
      } finally {
        setLoading(false);
      }
    }
    fetchApod();
  }, []);

  if (loading) {
    return (
      <div className="arcade-panel p-5 mb-8 flex flex-col items-center justify-center min-h-[160px] select-none font-mono">
        <span className="text-dim text-sm animate-pulse">
          {isArcadeTheme ? '> RETRIEVING APOD DATA TRANSMISSION...' : 'Retrieving APOD data transmission...'}
        </span>
      </div>
    );
  }

  const { title, url, explanation } = apod || MOCK_APOD;

  return (
    <section className="my-8 select-none">
      <h2 className="font-display text-xs text-cyan-400 glow-cyan mb-3 border-b border-edge/30 pb-2">
        {isArcadeTheme ? '[ TODAY IN SPACE - NASA APOD ]' : 'TODAY IN SPACE - NASA APOD'}
      </h2>

      <div className="arcade-panel p-5 sm:p-6 flex flex-col md:flex-row gap-6 items-stretch">
        {/* Image Container */}
        <div className="w-full md:w-72 h-48 sm:h-56 shrink-0 border border-edge overflow-hidden relative bg-void flex items-center justify-center">
          <img 
            src={url} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.src = MOCK_APOD.url;
            }}
          />
        </div>

        {/* Text Details */}
        <div className="flex flex-col justify-between flex-grow">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-display text-[9px] uppercase tracking-wider text-dim">
                NASA APOD SENSOR READOUT
              </span>
              <span className="font-display text-[9px] px-1.5 py-0.5 border border-edge text-dim uppercase">
                COSMIC STREAM
              </span>
            </div>

            <h3 className="font-arcade text-lg text-ink font-bold mb-2 tracking-wide uppercase">
              {title}
            </h3>

            <p className="text-xs sm:text-sm text-dim leading-relaxed font-mono">
              {isArcadeTheme ? explanation.toUpperCase() : explanation}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-edge/10 flex justify-between items-center text-[10px] text-dim font-mono">
            <span>NASA IMAGE ARCHIVE proxy</span>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-signal hover:underline flex items-center gap-1 uppercase font-bold"
            >
              [ View Source ]
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
