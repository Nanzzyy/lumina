import { describe, it, expect } from 'vitest';
import { PluginHost } from './host';
import { heroManifest, heroHooks } from '../../data/library/plugins/hero';
import { countdownManifest } from '../../data/library/plugins/countdown';
import { rsvpManifest } from '../../data/library/plugins/rsvp';

describe('builtin plugins (P7.3)', () => {
  it('hero manifest has required fields', () => {
    expect(heroManifest.id).toBe('lumina.hero');
    expect(heroManifest.components).toHaveLength(1);
    expect(heroManifest.components![0].id).toBe('hero');
  });

  it('countdown manifest declares correct capabilities', () => {
    expect(countdownManifest.id).toBe('lumina.countdown');
    expect(countdownManifest.components![0].capabilities?.repeatable).toBe('required');
  });

  it('rsvp manifest declares mutate permission', () => {
    expect(rsvpManifest.permissions.some((p: { kind: string }) => p.kind === 'runtime.mutate')).toBe(true);
  });

  it('hero plugin registers and activates via PluginHost', async () => {
    const host = new PluginHost();
    host.register(heroManifest, heroHooks);
    expect(host.getPlugin('lumina.hero')).toBeDefined();
  });

  it('all builtins register without conflict', () => {
    const host = new PluginHost();
    host.register(heroManifest, heroHooks);
    host.register(countdownManifest, {});
    host.register(rsvpManifest, {});
    expect(host.listPlugins()).toHaveLength(3);
  });
});
