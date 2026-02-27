import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Temporary API route to verify Prisma client connects to the database.
 * GET /api/db-check — run once to confirm DATABASE_URL works, then remove or keep as health check.
 */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, message: 'Database connection OK' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
