import { NextResponse } from 'next/server';
import {
  createSessionToken,
  getConfiguredCredentials,
  getSessionCookieConfig,
  SESSION_COOKIE,
} from '@/lib/auth';

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

  const credentials = getConfiguredCredentials();

  if (
    body.email !== credentials.email ||
    body.password !== credentials.password
  ) {
    return NextResponse.json(
      { message: 'Invalid credentials.' },
      { status: 401 },
    );
  }

  const token = createSessionToken(body.email);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, getSessionCookieConfig());

  return response;
}
