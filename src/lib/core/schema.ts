/**
 * Property Schema — Component/Property Engine.
 *
 * A component declares a PropSchema; the generic Inspector renders from it.
 * Fields may be responsive (per-breakpoint) and bindable (linked to a variable /
 * expression, ADR-003). Replaces the hardcoded per-kind editor panels.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'rich'
  | 'color'
  | 'number'
  | 'range'
  | 'select'
  | 'boolean'
  | 'image'
  | 'video'
  | 'audio'
  | 'icon'
  | 'spacing'
  | 'radius'
  | 'shadow'
  | 'gradient'
  | 'font'
  | 'css'
  | 'group';

export interface SelectOption {
  label: string;
  value: string | number | boolean;
}

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  description?: string;
  default?: unknown;
  options?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
  /** Stores a per-breakpoint map when true (Responsive Engine). */
  responsive?: boolean;
  /** UI shows a "link" toggle to bind this field (ADR-003). */
  bindable?: boolean;
  /** Reference a semantic/component token (3-layer Token Engine). */
  tokenRef?: string;
  /** Nested fields when type === 'group'. */
  fields?: Field[];
}

export interface PropSchema {
  fields: Field[];
}
