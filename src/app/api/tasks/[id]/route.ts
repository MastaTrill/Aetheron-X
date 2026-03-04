import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import { initializeDatabase, prisma } from '@/lib/db';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
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

  const { id } = await context.params;
  const taskId = Number.parseInt(id, 10);

  if (Number.isNaN(taskId)) {
    return NextResponse.json({ message: 'Invalid task ID' }, { status: 400 });
  }

  const existingTask = await prisma.task.findFirst({
    where: { id: taskId, userId: user.id },
  });

  if (!existingTask) {
    return NextResponse.json({ message: 'Task not found' }, { status: 404 });
  }

  const body = (await request.json()) as { title?: string; status?: string };

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.status !== undefined && { status: body.status }),
    },
  });

  return NextResponse.json(task);
}

export async function DELETE(_request: Request, context: RouteContext) {
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

  const { id } = await context.params;
  const taskId = Number.parseInt(id, 10);

  if (Number.isNaN(taskId)) {
    return NextResponse.json({ message: 'Invalid task ID' }, { status: 400 });
  }

  const existingTask = await prisma.task.findFirst({
    where: { id: taskId, userId: user.id },
  });

  if (!existingTask) {
    return NextResponse.json({ message: 'Task not found' }, { status: 404 });
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  return NextResponse.json({ ok: true });
}
