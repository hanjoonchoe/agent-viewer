/** Small presentational primitives shared by the agent card and detail dialog. */
import { statusOf, type Agent } from '../lib/types';
import type { AgentCardInfo } from '../lib/agentCard';
import { protocolsOf, type Protocol } from '../lib/filtering';
import { StatusIcon } from './icons';

const BASESCAN = 'https://sepolia.basescan.org/address/';

const PROTO_TAG: Record<Protocol, string> = { a2a: 'tag-accent', mcp: 'tag-neutral' };

/** Blueprint registration marks for a `.blueprint`-framed element. */
export function Corners() {
  return (
    <>
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
    </>
  );
}

/** Colored status pill with its icon; color carries the meaning. */
export function StatusPill({ agent }: { agent: Agent }) {
  const status = statusOf(agent);
  return (
    <span className={`status-pill status-${status}`}>
      <StatusIcon status={status} />
      {status}
    </span>
  );
}

/** Protocol chips (a2a / mcp) derived from service URLs, plus x402 when the card declares it. */
export function ProtocolChips({ agent, x402 = false }: { agent: Agent; x402?: boolean }) {
  return (
    <>
      {protocolsOf(agent).map((p) => (
        <span key={p} className={`tag tag-proto ${PROTO_TAG[p]}`}>
          {p}
        </span>
      ))}
      {x402 && <span className="tag tag-proto tag-outline">x402</span>}
    </>
  );
}

/** Category + tag chips from a fetched registration card. */
export function CardTagChips({ card }: { card: AgentCardInfo }) {
  return (
    <>
      {card.category && <span className="tag tag-proto tag-accent-2 uppercase">{card.category}</span>}
      {card.tags.map((t) => (
        <span key={t} className="tag tag-proto tag-neutral">
          {t}
        </span>
      ))}
    </>
  );
}

/** Owner address linked to Basescan; never triggers the parent card's click. */
export function OwnerLink({ address, truncated = false }: { address: string; truncated?: boolean }) {
  const text =
    truncated && address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
  return (
    <a
      className="owner-link"
      href={`${BASESCAN}${address}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      {text}
    </a>
  );
}
