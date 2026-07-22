# ADR-026: Agent Contract

- Status: Accepted (2026-07-19)
- Date: 2026-07-19
- Phase gate: P8 (must be Accepted before any P8 code)

## Context
ADR-025 defines the AI Runtime as a plugin-like service that runs an agent loop. But the agent itself — how it plans, calls tools, observes results, and produces patches — needs a formal contract so that different providers (Claude, OpenAI, Gemini, Llama) are interchangeable at the agent level, not just the inference level.

Without this contract, each provider would need a custom agent implementation, duplicating tool-calling logic, prompt templates, and error handling.

## Decision

### Agent interface
An Agent is a class (pure logic, no I/O) that produces a `DocumentPatch` given a context:
```ts
interface Agent {
  id: string;
  /** Human-readable name for UI display. */
  name: string;
  /** The provider this agent wraps. */
  providerId: string;
  /** Capabilities this agent supports. */
  capabilities: AICapability[];

  /** Run one step of the agent loop. Returns a patch or signals completion. */
  act(context: AgentContext): Promise<AgentStep>;
}

interface AgentContext {
  intent: AICapability;
  doc: AIDocumentView;         // ADR-006 projection
  prompt?: string;
  selection?: string[];
  history: DocumentPatch[];    // patches from previous steps
  toolRegistry: ToolRegistry;  // available tools (read schemas, list components, etc.)
}

type AgentStep =
  | { kind: 'patch'; patch: DocumentPatch; confidence: number; explanation: string }
  | { kind: 'done' }
  | { kind: 'error'; message: string; recoverable: boolean };
```

### Tools
Tools are the only way an agent reads or mutates the document. Each tool is a registered function with a schema:
```ts
interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;  // JSON Schema
  execute(params: unknown): Promise<unknown>;
}
```
Built-in tools include:
- `readDocument(path?)` — read the current document (or a subpath)
- `readSchema(componentId)` — get the PropSchema for a component
- `listComponents(category?)` — list available components
- `listTokens(layer?)` — list theme tokens
- `proposePatch(patch)` — submit a patch for validation (does not apply)
- `getTimeline()` — read history timeline

The agent cannot call engine internals directly — only through tools.

### Provider interchangeability
Any provider that implements the `Agent` interface works. The runtime selects the best agent for the intent based on capability declaration. A provider without a planning model uses a simpler "single-shot" agent (plan + act in one step), while frontier models use a multi-step agent.

### Relationship to existing contracts
- ADR-006 defines the AI provider contract (request/result shape).
- ADR-025 defines the AI Runtime (orchestration, provider registry, safety layer).
- ADR-026 defines the Agent contract (tool-calling, planning, interchangeability).

## Consequences
- Adding a new model provider = writing an `Agent` class that wraps it. No changes to the agent loop or tool registry.
- Tools are reusable across providers — the `readDocument` tool works identically for Claude and Llama.
- The agent loop is optional: a simple agent returns one `patch` step; a complex agent loops until `done`.

## Alternatives
- **Provider-specific agent implementations:** rejected — duplicates tool-calling and planning logic per provider.
- **No tool abstraction (agent calls APIs directly):** rejected — bypasses capability gating; an agent could mutate without validation.
