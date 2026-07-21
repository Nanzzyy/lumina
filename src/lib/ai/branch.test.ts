import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BranchManager, runAIAgent } from './branch';
import { Agent } from './agent';
import { registerBuiltinTools } from './tools/builtin';
import { clearTools } from './tools/registry';
import type { ModelAdapter } from './types';

const mockModel: ModelAdapter = {
  provider: 'test',
  call: vi.fn(async (req) => ({
    content: '[]',
    toolCalls: [
      { id: 'tc1', name: 'document.read', args: { path: '/' } },
    ],
  })),
};

describe('branch-first AI (ADR-026)', () => {
  let bm: BranchManager;

  beforeEach(() => {
    clearTools();
    registerBuiltinTools();
    bm = new BranchManager();
  });

  it('fork creates a new session', () => {
    const s = bm.fork('designer', 'suggest-theme', 'assist');
    expect(s.sessionId).toBeTruthy();
    expect(s.branchName).toContain('ai-designer');
    expect(s.status).toBe('planning');
    expect(s.mode).toBe('assist');
  });

  it('storePatch transitions to awaiting_approval in assist mode', () => {
    const s = bm.fork('designer', 'suggest-theme', 'assist');
    bm.storePatch(s.sessionId, [{ op: 'replace', path: '/color', value: '#ff6600' }], {
      agent: 'designer', planId: 'p1', reason: 'Theme suggestion', confidence: 0.9,
      tools: ['document.read'], durationMs: 100, intent: 'suggest-theme', mode: 'assist',
    });
    expect(bm.getSession(s.sessionId)!.status).toBe('awaiting_approval');
  });

  it('autonomous mode auto-merges via storePatch', () => {
    const s = bm.fork('designer', 'suggest-theme', 'autonomous');
    bm.storePatch(s.sessionId, [{ op: 'add', path: '/new', value: 'auto' }], {
      agent: 'designer', planId: 'p1', reason: 'auto', confidence: 1,
      tools: [], durationMs: 0, intent: 'suggest-theme', mode: 'autonomous',
    });
    expect(bm.getSession(s.sessionId)!.status).toBe('merged');
  });

  it('observe mode auto-discards via storePatch', () => {
    const s = bm.fork('observer', 'audit-accessibility', 'observe');
    bm.storePatch(s.sessionId, [], {
      agent: 'observer', planId: 'p1', reason: 'observe', confidence: 1,
      tools: [], durationMs: 0, intent: 'audit-accessibility', mode: 'observe',
    });
    expect(bm.getSession(s.sessionId)!.status).toBe('discarded');
  });

  it('accept merges and returns the patch', () => {
    const s = bm.fork('designer', 'suggest-color', 'assist');
    bm.storePatch(s.sessionId, [{ op: 'replace', path: '/c', value: 'red' }], {
      agent: 'd', planId: 'p1', reason: 'r', confidence: 0.8,
      tools: [], durationMs: 0, intent: 'suggest-color', mode: 'assist',
    });
    const patch = bm.accept(s.sessionId);
    expect(patch).toHaveLength(1);
    expect(bm.getSession(s.sessionId)!.status).toBe('merged');
  });

  it('discard sets status to discarded', () => {
    const s = bm.fork('designer', 'suggest-color', 'assist');
    bm.discard(s.sessionId);
    expect(bm.getSession(s.sessionId)!.status).toBe('discarded');
  });

  it('cleanup removes session', () => {
    const s = bm.fork('d', 'animate', 'assist');
    bm.cleanup(s.sessionId);
    expect(bm.getSession(s.sessionId)).toBeUndefined();
  });

  it('runAIAgent integrates Agent + BranchManager', async () => {
    const agent = new Agent('tester', 'Tester', ['suggest-theme'], 'assist', mockModel);
    const { session, patch } = await runAIAgent(agent, bm, 'suggest-theme', 'Project');
    expect(session.status).toBe('awaiting_approval');
    expect(patch).toBeDefined();
  });

  it('observe agent returns empty patch without waiting for approval', async () => {
    const agent = new Agent('obs', 'Observer', ['audit-accessibility'], 'observe', mockModel);
    const { session, patch } = await runAIAgent(agent, bm, 'audit-accessibility', 'Project');
    expect(session.status).toBe('discarded');
    expect(patch).toEqual([]);
  });
});
