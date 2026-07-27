import { getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getMessaging, Message } from 'firebase-admin/messaging';

// Initialize Firebase Admin SDK
try {
  if (!getApps().length) {
    initializeApp({
      credential: applicationDefault(), 
    });
  }
} catch (error) {
  console.error("Firebase admin initialization error", error);
}

class PushService {
  async sendPushNotification(token: string, title: string, body: string, data?: any) {
    try {
      const message: Message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        token,
      };

      const response = await getMessaging().send(message);
      console.log('Successfully sent push notification:', response);
      return response;
    } catch (error) {
      console.error('Error sending push notification:', error);
      // Don't throw if you want the system to keep running even if a push fails
      // throw error; 
    }
  }
}

export default new PushService();
