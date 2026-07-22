# ADR Dependency Graph

Generated from ADR frontmatter `dependsOn` fields. Shows relationships between all 29 Architecture Decision Records.

```mermaid
graph TD
  001 -->|required by| 003
  001 -->|required by| 014
  002 -->|required by| 016
  003 -->|required by| 004
  003 -->|required by| 016
  003 -->|required by| 017
  004 -->|required by| 016
  004 -->|required by| 017
  005 -->|required by| 013
  005 -->|required by| 024
  006 -->|required by| 025
  009 -->|required by| 022
  010 -->|required by| 006
  010 -->|required by| 014
  010 -->|required by| 016
  010 -->|required by| 020
  010 -->|required by| 025
  010 -->|required by| 027
  010 -->|required by| 028
  014 -->|required by| 015
  016 -->|required by| 017
  016 -->|required by| 018
  016 -->|required by| 019
  016 -->|required by| 021
  017 -->|required by| 019
  018 -->|required by| 017
  019 -->|required by| 021
  021 -->|required by| 023
  024 -->|required by| 025
  025 -->|required by| 026
  027 -->|required by| 028
  001-028 -->|all feed into| 029
```

## Legend

- **001–004**: Foundation (Document Model, Variables, Expressions)
- **005–006**: Plugin & AI Contracts
- **007–009**: Event, Publish, Asset (Proposed)
- **010–013**: History, Engine Rules, Perf Budget, Security (Core)
- **014–015**: Canvas Engine
- **016–020**: Resolution Pipeline → Property → Theme → Responsive → Timeline
- **021–024**: Publish → Render Tree → Plugin Runtime
- **025–026**: AI Runtime → Agent Contract
- **027–028**: Collaboration → Sync
- **029**: Production Hardening (depends on all)

## Implementation status

- ✅ Accepted & Implemented: 001, 002, 005, 006, 010, 011, 014, 016, 017, 018, 019, 020, 021, 022, 023, 024, 025, 026, 027, 028, 029
- ❓ Proposed: 003, 004, 007, 008, 009, 012, 013, 015
