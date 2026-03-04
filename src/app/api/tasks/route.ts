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

  return NextResponse.json({
    items: user.tasks,
    user: session.email,
  });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await initializeDatabase();

  const user = await prisma.user.findUnique({
    where: { email: session.email },
  });

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const body = (await request.json()) as { title?: string; status?: string };

  if (!body.title || body.title.trim() === '') {
    return NextResponse.json({ message: 'Title is required' }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title: body.title.trim(),
      status: body.status === 'completed' ? 'completed' : 'pending',
      userId: user.id,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
