#!/usr/bin/env bash
# Start Lumina locally in production mode with standalone output support
set -e
cd "$(dirname "$0")"

echo "→ Building..."
pnpm build

echo "→ Copying static assets for standalone..."
cp -r .next/static .next/standalone/.next/ 2>/dev/null
[ -d public ] && cp -r public .next/standalone/ 2>/dev/null

echo "→ Starting server on http://localhost:3000"
cd .next/standalone
NODE_ENV=production PORT=3000 node server.js
