import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchAgents } from './api';
import { statusOf, type AgentsResponse } from './types';

afterEach(() => vi.unstubAllGlobals());

describe('statusOf', () => {
  it('dead liveness wins over availability', () => {
    expect(statusOf({ availability: 'available', liveness: 'dead' })).toBe('dead');
  });
  it('maps available / unknown / unavailable', () => {
    expect(statusOf({ availability: 'available', liveness: 'alive' })).toBe('available');
    expect(statusOf({ availability: 'unknown', liveness: 'unknown' })).toBe('unknown');
    expect(statusOf({ availability: 'unavailable', liveness: 'unknown' })).toBe('unavailable');
  });
});

describe('fetchAgents', () => {
  it('builds the URL with params and parses the response', async () => {
    const payload: AgentsResponse = {
      network: 'base-sepolia',
      chainId: 84532,
      fromBlock: '100',
      count: 0,
      agents: [],
    };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => payload });
    vi.stubGlobal('fetch', fetchMock);

    const res = await fetchAgents({ apiBase: 'http://x', max: 5 });

    expect(fetchMock).toHaveBeenCalledWith('http://x/api/agents?max=5', expect.anything());
    expect(res.chainId).toBe(84532);
  });

  it('throws on non-2xx', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }));
    await expect(fetchAgents()).rejects.toThrow('HTTP 500');
  });
});
