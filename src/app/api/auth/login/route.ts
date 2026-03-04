import { NextResponse } from 'next/server';
import {
  createSessionToken,
  getSessionCookieConfig,
  SESSION_COOKIE,
} from '@/lib/auth';
import { initializeDatabase, prisma } from '@/lib/db';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;

  if (!body?.email || !body?.password) {
    return NextResponse.json(
      { message: 'Email and password are required.' },
      { status: 400 },
    );
  }

  await initializeDatabase();

  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (!user || user.password !== body.password) {
    return NextResponse.json(
      { message: 'Invalid credentials.' },
      { status: 401 },
    );
  }

  const token = createSessionToken(user.email);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, getSessionCookieConfig());

  return response;
}
