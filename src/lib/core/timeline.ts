/**
 * History Timeline & Branching — ADR-020.
 *
 * Extends the command-pattern history (ADR-010) with a **timeline**:
 * an ordered sequence of TimelineEntry records. Each entry references a Command
 * plus metadata (source, timestamp, author, branch). Branches fork from any
 * entry. Autosave produces snapshot-bearing entries for cheap restore.
 *
 * Pure: no React/DB (R5/R7). The DB layers (history table) serialize entries;
 * this module defines the types and the branching/restore logic.
 */

import { genId } from './id';
import type { Command, DocumentPatch } from './history';
import { applyPatch } from './history';

// ─── Types ──────────────────────────────────────────────────
export type EntrySource = 'user' | 'ai' | 'plugin' | 'autosave' | 'collab' | 'system';

export interface EntryMeta {
  source: EntrySource;
  label?: string;
  timestamp: number;
  authorId?: string;
}

export interface TimelineEntry {
  id: string;
  parentId: string | null;             // null = root
  command: Command;
  /** Full document snapshot at this point (autosave / branch point). */
  snapshot?: Record<string, unknown>;
  meta: EntryMeta;
  branch: string;                      // 'main' by default
}

export interface BranchInfo {
  name: string;
  entryCount: number;
  headEntryId: string;
  forkPointId: string;
}

// ─── Timeline ───────────────────────────────────────────────
export class Timeline {
  entries: Map<string, TimelineEntry> = new Map();
  branches: Map<string, BranchInfo> = new Map();
  rootId: string | null = null;

  /** Current branch being edited (default: 'main'). */
  activeBranch = 'main';

  // ── Mutation ─────────────────────────────────────────────

  /** Append an entry. Automatically links parentId = last entry on active branch. */
  append(
    command: Command,
    meta: EntryMeta,
    branch?: string,
    snapshot?: Record<string, unknown>,
  ): TimelineEntry {
    const branchName = branch ?? this.activeBranch;

    // Find the most recent entry on this branch (crawl parent chain)
    const branchEntries = this.getBranchEntries(branchName);
    const parentId = branchEntries.length > 0
      ? branchEntries[branchEntries.length - 1].id
      : this.rootId;

    const entry: TimelineEntry = {
      id: genId('tl'),
      parentId,
      command,
      snapshot,
      meta: { ...meta, timestamp: meta.timestamp ?? Date.now() },
      branch: branchName,
    };

    this.entries.set(entry.id, entry);
    this.updateBranchInfo(branchName);
    return entry;
  }

  /** Fork from a specific entry. Creates a new branch. */
  fork(fromEntryId: string, newBranchName: string, command: Command, meta: EntryMeta): TimelineEntry {
    const parent = this.entries.get(fromEntryId);
    if (!parent) throw new Error(`[timeline] fork target ${fromEntryId} not found`);
    if (this.branches.has(newBranchName)) throw new Error(`[timeline] branch "${newBranchName}" exists`);

    // Auto-snapshot the branch point
    const entry: TimelineEntry = {
      id: genId('tl'),
      parentId: fromEntryId,
      command,
      snapshot: parent.snapshot ?? undefined,
      meta: { ...meta, label: `Fork: ${newBranchName}`, timestamp: Date.now() },
      branch: newBranchName,
    };

    this.entries.set(entry.id, entry);
    this.updateBranchInfo(newBranchName);
    return entry;
  }

  // ── Get operations ───────────────────────────────────────

  /** Get all entries on a branch, in chronological order (walking parent chain). */
  getBranchEntries(branch: string): TimelineEntry[] {
    const all = Array.from(this.entries.values())
      .filter((e) => e.branch === branch)
      .sort((a, b) => (a.meta.timestamp ?? 0) - (b.meta.timestamp ?? 0));
    return all;
  }

  /** Get entries across all branches, newest first. */
  getAllEntries(): TimelineEntry[] {
    return Array.from(this.entries.values())
      .sort((a, b) => (b.meta.timestamp ?? 0) - (a.meta.timestamp ?? 0));
  }

  /** Switch active branch. Also returns the document state at branch head. */
  switchBranch(doc: Record<string, unknown>, branch: string): Record<string, unknown> {
    if (!this.branches.has(branch)) throw new Error(`[timeline] branch "${branch}" not found`);
    this.activeBranch = branch;
    return this.restoreFromBranch(doc, branch);
  }

  /** Reconstruct the document state at the head of a branch. */
  restoreFromBranch(doc: Record<string, unknown>, branch: string): Record<string, unknown> {
    const entries = this.getBranchEntries(branch);
    if (entries.length === 0) return { ...doc };

    // Find the latest entry with a snapshot (restore from there, then replay)
    let state: Record<string, unknown> = { ...doc };
    let replayFrom = 0;

    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].snapshot) {
        state = entries[i].snapshot!;
        replayFrom = i + 1;
        break;
      }
    }

    // Replay subsequent commands
    for (let i = replayFrom; i < entries.length; i++) {
      state = applyPatch(state, entries[i].command.forward);
    }
    return state;
  }

  /** Remove a branch (cascade = delete its entries). */
  deleteBranch(branch: string): void {
    if (branch === 'main') throw new Error('[timeline] cannot delete main branch');
    for (const [id, entry] of this.entries) {
      if (entry.branch === branch) this.entries.delete(id);
    }
    this.branches.delete(branch);
  }

  /** Set the root entry. Call once. */
  setRoot(entry: TimelineEntry): void {
    if (this.rootId) throw new Error('[timeline] root already set');
    this.rootId = entry.id;
    this.entries.set(entry.id, entry);
    this.updateBranchInfo(entry.branch);
  }

  // ── Helpers ──────────────────────────────────────────────
  private updateBranchInfo(branch: string): void {
    const branchEntries = this.getBranchEntries(branch);
    if (branchEntries.length === 0) {
      this.branches.delete(branch);
      return;
    }
    this.branches.set(branch, {
      name: branch,
      entryCount: branchEntries.length,
      headEntryId: branchEntries[branchEntries.length - 1].id,
      forkPointId: branchEntries[0].parentId ?? branchEntries[0].id,
    });
  }

  /** Return all known branches. */
  listBranches(): BranchInfo[] {
    return Array.from(this.branches.values());
  }
}
