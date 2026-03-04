import { createClient } from "@redis/client";

const ENV = process.env.NODE_ENV;
export const PREFIX = ENV === "production" ? "production" : "dev";

const connectionString = `${process.env.REDIS_URL}`;

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient> | undefined;
};

if (!globalForRedis.redis) {
  globalForRedis.redis = createClient({ url: connectionString });
  globalForRedis.redis.on("error", (err) =>
    console.log("Redis Client Error", err)
  );
  await globalForRedis.redis.connect();
}

export const redis = globalForRedis.redis;

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
