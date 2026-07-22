# ADR-015: Input & Gesture Architecture

- Status: Proposed (deferred — author fully when P2 gesture handling begins)
- Date: 2026-07-19
- Phase gate: P2 mid (not required to start P2; required before gesture logic spreads across editor components)

## Context
ADR-014 commits to command-first interaction, but multiple input sources will drive gestures: mouse, touchpad, touchscreen, keyboard — later stylus, Apple Pencil, drawing tablet, multi-touch. If each component interprets pointers directly, gesture logic scatters and becomes untestable/unsplittable.

## Decision (intent — to be elaborated when authored)
Centralize input behind an Input Engine so gesture sources are adapters:
```
Pointer (mouse/touch/stylus/keyboard/…)
  → Input Engine (adapter per device)
    → Gesture Recognizer (drag/resize/rotate/marquee/pan/zoom)
      → Command Dispatcher (Move/Resize/Rotate per ADR-014)
        → History (ADR-010)
```
- Adding a device = adding an adapter; no editor component changes.
- Gesture recognition is pure logic over a pointer-event stream → unit-testable (R7).
- Keyboard shortcuts route through the same dispatcher.

## Why deferred
P2 begins with the layered canvas + overlay + commands (ADR-014). A single mouse/keyboard path suffices to validate that. ADR-015 is authored once a second gesture source or reusable gesture appears — early enough to prevent scatter, not so early it speculates.

## Consequences
- One seam for all input; gestures never live inside React components.
- Enables future touch/stylus/multi-touch without touching the canvas or components.

## Alternatives
- **Per-component pointer handlers:** rejected — scatters gesture logic, untestable, blocks new devices.
