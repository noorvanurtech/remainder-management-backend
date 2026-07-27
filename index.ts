import app from './src/app';
import connectDB from './src/config/db';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from './src/utils/logger';
import dns from 'dns';
import notificationGateway from './src/notification/gateways/notification.gateway';
import { NotificationModule } from './src/notification/notification.module';
import CronJobManager from './src/cron';

// Force Node.js to use Google DNS to bypass local DNS resolution issues (ECONNREFUSED)
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load Env based on NODE_ENV from Root Directory
// const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
// dotenv.config({ path: path.resolve(__dirname, envFile) });
dotenv.config();
const PORT = process.env.PORT || 5000;

// Connect to Database and Start Server
const startServer = async () => {
    try {
        await connectDB();
        
        const server = app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });

        // Initialize Notification Module (Listeners & Queue Processors)
        NotificationModule.initialize();

        // Initialize Socket.io Gateway
        notificationGateway.initialize(server as any);

        // Initialize Cron Jobs
        CronJobManager.initialize();

        server.on('error', (err) => {
            logger.error(`Server Error: ${err}`);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err: Error) => {
            logger.error(`Unhandled Rejection: ${err.message}`);
            // Close server & exit process
            server.close(() => process.exit(1));
        });
    } catch (error) {
        logger.error(`Failed to start server: ${error}`);
        process.exit(1);
    }
};

startServer();
