import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken, hasRole } from '@/lib/auth';
import { initializeDatabase, prisma } from '@/lib/db';

type AutomationBody = {
  action?: 'seed-weekly-plan' | 'clear-completed';
};

export async function GET() {
  return NextResponse.json({
    actions: ['seed-weekly-plan', 'clear-completed'],
    method: 'POST',
    example: { action: 'seed-weekly-plan' },
  });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!hasRole(session, 'admin')) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await initializeDatabase();

  const user = await prisma.user.findUnique({
    where: { email: session.email },
  });

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const body = (await request
    .json()
    .catch(() => null)) as AutomationBody | null;
  const action = body?.action;

  if (!action) {
    return NextResponse.json(
      { message: 'Action is required.' },
      { status: 400 },
    );
  }

  if (action === 'seed-weekly-plan') {
    const created = await prisma.task.createMany({
      data: [
        { title: 'Weekly planning review', status: 'pending', userId: user.id },
        {
          title: 'Prioritize top 3 outcomes',
          status: 'pending',
          userId: user.id,
        },
        {
          title: 'Schedule deep work blocks',
          status: 'pending',
          userId: user.id,
        },
      ],
    });

    return NextResponse.json({
      ok: true,
      action,
      createdCount: created.count,
    });
  }

  if (action === 'clear-completed') {
    const deleted = await prisma.task.deleteMany({
      where: {
        userId: user.id,
        status: 'completed',
      },
    });

    return NextResponse.json({
      ok: true,
      action,
      deletedCount: deleted.count,
    });
  }

  return NextResponse.json({ message: 'Unknown action.' }, { status: 400 });
}
