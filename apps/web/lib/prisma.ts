import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const ENV = process.env.NODE_ENV;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not defined");
}

const prismaClientSingleton = () => {
  const pool = new Pool({
    connectionString,
    max: 10,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: ENV === "development" ? ["error", "warn", "info"] : ["error"],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (ENV !== "production") globalForPrisma.prisma = prisma;
