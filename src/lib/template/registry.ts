import type { TemplateDefinition } from './types';

/**
 * Template registry — all available templates live here.
 * New templates register themselves by adding to this map.
 */
const templateRegistry = new Map<string, TemplateDefinition>();

export function registerTemplate(template: TemplateDefinition): void {
  if (templateRegistry.has(template.id)) {
    console.warn(
      `[TemplateRegistry] Overwriting template "${template.id}"`,
    );
  }
  templateRegistry.set(template.id, template);
}

export function getTemplate(id: string): TemplateDefinition | undefined {
  return templateRegistry.get(id);
}

export function getAllTemplates(): TemplateDefinition[] {
  return Array.from(templateRegistry.values());
}

export function clearRegistry(): void {
  templateRegistry.clear();
}
