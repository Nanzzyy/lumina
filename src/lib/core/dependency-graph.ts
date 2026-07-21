/**
 * Dependency Graph — ADR-016 §DAG + R9 (cycle detection).
 *
 * A DAG over variable/expression keys. Edges are derived from static analysis of
 * expressions (`exprDependencies`, ADR-004) and variable refs (`$var`, ADR-003).
 * The Resolution Pipeline uses it for incremental re-resolve: markDirty(key) →
 * getAffected() returns only dependents that need recompute.
 *
 * Pure: no React/DB (R5/R7).
 */

export class DependencyError extends Error {
  readonly cycle: string[];
  constructor(cycle: string[]) {
    super(`[dag] cycle detected: ${cycle.join(' → ')}`);
    this.name = 'DependencyError';
    this.cycle = cycle;
  }
}

export class DependencyGraph {
  /** edges: key → [keys that depend on it] */
  private forward = new Map<string, Set<string>>();
  /** reverse: key → [keys it depends on] */
  private reverse = new Map<string, Set<string>>();
  /** Dirty set: keys whose values have changed (or that need full recompute). */
  private dirty = new Set<string>();
  /** Known keys (for error checking). */
  private nodes = new Set<string>();

  /** Register a key — idempotent. */
  addNode(key: string): this {
    this.nodes.add(key);
    if (!this.forward.has(key)) this.forward.set(key, new Set());
    if (!this.reverse.has(key)) this.reverse.set(key, new Set());
    return this;
  }

  /**
   * Add an edge: `from → to` means `to` depends on `from`.
   * On cycle detection, throws `DependencyError` with the cycle path.
   */
  addEdge(from: string, to: string): this {
    this.addNode(from);
    this.addNode(to);
    this.forward.get(from)!.add(to);
    this.reverse.get(to)!.add(from);

    // Detect cycle via topological reachability
    const visited = new Set<string>();
    const stack = new Set<string>();
    const path: string[] = [];
    const detect = (k: string): boolean => {
      if (stack.has(k)) {
        path.push(k);
        return true;
      }
      if (visited.has(k)) return false;
      visited.add(k);
      stack.add(k);
      for (const dep of this.forward.get(k) ?? []) {
        if (detect(dep)) {
          path.unshift(k);
          return true;
        }
      }
      stack.delete(k);
      return false;
    };

    if (detect(from)) throw new DependencyError(path);
    return this;
  }

  /** Return a topological sort of all known keys. Throws on cycle. */
  topologicalSort(): string[] {
    const inDegree = new Map<string, number>();
    const queue: string[] = [];
    const result: string[] = [];

    for (const node of this.nodes) {
      this.addNode(node); // ensure forward/reverse entries
    }

    for (const node of this.nodes) {
      const deg = this.reverse.get(node)?.size ?? 0;
      inDegree.set(node, deg);
      if (deg === 0) queue.push(node);
    }

    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node);
      for (const dep of this.forward.get(node) ?? []) {
        const deg = (inDegree.get(dep) ?? 0) - 1;
        inDegree.set(dep, deg);
        if (deg === 0) queue.push(dep);
      }
    }

    if (result.length < this.nodes.size) {
      const leftover = Array.from(this.nodes).filter((n) => !result.includes(n));
      throw new DependencyError(leftover);
    }
    return result;
  }

  /** Mark a key as dirty → its dependents need recompute. */
  markDirty(key: string): this {
    this.dirty.add(key);
    return this;
  }

  /** Get all affected keys to recompute (transitive dependents of dirty set). */
  getAffected(): Set<string> {
    const affected = new Set<string>();
    const walk = (k: string) => {
      if (affected.has(k)) return;
      affected.add(k);
      for (const dep of this.forward.get(k) ?? []) walk(dep);
    };
    for (const k of this.dirty) walk(k);
    return affected;
  }

  /** Clear dirty after recompute. */
  clearDirty(): void {
    this.dirty.clear();
  }

  /** True if an edge directly exists. */
  dependsOn(from: string, to: string): boolean {
    return this.forward.get(from)?.has(to) ?? false;
  }

  /** Reset all nodes and edges. */
  clear(): void {
    this.forward.clear();
    this.reverse.clear();
    this.dirty.clear();
    this.nodes.clear();
  }
}
