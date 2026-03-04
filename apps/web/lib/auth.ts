import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { redis, PREFIX } from "@/lib/redis";

const prefix = `${PREFIX}:better-auth`;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secondaryStorage: {
    get: async (key) => {
      return await redis.get(`${prefix}:${key}`);
    },
    set: async (key, value, ttl) => {
      if (ttl) await redis.set(`${prefix}:${key}`, value, { EX: ttl });
      else await redis.set(`${prefix}:${key}`, value);
    },
    delete: async (key) => {
      await redis.del(`${prefix}:${key}`);
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
});
