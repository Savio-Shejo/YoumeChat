import http from 'http';
import app from './app';
import { env } from './config/env.config';
import { connectDB } from './config/db.config';
import { initSockets } from './sockets';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    // 1. Connect to MongoDB Atlas Database
    await connectDB();

    // 2. Create HTTP server instance
    const server = http.createServer(app);

    // 3. Initialize Socket.IO server
    initSockets(server);

    // 4. Start listening
    const PORT = Number(env.PORT) || 5000;
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`================================================`);
      logger.info(`  YoumeChat Backend Server Engine Active        `);
      logger.info(`  Environment: ${env.NODE_ENV}                  `);
      logger.info(`  Listening on port: ${PORT}                     `);
      logger.info(`  API Base URL: http://0.0.0.0:${PORT}/api/${env.API_VERSION}`);
      logger.info(`================================================`);
    });

    // Graceful Shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}. Gracefully shutting down HTTP server...`);
      server.close(() => {
        logger.info('HTTP Server closed. Process exiting.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to boot YoumeChat Backend Server:', error);
    process.exit(1);
  }
};

startServer();
