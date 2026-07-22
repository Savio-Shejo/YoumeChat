import pino from 'pino';
import fs from 'fs';
import path from 'path';

const logDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const createPinoLogger = (filename: string) => {
  return pino(
    {
      level: process.env.LOG_LEVEL || 'info',
      base: { env: process.env.NODE_ENV },
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    pino.multistream([
      { stream: pino.destination(path.join(logDir, filename)) },
      { stream: process.stdout },
    ])
  );
};

export const loggers = {
  auth: createPinoLogger('auth.log'),
  socket: createPinoLogger('socket.log'),
  database: createPinoLogger('database.log'),
  security: createPinoLogger('security.log'),
  admin: createPinoLogger('admin.log'),
  error: createPinoLogger('error.log'),
  api: createPinoLogger('api.log'),
};
