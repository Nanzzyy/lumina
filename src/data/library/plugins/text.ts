import type { ComponentDef } from '../../../lib/core/plugin';

/**
 * Text primitive — first-party plugin (ADR-005 ComponentDef).
 * ponytail: wrap in a full PluginManifest (vendor/version/permissions/sandbox) when this
 * enters the async PluginHost runtime; the editor reads ComponentDef directly.
 */
export const textComponent: ComponentDef = {
  id: 'text',
  name: 'Text',
  category: 'primitive',
  renderKind: 'text',
  schema: {
    fields: [
      { key: 'text', label: 'Content', type: 'textarea', default: 'Teks baru' },
      { key: 'color', label: 'Color', type: 'color', default: '#111827', tokenRef: 'color-text' },
      { key: 'fontSize', label: 'Font Size', type: 'text', default: '20px' },
      { key: 'fontFamily', label: 'Font', type: 'font', default: 'Georgia, serif' },
      {
        key: 'textAlign', label: 'Align', type: 'select', default: 'center',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
      },
    ],
  },
  capabilities: { editable: 'required', draggable: 'required', resizable: 'optional', bindable: 'optional' },
};
