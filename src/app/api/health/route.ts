import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

let startTime = Date.now();
let dbConnected = false;

try {
  const dbPath = process.env.LUMINA_DB_PATH || path.join(process.cwd(), 'dev.db');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.prepare('SELECT 1').get();
  db.close();
  dbConnected = true;
} catch {
  dbConnected = false;
}

export async function GET() {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  return NextResponse.json({
    status: dbConnected ? 'healthy' : 'degraded',
    version: process.env.npm_package_version || '0.1.0',
    uptime,
    db: dbConnected ? 'connected' : 'error',
    timestamp: new Date().toISOString(),
  });
}
