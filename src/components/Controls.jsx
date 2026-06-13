import { Calendar, Filter, ArrowUpDown } from 'lucide-react';

export default function Controls({
  selectedDate,
  onDateChange,
  filterRisk,
  onFilterChange,
  sortMetric,
  onSortChange,
  searchQuery,
  onSearchChange,
}) {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 365);
  const maxDateString = maxDate.toISOString().split('T')[0];

  return (
    <div className="arcade-panel flex flex-col sm:flex-row flex-wrap gap-6 items-end sm:items-center p-5 my-8">
      {/* Name Search Input */}
      <div className="flex-1 w-full sm:w-auto">
        <label htmlFor="search-input" className="flex items-center gap-2 text-xs font-display uppercase text-cyan-400 mb-2 glow-cyan">
          <svg viewBox="0 0 24 24" width="12" height="12" className="fill-none stroke-current stroke-2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          Search Name
        </label>
        <input
          id="search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ENTER ASTEROID NAME..."
          className="bg-void border-2 border-edge text-ink text-sm px-3 py-1.5 focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal w-full font-mono uppercase select-text"
        />
      </div>

      {/* Date Selector */}
      <div className="flex-1 w-full sm:w-auto">
        <label htmlFor="date-select-input" className="flex items-center gap-2 text-xs font-display uppercase text-cyan-400 mb-2 glow-cyan">
          <Calendar size={12} /> Date Select
        </label>
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <input
            id="date-select-input"
            type="date"
            value={selectedDate}
            min="2015-01-01"
            max={maxDateString}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-void border-2 border-edge text-ink text-sm px-3 py-1.5 focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal flex-1 w-full sm:w-auto font-mono select-text"
          />
          <button
            onClick={() => onDateChange(new Date().toISOString().slice(0, 10))}
            className="bg-void border-2 border-edge hover:border-signal text-edge hover:text-signal px-3 py-1.5 font-display text-[10px] sm:text-xs tracking-wider cursor-pointer select-none transition-all hover:scale-[1.03] active:scale-95 whitespace-nowrap shrink-0"
            title="Reset to today"
          >
            [TODAY]
          </button>
        </div>
        <p className="text-[10px] text-dim font-mono mt-1.5 uppercase tracking-wider">
          Data available 2015 – {maxDate.getFullYear()}
        </p>
      </div>

      {/* Select Controls Row */}
      <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto flex-1 sm:flex-none">
        {/* Risk Filter */}
        <div className="flex-1 sm:w-48">
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
        <div className="flex-1 sm:w-56">
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
