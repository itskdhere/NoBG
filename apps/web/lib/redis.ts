import { createClient } from "@redis/client";

const ENV = process.env.NODE_ENV;
export const PREFIX = ENV === "production" ? "production" : "dev";

const connectionString = process.env.REDIS_URL;

if (!connectionString) {
  throw new Error("REDIS_URL environment variable is not defined");
}

const redisClientSingleton = () => {
  const client = createClient({ url: connectionString });

  client.on("error", (err) => console.error("Redis Client Error:", err));
  client.on("ready", () => console.log("Redis Client Connected"));

  client.connect().catch((err) => {
    console.error("Failed to connect to Redis:", err);
  });

  return client;
};

type RedisClientType = ReturnType<typeof redisClientSingleton>;

const globalForRedis = globalThis as unknown as {
  redis: RedisClientType | undefined;
};

export const redis = globalForRedis.redis ?? redisClientSingleton();

if (ENV !== "production") globalForRedis.redis = redis;
