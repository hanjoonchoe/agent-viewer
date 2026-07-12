/**
 * Fetching and parsing of ERC-8004 registration cards (the JSON documents
 * that an agent's `tokenURI` points at). Everything here is React-free;
 * the {@link ../hooks/useAgentCard} hook wraps it for components.
 */

/** One skill advertised in a registration card, with optional vendor pricing. */
export interface SkillInfo {
  name: string;
  tags: string[];
  /** One-time purchase price in USD, when the vendor extension provides it. */
  purchaseUsd?: number;
  /** Per-execution price in USD, when the vendor extension provides it. */
  executionUsd?: number;
}

/** The slice of a registration card that the UI renders. */
export interface AgentCardInfo {
  description?: string;
  /** Thumbnail URL (`image` or `iconUrl` field of the card). */
  image?: string;
  /** Whether the card declares x402 payment support. */
  x402: boolean;
  /** Vendor-declared category, e.g. `"business"`. */
  category?: string;
  /** Vendor-declared tags, e.g. `["automation"]`. */
  tags: string[];
  skills: SkillInfo[];
}

const cache = new Map<string, Promise<AgentCardInfo | null>>();

const str = (v: unknown) => (typeof v === 'string' && v.length > 0 ? v : undefined);
const strings = (v: unknown) => (Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : []);
const asRecord = (v: unknown) => (typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : undefined);

/**
 * Extracts a field from a card's `extensions` block. Extensions are keyed by
 * vendor name (e.g. `"indie.money"`), so every entry is scanned and the first
 * value `pick` accepts wins.
 */
function fromExtensions<T>(extensions: unknown, pick: (ext: Record<string, unknown>) => T | undefined): T | undefined {
  const record = asRecord(extensions);
  if (!record) return undefined;
  for (const value of Object.values(record)) {
    const ext = asRecord(value);
    const found = ext && pick(ext);
    if (found !== undefined) return found;
  }
  return undefined;
}

/** Converts a micro-USD amount (e.g. `10_000_000` → `$10`) to dollars. */
const microUsd = (v: unknown) => (typeof v === 'number' ? v / 1_000_000 : undefined);

/** Parses one entry of the card's `skills` array; returns `null` for malformed entries. */
function parseSkill(v: unknown): SkillInfo | null {
  const skill = asRecord(v);
  const name = skill && str(skill.name);
  if (!skill || !name) return null;
  const pricing = fromExtensions(skill.extensions, (ext) => asRecord(ext.pricing));
  return {
    name,
    tags: strings(skill.tags),
    purchaseUsd: pricing && microUsd(pricing.purchasePriceMicroUsd),
    executionUsd: pricing && microUsd(pricing.executionPriceMicroUsd),
  };
}

/**
 * Parses a raw registration-card JSON payload into {@link AgentCardInfo}.
 * Fully defensive: any shape is accepted and missing/malformed fields are
 * dropped rather than thrown on. Returns `null` for non-object payloads.
 */
export function parseCard(json: unknown): AgentCardInfo | null {
  const card = asRecord(json);
  if (!card) return null;
  return {
    description: str(card.description),
    image: str(card.image) ?? str(card.iconUrl),
    // Both spellings appear in real registration cards.
    x402: card.x402Support === true || card.x402support === true,
    category: fromExtensions(card.extensions, (ext) => str(ext.category)),
    tags: fromExtensions(card.extensions, (ext) => {
      const tags = strings(ext.tags);
      return tags.length > 0 ? tags : undefined;
    }) ?? [],
    skills: Array.isArray(card.skills) ? card.skills.map(parseSkill).filter((s): s is SkillInfo => s !== null) : [],
  };
}

/**
 * Fetches and parses the registration card at `tokenURI` (`https:` or `data:`).
 *
 * One fetch per tokenURI for the whole session; a failed card is cached as
 * `null` so broken hosts aren't hammered on every page flip. Never rejects.
 */
export function fetchAgentCard(tokenURI: string): Promise<AgentCardInfo | null> {
  let pending = cache.get(tokenURI);
  if (!pending) {
    pending = fetch(tokenURI)
      .then((res) => (res.ok ? res.json() : null))
      .then(parseCard)
      .catch(() => null);
    cache.set(tokenURI, pending);
  }
  return pending;
}
