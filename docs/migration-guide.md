# Lumina OS — Migration Guide (v0.x → v1.0)

## Overview

Lumina OS v1.0 is a production-ready release. This guide covers breaking changes from earlier versions and how to migrate your existing projects.

## Breaking Changes

### 1. Authentication

**Before:** Single `ADMIN_PASSWORD` env var. Session cookie was a random hex token.
**After:** JWT-based authentication. Login endpoint returns a signed JWT in `lumina_session` cookie.

**Migration:**
1. Set `LUMINA_JWT_SECRET` in `.env.local` (run `openssl rand -hex 32` to generate).
2. Set `ADMIN_PASSWORD` for the login route (or `ADMIN_PASSWORD_HASH` for bcrypt).
3. Existing sessions will be invalidated — users must re-login.

### 2. Database Schema

**Before:** 5 tables (invitations, layouts, widgets, rsvps, wishes).
**After:** 25+ tables with workspace/project/page/frame hierarchy.

**Migration:** Automatic. When the server starts for the first time after upgrade:
1. Existing `dev.db` is backed up to `dev.db.bak`.
2. New tables are created idempotently (`CREATE IF NOT EXISTS`).
3. Existing invitations are backfilled into the workspace→project→page→frame hierarchy.
4. Existing data remains intact and accessible.

### 3. API Routes

**Before:** `/api/invitations`, `/api/layouts`, `/api/widgets`, `/api/rsvp`, `/api/wishes` only.
**After:** All previous routes plus `/api/projects`, `/api/pages`, `/api/frames`, `/api/themes`, `/api/assets`, `/api/components`, `/api/plugins`, `/api/ai`, `/api/health`, `/api/metrics`, `/api/history`.

**Migration:** Old routes continue to work. New routes require authentication (JWT).

### 4. Plugin System

**Before:** All components registered via `SectionRegistry` (hardcoded registration).
**After:** Components registered via PluginHost. Builtin plugins (Hero, Countdown, RSVP) use the same runtime as third-party plugins.

**Migration:** `registerAllSections()` still works during transition. New plugins use `PluginHost.register()`. Builtin plugins are loaded automatically at startup.

### 5. Configuration

**New env vars (all optional with defaults):**

| Variable | Default | Description |
|---|---|---|
| `LUMINA_DB_PATH` | `./dev.db` | SQLite database path |
| `LUMINA_JWT_SECRET` | dev-only | JWT signing secret |
| `LUMINA_ASSET_DIR` | `./public/uploads` | Asset storage directory |
| `LUMINA_ASSET_PUBLIC_BASE` | `/uploads` | Public URL prefix for assets |

## Rollback

If you need to roll back to a previous version:
1. Stop the server.
2. Restore database from backup: `cp .backups/db_<date>.db dev.db`
3. Revert code to previous version.
4. Restart the server.

## Support

For migration assistance, refer to the Architecture Decision Records in `docs/adr/`.
