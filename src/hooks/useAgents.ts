import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAgents } from '../lib/api';
import type { AgentsResponse } from '../lib/types';

export interface AgentsQuery {
  max: number;
  fromBlock?: string; // blank / absent = the API's recent window
}

export type AgentsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: AgentsResponse };

// Owns the request lifecycle: one in-flight fetch at a time, and a run that we
// aborted ourselves (remount, or a newer Load) never settles the UI.
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
