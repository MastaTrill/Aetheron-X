import { PrismaClient } from "@prisma/client";
import { getConfiguredCredentials } from "./auth";

let prismaInstance: PrismaClient | null = null;

function getPrisma() {
  if (!prismaInstance) {
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
      await prismaCli.user.create({
        data: {
          email: credentials.email,
          password: credentials.password,
          role: "admin",
          tasks: {
            create: [
              { title: "Finalize dashboard route", status: "todo" },
              { title: "Add data persistence", status: "done" },
              { title: "Ship v0 API contract", status: "in-progress" },
            ],
          },
        },
      });
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}
