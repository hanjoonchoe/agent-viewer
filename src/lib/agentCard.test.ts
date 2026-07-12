import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchAgentCard, parseCard } from './agentCard';

describe('parseCard', () => {
  it('extracts description, image and x402 support', () => {
    const card = parseCard({ description: 'a cloud', image: 'https://x/img.png', x402support: true });
    expect(card).toMatchObject({ description: 'a cloud', image: 'https://x/img.png', x402: true });
  });

  it('falls back to iconUrl and treats non-boolean x402support as false', () => {
    expect(parseCard({ iconUrl: 'https://x/icon.png', x402support: 'yes' })).toMatchObject({
      image: 'https://x/icon.png',
      x402: false,
    });
  });

  it('accepts both x402Support spellings seen in real cards', () => {
    expect(parseCard({ x402Support: true })?.x402).toBe(true);
    expect(parseCard({ x402support: true })?.x402).toBe(true);
  });

  it('extracts category and tags from vendor extensions', () => {
    const card = parseCard({
      extensions: { 'indie.money': { category: 'business', tags: ['automation'] } },
    });
    expect(card?.category).toBe('business');
    expect(card?.tags).toEqual(['automation']);
  });

  it('extracts skills with micro-USD pricing converted to dollars', () => {
    const card = parseCard({
      skills: [
        {
          name: 'smoke',
          tags: ['automation'],
          extensions: {
            'indie.money': { pricing: { purchasePriceMicroUsd: 10_000_000, executionPriceMicroUsd: 5_000_000 } },
          },
        },
        { notAName: true }, // malformed skills are dropped
      ],
    });
    expect(card?.skills).toEqual([
      { name: 'smoke', tags: ['automation'], purchaseUsd: 10, executionUsd: 5 },
    ]);
  });

  it('rejects non-object payloads', () => {
    expect(parseCard(null)).toBeNull();
    expect(parseCard('nope')).toBeNull();
    expect(parseCard(42)).toBeNull();
  });
});

describe('fetchAgentCard', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('falls back to the agent-finder proxy when the direct fetch fails (CORS)', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch')) // browser CORS failure
      .mockResolvedValueOnce({ ok: true, json: async () => ({ description: 'via proxy' }) });
    vi.stubGlobal('fetch', fetchMock);

    const card = await fetchAgentCard('https://no-cors.example/card.json');

    expect(card?.description).toBe('via proxy');
    expect(fetchMock.mock.calls[0][0]).toBe('https://no-cors.example/card.json');
    expect(fetchMock.mock.calls[1][0]).toContain('/api/card?uri=https%3A%2F%2Fno-cors.example%2Fcard.json');
  });

  it('caches a null result when both direct and proxy fetches fail', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('offline'));
    vi.stubGlobal('fetch', fetchMock);

    expect(await fetchAgentCard('https://dead.example/card.json')).toBeNull();
    expect(await fetchAgentCard('https://dead.example/card.json')).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2); // direct + proxy once; second call served from cache
  });
});
