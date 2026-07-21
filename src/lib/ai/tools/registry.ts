/**
 * Tool Registry — ADR-026 §tools.
 *
 * All AI capabilities come from registered tools. The Planner never executes
 * tools — it only plans. The Executor calls tools, collects results, and feeds
 * them to the PatchGenerator. Each tool has a JSON Schema parameter definition.
 */

import type { ToolDef, ToolResult } from '../types';

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

interface RegisteredTool {
  def: ToolDef;
  execute: ToolHandler;
}

const registry = new Map<string, RegisteredTool>();

export function registerTool(name: string, def: ToolDef, execute: ToolHandler): void {
  if (registry.has(name)) throw new Error(`[tool] duplicate: ${name}`);
  registry.set(name, { def, execute });
}

export function getTool(name: string): RegisteredTool | undefined {
  return registry.get(name);
}

export function listTools(): ToolDef[] {
  return Array.from(registry.values()).map((t) => t.def);
}

export async function callTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
  const tool = registry.get(name);
  if (!tool) return { name, success: false, data: null, error: `tool not found: ${name}` };
  try {
    const data = await tool.execute(args);
    return { name, success: true, data };
  } catch (e) {
    return { name, success: false, data: null, error: e instanceof Error ? e.message : String(e) };
  }
}

export function clearTools(): void {
  registry.clear();
}
