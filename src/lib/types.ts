// Shared API contract — mirror of what agent-finder's GET /api/agents returns.
// Keep this in sync with the backend (see agent-finder response format).

export type Availability = 'available' | 'unavailable' | 'unknown';
export type Liveness = 'alive' | 'dead' | 'unknown';

export interface Agent {
  agentId: string; // string, not number (on-chain bigint)
  owner: string; // 0x address
  name: string | null; // null when the card didn't resolve
  cardOk: boolean;
  cardReason?: string; // present only when cardOk === false
  availability: Availability;
  liveness: Liveness;
  services: string[];
  tokenURI: string;
}

// The single badge state shown per agent: dead liveness overrides availability.
export type Status = Availability | 'dead';

export function statusOf(a: Pick<Agent, 'availability' | 'liveness'>): Status {
  return a.liveness === 'dead' ? 'dead' : a.availability;
}

export interface AgentsResponse {
  network: string;
  chainId: number;
  fromBlock: string; // string (bigint)
  count: number;
  agents: Agent[];
}
