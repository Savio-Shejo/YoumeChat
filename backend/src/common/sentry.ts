import * as Sentry from '@sentry/node';
import { Application } from 'express';
import { loggers } from './pinoLogger';

export const initSentry = (app: Application) => {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 1.0,
    });
    loggers.security.info('Sentry Error Tracking Engine initialized.');
  }
};
