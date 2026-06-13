import { Calendar, Filter, ArrowUpDown } from 'lucide-react';

export default function Controls({
  selectedDate,
  onDateChange,
  filterRisk,
  onFilterChange,
  sortMetric,
  onSortChange,
}) {
  return (
    <div className="arcade-panel flex flex-col sm:flex-row flex-wrap gap-6 items-end sm:items-center p-5 my-8">
      <div className="flex-1 w-full sm:w-auto">
        <label className="flex items-center gap-2 text-xs font-display uppercase text-cyan-400 mb-2 glow-cyan">
          <Calendar size={12} /> Date Select
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="bg-void border-2 border-edge text-ink text-sm px-3 py-1.5 focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal w-full sm:w-auto font-mono select-text"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto flex-1 sm:flex-none">
        <div className="flex-1 sm:w-48">
          <label className="flex items-center gap-2 text-xs font-display uppercase text-cyan-400 mb-2 glow-cyan">
            <Filter size={12} /> Risk Filter
          </label>
          <div className="relative">
            <select
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

        <div className="flex-1 sm:w-56">
          <label className="flex items-center gap-2 text-xs font-display uppercase text-cyan-400 mb-2 glow-cyan">
            <ArrowUpDown size={12} /> Sort Order
          </label>
          <div className="relative">
            <select
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
