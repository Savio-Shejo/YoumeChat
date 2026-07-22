import express, { Application, Request, Response } from 'express';
import { helmetMiddleware, corsMiddleware, noSqlSanitize } from './middlewares/security.middleware';
import { globalRateLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { requestIdMiddleware } from './common/requestId.middleware';
import { prometheusMiddleware, metricsHandler } from './common/prometheus';
import { initSentry } from './common/sentry';
import apiRouter from './routes';
import { env } from './config/env.config';
import { ResponseHandler } from './utils/responseHandler';

const app: Application = express();

// Initialize Sentry Monitoring
initSentry(app);

// Request Tracking & Metrics Middlewares
app.use(requestIdMiddleware);
app.use(prometheusMiddleware);

// Security Middlewares
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(noSqlSanitize);
app.use(globalRateLimiter);

// Prometheus Metrics Endpoint
app.get('/metrics', metricsHandler);

// Health, Readiness & Liveness Endpoints
app.get('/health', (req: Request, res: Response) => {
  return ResponseHandler.success(res, 'YoumeChat API server is healthy and operational', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: env.API_VERSION,
  });
});

app.get('/health/readiness', (req: Request, res: Response) => {
  return ResponseHandler.success(res, 'YoumeChat system readiness check passed');
});

app.get('/health/liveness', (req: Request, res: Response) => {
  return ResponseHandler.success(res, 'YoumeChat system is alive');
});

// API Routes
app.use(`/api/${env.API_VERSION}`, apiRouter);

// 404 Route Handler
app.use('*', (req: Request, res: Response) => {
  return ResponseHandler.error(res, `Cannot find ${req.originalUrl} on this server`, 404, 'NOT_FOUND');
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
