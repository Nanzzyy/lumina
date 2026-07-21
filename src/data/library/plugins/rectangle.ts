import type { ComponentDef } from '../../../lib/core/plugin';

/** Rectangle primitive — first-party plugin (ADR-005 ComponentDef). */
export const rectangleComponent: ComponentDef = {
  id: 'rectangle',
  name: 'Rectangle',
  category: 'primitive',
  renderKind: 'shape',
  schema: {
    fields: [
      { key: 'backgroundColor', label: 'Fill', type: 'color', default: '#db2777', tokenRef: 'color-primary' },
      { key: 'borderRadius', label: 'Radius', type: 'radius', default: '12px' },
      { key: 'borderWidth', label: 'Border Width', type: 'number', default: 0, min: 0, max: 20 },
      { key: 'borderColor', label: 'Border Color', type: 'color', default: '#000000' },
      { key: 'boxShadow', label: 'Shadow', type: 'shadow', default: 'none' },
    ],
  },
  capabilities: { draggable: 'required', resizable: 'required', rotatable: 'optional' },
};
