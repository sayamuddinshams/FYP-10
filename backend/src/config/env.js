import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017',
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'rentlink',
  JWT_SECRET: process.env.JWT_SECRET || 'rentlink_super_secret_jwt_key_2026_secure_random',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:5175,http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((s) => s.trim()),
};
