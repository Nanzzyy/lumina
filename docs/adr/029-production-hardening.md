# ADR-029: Production Hardening

- Status: Accepted (2026-07-19)
- Date: 2026-07-19
- Phase gate: P10 (must be Accepted before any P10 code)

## Context
P1–P9 built Lumina OS: a visual builder platform with document engine, canvas editor, resolution pipeline, property/theme system, responsive/timeline, publish runtime, plugin SDK, AI runtime, and collaboration runtime. The architecture is complete. P10 is not about adding new subsystems — it is about making the existing platform **production-ready**: reliable, observable, performant, secure, deployable, maintainable.

## Decision
P10 is a **hardening phase**, not a feature phase. Work is organized into workstreams, each with clear exit criteria. No new ADRs for new engines. Changes to existing engine contracts require a superseding ADR (ADR-002).

### Workstreams

#### WS-1: Security
- **Auth & session:** Replace single `ADMIN_PASSWORD` with real auth (JWT or session tokens). Multi-user authentication with hashed credentials or OAuth.
- **CSP hardening:** Published output Content-Security-Policy — no `unsafe-inline` scripts, nonce/hash for styles.
- **API rate limiting & validation:** Schema validation on all API inputs (zod). Rate limiting per session. CORS configuration.
- **Secrets management:** Audit all env vars. No secrets in client bundles. Key rotation.
- **Dependency audit:** `pnpm audit` — resolve or suppress known vulnerabilities. Lockfile integrity.
- **Penetration testing:** XSS, CSRF, path traversal, injection, tenant isolation. Fix findings.

#### WS-2: Performance
- **Golden benchmark gate:** CI fails if the golden benchmark (1000-node project) exceeds budget (editor pan/zoom/drag < 16ms, publish build < 5s, runtime bundle < 20KB gzipped).
- **Lighthouse budget:** Published page scores ≥ 95 on Performance, Accessibility, Best Practices.
- **Bundle analysis:** `@next/analyze` on studio bundle. Code-split plugin/AI/collab runtimes (loaded on demand).
- **Memory profiling:** Detect leaks in History stack, Timeline, presence system. Cap heap growth per session.
- **Asset pipeline:** Enable WebP/AVIF encoding, responsive srcset, LQIP in production. Verify CDN cache hit rate targets.

#### WS-3: Observability
- **Structured logging:** JSON logs with correlated sessionId, requestId. Log levels (debug/info/warn/error). PII redaction.
- **Metrics:** Prometheus / OpenTelemetry endpoints. Key metrics: request latency, error rate, active sessions, timeline entries, history size, AI inference latency.
- **Tracing:** Distributed tracing (OpenTelemetry) across API → engine → DB → publish.
- **Health checks:** `/api/health` — DB connectivity, queue depth, version info.
- **Error tracking:** Uncaught exception handler. Plugin/AI error telemetry (already wired in P7/P8). Collab transport error reporting.

#### WS-4: Reliability
- **DB backup & recovery:** Automated WAL checkpoint. Daily snapshot + WAL archive. Restore dry-run in CI.
- **Migration resilience:** Schema versioning (ADR-002) with rollback testing. Migrations run in transactions. Monitor migration duration.
- **Graceful degradation:** When DB is down, the editor shows a maintenance page (not a crash). When AI provider is down, fall back to "offline" mode.
- **Error boundaries:** React error boundaries around canvas, inspector, panels. Crash in one panel doesn't take down the editor.

#### WS-5: Deployability
- **Docker image:** `Dockerfile` with multi-stage build (dependencies → build → run). Health check endpoint.
- **CI/CD pipeline:** GitHub Actions (or current CI). Stages: lint → test → build → benchmark → deploy.
- **Environment management:** Dev / staging / production config via env vars. No hardcoded secrets.
- **Zero-downtime deployment:** Graceful shutdown, DB connection pool drain, pending patches flushed before SIGTERM.

#### WS-6: Documentation & SDK
- **Architecture docs:** Finalize the docs/adr/ set. Generate an architecture decision log (ADL) from ADR frontmatter (depends/requiredBy/phase).
- **Plugin SDK guide:** Document PluginHost, PluginRuntime, capability model, lifecycle hooks. Publish example plugin.
- **API reference:** Auto-generated from route handlers (zod schemas → OpenAPI).
- **Migration guide:** How to upgrade from v0.x to v1.0. Breaking changes log.

### Exit criteria
1. Security audit passes (no critical/high findings).
2. Lighthouse ≥ 95 on published output.
3. Golden benchmark budget met in CI.
4. Health check + metrics + structured logging deployed.
5. DB backup & recovery verified.
6. Docker image builds and runs.
7. Plugin SDK guide published.
8. All P1–P9 tests green with no regressions.

## Consequences
- P10 takes longer than a single sprint — 8 workstreams is a scope. Prioritize WS-1 (Security) and WS-2 (Performance) as the gate. WS-3 through WS-6 are continuous improvement.
- No new engine contracts are added. Every change is a refinement of an existing contract.
- The existing 28 ADRs remain the complete set of architectural decisions. P10 may produce a few superseding ADRs if hardening requires contract changes.
