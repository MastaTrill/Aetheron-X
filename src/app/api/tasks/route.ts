import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

const tasks = [
  { id: 1, title: 'Finalize dashboard route', status: 'todo' },
  { id: 2, title: 'Add data persistence', status: 'todo' },
  { id: 3, title: 'Ship v0 API contract', status: 'in-progress' },
];

export async function GET() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    items: tasks,
    user: session.email,
  });
}
