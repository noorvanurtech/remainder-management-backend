export class NotificationModule {
  static initialize() {
    console.log("Initializing Notification Module...");

    // Initialize BullMQ Processor
    import("./queues/notification.processor");
  }
}
