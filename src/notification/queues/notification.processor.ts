import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import notificationService from "../services/notification.service";

const redisConnection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    return Math.min(times * 2000, 30000);
  },
});

redisConnection.on("error", (err) => {
  // Prevent unhandled exception when Redis is not running locally
});

export const notificationWorker = new Worker(
  "notificationQueue",
  async (job: Job) => {
    console.log(`Processing notification job ${job.id} of type ${job.name}`);
    await notificationService.processNotification(job.name, job.data);
  },
  {
    connection: redisConnection as any,
  }
);

notificationWorker.on("completed", (job) => {
  console.log(`Notification Job ${job.id} has completed!`);
});

notificationWorker.on("failed", (job, err) => {
  console.log(`Notification Job ${job?.id} has failed with ${err.message}`);
});

notificationWorker.on("error", (err) => {
  // Prevent unhandled exception when Redis is not running locally
});
