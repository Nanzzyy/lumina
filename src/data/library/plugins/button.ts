import type { ComponentDef } from '../../../lib/core/plugin';

/**
 * Button primitive — first-party plugin (ADR-005 ComponentDef).
 * Publishes to a <button> in the HTML adapter (renderKind: 'button').
 * ponytail: register into the editor ComponentRegistry + canvas renderer when the
 * design surface needs an addable button; publish already resolves it via renderKind.
 */
export const buttonComponent: ComponentDef = {
  id: 'button',
  name: 'Button',
  category: 'primitive',
  renderKind: 'button',
  schema: {
    fields: [
      { key: 'title', label: 'Label', type: 'text', default: 'Button' },
      { key: 'backgroundColor', label: 'Fill', type: 'color', default: '#db2777', tokenRef: 'color-primary' },
      { key: 'color', label: 'Text Color', type: 'color', default: '#ffffff' },
      { key: 'fontSize', label: 'Font Size', type: 'text', default: '15px' },
      { key: 'borderRadius', label: 'Radius', type: 'radius', default: '9999px' },
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
  capabilities: { editable: 'required', draggable: 'required', resizable: 'required', bindable: 'optional' },
};
