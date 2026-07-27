import { Request, Response } from "express";

class NotificationController {
  // Placeholder for REST endpoints if needed (e.g. GET /notifications)
  getNotifications(req: Request, res: Response) {
    res.status(200).json({ success: true, message: "Notifications retrieved" });
  }
}

export default new NotificationController();
