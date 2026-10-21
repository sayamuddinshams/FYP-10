import app from './app.js';
import { ENV } from './config/env.js';
import { prisma } from './config/db.js';
import { logger } from './utils/logger.js';

const PORT = ENV.PORT || 5000;

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('Database connected successfully (SQLite / Prisma).');

    const server = app.listen(PORT, () => {
      logger.info(`RentLink Backend running at http://localhost:${PORT}`);
      logger.info(`Environment: ${ENV.NODE_ENV}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });

    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Closed database connection and HTTP server.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
