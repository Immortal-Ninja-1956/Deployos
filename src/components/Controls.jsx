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
    <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-end sm:items-center bg-panel/40 border border-edge rounded-xl p-4 my-8">
      <div className="flex-1 w-full sm:w-auto">
        <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-dim mb-2">
          <Calendar size={14} /> 7-Day Window Start
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="bg-void border border-edge rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-signal w-full sm:w-auto"
        />
      </div>

      <div className="flex flex-1 sm:flex-none gap-4 w-full sm:w-auto">
        <div className="flex-1 sm:w-40">
          <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-dim mb-2">
            <Filter size={14} /> Risk Filter
          </label>
          <select
            value={filterRisk}
            onChange={(e) => onFilterChange(e.target.value)}
            className="bg-void border border-edge rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-signal w-full appearance-none"
          >
            <option value="all">All Risks</option>
            <option value="hazardous">Hazardous</option>
            <option value="watch">Watch</option>
            <option value="notable">Notable</option>
            <option value="routine">Routine</option>
          </select>
        </div>

        <div className="flex-1 sm:w-48">
          <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-dim mb-2">
            <ArrowUpDown size={14} /> Sort By
          </label>
          <select
            value={sortMetric}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-void border border-edge rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-signal w-full appearance-none"
          >
            <option value="distance">Closest Approach</option>
            <option value="size">Largest Size</option>
            <option value="velocity">Fastest Velocity</option>
          </select>
        </div>
      </div>
    </div>
  );
}
