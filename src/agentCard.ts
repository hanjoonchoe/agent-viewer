import { useEffect, useState } from 'react';
import type { Agent } from './types';

// The slice of an ERC-8004 registration card (fetched from tokenURI) we render.
export interface SkillInfo {
  name: string;
  tags: string[];
  purchaseUsd?: number;
  executionUsd?: number;
}

export interface AgentCardInfo {
  description?: string;
  image?: string;
  x402: boolean;
  category?: string;
  tags: string[];
  skills: SkillInfo[];
}

const cache = new Map<string, Promise<AgentCardInfo | null>>();

const str = (v: unknown) => (typeof v === 'string' && v.length > 0 ? v : undefined);
const strings = (v: unknown) => (Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : []);
const asRecord = (v: unknown) => (typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : undefined);

// Vendor extensions are keyed by vendor name; scan every entry for the field.
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

const microUsd = (v: unknown) => (typeof v === 'number' ? v / 1_000_000 : undefined);

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

// One fetch per tokenURI for the whole session; a failed card is cached as
// null so broken hosts aren't hammered on every page flip.
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

export function useAgentCard(agent: Agent): { card: AgentCardInfo | null; fetching: boolean } {
  const resolvable = agent.cardOk && /^(https?|data):/.test(agent.tokenURI);
  const [card, setCard] = useState<AgentCardInfo | null>(null);
  const [fetching, setFetching] = useState(resolvable);

  useEffect(() => {
    if (!resolvable) {
      setCard(null);
      setFetching(false);
      return;
    }
    let live = true;
    setFetching(true);
    fetchAgentCard(agent.tokenURI).then((info) => {
      if (!live) return;
      setCard(info);
      setFetching(false);
    });
    return () => {
      live = false;
    };
  }, [agent.tokenURI, resolvable]);

  return { card, fetching };
}
