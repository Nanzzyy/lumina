import type { LayoutDefinition } from './types';
import { getJson } from '@/lib/utils/api-client';

const registry = new Map<string, LayoutDefinition>();

/** `/api/layouts` payload: a `LayoutDefinition` with its structure under `config`. */
interface DBLayoutRow extends Pick<LayoutDefinition, 'id' | 'name' | 'description'> {
  config: Pick<LayoutDefinition, 'sections' | 'containers' | 'animation' | 'wrapper' | 'engine' | 'nodes'>;
}

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
    const layouts = await getJson<DBLayoutRow[]>('/api/layouts');
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
          engine: l.config.engine,
          nodes: l.config.nodes,
        });
      }
    }
  } catch {
    // Silently fail — fallback to in-memory
  }
}
