'use server';

import { getOrCreateUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function saveSession(data: {
  mode: 'formula' | 'branch';
  maxInternalLevel: number;
  totalQuestions: number;
  correctCount: number;
  durationSeconds: number;
  attempts: { sequence: number; difficulty: number; isCorrect: boolean; responseTimeMs: number }[];
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
        attempts: {
          create: data.attempts.map((a) => ({
            sequence: a.sequence,
            difficulty: a.difficulty,
            isCorrect: a.isCorrect,
            responseTimeMs: a.responseTimeMs,
          })),
        },
      },
    });
  } catch (error) {
    console.error('[saveSession] DB write failed:', error);
  }
}
