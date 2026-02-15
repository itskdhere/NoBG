import { createClient } from "@redis/client";

const connectionString = `${process.env.REDIS_URL}`;

const redis = createClient({ url: connectionString });

redis.on("error", (err) => console.log("Redis Client Error", err));

await redis.connect();

export { redis };
