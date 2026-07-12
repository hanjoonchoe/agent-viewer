import { describe, expect, it } from 'vitest';
import { applyView, protocolsOf, toggled } from './filtering';
import type { Agent } from './types';

function makeAgent(overrides: Partial<Agent>): Agent {
  return {
    agentId: '1',
    owner: '0x0',
    name: 'a',
    cardOk: true,
    availability: 'available',
    liveness: 'alive',
    services: [],
    tokenURI: '',
    ...overrides,
  };
}

const alive = makeAgent({ agentId: '1', name: 'Zed', services: ['https://x/a2a'] });
const dead = makeAgent({ agentId: '2', name: 'Ann', liveness: 'dead', services: ['https://x/mcp'] });
const unnamed = makeAgent({ agentId: '3', name: null });

describe('protocolsOf', () => {
  it('derives chips from service URLs', () => {
    expect(protocolsOf(alive)).toEqual(['a2a']);
    expect(protocolsOf(dead)).toEqual(['mcp']);
    expect(protocolsOf(unnamed)).toEqual([]);
  });
});

describe('applyView', () => {
  const all = [alive, dead, unnamed];
  const none = { statuses: new Set<never>(), protocols: new Set<never>(), sort: 'id-desc' as const };

  it('empty filter sets pass everything, sorted id-desc', () => {
    expect(applyView(all, none).map((a) => a.agentId)).toEqual(['3', '2', '1']);
  });

  it('filters by derived status and protocol', () => {
    expect(applyView(all, { ...none, statuses: new Set(['dead']) })).toEqual([dead]);
    expect(applyView(all, { ...none, protocols: new Set(['a2a']) })).toEqual([alive]);
  });

  it('sorts by name with unnamed agents last', () => {
    expect(applyView(all, { ...none, sort: 'name' }).map((a) => a.name)).toEqual(['Ann', 'Zed', null]);
  });
});

describe('toggled', () => {
  it('adds and removes without mutating the input', () => {
    const start = new Set(['a']);
    expect(toggled(start, 'b')).toEqual(new Set(['a', 'b']));
    expect(toggled(start, 'a')).toEqual(new Set());
    expect(start).toEqual(new Set(['a']));
  });
});
