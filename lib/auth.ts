import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * Gets the authenticated user from Clerk and ensures a corresponding User record
 * exists in the database. Creates or updates the User via upsert.
 * Returns null if not signed in.
 */
export async function getOrCreateUser() {
  const clerkUser = await currentUser();
  if (!clerkUser?.id) return null;

  const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? undefined;
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || undefined;

  const user = await db.user.upsert({
    where: { clerkId: clerkUser.id },
    create: { clerkId: clerkUser.id, email, name },
    update: { email, name },
  });

  return user;
}
