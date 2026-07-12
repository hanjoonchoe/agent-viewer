import type { Agent } from '../lib/types';
import { useAgentCard } from '../hooks/useAgentCard';
import type { SkillInfo } from '../lib/agentCard';
import { Dialog } from './Dialog';
import { SpinnerIcon, StatusIcon } from './icons';
import { CardTagChips, Corners, OwnerLink, ProtocolChips, StatusPill } from './shared';

const usd = (v: number) => `$${v.toFixed(2)}`;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="detail-row">
      <span className="row-label">{label}</span>
      <span className="detail-value">{children}</span>
    </div>
  );
}

function Skill({ skill }: { skill: SkillInfo }) {
  return (
    <div className="skill">
      <div className="skill-head">
        <span className="skill-name">{skill.name}</span>
        {skill.tags.map((t) => (
          <span key={t} className="tag tag-proto tag-neutral">
            {t}
          </span>
        ))}
      </div>
      {(skill.purchaseUsd !== undefined || skill.executionUsd !== undefined) && (
        <div className="skill-pricing">
          {skill.purchaseUsd !== undefined && (
            <span>
              <span className="row-label">purchase</span> <span className="mono">{usd(skill.purchaseUsd)}</span>
            </span>
          )}
          {skill.executionUsd !== undefined && (
            <span>
              <span className="row-label">execution</span> <span className="mono">{usd(skill.executionUsd)}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Modal with the full record of one agent: status/protocol/category chips,
 * card-enriched description and thumbnail, on-chain fields (owner linked to
 * Basescan, token URI, services), and skills with vendor pricing. Closes on
 * backdrop click or the ✕ button.
 */
export function AgentDetail({
  agent,
  onClose,
  onShowRaw,
}: {
  agent: Agent;
  onClose: () => void;
  onShowRaw: (agent: Agent) => void;
}) {
  const { card, fetching } = useAgentCard(agent);
  return (
    <Dialog label={`agent #${agent.agentId}`} onClose={onClose}>
      <div className="card-head">
        <span className="agent-id">#{agent.agentId}</span>
        <button type="button" className="btn btn-ghost btn-icon" aria-label="close" onClick={onClose}>
          ✕
        </button>
      </div>
      <h2 className="dialog-title">{agent.name ?? 'unnamed agent'}</h2>

      <div className="card-id-row chips">
        <StatusPill agent={agent} />
        <ProtocolChips agent={agent} x402={card?.x402} />
        {card && <CardTagChips card={card} />}
      </div>

      {fetching && (
        <p className="card-fetching">
          <SpinnerIcon /> fetching agent card…
        </p>
      )}
      {card && (card.image || card.description) && (
        <div className="detail-media">
          {card.image && (
            <span className="thumb thumb-lg duotone blueprint">
              <Corners />
              <img src={card.image} alt="" />
            </span>
          )}
          {card.description && <p className="card-desc">{card.description}</p>}
        </div>
      )}

      <div className="detail-rows">
        <Row label="owner">
          <OwnerLink address={agent.owner} />
        </Row>
        <Row label="availability">{agent.availability}</Row>
        <Row label="liveness">{agent.liveness}</Row>
        <Row label="card">
          {agent.cardOk ? (
            <span className="card-resolved">
              <StatusIcon status="available" /> resolved
            </span>
          ) : (
            `unresolved · ${agent.cardReason ?? 'unknown'}`
          )}
        </Row>
        <Row label="token uri">
          {/^https?:\/\//.test(agent.tokenURI) ? (
            <a href={agent.tokenURI} target="_blank" rel="noopener noreferrer">
              {agent.tokenURI}
            </a>
          ) : (
            agent.tokenURI || '—'
          )}
        </Row>
        {agent.services.length > 0 && (
          <Row label="services">
            {agent.services.map((url) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="service-url">
                {url}
              </a>
            ))}
          </Row>
        )}
      </div>

      {card && card.skills.length > 0 && (
        <div className="skills-section">
          <span className="row-label">skills</span>
          {card.skills.map((s) => (
            <Skill key={s.name} skill={s} />
          ))}
        </div>
      )}

      <div className="dialog-actions">
        <button className="btn btn-secondary" onClick={() => onShowRaw(agent)}>
          {'{}'} raw json
        </button>
      </div>
    </Dialog>
  );
}
