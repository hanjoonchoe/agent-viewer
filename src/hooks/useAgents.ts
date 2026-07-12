import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAgents } from '../lib/api';
import type { AgentsResponse } from '../lib/types';

/** Query parameters the user can control from the header. */
export interface AgentsQuery {
  max: number;
  /** First block to scan from; blank / absent = the API's recent window. */
  fromBlock?: string;
}

/** Discriminated request state rendered by the page. */
export type AgentsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: AgentsResponse };

/**
 * Owns the agent-list request lifecycle: fetches once on mount with `initial`,
 * and refetches via the returned `load`. Only one fetch is in flight at a
 * time — starting a new one aborts the previous — and a run that we aborted
 * ourselves (unmount, StrictMode remount, or a newer `load`) never settles
 * the UI.
 *
 * @param initial Query used for the automatic fetch on mount. Read once;
 *   later changes to the argument are ignored.
 */
export function useAgents(initial: AgentsQuery) {
  const [state, setState] = useState<AgentsState>({ status: 'loading' });
  const inflight = useRef<AbortController | null>(null);
  const initialQuery = useRef(initial);

  const load = useCallback((query: AgentsQuery) => {
    inflight.current?.abort();
    const ctl = new AbortController();
    inflight.current = ctl;
    setState({ status: 'loading' });

    fetchAgents({ ...query, signal: ctl.signal })
      .then((data) => {
        if (!ctl.signal.aborted) setState({ status: 'ready', data });
      })
      .catch((e: unknown) => {
        if (ctl.signal.aborted) return;
        setState({ status: 'error', message: e instanceof Error ? e.message : String(e) });
      });
  }, []);

  useEffect(() => {
    load(initialQuery.current);
    return () => inflight.current?.abort();
  }, [load]);

  return { state, load };
}
