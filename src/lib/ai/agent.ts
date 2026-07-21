/**
 * Agent Runtime — ADR-025, ADR-026.
 *
 * The AI Runtime is a plugin with `ai` permission. It:
 * 1. Receives an intent (from user command, tool, or event).
 * 2. The Planner creates an ExecutionPlan (list of tool calls).
 * 3. The Executor runs the plan through the ToolRegistry.
 * 4. The PatchGenerator converts results to a DocumentPatch.
 * 5. The patch goes through the Safety Layer → History → Resolution Pipeline.
 *
 * Provider-agnostic: any ModelAdapter (Claude, OpenAI, Gemini, Llama, Ollama)
 * can back the Planner.
 */

import { genId } from '../core/id';
import type {
  ModelAdapter, ModelRequest, ExecutionPlan, PlanStep, ExecutorResult,
  ToolResult, AIIntent, HumanMode, AIActionMetadata,
} from './types';
import { callTool } from './tools/registry';

export class PromptBuilder {
  static buildPlanPrompt(intent: AIIntent, context: string, selection?: string[]): string {
    return `You are a design assistant for Lumina, a visual website builder.
Intent: ${intent}
Context: ${context}
${selection?.length ? `Selected nodes: ${selection.join(', ')}` : ''}

Create a step-by-step plan using the available tools. Output each step as a tool call with its arguments.`;
  }
}

// ─── Planner ───────────────────────────────────────────────
export class Planner {
  constructor(private model: ModelAdapter) {}

  async plan(intent: AIIntent, context: string, selection?: string[]): Promise<ExecutionPlan> {
    const planId = genId('plan');
    const response = await this.model.call({
      systemPrompt: 'You are a design planner. Given an intent and context, produce a sequence of tool calls.',
      messages: [{ role: 'user', content: PromptBuilder.buildPlanPrompt(intent, context, selection) }],
    });
    // Parse tool calls from model response into plan steps
    const steps: PlanStep[] = (response.toolCalls ?? []).map((tc, i) => ({
      stepId: `${planId}_step_${i}`,
      tool: tc.name,
      args: tc.args,
      description: `Step ${i + 1}: ${tc.name}`,
    }));
    return { planId, intent, steps, reasoning: response.content };
  }
}

// ─── Executor ──────────────────────────────────────────────
export class Executor {
  async execute(plan: ExecutionPlan): Promise<ExecutorResult> {
    const results: ToolResult[] = [];
    for (const step of plan.steps) {
      const result = await callTool(step.tool, step.args);
      results.push(result);
    }
    return { planId: plan.planId, results };
  }
}

// ─── PatchGenerator ────────────────────────────────────────
export class PatchGenerator {
  constructor(private model: ModelAdapter) {}

  async generate(executorResult: ExecutorResult, context: string): Promise<{ patch: import('../core/history').DocumentPatch; reasoning: string }> {
    const summary = JSON.stringify(executorResult.results);
    const response = await this.model.call({
      systemPrompt: 'You are a patch generator. Given tool results, produce an RFC6902 JSON Patch that applies the changes to the document.',
      messages: [{ role: 'user', content: `Context: ${context}\nTool results: ${summary}\n\nProduce a JSON Patch array that represents the changes to apply.` }],
    });
    try {
      const patch = JSON.parse(response.content);
      return { patch, reasoning: response.content };
    } catch {
      return { patch: [], reasoning: response.content };
    }
  }
}

// ─── Agent ─────────────────────────────────────────────────
export class Agent {
  public readonly planner: Planner;
  public readonly executor: Executor;
  public readonly patchGenerator: PatchGenerator;

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly capabilities: AIIntent[],
    public readonly mode: 'observe' | 'assist' | 'autonomous',
    model: ModelAdapter,
  ) {
    this.planner = new Planner(model);
    this.executor = new Executor();
    this.patchGenerator = new PatchGenerator(model);
  }

  async run(
    intent: AIIntent,
    context: string,
    selection?: string[],
  ): Promise<{
    plan: ExecutionPlan;
    results: ExecutorResult;
    patch: import('../core/history').DocumentPatch;
    metadata: AIActionMetadata;
  }> {
    const start = Date.now();

    if (this.mode === 'observe') {
      return {
        plan: { planId: genId('plan'), intent, steps: [] },
        results: { planId: '', results: [] },
        patch: [],
        metadata: {
          agent: this.id, planId: '', reason: 'Observe mode — read-only analysis',
          confidence: 1, tools: [], durationMs: Date.now() - start, intent, mode: 'observe',
        },
      };
    }

    const plan = await this.planner.plan(intent, context, selection);
    const results = await this.executor.execute(plan);
    const { patch, reasoning } = await this.patchGenerator.generate(results, context);

    return {
      plan,
      results,
      patch,
      metadata: {
        agent: this.id,
        planId: plan.planId,
        reason: reasoning,
        confidence: 0.9,
        tools: plan.steps.map((s) => s.tool),
        durationMs: Date.now() - start,
        intent,
        mode: this.mode,
      },
    };
  }
}
