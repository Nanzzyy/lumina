export { TemplateRenderer } from './TemplateRenderer';
export { TreeRenderer } from './TreeRenderer';
export { SectionShell } from './SectionShell';
export { SectionRegistry } from './SectionRegistry';
export {
  registerTemplate,
  getTemplate,
  getAllTemplates,
  clearRegistry,
} from './registry';
export type {
  TemplateDefinition,
  SectionConfig,
  SectionType,
  AnimationConfig,
  DecorationConfig,
  ResolvedInvitation,
} from './types';
export type { SectionComponentProps, SectionComponent } from './SectionRegistry';
