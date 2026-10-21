import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✓ SQLite database connected successfully via Prisma');
  } catch (error) {
    console.error('Failed to connect to SQLite database:', error);
    process.exit(1);
  }
}
