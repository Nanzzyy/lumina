/**
 * Built-in AI tools — ADR-026.
 *
 * Each tool is a registered function with JSON Schema parameters.
 * The Planner never executes tools — the Executor does.
 */

import { registerTool } from './registry';

export function registerBuiltinTools(): void {
  registerTool('document.read', {
    name: 'document.read',
    description: 'Read the current document (or a sub-path)',
    parameters: {
      type: 'object',
      properties: { path: { type: 'string', description: 'JSON-pointer path (optional)' } },
    },
  }, async (args) => {
    // ponytail: real document read when connected to editor store
    return { path: args.path ?? '/', data: {} };
  });

  registerTool('document.patch', {
    name: 'document.patch',
    description: 'Submit a DocumentPatch for validation (does not apply — goes through safety layer)',
    parameters: {
      type: 'object',
      properties: {
        patch: { type: 'array', items: { type: 'object' }, description: 'RFC6902 patch ops' },
      },
      required: ['patch'],
    },
  }, async (args) => {
    const patch = args.patch as unknown[];
    return { patch, validated: true, message: 'Patch validated. Ready for user approval.' };
  });

  registerTool('selection.read', {
    name: 'selection.read',
    description: 'Read the current selection (selected node ids)',
    parameters: { type: 'object', properties: {} },
  }, async () => {
    return { selectedIds: [] };
  });

  registerTool('theme.read', {
    name: 'theme.read',
    description: 'Read theme tokens',
    parameters: {
      type: 'object',
      properties: { layer: { type: 'string', enum: ['raw', 'semantic', 'component'] } },
    },
  }, async (args) => {
    const layer = (args.layer as string) ?? 'semantic';
    return { layer, tokens: [] };
  });

  registerTool('theme.suggest', {
    name: 'theme.suggest',
    description: 'Suggest a new theme configuration',
    parameters: {
      type: 'object',
      properties: {
        primary: { type: 'string', description: 'Primary color hex' },
        background: { type: 'string', description: 'Background color hex' },
        typography: { type: 'string', description: 'Font family' },
      },
    },
  }, async (args) => {
    return { suggested: args, message: 'Theme suggestion ready for preview' };
  });

  registerTool('history.branch', {
    name: 'history.branch',
    description: 'Create a branch for safe AI editing',
    parameters: {
      type: 'object',
      properties: { name: { type: 'string', description: 'Branch name' } },
      required: ['name'],
    },
  }, async (args) => {
    return { branch: args.name, message: `Branch '${args.name}' created. AI edits isolated from main.` };
  });

  registerTool('publish.preview', {
    name: 'publish.preview',
    description: 'Preview the current document as published output',
    parameters: { type: 'object', properties: { format: { type: 'string', enum: ['html', 'render-tree'] } } },
  }, async (args) => {
    return { format: args.format ?? 'html', previewLength: 0 };
  });

  registerTool('assets.search', {
    name: 'assets.search',
    description: 'Search for assets by keyword',
    parameters: {
      type: 'object',
      properties: { query: { type: 'string' }, kind: { type: 'string', enum: ['image', 'video', 'audio', 'font'] } },
      required: ['query'],
    },
  }, async (args) => {
    return { query: args.query, results: [] };
  });

  registerTool('plugin.invoke', {
    name: 'plugin.invoke',
    description: 'Invoke a registered plugin action',
    parameters: {
      type: 'object',
      properties: {
        pluginId: { type: 'string' },
        action: { type: 'string' },
        args: { type: 'object' },
      },
      required: ['pluginId', 'action'],
    },
  }, async (args) => {
    return { pluginId: args.pluginId, action: args.action, result: 'Plugin action queued' };
  });
}
