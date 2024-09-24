import RedisStore from "connect-redis";
import Redis from "ioredis";

import { DB_REDIS_HOST, DB_REDIS_PORT } from "@/shared/common/config";

export const redis = new Redis({
  host: DB_REDIS_HOST,
  port: Number(DB_REDIS_PORT),
});

export const redisStore = new RedisStore({
  client: redis,
  prefix: "myapp:",
});
