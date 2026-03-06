'use server';

import { getOrCreateUser } from '@/lib/auth';
import { db } from '@/lib/db';
import type { Prisma } from '@/lib/generated/prisma/client';

export async function saveSession(data: {
  mode: 'formula' | 'branch';
  score: number;
  levelReached: number;
  durationSeconds: number;
  analytics?: Record<string, unknown> | null;
}) {
  const user = await getOrCreateUser();

  await db.session.create({
    data: {
      userId: user?.id ?? null,
      mode: data.mode,
      score: data.score,
      levelReached: data.levelReached,
      durationSeconds: data.durationSeconds,
      ...(data.analytics != null && { analytics: data.analytics as Prisma.InputJsonValue }),
    },
  });
}
