/**
 * snake_case DB row → camelCase API payload. The list and detail routes for each
 * resource used to inline the same field-by-field mapping, so they drifted
 * (a renamed column had to be fixed in two places).
 */
import type { InvitationRow, LayoutRow, WidgetRow } from '@/lib/db';

interface Timestamped {
  created_at: string;
  updated_at: string;
}

const timestamps = (row: Timestamped) => ({ createdAt: row.created_at, updatedAt: row.updated_at });

/** Rows from `listInvitations()` — `content`/`theme_overrides` are raw JSON text. */
export function serializeInvitationRow(row: InvitationRow) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    templateId: row.template_id,
    layoutId: row.layout_id,
    content: JSON.parse(row.content),
    themeOverrides: JSON.parse(row.theme_overrides),
    published: !!row.published,
    ...timestamps(row),
  };
}

/** Layout rows whose `config` was already parsed by the db layer. */
export function serializeLayoutRow(row: Omit<LayoutRow, 'config'> & { config: unknown }) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    config: row.config,
    isBuiltin: !!row.is_builtin,
    ...timestamps(row),
  };
}

/** Widget rows whose `definition` was already parsed by the db layer. */
export function serializeWidgetRow(row: Omit<WidgetRow, 'definition'> & { definition: unknown }) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    thumbnail: row.thumbnail,
    category: row.category,
    definition: row.definition,
    isBuiltin: !!row.is_builtin,
    ...timestamps(row),
  };
}
