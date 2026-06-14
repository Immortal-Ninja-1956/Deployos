import { useState, useMemo, useEffect } from 'react';
import DisclaimerBanner from './components/DisclaimerBanner';
import Header from './components/Header';
import Hero from './components/Hero';
import OrbitalCanvas from './components/OrbitalCanvas';
import AsteroidList from './components/AsteroidList';
import Controls from './components/Controls';
import DetailModal from './components/DetailModal';
import HistoricalContext from './components/HistoricalContext';
import APODWidget from './components/APODWidget';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { useAsteroidFeed } from './hooks/useAsteroidFeed';

export default function App() {
  const [isArcadeTheme, setIsArcadeTheme] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterRisk, setFilterRisk] = useState('all');
  const [sortMetric, setSortMetric] = useState('distance');
  const [searchQuery, setSearchQuery] = useState('');

  const { asteroids, prevAsteroids, loading, isDemoData, toastMessage, clearToast } = useAsteroidFeed(selectedDate);
  const [selected, setSelected] = useState(null);

  const [globalResults, setGlobalResults] = useState(null);
  const [globalSearchLoading, setGlobalSearchLoading] = useState(false);
  const [appToast, setAppToast] = useState(null);

  // Close the detail modal when the date changes to prevent viewing stale data
  useEffect(() => {
    setSelected(null);
  }, [selectedDate]);

  const handleGlobalSearch = async (query) => {
    if (!query || query.trim() === '') return;
    setGlobalSearchLoading(true);
    setGlobalResults(null);
    setAppToast(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
      if (!res.ok) {
        throw new Error(`HTTP_${res.status}`);
      }
      const data = await res.json();
      if (data.type === 'empty') {
        setAppToast(`NO RECORD FOUND FOR "${query.toUpperCase()}"`);
      } else if (data.type === 'list') {
        setGlobalResults(data);
      } else if (data.type === 'match') {
        // Open detail modal directly
        setSelected(data.asteroid);
      }
    } catch (err) {
      setAppToast(`NASA DATABASE SEARCH FAILED: ${err.message.toUpperCase()}`);
    } finally {
      setGlobalSearchLoading(false);
    }
  };

  const handleResetToday = () => {
    setSelectedDate(new Date().toISOString().slice(0, 10));
    setSearchQuery('');
    setGlobalResults(null);
  };

  const displayedAsteroids = useMemo(() => {
    let result = [...asteroids];

    if (filterRisk !== 'all') {
      result = result.filter((a) => a.riskLevel === filterRisk);
    }

    if (searchQuery.trim() !== '') {
      result = result.filter((a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      );
    }

    result.sort((a, b) => {
      if (sortMetric === 'distance') return a.missDistanceLD - b.missDistanceLD;
      if (sortMetric === 'size') return b.diameterMeters.max - a.diameterMeters.max;
      if (sortMetric === 'velocity') return b.velocityKmS - a.velocityKmS;
      return 0;
    });

    return result;
  }, [asteroids, filterRisk, sortMetric, searchQuery]);

  return (
    <div className={`min-h-screen bg-void text-ink font-body transition-colors duration-300 ${isArcadeTheme ? 'theme-arcade' : ''}`}>
      <div className="starfield" aria-hidden="true" />
      <div className="vector-grid" aria-hidden="true" />

      <DisclaimerBanner isArcadeTheme={isArcadeTheme} />

      <main className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Header isArcadeTheme={isArcadeTheme} onToggleTheme={() => setIsArcadeTheme(!isArcadeTheme)} />
        <Controls
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onResetToday={handleResetToday}
          filterRisk={filterRisk}
          onFilterChange={setFilterRisk}
          sortMetric={sortMetric}
          onSortChange={setSortMetric}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onGlobalSearch={handleGlobalSearch}
          globalSearchLoading={globalSearchLoading}
        />

        {globalResults && globalResults.type === 'list' && (
          <div className="arcade-panel p-4 mb-8 bg-void border-edge select-none">
            <div className="flex justify-between items-baseline mb-3 pb-1.5 border-b border-edge/30">
              <h3 className="font-display text-xs text-signal glow-magenta uppercase">
                {isArcadeTheme ? '[ GLOBAL CATALOG RESULTS - CHOOSE DESIGNATION ]' : 'GLOBAL CATALOG RESULTS - CHOOSE DESIGNATION'}
              </h3>
              <button 
                onClick={() => setGlobalResults(null)}
                className="font-mono text-xs hover:text-signal text-dim cursor-pointer"
              >
                {isArcadeTheme ? '[ CLEAR RESULTS ]' : '[ Clear ]'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto">
              {globalResults.results.map((item) => (
                <button
                  key={item.des}
                  onClick={() => handleGlobalSearch(item.des)}
                  className="bg-panel hover:bg-panel2 border border-edge text-left p-2 font-mono text-sm text-ink hover:text-signal transition-colors text-ellipsis overflow-hidden whitespace-nowrap cursor-pointer select-none"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
        <Hero 
          asteroids={displayedAsteroids} 
          allCurrentAsteroids={asteroids}
          prevAsteroids={prevAsteroids}
          selectedDate={selectedDate}
          onSelect={setSelected}
          loading={loading} 
          isDemoData={isDemoData} 
          isArcadeTheme={isArcadeTheme} 
        />
        <OrbitalCanvas asteroids={displayedAsteroids} onSelect={setSelected} isArcadeTheme={isArcadeTheme} />
        <AsteroidList asteroids={displayedAsteroids} onSelect={setSelected} loading={loading} isArcadeTheme={isArcadeTheme} onFilterChange={setFilterRisk} />
        <APODWidget isArcadeTheme={isArcadeTheme} />
        <HistoricalContext isArcadeTheme={isArcadeTheme} />
      </main>

      <Footer />

      {selected && (() => {
        const selectedIndex = displayedAsteroids.findIndex((a) => a.id === selected.id);
        return (
          <DetailModal 
            asteroid={selected} 
            onClose={() => setSelected(null)} 
            isArcadeTheme={isArcadeTheme} 
            onNext={selectedIndex !== -1 && selectedIndex < displayedAsteroids.length - 1 ? () => setSelected(displayedAsteroids[selectedIndex + 1]) : null}
            onPrev={selectedIndex !== -1 && selectedIndex > 0 ? () => setSelected(displayedAsteroids[selectedIndex - 1]) : null}
          />
        );
      })()}
      <Toast message={appToast || toastMessage} onClose={() => { setAppToast(null); clearToast(); }} />
    </div>
  );
}
