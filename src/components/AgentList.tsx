import { statusOf, type Agent } from '../lib/types';
import { useAgentCard } from '../hooks/useAgentCard';
import { protocolsOf, type Protocol } from '../lib/filtering';
import { BracesIcon, ImageOffIcon, StatusIcon } from './icons';

const PROTO_TAG: Record<Protocol, string> = { a2a: 'tag-accent', mcp: 'tag-neutral' };

const BASESCAN = 'https://sepolia.basescan.org/address/';

const truncate = (addr: string) => (addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr);

function Corners() {
  return (
    <>
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
    </>
  );
}

interface CardActions {
  /** Open the raw-JSON dialog for this agent. */
  onShowRaw: (agent: Agent) => void;
  /** Open the detail dialog for this agent. */
  onSelect: (agent: Agent) => void;
}

/**
 * One agent as a clickable card: id + protocol chips + status pill header,
 * name/description (card-enriched), owner link, and service endpoints.
 * The whole card opens the detail dialog; inner links stop propagation.
 */

function AgentCard({ agent, onShowRaw, onSelect }: { agent: Agent } & CardActions) {
  const status = statusOf(agent);
  const { card } = useAgentCard(agent);
  return (
    <li
      className="agent-card blueprint"
      data-status={status}
      role="button"
      tabIndex={0}
      aria-label={`agent ${agent.agentId} details`}
      onClick={() => onSelect(agent)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(agent);
        }
      }}
    >
      <Corners />
      <div className="card-head">
        <span className="card-id-row">
          <span className="agent-id">#{agent.agentId}</span>
          {protocolsOf(agent).map((p) => (
            <span key={p} className={`tag tag-proto ${PROTO_TAG[p]}`}>
              {p}
            </span>
          ))}
          {card?.x402 && <span className="tag tag-proto tag-outline">x402</span>}
        </span>
        <span className={`status-pill status-${status}`}>
          <StatusIcon status={status} />
          {status}
        </span>
      </div>

      {agent.name !== null ? (
        <div className="card-body-row">
          {card?.image && (
            <span className="thumb duotone blueprint">
              <Corners />
              <img src={card.image} alt="" loading="lazy" />
            </span>
          )}
          <div className="card-text">
            <div className="agent-name">{agent.name}</div>
            {card?.description && <p className="card-desc">{card.description}</p>}
            {card && (card.category || card.tags.length > 0) && (
              <div className="card-tags">
                {card.category && <span className="tag tag-proto tag-accent-2 uppercase">{card.category}</span>}
                {card.tags.map((t) => (
                  <span key={t} className="tag tag-proto tag-neutral">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="agent-name unnamed">unnamed agent</div>
          <div>
            <span className="no-card">
              <ImageOffIcon />
              no card · {agent.cardReason ?? 'unknown'}
            </span>
          </div>
        </>
      )}

      <div className="card-footer">
        <span className="row-label">owner</span>
        <a
          className="owner-link"
          href={`${BASESCAN}${agent.owner}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {truncate(agent.owner)}
        </a>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          title="View raw JSON"
          aria-label={`View raw JSON for agent ${agent.agentId}`}
          onClick={(e) => {
            e.stopPropagation();
            onShowRaw(agent);
          }}
        >
          <BracesIcon />
        </button>
      </div>

      {agent.services.length > 0 && (
        <div className="services">
          <span className="row-label">services</span>
          {agent.services.map((url) => (
            <span key={url} className="service-url">
              {url}
            </span>
          ))}
        </div>
      )}
    </li>
  );
}

/** Responsive grid of {@link AgentCard}s for the currently visible page. */
export function AgentList({ agents, onShowRaw, onSelect }: { agents: Agent[] } & CardActions) {
  return (
    <ul className="grid">
      {agents.map((a) => (
        <AgentCard key={a.agentId} agent={a} onShowRaw={onShowRaw} onSelect={onSelect} />
      ))}
    </ul>
  );
}
