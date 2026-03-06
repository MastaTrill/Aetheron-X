import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import { initializeDatabase, prisma } from '@/lib/db';

export async function GET() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await initializeDatabase();

  const user = await prisma.user.findUnique({
    where: { email: session.email },
    include: { tasks: true },
  });

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const now = new Date();

  const total = user.tasks.length;
  const completed = user.tasks.filter((task) => task.status === 'completed').length;
  const pending = user.tasks.filter((task) => task.status === 'pending').length;
  const overdue = user.tasks.filter(
    (task) => task.status === 'pending' && task.dueDate && task.dueDate < now,
  ).length;

  return NextResponse.json({
    user: {
      email: session.email,
      role: session.role,
    },
    summary: {
      total,
      pending,
      completed,
      overdue,
      completionRate: total > 0 ? Number(((completed / total) * 100).toFixed(2)) : 0,
    },
  });
}
