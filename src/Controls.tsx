import { useState } from 'react';
import type { AgentsQuery } from './useAgents';
import { BracesIcon, ClockIcon, RefreshIcon } from './icons';

export const AUTO_RELOAD_SECONDS = 30;

export function Controls({
  initial,
  busy,
  auto,
  onLoad,
  onAutoChange,
  onShowRaw,
  rawDisabled,
}: {
  initial: AgentsQuery;
  busy: boolean;
  auto: boolean;
  onLoad: (query: AgentsQuery) => void;
  onAutoChange: (auto: boolean) => void;
  onShowRaw: () => void;
  rawDisabled: boolean;
}) {
  const [max, setMax] = useState(String(initial.max));
  const [fromBlock, setFromBlock] = useState(initial.fromBlock ?? '');

  return (
    <form
      className="header-actions"
      onSubmit={(e) => {
        e.preventDefault();
        onLoad({ max: Number(max), fromBlock: fromBlock.trim() || undefined });
      }}
    >
      <label>
        max
        <input
          className="input"
          type="number"
          min={1}
          value={max}
          onChange={(e) => setMax(e.target.value)}
          aria-label="max"
        />
      </label>
      <label>
        from block
        <input
          className="input"
          type="text"
          value={fromBlock}
          placeholder="recent"
          onChange={(e) => setFromBlock(e.target.value)}
          aria-label="from block"
        />
      </label>
      <button type="submit" className="btn btn-primary blueprint" disabled={busy || !Number(max)}>
        <i className="corner tl" />
        <i className="corner tr" />
        <i className="corner bl" />
        <i className="corner br" />
        <RefreshIcon />
        {busy ? 'Loading…' : 'Reload'}
      </button>
      <div className="seg" role="group" aria-label="Auto reload">
        <label className="seg-opt" title="Reload automatically">
          <input type="checkbox" checked={auto} onChange={(e) => onAutoChange(e.target.checked)} />
          <ClockIcon />
          auto · {AUTO_RELOAD_SECONDS}s
        </label>
      </div>
      <button
        type="button"
        className="btn btn-secondary"
        disabled={rawDisabled}
        title="View raw API response"
        onClick={onShowRaw}
      >
        <BracesIcon size={14} />
        raw
      </button>
    </form>
  );
}
