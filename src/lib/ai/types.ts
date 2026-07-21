/**
 * AI Runtime types — ADR-025, ADR-026.
 *
 * Shared types for ModelAdapter, Planner, Executor, PatchGenerator, tools,
 * branch-first execution, human modes, and explainability metadata.
 */

import type { DocumentPatch } from '../core/history';

// ─── Provider-agnostic model adapter ───────────────────────
export type ModelProviderId = 'claude' | 'openai' | 'gemini' | 'llama' | 'ollama' | string;

export interface ModelConfig {
  provider: ModelProviderId;
  model?: string;       // e.g. "claude-sonnet-5", "gpt-4o"
  apiKeyEnv?: string;   // env var name for API key
  maxTokens?: number;
  temperature?: number;
}

export interface ModelRequest {
  systemPrompt?: string;
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  tools?: ToolDef[];
}

export interface ModelResponse {
  content: string;
  toolCalls?: { id: string; name: string; args: Record<string, unknown> }[];
  usage?: { promptTokens: number; completionTokens: number };
}

export interface ModelAdapter {
  readonly provider: ModelProviderId;
  call(req: ModelRequest): Promise<ModelResponse>;
}

// ─── Tools ─────────────────────────────────────────────────
export interface ToolDef {
  name: string;
  description: string;
  parameters: Record<string, unknown>;  // JSON Schema
}

export interface ToolResult {
  name: string;
  success: boolean;
  data: unknown;
  error?: string;
}

// ─── Planner ───────────────────────────────────────────────
export type AIIntent =
  | 'generate-document'
  | 'suggest-theme'
  | 'suggest-typography'
  | 'suggest-color'
  | 'improve-layout'
  | 'fix-responsive'
  | 'generate-copy'
  | 'generate-component'
  | 'audit-accessibility'
  | 'audit-seo'
  | 'animate';

export interface ExecutionPlan {
  planId: string;
  intent: AIIntent;
  steps: PlanStep[];
  reasoning?: string;
}

export interface PlanStep {
  stepId: string;
  tool: string;
  args: Record<string, unknown>;
  description: string;
}

export interface Planner {
  plan(intent: AIIntent, context: string, selection?: string[]): Promise<ExecutionPlan>;
}

// ─── Executor ──────────────────────────────────────────────
export interface ExecutorResult {
  planId: string;
  results: ToolResult[];
}

export interface Executor {
  execute(plan: ExecutionPlan): Promise<ExecutorResult>;
}

// ─── PatchGenerator ────────────────────────────────────────
export interface PatchGenerator {
  generate(executorResult: ExecutorResult, context: string): Promise<{ patch: DocumentPatch; reasoning: string }>;
}

// ─── Agent ─────────────────────────────────────────────────
export interface AgentConfig {
  id: string;
  name: string;
  provider: ModelProviderId;
  capabilities: AIIntent[];
  mode: HumanMode;
}

export type HumanMode = 'observe' | 'assist' | 'autonomous';

// ─── Explainability (ADR-026 §explainability) ─────────────
export interface AIActionMetadata {
  agent: string;
  planId: string;
  reason: string;
  confidence: number;     // 0..1
  tools: string[];        // tool names used
  durationMs: number;
  intent: AIIntent;
  mode: HumanMode;
}
