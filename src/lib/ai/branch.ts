/**
 * Branch-first AI execution + Human modes — ADR-026 §branch, §human-modes.
 *
 * AI never edits Main directly. Every execution starts with a branch fork.
 * User reviews the proposed patch then Accepts (merge) or Discards (delete branch).
 * Three human modes control how much autonomy the AI has.
 */

import { genId } from '../core/id';
import type { DocumentPatch } from '../core/history';
import type { AIActionMetadata, HumanMode, AIIntent } from './types';
import type { Agent } from './agent';
export interface AISession {
  sessionId: string;
  agentId: string;
  intent: AIIntent;
  branchName: string;
  mode: HumanMode;
  patch: DocumentPatch;
  metadata: AIActionMetadata;
  status: 'planning' | 'awaiting_approval' | 'merged' | 'discarded' | 'error';
}

export class BranchManager {
  private sessions = new Map<string, AISession>();

  /** Fork a branch for AI execution. Returns a session. */
  fork(agentId: string, intent: AIIntent, mode: HumanMode, branchName?: string): AISession {
    const sessionId = genId('ai');
    const name = branchName ?? `ai-${agentId}-${genId('br').slice(0, 12)}`;
    const session: AISession = {
      sessionId, agentId, intent, branchName: name, mode,
      patch: [], metadata: null as unknown as AIActionMetadata, status: 'planning',
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  /** Store the AI-generated patch for review. */
  storePatch(sessionId: string, patch: DocumentPatch, metadata: AIActionMetadata): void {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error(`[ai] session not found: ${sessionId}`);
    s.patch = patch;
    s.metadata = metadata;
    if (s.mode === 'observe') {
      s.status = 'discarded'; // Observe never patches
    } else if (s.mode === 'autonomous') {
      s.status = 'merged';    // Autonomous → auto-apply
    } else {
      s.status = 'awaiting_approval';
    }
  }

  /** Accept: merge the patch into the main document */
  accept(sessionId: string): DocumentPatch {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error(`[ai] session not found: ${sessionId}`);
    if (s.status !== 'awaiting_approval') throw new Error(`[ai] cannot accept: ${s.status}`);
    s.status = 'merged';
    return s.patch;
  }

  /** Discard: remove the branch without merging */
  discard(sessionId: string): void {
    const s = this.sessions.get(sessionId);
    if (!s) return;
    s.status = 'discarded';
  }

  getSession(sessionId: string): AISession | undefined {
    return this.sessions.get(sessionId);
  }

  listSessions(): AISession[] {
    return Array.from(this.sessions.values());
  }

  /** Clean up old sessions (e.g. after merge/discard or timeout). */
  cleanup(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}

// ─── Session integration with Agent ────────────────────────
export async function runAIAgent(
  agent: Agent,
  branchManager: BranchManager,
  intent: AIIntent,
  context: string,
  selection?: string[],
): Promise<{ session: AISession; patch: DocumentPatch }> {
  const session = branchManager.fork(agent.id, intent, agent.mode);
  const output = await agent.run(intent, context, selection);

  // Detect mode: observe returns empty patch
  if (agent.mode === 'observe') {
    session.status = 'discarded';
    return { session, patch: [] };
  }

  branchManager.storePatch(session.sessionId, output.patch, output.metadata);

  // Autonomous: auto-accept
  if (agent.mode === 'autonomous') {
    const patch = branchManager.accept(session.sessionId);
    return { session, patch };
  }

  // Assist: await user approval
  return { session, patch: output.patch };
}
