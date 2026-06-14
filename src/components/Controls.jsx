import { Calendar, Filter, ArrowUpDown } from 'lucide-react';

export default function Controls({
  selectedDate,
  onDateChange,
  onResetToday,
  filterRisk,
  onFilterChange,
  sortMetric,
  onSortChange,
  searchQuery,
  onSearchChange,
  onGlobalSearch,
  globalSearchLoading,
}) {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 365);
  const maxDateString = maxDate.toISOString().split('T')[0];

  return (
    <div className="arcade-panel flex flex-col gap-6 p-5 my-8">
      {/* Upper Row: Search Name & Date Select */}
      <div className="flex flex-col md:flex-row gap-6 items-end w-full">
        {/* Name Search Input */}
        <div className="flex-1 w-full">
          <label htmlFor="search-input" className="flex items-center gap-2 text-xs font-display uppercase text-cyan-400 mb-2 glow-cyan">
            <svg viewBox="0 0 24 24" width="12" height="12" className="fill-none stroke-current stroke-2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Search Name
          </label>
          <div className="flex gap-2">
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onGlobalSearch(searchQuery);
                }
              }}
              placeholder="ENTER NAME (E.G. CERES, HALLEY)..."
              className="bg-void border-2 border-edge text-ink text-sm px-3 py-1.5 focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal w-full font-mono uppercase select-text"
            />
            <button
              onClick={() => onGlobalSearch(searchQuery)}
              disabled={globalSearchLoading || !searchQuery.trim()}
              className="btn-global-search"
              title="Search the global NASA JPL catalog"
            >
              {globalSearchLoading ? 'SEARCHING...' : 'GLOBAL SEARCH'}
            </button>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex-1 w-full">
          <label htmlFor="date-select-input" className="flex items-center gap-2 text-xs font-display uppercase text-cyan-400 mb-2 glow-cyan">
            <Calendar size={12} /> Date Select
          </label>
          <div className="flex gap-2 items-center w-full">
            <input
              id="date-select-input"
              type="date"
              value={selectedDate}
              min="2015-01-01"
              max={maxDateString}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-void border-2 border-edge text-ink text-sm px-3 py-1.5 focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal flex-1 w-full font-mono select-text"
            />
            <button
              onClick={onResetToday}
              className="btn-today"
              title="Reset to today"
            >
              [TODAY]
            </button>
          </div>
          <p className="text-[10px] text-dim font-mono mt-1.5 uppercase tracking-wider">
            Data available 2015 – {maxDate.getFullYear()}
          </p>
        </div>
      </div>

      {/* Lower Row: Risk Filter & Sort Order */}
      <div className="flex flex-col md:flex-row gap-6 items-end w-full">
        {/* Risk Filter */}
        <div className="flex-1 w-full">
          <label htmlFor="risk-filter-select" className="flex items-center gap-2 text-xs font-display uppercase text-cyan-400 mb-2 glow-cyan">
            <Filter size={12} /> Risk Filter
          </label>
          <div className="relative">
            <select
              id="risk-filter-select"
              value={filterRisk}
              onChange={(e) => onFilterChange(e.target.value)}
              className="bg-void border-2 border-edge text-ink text-sm px-3 py-1.5 focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal w-full font-mono cursor-pointer"
            >
              <option value="all">ALL OBJECTS</option>
              <option value="hazardous">HAZARDOUS ONLY</option>
              <option value="watch">WATCH ONLY</option>
              <option value="notable">NOTABLE ONLY</option>
              <option value="routine">ROUTINE ONLY</option>
            </select>
          </div>
        </div>

        {/* Sort Order */}
        <div className="flex-1 w-full">
          <label htmlFor="sort-order-select" className="flex items-center gap-2 text-xs font-display uppercase text-cyan-400 mb-2 glow-cyan">
            <ArrowUpDown size={12} /> Sort Order
          </label>
          <div className="relative">
            <select
              id="sort-order-select"
              value={sortMetric}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-void border-2 border-edge text-ink text-sm px-3 py-1.5 focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal w-full font-mono cursor-pointer"
            >
              <option value="distance">CLOSEST APPROACH</option>
              <option value="size">LARGEST DIAMETER</option>
              <option value="velocity">MAXIMUM VELOCITY</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
