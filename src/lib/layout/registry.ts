import type { LayoutDefinition } from './types';

const registry = new Map<string, LayoutDefinition>();

export function registerLayout(layout: LayoutDefinition): void {
  registry.set(layout.id, layout);
}

export function getLayout(id: string): LayoutDefinition | undefined {
  return registry.get(id);
}

export function getAllLayouts(): LayoutDefinition[] {
  return Array.from(registry.values());
}

export function clearLayoutRegistry(): void {
  registry.clear();
}

export async function syncLayoutsFromDB(): Promise<void> {
  try {
    const res = await fetch('/api/layouts');
    const layouts = await res.json();
    for (const l of layouts) {
      if (!registry.has(l.id)) {
        registry.set(l.id, {
          id: l.id,
          name: l.name,
          description: l.description,
          sections: l.config.sections || [],
          containers: l.config.containers || [],
          animation: l.config.animation,
          wrapper: l.config.wrapper,
        });
      }
    }
  } catch {
    // Silently fail — fallback to in-memory
  }
}
