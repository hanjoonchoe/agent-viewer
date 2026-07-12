import { StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import type { Agent, AgentsResponse } from './lib/types';

afterEach(() => vi.unstubAllGlobals());

const agent: Agent = {
  agentId: '1',
  owner: '0xabc',
  name: 'Alpha',
  cardOk: true,
  availability: 'available',
  liveness: 'alive',
  services: [],
  tokenURI: 'https://card',
};

const payload: AgentsResponse = {
  network: 'base-sepolia',
  chainId: 84532,
  fromBlock: '100',
  count: 1,
  agents: [agent],
};

// A fetch that resolves on a later tick and rejects if the caller aborts first,
// like the real one. Records every URL it was called with.
function stubFetch() {
  const urls: string[] = [];
  vi.stubGlobal('fetch', (url: string, init?: RequestInit) => {
    urls.push(url);
    return new Promise((resolve, reject) => {
      init?.signal?.addEventListener('abort', () =>
        reject(new DOMException('The user aborted a request.', 'AbortError')),
      );
      setTimeout(() => resolve({ ok: true, status: 200, json: async () => payload }), 0);
    });
  });
  return urls;
}

describe('App', () => {
  it('renders the agents, network badge and meta line once loaded', async () => {
    stubFetch();
    render(<App />);

    expect(await screen.findByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('base-sepolia · 84532')).toBeInTheDocument();
    expect(screen.getByTestId('meta')).toHaveTextContent('1 agents');
    expect(screen.getByTestId('meta')).toHaveTextContent('from block 100');
  });

  it('refetches with the max / fromBlock controls on Reload', async () => {
    const urls = stubFetch();
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Alpha');

    await user.clear(screen.getByLabelText('max'));
    await user.type(screen.getByLabelText('max'), '5');
    await user.type(screen.getByLabelText('from block'), '43840209');
    await user.click(screen.getByRole('button', { name: /Reload/ }));

    await screen.findByText('Alpha');
    const apiCalls = urls.filter((u) => u.includes('/api/agents'));
    expect(apiCalls.at(-1)).toContain('max=5');
    expect(apiCalls.at(-1)).toContain('fromBlock=43840209');
  });

  it('filters out agents whose status is not selected', async () => {
    stubFetch();
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Alpha');

    // Alpha is available; selecting only "dead" must hide it.
    await user.click(screen.getByRole('checkbox', { name: 'dead' }));
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    expect(screen.getByText('No agents found in this range.')).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'dead' }));
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  it('opens the raw API response dialog', async () => {
    stubFetch();
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Alpha');

    await user.click(screen.getByRole('button', { name: 'raw' }));
    expect(screen.getByRole('dialog', { name: 'API response' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the agent detail dialog when a card is clicked', async () => {
    stubFetch();
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Alpha');

    await user.click(screen.getByRole('button', { name: 'agent 1 details' }));
    const dialog = screen.getByRole('dialog', { name: 'agent #1' });
    expect(dialog).toHaveTextContent('Alpha');
    expect(dialog).toHaveTextContent('0xabc');

    await user.click(screen.getByRole('button', { name: 'close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('card raw button opens raw JSON, not the detail dialog', async () => {
    stubFetch();
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Alpha');

    await user.click(screen.getByRole('button', { name: 'View raw JSON for agent 1' }));
    const dialog = screen.getByRole('dialog', { name: 'agent #1' });
    expect(dialog).toHaveTextContent('"agentId": "1"');
  });

  it('paints the quick first slice while the full scan is still running', async () => {
    let resolveFull!: (v: unknown) => void;
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        // quick slice (max=24) answers immediately
        .mockResolvedValueOnce({ ok: true, status: 200, json: async () => payload })
        // full scan (max=200) stays pending until we release it
        .mockImplementationOnce(() => new Promise((r) => (resolveFull = r)))
        // card-enrichment fetches
        .mockResolvedValue({ ok: true, status: 200, json: async () => ({}) }),
    );
    render(<App />);

    // Grid is up from the quick slice, with the background update indicated.
    expect(await screen.findByText('Alpha')).toBeInTheDocument();
    expect(screen.getByTestId('meta')).toHaveTextContent('updating…');

    resolveFull({ ok: true, status: 200, json: async () => payload });
    await screen.findByText('Alpha');
  });

  it('keeps showing stale agents while a reload is in flight', async () => {
    stubFetch();
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Alpha');

    vi.stubGlobal('fetch', () => new Promise(() => {})); // reload never resolves
    await user.click(screen.getByRole('button', { name: /Reload|Loading/ }));

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByText(/Scanning the chain/)).not.toBeInTheDocument();
    expect(screen.getByTestId('meta')).toHaveTextContent('updating…');
  });

  it('does not surface its own aborted fetch as an error (StrictMode remount)', async () => {
    stubFetch();
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    // StrictMode aborts the first effect's fetch; that rejection must not land
    // in the error panel, and the second run must still settle the UI.
    expect(await screen.findByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByText(/Could not reach the API/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Scanning the chain/)).not.toBeInTheDocument();
  });
});
