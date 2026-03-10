'use server';

import { getOrCreateUser } from '@/lib/auth';
import { db } from '@/lib/db';
import type { Prisma } from '@/lib/generated/prisma/client';

export async function saveSession(data: {
  mode: 'formula' | 'branch';
  maxInternalLevel: number;
  totalQuestions: number;
  correctCount: number;
  durationSeconds: number;
}) {
  try {
    const user = await getOrCreateUser();

    await db.session.create({
      data: {
        userId: user?.id ?? null,
        mode: data.mode,
        maxInternalLevel: data.maxInternalLevel,
        totalQuestions: data.totalQuestions,
        correctCount: data.correctCount,
        durationSeconds: data.durationSeconds,
      },
    });
  } catch (error) {
    console.error('[saveSession] DB write failed:', error);
  }
}
