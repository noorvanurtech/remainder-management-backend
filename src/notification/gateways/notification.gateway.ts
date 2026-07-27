import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";

class NotificationGateway {
  private io: SocketServer | null = null;

  initialize(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: "*", // Adjust according to your CORS policy
        methods: ["GET", "POST"]
      }
    });

    this.io.on("connection", (socket) => {
      console.log(`Client connected to notifications: ${socket.id}`);
      
      // Clients can join their own private room based on user ID
      socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`Socket ${socket.id} joined room ${userId}`);
      });

      socket.on("disconnect", () => {
        console.log(`Client disconnected from notifications: ${socket.id}`);
      });
    });
  }

  broadcastEvent(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  sendToUser(userId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(userId).emit(event, data);
    }
  }
}

export default new NotificationGateway();
