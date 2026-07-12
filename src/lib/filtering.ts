import { statusOf, type Agent, type Status } from './types';

export const PROTOCOLS = ['a2a', 'mcp'] as const;
export type Protocol = (typeof PROTOCOLS)[number];

export const SORTS = ['id-desc', 'id-asc', 'name'] as const;
export type Sort = (typeof SORTS)[number];

export interface ViewOptions {
  statuses: ReadonlySet<Status>; // empty = all
  protocols: ReadonlySet<Protocol>; // empty = all
  sort: Sort;
}

// A protocol chip is shown when any service URL path mentions it.
export function protocolsOf(agent: Agent): Protocol[] {
  return PROTOCOLS.filter((p) => agent.services.some((url) => url.toLowerCase().includes(p)));
}

const COMPARATORS: Record<Sort, (a: Agent, b: Agent) => number> = {
  'id-desc': (a, b) => Number(b.agentId) - Number(a.agentId),
  'id-asc': (a, b) => Number(a.agentId) - Number(b.agentId),
  // Named agents alphabetically, unnamed ones last.
  name: (a, b) =>
    a.name === null || b.name === null
      ? Number(a.name === null) - Number(b.name === null)
      : a.name.localeCompare(b.name),
};

export function applyView(agents: Agent[], view: ViewOptions): Agent[] {
  return agents
    .filter((a) => view.statuses.size === 0 || view.statuses.has(statusOf(a)))
    .filter((a) => view.protocols.size === 0 || protocolsOf(a).some((p) => view.protocols.has(p)))
    .sort(COMPARATORS[view.sort]);
}

export function toggled<T>(set: ReadonlySet<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}
