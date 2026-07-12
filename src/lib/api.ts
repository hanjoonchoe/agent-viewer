/** Thin client for the agent-finder HTTP API. */
import type { AgentsResponse } from './types';

/** Base URL of the agent-finder API; override with `VITE_API_BASE` at build time. */
export const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4100';

export interface FetchAgentsOptions {
  /** API origin; defaults to {@link DEFAULT_API_BASE}. */
  apiBase?: string;
  /** Maximum number of agents to scan for. */
  max?: number;
  /** First block to scan from; omit for the API's recent window. */
  fromBlock?: string;
  /** Abort signal for cancelling an in-flight request. */
  signal?: AbortSignal;
}

/**
 * Fetches `GET {apiBase}/api/agents` and returns the parsed response.
 *
 * @throws {Error} `HTTP <status>` on a non-2xx response; `AbortError` when
 *   cancelled via `opts.signal`.
 */
export async function fetchAgents(opts: FetchAgentsOptions = {}): Promise<AgentsResponse> {
  const base = (opts.apiBase ?? DEFAULT_API_BASE).replace(/\/$/, '');
  const params = new URLSearchParams();
  if (opts.max != null) params.set('max', String(opts.max));
  if (opts.fromBlock) params.set('fromBlock', opts.fromBlock);
  const res = await fetch(`${base}/api/agents?${params.toString()}`, { signal: opts.signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as AgentsResponse;
}
