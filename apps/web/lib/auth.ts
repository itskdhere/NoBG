import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const ENV = process.env.NODE_ENV === "production" ? "production" : "dev";

const PREFIX = `${ENV}:better-auth`;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secondaryStorage: {
    get: async (key) => {
      return await redis.get(`${PREFIX}:${key}`);
    },
    set: async (key, value, ttl) => {
      if (ttl) await redis.set(`${PREFIX}:${key}`, value, { EX: ttl });
      else await redis.set(`${PREFIX}:${key}`, value);
    },
    delete: async (key) => {
      await redis.del(`${PREFIX}:${key}`);
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
});
