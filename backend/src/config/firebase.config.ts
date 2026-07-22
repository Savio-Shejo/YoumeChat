import * as admin from 'firebase-admin';
import { env } from './env.config';
import { logger } from '../utils/logger';

let firebaseApp: admin.app.App | null = null;

try {
  if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
    const formattedPrivateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: formattedPrivateKey,
      }),
    });
    logger.info('Firebase Admin SDK initialized successfully.');
  } else {
    logger.warn('Firebase Admin SDK credentials not set. Running in development token mode.');
  }
} catch (error: any) {
  logger.error('Failed to initialize Firebase Admin SDK:', error.message);
}

export { firebaseApp, admin };
