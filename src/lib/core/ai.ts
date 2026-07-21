/**
 * AI Provider Contract & Safety Layer — ADR-006.
 *
 * AI operates on a document *projection* only (AIDocumentView), never internals,
 * and proposes a DocumentPatch. The host validates → simulates → diffs → applies
 * via history (ADR-010). AIResult carries confidence/risk/reason for the UI
 * ("AI 93% sure this is safe"). Provider-agnostic; default provider is Claude.
 */

import type { DocumentPatch } from './history';

export type AICapability =
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

/** Declaration a plugin manifest uses to register a provider. */
export interface AIProviderDef {
  id: string;
  capabilities: AICapability[];
}

/**
 * A lossy, JSON-serializable view of the document handed to a provider. Contains
 * resolved variables/data/nodes/theme — enough to reason, nothing about engine
 * plumbing. Satisfies rule R3.
 */
export interface AIDocumentView {
  schemaVersion: number;
  variables: unknown;
  dataSources: unknown;
  nodes: unknown;
  theme: unknown;
  selection?: string[];
}

export interface AIRequest {
  intent: AICapability;
  doc: AIDocumentView;
  prompt?: string;
  selection?: string[];
}

export type AIRisk = 'low' | 'medium' | 'high';

export interface AIResult {
  patch: DocumentPatch;
  explanation: string;
  warnings?: string[];
  /** 0..1 — surfaced in UI as "AI N% sure". */
  confidence: number;
  /** Blast radius if the patch is wrong; gates auto-apply vs ask. */
  risk: AIRisk;
  /** One-line rationale. */
  reason: string;
  /** e.g. "12 nodes, 4 bindings". */
  estimatedImpact?: string;
}

export interface AIProvider {
  id: string;
  capabilities: AICapability[];
  run(req: AIRequest): Promise<AIResult>;
}
