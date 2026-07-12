import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAgents } from '../lib/api';
import type { AgentsResponse } from '../lib/types';

/** Query parameters the user can control from the header. */
export interface AgentsQuery {
  max: number;
  /** First block to scan from; blank / absent = the API's recent window. */
  fromBlock?: string;
}

/** Size of the fast first slice painted while the full scan runs. */
const QUICK_MAX = 24;

/**
 * Request state. `data` and `loading` are independent so the grid can keep
 * showing the previous (or quick-slice) response while a fetch is in flight.
 */
export interface AgentsState {
  /** Last successful response; undefined until the first fetch lands. */
  data?: AgentsResponse;
  /** Wall-clock time `data` arrived. */
  refreshedAt?: string;
  /** A fetch is in flight (first load, slice upgrade, or reload). */
  loading: boolean;
  /** Last fetch failure; kept alongside stale `data` so the grid stays up. */
  error?: string;
}

/**
 * Owns the agent-list request lifecycle: fetches once on mount with `initial`,
 * refetches via `load(query)`, and re-runs the last query via `reload()`
 * (used by auto-refresh).
 *
 * Loading is progressive: the very first visit fetches a small quick slice
 * ({@link QUICK_MAX}) and paints it, then upgrades to the full result — the
 * two fetches are sequential, never concurrent. Reloads keep the previous
 * response visible instead of blanking the page. Only one load is active at
 * a time — starting a new one aborts the previous — and a run we aborted
 * ourselves (unmount, StrictMode remount, newer `load`) never settles the UI.
 *
 * @param initial Query used for the automatic fetch on mount. Read once;
 *   later changes to the argument are ignored.
 */
export function useAgents(initial: AgentsQuery) {
  const [state, setState] = useState<AgentsState>({ loading: true });
  const inflight = useRef<AbortController | null>(null);
  const lastQuery = useRef(initial);
  const hasData = useRef(false);

  const load = useCallback((query: AgentsQuery) => {
    lastQuery.current = query;
    inflight.current?.abort();
    const ctl = new AbortController();
    inflight.current = ctl;
    setState((s) => ({ ...s, loading: true, error: undefined }));

    const settle = (patch: Partial<AgentsState>) => {
      if (!ctl.signal.aborted) setState((s) => ({ ...s, ...patch }));
    };
    const arrived = (data: AgentsResponse) => {
      hasData.current = true;
      return { data, refreshedAt: new Date().toLocaleTimeString() };
    };

    void (async () => {
      // First visit only: paint a quick slice while the full scan runs.
      // (On reloads the stale grid already covers the wait.)
      if (!hasData.current && query.max > QUICK_MAX) {
        try {
          settle(arrived(await fetchAgents({ ...query, max: QUICK_MAX, signal: ctl.signal })));
        } catch {
          // Best effort — the full fetch below decides success or failure.
        }
      }
      try {
        const data = await fetchAgents({ ...query, signal: ctl.signal });
        settle({ ...arrived(data), loading: false });
      } catch (e) {
        if (ctl.signal.aborted) return;
        settle({ loading: false, error: e instanceof Error ? e.message : String(e) });
      }
    })();
  }, []);

  const reload = useCallback(() => load(lastQuery.current), [load]);

  useEffect(() => {
    load(lastQuery.current);
    return () => inflight.current?.abort();
  }, [load]);

  return { state, load, reload };
}
