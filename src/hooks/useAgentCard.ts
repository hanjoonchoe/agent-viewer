import { useEffect, useState } from 'react';
import { fetchAgentCard, type AgentCardInfo } from '../lib/agentCard';
import type { Agent } from '../lib/types';

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
