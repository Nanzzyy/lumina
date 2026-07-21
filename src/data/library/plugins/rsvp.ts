import type { PluginManifest } from '../../../lib/plugin/host';

export const rsvpManifest: PluginManifest = {
  id: 'lumina.rsvp',
  name: 'RSVP Form',
  version: '1.0.0',
  vendor: 'Lumina',
  manifestVersion: 1,
  apiVersion: '1',
  engineVersion: '>=1.0',
  permissions: [{ kind: 'runtime.read' }, { kind: 'runtime.mutate' }],
  components: [{
    id: 'rsvp',
    name: 'RSVP',
    category: 'section',
    renderKind: 'rsvp-form',
    hydrates: true,
    schema: {
      fields: [
        { key: 'title', label: 'Title', type: 'text', default: 'RSVP' },
        { key: 'description', label: 'Description', type: 'textarea', default: '' },
        { key: 'showConfirmationList', label: 'Show Attending', type: 'boolean', default: true },
      ],
    },
    capabilities: { resizable: 'optional', bindable: 'optional' },
    tokens: { tokens: [] },
    renderEntry: '../../components/sections/RSVP',
  }],
};
