import { Queue } from "bullmq";
import Redis from "ioredis";

const redisConnection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    return Math.min(times * 2000, 30000);
  },
});

redisConnection.on("error", (err) => {
  // Prevent unhandled exception when Redis is not running locally
});

export const notificationQueue = new Queue("notificationQueue", {
  connection: redisConnection as any,
});

notificationQueue.on("error", (err) => {
  // Prevent unhandled exception when Redis is not running locally
});
