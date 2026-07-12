import { useEffect, useState } from 'react';
import { AgentDetail } from './components/AgentDetail';
import { AgentList } from './components/AgentList';
import { Controls, AUTO_RELOAD_SECONDS } from './components/Controls';
import { FilterBar } from './components/FilterBar';
import { RawDialog } from './components/RawDialog';
import { InfoIcon, SpinnerIcon } from './components/icons';
import { useAgents, type AgentsQuery } from './hooks/useAgents';
import { applyView, type ViewOptions } from './lib/filtering';
import type { Agent } from './lib/types';

const PAGE_SIZE = 12;
const INITIAL_QUERY: AgentsQuery = { max: 200 };
const INITIAL_VIEW: ViewOptions = { statuses: new Set(), protocols: new Set(), sort: 'id-desc' };

interface RawView {
  title: string;
  data: unknown;
}

/**
 * Page shell: sticky header (brand, network badge, query controls), the
 * filterable/paginated agent grid, and the detail / raw-JSON dialogs.
 * Server state lives in {@link useAgents}; everything else here is view
 * state (filters, page, dialogs, auto-reload).
 */
export default function App() {
  const { state, load, reload } = useAgents(INITIAL_QUERY);
  const [view, setView] = useState<ViewOptions>(INITIAL_VIEW);
  const [page, setPage] = useState(0);
  const [auto, setAuto] = useState(false);
  const [raw, setRaw] = useState<RawView | null>(null);
  const [selected, setSelected] = useState<Agent | null>(null);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(reload, AUTO_RELOAD_SECONDS * 1000);
    return () => clearInterval(id);
  }, [auto, reload]);

  const showRawAgent = (a: Agent) => setRaw({ title: `agent #${a.agentId}`, data: a });

  const ready = state.status === 'ready' ? state : null;
  const filtered = ready ? applyView(ready.data.agents, view) : [];
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1); // a smaller result set can strand `page` past the end
  const visible = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  return (
    <div className="page">
      <header className="site-header">
        <nav className="nav">
          <span className="nav-brand">
            agent <span className="accent">·</span> <span className="accent">viewer</span>
          </span>
          {ready && (
            <span className="tag tag-outline network-tag">
              <span className="dot" />
              {ready.data.network} · {ready.data.chainId}
            </span>
          )}
          <Controls
            initial={INITIAL_QUERY}
            busy={state.status === 'loading'}
            auto={auto}
            onLoad={(query) => {
              setPage(0);
              load(query);
            }}
            onAutoChange={setAuto}
            onShowRaw={() => ready && setRaw({ title: 'API response', data: ready.data })}
            rawDisabled={!ready}
          />
        </nav>
      </header>

      <main className="main">
        {state.status === 'loading' && (
          <div className="state-panel">
            <SpinnerIcon />
            <div className="label">Scanning the chain…</div>
          </div>
        )}

        {state.status === 'error' && (
          <div className="notice error">
            <InfoIcon />
            <span>Could not reach the API: {state.message}</span>
          </div>
        )}

        {ready && (
          <>
            <FilterBar
              view={view}
              onChange={(next) => {
                setView(next);
                setPage(0);
              }}
            />
            <p className="meta" data-testid="meta">
              <span>
                <span className="mono">{ready.data.count}</span> agents
              </span>
              <span className="sep">·</span>
              <span>
                from block <span className="mono">{ready.data.fromBlock}</span>
              </span>
              <span className="sep">·</span>
              <span>
                refreshed <span className="mono">{ready.refreshedAt}</span>
              </span>
              {filtered.length !== ready.data.agents.length && (
                <>
                  <span className="sep">·</span>
                  <span>
                    <span className="mono">{filtered.length}</span> matching
                  </span>
                </>
              )}
            </p>

            {filtered.length === 0 ? (
              <div className="notice">
                <InfoIcon />
                <span>No agents found in this range.</span>
              </div>
            ) : (
              <>
                <AgentList agents={visible} onSelect={setSelected} onShowRaw={showRawAgent} />
                <nav className="pager">
                  <button className="btn btn-secondary" disabled={current === 0} onClick={() => setPage(current - 1)}>
                    ‹ prev
                  </button>
                  <span>
                    page <span className="mono">{current + 1} / {pages}</span>
                  </span>
                  <button
                    className="btn btn-secondary"
                    disabled={current >= pages - 1}
                    onClick={() => setPage(current + 1)}
                  >
                    next ›
                  </button>
                </nav>
              </>
            )}
          </>
        )}
      </main>

      {selected && !raw && (
        <AgentDetail agent={selected} onClose={() => setSelected(null)} onShowRaw={showRawAgent} />
      )}

      {raw && <RawDialog title={raw.title} data={raw.data} onClose={() => setRaw(null)} />}
    </div>
  );
}
