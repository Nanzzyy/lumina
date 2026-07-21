/**
 * Builtin: Hero plugin manifest.
 *
 * First-party plugin loaded by PluginHost at boot. Uses the same Runtime API
 * as third-party plugins — no special treatment.
 */

import type { PluginManifest, PluginLifecycleHooks } from '../../../lib/plugin/host';
import { Hero } from '../../../components/sections/Hero';

export const heroManifest: PluginManifest = {
  id: 'lumina.hero',
  name: 'Hero',
  version: '1.0.0',
  vendor: 'Lumina',
  manifestVersion: 1,
  apiVersion: '1',
  engineVersion: '>=1.0',
  permissions: [{ kind: 'runtime.read' }],
  components: [{
    id: 'hero',
    name: 'Hero',
    category: 'hero',
    renderKind: 'section',
    schema: {
      fields: [
        { key: 'title', label: 'Title', type: 'text', default: 'Welcome' },
        { key: 'subtitle', label: 'Subtitle', type: 'text', default: '' },
        { key: 'backgroundImage', label: 'Background', type: 'image' },
        { key: 'overlay', label: 'Overlay', type: 'boolean', default: false },
      ],
    },
    capabilities: { resizable: 'required', draggable: 'optional', bindable: 'required' },
    tokens: { tokens: [{ key: 'hero-bg', layer: 'component', value: '', alias: 'color-background' }] },
    renderEntry: '../../components/sections/Hero',
  }],
};

export const heroHooks: PluginLifecycleHooks = {
  onInit: async (ctx) => {
    console.log('[plugin] hero initialized');
  },
};
