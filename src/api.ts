import type { AgentsResponse } from './types';

export const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4100';

export interface FetchAgentsOptions {
  apiBase?: string;
  max?: number;
  fromBlock?: string;
  signal?: AbortSignal;
}

export async function fetchAgents(opts: FetchAgentsOptions = {}): Promise<AgentsResponse> {
  const base = (opts.apiBase ?? DEFAULT_API_BASE).replace(/\/$/, '');
  const params = new URLSearchParams();
  if (opts.max != null) params.set('max', String(opts.max));
  if (opts.fromBlock) params.set('fromBlock', opts.fromBlock);
  const res = await fetch(`${base}/api/agents?${params.toString()}`, { signal: opts.signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as AgentsResponse;
}
