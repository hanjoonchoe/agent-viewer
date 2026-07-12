import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AgentList } from './AgentList';
import type { Agent } from '../lib/types';

// Card enrichment fetches tokenURI; keep unit tests off the network.
beforeEach(() => vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline'))));
afterEach(() => vi.unstubAllGlobals());

const agents: Agent[] = [
  {
    agentId: '1',
    owner: '0x6ae1B2C3D4E5F60718293A4B5C6D7E8F909192A9',
    name: 'Alpha',
    cardOk: true,
    availability: 'available',
    liveness: 'alive',
    services: ['https://a.example/a2a', 'https://a.example/mcp'],
    tokenURI: 'https://card',
  },
  {
    agentId: '2',
    owner: '0xdef',
    name: null,
    cardOk: false,
    cardReason: 'HTTP 404',
    availability: 'unavailable',
    liveness: 'unknown',
    services: [],
    tokenURI: 'ipfs://x',
  },
];

describe('AgentList', () => {
  it('renders resolved names and broken-card reasons', () => {
    render(<AgentList agents={agents} onShowRaw={vi.fn()} onSelect={vi.fn()} />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText(/HTTP 404/)).toBeInTheDocument();
  });

  it('shows a status pill and protocol chips per agent', () => {
    render(<AgentList agents={agents} onShowRaw={vi.fn()} onSelect={vi.fn()} />);
    expect(screen.getByText('available')).toBeInTheDocument();
    expect(screen.getByText('unavailable')).toBeInTheDocument();
    expect(screen.getByText('a2a')).toBeInTheDocument();
    expect(screen.getByText('mcp')).toBeInTheDocument();
  });

  it('links the truncated owner address to Basescan and lists services', () => {
    render(<AgentList agents={agents} onShowRaw={vi.fn()} onSelect={vi.fn()} />);
    const link = screen.getByRole('link', { name: '0x6ae1…92A9' });
    expect(link).toHaveAttribute(
      'href',
      'https://sepolia.basescan.org/address/0x6ae1B2C3D4E5F60718293A4B5C6D7E8F909192A9',
    );
    expect(screen.getByText('https://a.example/a2a')).toBeInTheDocument();
  });
});
