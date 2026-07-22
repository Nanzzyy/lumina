# ADR-013: Security & Sandbox Model

- Status: Proposed
- Date: 2026-07-19
- Phase gate: P1 (model Accepted); hardening across phases

## Context
The platform executes third-party-ish code (plugins, AI-generated logic, expressions) and serves user-uploaded content to the public. Untrusted code and content must be contained so a malicious/broken plugin or asset can't hijack the editor, the published site, or other tenants.

## Decision
Layered isolation:

- **Plugin sandbox (ADR-005):** plugin `runtime` runs in a **Web Worker** (pure compute) or a **sandboxed iframe** (`sandbox` attr, no same-origin) for DOM-touching code. A capability/permission list in the manifest gates what the Runtime API exposes (can this plugin call `navigate`? `mutate`?). Default-deny.
- **Expression sandbox (ADR-004):** pure AST evaluator; no `eval`/`Function`/import/DOM/network. Total (never throws into render). Capability to read only declared variables.
- **AI patch safety (ADR-006):** validate → simulate → diff → accept; AI never applies directly; every patch undoable.
- **Asset safety (ADR-009):** MIME sniffed (not extension-trusted), size + dimension capped, SVG sanitized (strip `<script>`, event handlers) before serve; re-encoded to neutralize steganographic payloads where feasible.
- **Auth boundary:** studio routes stay behind `src/proxy.ts` cookie gate (single `ADMIN_PASSWORD` today). Multi-user RBAC lands in P7 (memberships/roles) — schema reserved. All API mutations require auth; CSRF via same-origin + cookie attributes.
- **Published output CSP:** emitted pages ship a strict Content-Security-Policy (no `unsafe-inline` scripts; styles via nonce/hash; plugin iframes sandboxed). Prevents stored-XSS via user content/variables.
- **Tenant isolation:** workspace scoping (ADR-001) enforced at the data-access layer — every query is workspace/project-scoped; no cross-tenant reads by construction.
- **Secrets:** `DB_PATH`, `ADMIN_PASSWORD`, `S3_ENDPOINT`, AI provider keys via env only; never in the document, never shipped to client.

## Consequences
- Plugins can't reach engine internals or the network without an explicit granted capability.
- One compromised asset/plugin can't pivot to other workspaces.
- Some convenience (inline scripts in custom CSS) is restricted; `node.props.__css` is sanitized, not raw-injected.

## Alternatives
- **Trust first-party only, no sandbox:** rejected — the moment marketplace/colab land, it's an XSS/Tenant-bypass incident.
- **Process-level isolation (separate server per plugin):** too heavy for P1; worker/iframe gives the practical boundary now, process isolation reserved for high-risk plugins later.
