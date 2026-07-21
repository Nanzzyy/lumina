import { describe, it, expect } from 'vitest';
import { can, capabilityTier, narrowCapability } from './capabilities';
import type { NodeCapabilities } from './capabilities';

const declared: NodeCapabilities = {
  resizable: { kind: 'resizable', tier: 'required' },
  repeatable: { kind: 'repeatable', tier: 'optional' },
  draggable: { kind: 'draggable', tier: 'experimental' },
};

describe('capabilities (ADR-005)', () => {
  it('can() reads presence', () => {
    expect(can({ capabilities: declared }, 'resizable')).toBe(true);
    expect(can({ capabilities: declared }, 'rotatable')).toBe(false);
  });

  it('capabilityTier() reads tier', () => {
    expect(capabilityTier({ capabilities: declared }, 'repeatable')).toBe('optional');
    expect(capabilityTier({ capabilities: declared }, 'rotatable')).toBeUndefined();
  });

  it('narrowCapability disables an optional capability', () => {
    const next = narrowCapability(declared, 'repeatable', false);
    expect(next.repeatable?.config?.disabled).toBe(true);
  });

  it('narrowCapability refuses to disable a required capability', () => {
    const next = narrowCapability(declared, 'resizable', false);
    expect(next.resizable?.tier).toBe('required');
    expect(next.resizable?.config?.disabled).toBeUndefined();
  });

  it('narrowCapability is pure (returns a new map)', () => {
    const before = declared;
    narrowCapability(declared, 'repeatable', false);
    expect(declared).toBe(before);
    expect(declared.repeatable?.config?.disabled).toBeUndefined();
  });
});
