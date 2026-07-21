import type { LayoutNode } from '@/lib/layout/tree';

/** Find a node anywhere in the tree (including composite slots) by id. */
export function findNodeDeep(nodes: LayoutNode[], id: string): LayoutNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const f = findNodeDeep(n.children, id);
      if (f) return f;
    }
  }
  return undefined;
}

export interface NodeLoc {
  node: LayoutNode;
  parent: LayoutNode | null;
}

/** Find a node and its parent (null when the node is top-level). */
export function findWithParent(nodes: LayoutNode[], id: string, parent: LayoutNode | null = null): NodeLoc | undefined {
  for (const n of nodes) {
    if (n.id === id) return { node: n, parent };
    if (n.children) {
      const f = findWithParent(n.children, id, n);
      if (f) return f;
    }
  }
  return undefined;
}

/** Return a new tree with the matching node replaced by `fn(node)`. */
export function replaceNodeDeep(nodes: LayoutNode[], id: string, fn: (n: LayoutNode) => LayoutNode): LayoutNode[] {
  return nodes.map((n) => {
    if (n.id === id) return fn(n);
    if (n.children) return { ...n, children: replaceNodeDeep(n.children, id, fn) };
    return n;
  });
}

/** Remove a node anywhere in the tree. */
export function removeNodeDeep(nodes: LayoutNode[], id: string): LayoutNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => (n.children ? { ...n, children: removeNodeDeep(n.children, id) } : n));
}
