import emailService from "./email.service";
import pushService from "./push.service";
import notificationGateway from "../gateways/notification.gateway";

class NotificationService {
  async processNotification(eventType: string, data: any) {
    try {
      switch (eventType) {
        case "JOB_CREATED":
          await this.handleJobCreated(data);
          break;
        case "USER_REGISTERED":
          await this.handleUserRegistered(data);
          break;
        case "JOB_STATUS_UPDATED":
          await this.handleJobStatusUpdated(data);
          break;
        case "ORDER_CREATED":
          // handle order created
          break;
        default:
          console.warn(`Unhandled notification event type: ${eventType}`);
      }
    } catch (error) {
      console.error(`Error processing notification for ${eventType}:`, error);
      throw error;
    }
  }

  private async handleJobCreated(jobData: any) {
    // 1. Send Email to Customer
    const customerEmail = jobData.customerEmail; 
    if (customerEmail) {
      await emailService.sendJobCreatedEmail(customerEmail, jobData);
    } else {
      console.warn("No customer email provided for JOB_CREATED email notification.");
    }

    // 2. Send Real-time Socket Alert to admins or the specific customer
    notificationGateway.broadcastEvent("new_booking", jobData);
    if (jobData.customerId) {
      notificationGateway.sendToUser(jobData.customerId.toString(), "booking_update", jobData);
    }

    // 3. Send Push Notification (If user has FCM token stored)
    if (jobData.customerFcmToken) {
      await pushService.sendPushNotification(
        jobData.customerFcmToken,
        "Booking Confirmed",
        `Your booking ${jobData._id} has been created successfully.`
      );
    }
  }
  private async handleUserRegistered(userData: any) {
    // Broadcast Real-time Socket Alert to admins
    notificationGateway.broadcastEvent("new_user", userData);
  }

  private async handleJobStatusUpdated(jobData: any) {
    // Broadcast Real-time Socket Alert to admins
    notificationGateway.broadcastEvent("job_status_updated", jobData);
    
    // Notify specific customer about their job status update via socket
    if (jobData.customerId) {
      notificationGateway.sendToUser(jobData.customerId.toString(), "booking_update", jobData);
    }

    // Optional: Send Push Notification (If user has FCM token stored)
    if (jobData.customerFcmToken) {
      await pushService.sendPushNotification(
        jobData.customerFcmToken,
        "Job Status Updated",
        `Your booking ${jobData._id} status has been updated to ${jobData.jobStatus}.`
      );
    }
  }
}

export default new NotificationService();
