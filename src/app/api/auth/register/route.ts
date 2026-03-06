import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db';
import {
  createSessionToken,
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

  if (body.password.length < 8) {
    return NextResponse.json(
      { message: 'Password must be at least 8 characters.' },
      { status: 400 },
    );
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered.' },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        role: 'member',
        tasks: {
          create: [
            { title: 'Welcome to Aetheron-X!', status: 'todo' },
            { title: 'Create your first task', status: 'todo' },
          ],
        },
      },
    });

    const token = createSessionToken(user.email, 'member');
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, token, getSessionCookieConfig());

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Registration failed.' },
      { status: 500 },
    );
  }
}
