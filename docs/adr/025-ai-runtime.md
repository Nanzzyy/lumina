# ADR-025: AI Runtime

- Status: Accepted (2026-07-19)
- Date: 2026-07-19
- Phase gate: P8 (must be Accepted before any P8 code)

## Context
ADR-006 defined the AI provider contract: `AIRequest { intent, doc, prompt } → AIResult { patch, explanation, confidence, risk }`. ADR-010 defined the universal mutation language (RFC6902 DocumentPatch). ADR-016 defined the Resolution Pipeline. ADR-024 defined the Plugin Runtime (sandbox, capability-gated API).

AI is therefore not a special system — it's a **plugin with an `ai` capability** that consumes the same APIs every other extension uses. This ADR formalizes how the AI module: selects a provider, negotiates capabilities, runs inference (agent loop with planning + tool-calling + patching), and validates the output before it enters history.

## Decision

### Architecture
```
User Intent (prompt, selection, context)
        ↓
AI Runtime
  ├─ Provider Registry (Claude default, OpenAI/Gemini/Llama via plugin)
  ├─ Agent Loop (plan → act → observe → patch)
  ├─ Safety Layer (validate → simulate → diff → user accept)
  └─ Patch → History (ADR-010) → Resolution Pipeline (ADR-016)
```

### Provider Registry
Providers are registered via the Plugin mechanism (ADR-005 `aiProviders` in manifest). The default provider is Claude. Each provider declares its capabilities:
```ts
interface AIProviderDef {
  id: string;
  capabilities: AICapability[];
  model?: string;          // e.g. "claude-sonnet-5"
  config?: { apiKeyEnv?: string; maxTokens?: number };
}
```

### Agent Loop
For complex intents (generate-document, improve-layout), the AI Runtime runs a multi-step agent loop:
1. **Plan:** propose an operation sequence (read context → generate patch → verify)
2. **Act:** call the provider with the current context
3. **Observe:** validate the returned patch against the document schema
4. **Repeat** until the agent signals done or a max-iterations cap is reached

Each step produces a `DocumentPatch` that goes through the Safety Layer individually.

### Safety Layer (unchanged from ADR-006)
```
Proposed Patch → SchemaValidator → Simulation (dry-run resolve) → Diff (human-readable) → user accept → History command → Apply
```
The AI never bypasses this pipeline.

### Relationship to ADR-006
ADR-006 remains the binding contract between AI and the platform. ADR-025 organizes the *runtime* that hosts AI: provider selection, agent orchestration, and multi-step interaction. The `AIResult` shape (with `confidence`, `risk`, `reason`) is unchanged.

## Consequences
- AI is a plugin with `ai` permission — it runs in the same sandboxed environment as any other plugin (Worker, capability-gated).
- The agent loop makes AI capable of multi-step design tasks (generate → refine → finalize) without changing the provider contract.
- Provider registry is extensible via the existing Plugin mechanism — no core changes to add a new model.

## Alternatives
- **AI as a built-in service (not a plugin):** rejected — would create a privileged access path that plugins can't replicate.
- **Single-step AI only (no agent loop):** rejected — too limited for generate-document or improve-layout; the agent loop is optional per intent.
