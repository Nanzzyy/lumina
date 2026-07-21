import type { PluginManifest } from '../../../lib/plugin/host';

export const countdownManifest: PluginManifest = {
  id: 'lumina.countdown',
  name: 'Countdown',
  version: '1.0.0',
  vendor: 'Lumina',
  manifestVersion: 1,
  apiVersion: '1',
  engineVersion: '>=1.0',
  permissions: [{ kind: 'runtime.read' }],
  components: [{
    id: 'countdown',
    name: 'Countdown',
    category: 'section',
    renderKind: 'countdown',
    hydrates: true,
    schema: {
      fields: [
        { key: 'date', label: 'Target Date', type: 'text', default: '2026-12-31', bindable: true },
      ],
    },
    capabilities: { resizable: 'required', bindable: 'required', repeatable: 'required' },
    tokens: { tokens: [{ key: 'countdown-accent', layer: 'component', value: '', alias: 'color-accent' }] },
    renderEntry: '../../components/sections/Countdown',
  }],
};
