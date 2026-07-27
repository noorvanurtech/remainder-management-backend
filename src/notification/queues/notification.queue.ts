import { Queue } from "bullmq";
import Redis from "ioredis";

// Use environment variables for Redis config
const redisConnection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", { maxRetriesPerRequest: null });

export const notificationQueue = new Queue("notificationQueue", {
  connection: redisConnection as any,
});
