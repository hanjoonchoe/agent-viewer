import type { Status } from './types';
import { PROTOCOLS, SORTS, toggled, type Sort, type ViewOptions } from './filtering';

const STATUSES: Status[] = ['available', 'unavailable', 'unknown', 'dead'];
const SORT_LABELS: Record<Sort, string> = { 'id-desc': 'id ↓', 'id-asc': 'id ↑', name: 'name' };

export function FilterBar({ view, onChange }: { view: ViewOptions; onChange: (view: ViewOptions) => void }) {
  return (
    <div className="filters">
      <div className="filter-group">
        <span className="filter-label">status</span>
        <div className="seg" role="group" aria-label="Status filter">
          {STATUSES.map((s) => (
            <label key={s} className="seg-opt">
              <input
                type="checkbox"
                checked={view.statuses.has(s)}
                onChange={() => onChange({ ...view, statuses: toggled(view.statuses, s) })}
              />
              {s}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-label">protocol</span>
        <div className="seg" role="group" aria-label="Protocol filter">
          {PROTOCOLS.map((p) => (
            <label key={p} className="seg-opt">
              <input
                type="checkbox"
                checked={view.protocols.has(p)}
                onChange={() => onChange({ ...view, protocols: toggled(view.protocols, p) })}
              />
              {p}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-label">sort</span>
        <div className="seg" role="radiogroup" aria-label="Sort order">
          {SORTS.map((s) => (
            <label key={s} className="seg-opt">
              <input
                type="radio"
                name="av-sort"
                checked={view.sort === s}
                onChange={() => onChange({ ...view, sort: s })}
              />
              {SORT_LABELS[s]}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
