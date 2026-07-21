import type { ComponentDef } from '../../../lib/core/plugin';

/** Image primitive — first-party plugin (ADR-005 ComponentDef). */
export const imageComponent: ComponentDef = {
  id: 'image',
  name: 'Image',
  category: 'primitive',
  renderKind: 'image',
  schema: {
    fields: [
      { key: 'image', label: 'Source', type: 'image', default: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80' },
      { key: 'borderRadius', label: 'Radius', type: 'radius', default: '0px' },
      {
        key: 'objectFit', label: 'Fit', type: 'select', default: 'cover',
        options: [
          { label: 'Cover', value: 'cover' },
          { label: 'Contain', value: 'contain' },
          { label: 'Fill', value: 'fill' },
        ],
      },
    ],
  },
  capabilities: { draggable: 'required', resizable: 'required', rotatable: 'optional' },
};
