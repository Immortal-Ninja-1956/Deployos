import { useState, useMemo } from 'react';
import DisclaimerBanner from './components/DisclaimerBanner';
import Hero from './components/Hero';
import OrbitalCanvas from './components/OrbitalCanvas';
import AsteroidList from './components/AsteroidList';
import Controls from './components/Controls';
import DetailModal from './components/DetailModal';
import HistoricalContext from './components/HistoricalContext';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { useAsteroidFeed } from './hooks/useAsteroidFeed';

export default function App() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterRisk, setFilterRisk] = useState('all');
  const [sortMetric, setSortMetric] = useState('distance');

  const { asteroids, loading, isDemoData, toastMessage, clearToast } = useAsteroidFeed(selectedDate);
  const [selected, setSelected] = useState(null);

  const displayedAsteroids = useMemo(() => {
    let result = [...asteroids];

    if (filterRisk !== 'all') {
      result = result.filter((a) => a.riskLevel === filterRisk);
    }

    result.sort((a, b) => {
      if (sortMetric === 'distance') return a.missDistanceLD - b.missDistanceLD;
      if (sortMetric === 'size') return b.diameterMeters.max - a.diameterMeters.max;
      if (sortMetric === 'velocity') return b.velocityKmS - a.velocityKmS;
      return 0;
    });

    return result;
  }, [asteroids, filterRisk, sortMetric]);

  return (
    <div className="min-h-screen bg-void text-ink font-body">
      <div className="starfield" aria-hidden="true" />
      <div className="vector-grid" aria-hidden="true" />

      <DisclaimerBanner />

      <main className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Controls
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          filterRisk={filterRisk}
          onFilterChange={setFilterRisk}
          sortMetric={sortMetric}
          onSortChange={setSortMetric}
        />
        <Hero asteroids={displayedAsteroids} loading={loading} isDemoData={isDemoData} />
        <OrbitalCanvas asteroids={displayedAsteroids} onSelect={setSelected} />
        <AsteroidList asteroids={displayedAsteroids} onSelect={setSelected} loading={loading} />
        <HistoricalContext />
      </main>

      <Footer />

      {selected && <DetailModal asteroid={selected} onClose={() => setSelected(null)} />}
      <Toast message={toastMessage} onClose={clearToast} />
    </div>
  );
}
