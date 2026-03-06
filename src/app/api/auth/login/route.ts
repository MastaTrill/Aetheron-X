import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
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
    rememberMe?: boolean;
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

  if (!user) {
    return NextResponse.json(
      { message: 'Invalid credentials.' },
      { status: 401 },
    );
  }

  const passwordMatch = await bcrypt.compare(body.password, user.password);

  if (!passwordMatch) {
    return NextResponse.json(
      { message: 'Invalid credentials.' },
      { status: 401 },
    );
  }

  const rememberMe = body.rememberMe === true;
  const token = createSessionToken(user.email, user.role === 'admin' ? 'admin' : 'member', rememberMe);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, getSessionCookieConfig(rememberMe));

  return response;
}
