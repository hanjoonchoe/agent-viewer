import { statusOf, type Agent } from './types';
import { useAgentCard, type SkillInfo } from './agentCard';
import { protocolsOf } from './filtering';
import { SpinnerIcon, StatusIcon } from './icons';

const BASESCAN = 'https://sepolia.basescan.org/address/';

const usd = (v: number) => `$${v.toFixed(2)}`;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="detail-row">
      <span className="row-label">{label}</span>
      <span className="detail-value">{children}</span>
    </div>
  );
}

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

export function AgentDetail({
  agent,
  onClose,
  onShowRaw,
}: {
  agent: Agent;
  onClose: () => void;
  onShowRaw: (agent: Agent) => void;
}) {
  const status = statusOf(agent);
  const { card, fetching } = useAgentCard(agent);
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-label={`agent #${agent.agentId}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-head">
          <span className="agent-id">#{agent.agentId}</span>
          <button type="button" className="btn btn-ghost btn-icon" aria-label="close" onClick={onClose}>
            ✕
          </button>
        </div>
        <h2 className="dialog-title">{agent.name ?? 'unnamed agent'}</h2>

        <div className="card-id-row chips">
          <span className={`status-pill status-${status}`}>
            <StatusIcon status={status} />
            {status}
          </span>
          {protocolsOf(agent).map((p) => (
            <span key={p} className="tag tag-proto tag-accent">
              {p}
            </span>
          ))}
          {card?.x402 && <span className="tag tag-proto tag-outline">x402</span>}
          {card?.category && <span className="tag tag-proto tag-accent-2 uppercase">{card.category}</span>}
          {card?.tags.map((t) => (
            <span key={t} className="tag tag-proto tag-neutral">
              {t}
            </span>
          ))}
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
            <a href={`${BASESCAN}${agent.owner}`} target="_blank" rel="noopener noreferrer">
              {agent.owner}
            </a>
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
      </div>
    </div>
  );
}
