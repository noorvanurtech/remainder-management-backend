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
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com", "https://*.razorpay.com"],
        frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com", "https://*.razorpay.com"],
        connectSrc: ["'self'", "https://api.razorpay.com", "https://*.razorpay.com"],
        imgSrc: ["'self'", "data:", "https://*.razorpay.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
      },
    },
  })
);



/* ================================
   2. CORS Configuration
================================ */
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const envOrigin = process.env.CORS_ORIGIN || '';
    let allowedOrigins: string[] = [];

    // Handle array-like env: ['url1','url2']
    if (envOrigin.startsWith('[') && envOrigin.endsWith(']')) {
      allowedOrigins = envOrigin
        .slice(1, -1)
        .split(',')
        .map(o => o.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
    } else {
      // Handle: url1,url2 OR single url
      allowedOrigins = envOrigin
        .split(',')
        .map(o => o.trim())
        .filter(Boolean);
    }

    // Debug (optional – remove later)
    // console.log('Incoming Origin:', origin);

    // Allow server-to-server / mobile / curl
    if (!origin) {
      return callback(null, true);
    }

    // Allow all if explicitly *
    if (allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    // Exact origin match
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },

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
   8. Routes
================================ */
import routes from './routes';
app.use('/api/v1', routes);

/* ================================
   9. Global Error Handler
================================ */
app.use(errorHandler);

export default app;
