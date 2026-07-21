/**
 * Canvas renderer registry — maps a node's componentId to its React canvas renderer.
 * React lives here (components layer); the data ComponentDef lives in the react-free
 * editor lib. NodeView dispatches via getCanvasRenderer(componentId).
 */
import type { FC } from 'react';
import type { Node } from '@core/document';

export type CanvasRenderer = FC<{ node: Node }>;

const renderers = new Map<string, CanvasRenderer>();

export function registerCanvasRenderer(id: string, renderer: CanvasRenderer): void {
  renderers.set(id, renderer);
}

export function getCanvasRenderer(id: string | undefined): CanvasRenderer | undefined {
  return id ? renderers.get(id) : undefined;
}
