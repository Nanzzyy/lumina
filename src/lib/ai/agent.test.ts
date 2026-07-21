import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Agent, Planner, Executor, PatchGenerator } from './agent';
import { registerBuiltinTools } from './tools/builtin';
import { clearTools, callTool, listTools } from './tools/registry';
import type { ModelAdapter, ExecutionPlan, ToolResult } from './types';

const mockModel: ModelAdapter = {
  provider: 'test',
  call: vi.fn(async (req) => ({
    content: '[]',
    toolCalls: [
      { id: 'tc1', name: 'document.read', args: { path: '/' } },
      { id: 'tc2', name: 'theme.suggest', args: { primary: '#ff6600' } },
    ],
  })),
};

const simpleModel: ModelAdapter = {
  provider: 'simple',
  call: vi.fn(async (req) => ({
    content: JSON.stringify([{ op: 'replace', path: '/color', value: '#ff6600' }]),
    toolCalls: [],
  })),
};

describe('AI Agent Runtime (ADR-025/026)', () => {
  beforeEach(() => {
    clearTools();
    registerBuiltinTools();
  });

  it('tool registry lists built-in tools', () => {
    const tools = listTools();
    expect(tools.length).toBeGreaterThanOrEqual(8);
    expect(tools.some((t) => t.name === 'document.read')).toBe(true);
    expect(tools.some((t) => t.name === 'history.branch')).toBe(true);
  });

  it('callTool returns structured result', async () => {
    const r = await callTool('document.read', { path: '/project' });
    expect(r.success).toBe(true);
    expect(r.name).toBe('document.read');
  });

  it('callTool handles unknown tool gracefully', async () => {
    const r = await callTool('unknown', {});
    expect(r.success).toBe(false);
    expect(r.error).toContain('not found');
  });

  it('Planner creates an ExecutionPlan from model tool calls', async () => {
    const planner = new Planner(mockModel);
    const plan = await planner.plan('suggest-theme', 'Wedding invitation project');
    expect(plan.planId).toBeTruthy();
    expect(plan.intent).toBe('suggest-theme');
    expect(plan.steps.length).toBe(2);
    expect(plan.steps[0].tool).toBe('document.read');
  });

  it('Executor runs plan and returns results', async () => {
    const plan: ExecutionPlan = {
      planId: 'plan_01', intent: 'suggest-theme',
      steps: [
        { stepId: 's1', tool: 'selection.read', args: {}, description: 'read selection' },
        { stepId: 's2', tool: 'theme.read', args: { layer: 'semantic' }, description: 'read theme' },
      ],
    };
    const executor = new Executor();
    const result = await executor.execute(plan);
    expect(result.planId).toBe('plan_01');
    expect(result.results.length).toBe(2);
    expect(result.results[0].success).toBe(true);
  });

  it('PatchGenerator produces a patch from tool results', async () => {
    const gen = new PatchGenerator(simpleModel);
    const results = { planId: 'p1', results: [{ name: 'theme.suggest', success: true, data: { suggested: { primary: '#ff6600' } } }] };
    const { patch } = await gen.generate(results, 'Wedding project');
    expect(patch).toBeDefined();
  });

  it('Agent.run in assist mode produces plan + results + patch + metadata', async () => {
    const agent = new Agent('designer', 'Design Assistant', ['suggest-theme'], 'assist', mockModel);
    const output = await agent.run('suggest-theme', 'Wedding');
    expect(output.plan).toBeDefined();
    expect(output.results).toBeDefined();
    expect(output.patch).toBeDefined();
    expect(output.metadata.agent).toBe('designer');
    expect(output.metadata.planId).toBeTruthy();
    expect(output.metadata.confidence).toBeGreaterThan(0);
    expect(output.metadata.tools.length).toBeGreaterThan(0);
    expect(output.metadata.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('observe mode returns empty patch', async () => {
    const agent = new Agent('observer', 'Observer', ['suggest-theme'], 'observe', mockModel);
    const output = await agent.run('suggest-theme', 'Project');
    expect(output.patch).toEqual([]);
    expect(output.metadata.mode).toBe('observe');
  });
});
