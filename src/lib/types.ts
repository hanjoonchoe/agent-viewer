/**
 * Shared API contract — mirror of what agent-finder's `GET /api/agents` returns.
 * Keep this in sync with the backend (see agent-finder response format).
 */

/** Whether the agent's service endpoints responded to the finder's probe. */
export type Availability = 'available' | 'unavailable' | 'unknown';

/** Whether the agent is considered alive on-chain by the finder. */
export type Liveness = 'alive' | 'dead' | 'unknown';

/** One registered ERC-8004 agent as reported by agent-finder. */
export interface Agent {
  /** On-chain token id — a string, not a number (on-chain bigint). */
  agentId: string;
  /** Owner wallet, `0x…` address. */
  owner: string;
  /** Display name from the registration card; `null` when the card didn't resolve. */
  name: string | null;
  /** Whether the finder could fetch and parse the registration card. */
  cardOk: boolean;
  /** Failure reason (e.g. `"HTTP 404"`, `"empty uri"`); present only when `cardOk === false`. */
  cardReason?: string;
  availability: Availability;
  liveness: Liveness;
  /** Service endpoint URLs listed in the registration card. */
  services: string[];
  /** Where the registration card lives — `https:` or `data:` URI. */
  tokenURI: string;
}

/** The single badge state shown per agent: dead liveness overrides availability. */
export type Status = Availability | 'dead';

/** Collapses the two status axes into the one badge state ({@link Status}). */
export function statusOf(a: Pick<Agent, 'availability' | 'liveness'>): Status {
  return a.liveness === 'dead' ? 'dead' : a.availability;
}

/** Envelope of `GET /api/agents`. */
export interface AgentsResponse {
  /** Network slug, e.g. `"base-sepolia"`. */
  network: string;
  chainId: number;
  /** First scanned block — a string (bigint). */
  fromBlock: string;
  /** Number of agents found in the scanned range. */
  count: number;
  agents: Agent[];
}
