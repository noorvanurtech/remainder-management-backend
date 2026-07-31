import express from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorMiddleware';

const app = express();

// Trust the first proxy (e.g., Vercel, Render, Nginx) so rate limiting works correctly
app.set('trust proxy', 1);

/* ================================
   1. Security Headers
================================ */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);



/* ================================
   2. CORS Configuration
================================ */
const corsOptions: CorsOptions = {
  origin: true, // Dynamically mirror request origin for CORS + Credentials
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
};

app.use(cors(corsOptions));

/* ================================
   3. OPTIONS bypass (safe & TS friendly)
================================ */
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

/* ================================
   4. Rate Limiting
================================ */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

/* ================================
   5. Logging
================================ */
app.use(morgan('combined'));

/* ================================
   6. Body Parsers
================================ */
app.use(express.json({
  limit: '10kb',
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/* ================================
   7. Health Check
================================ */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

/* ================================
   8. Database Connection & Routes
================================ */
import connectDB from './config/db';
import routes from './routes';

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api/v1', routes);

/* ================================
   9. Global Error Handler
================================ */
app.use(errorHandler);

export default app;
