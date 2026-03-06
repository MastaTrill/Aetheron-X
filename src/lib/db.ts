import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import path from 'path';
import { getConfiguredCredentials } from './auth';

let prismaInstance: PrismaClient | null = null;

function getDatabaseUrl(): string {
  // Priority 1: Use explicitly set DATABASE_URL from environment
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Priority 2: Use PRISMA_DATABASE_URL if set
  if (process.env.PRISMA_DATABASE_URL) {
    return process.env.PRISMA_DATABASE_URL;
  }

  // Priority 3: Construct path relative to project root
  // In production, ensure DATABASE_URL is set via environment variables
  const projectRoot = process.cwd();
  const dbPath = path.join(projectRoot, 'prisma', 'dev.db');

  // Use absolute path for reliability in bundled environments
  return `file:${dbPath.replace(/\\/g, '/')}`;
}

function normalizeDatabaseUrl(value: string) {
  if (!value.startsWith('file:./')) {
    return value;
  }

  const relativePath = value.slice('file:./'.length);
  const absolutePath = path
    .resolve(process.cwd(), relativePath)
    .replace(/\\/g, '/');
  return `file:${absolutePath}`;
}

function getPrisma() {
  if (!prismaInstance) {
    const databaseUrl = normalizeDatabaseUrl(getDatabaseUrl());
    process.env.DATABASE_URL = databaseUrl;
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    return Reflect.get(getPrisma(), prop);
  },
});

export async function initializeDatabase() {
  const prismaCli = getPrisma();
  try {
    const existingUser = await prismaCli.user.findUnique({
      where: { email: getConfiguredCredentials().email },
    });

    if (!existingUser) {
      const credentials = getConfiguredCredentials();
      const hashedPassword = await bcrypt.hash(credentials.password, 10);
      await prismaCli.user.create({
        data: {
          email: credentials.email,
          password: hashedPassword,
          role: 'admin',
          tasks: {
            create: [
              { title: 'Finalize dashboard route', status: 'todo' },
              { title: 'Add data persistence', status: 'done' },
              { title: 'Ship v0 API contract', status: 'in-progress' },
            ],
          },
        },
      });
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}
