import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const backendRoot = fileURLToPath(new URL('../../', import.meta.url));
function positiveNumber(name, fallback) {
  const value = Number(process.env[name] || fallback);
  if (!Number.isFinite(value) || value <= 0)
    throw new Error(`${name} precisa ser um número positivo.`);
  return value;
}

export const env = {
  port: positiveNumber('PORT', 3333),
  host: process.env.HOST || '127.0.0.1',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  databaseUrl:
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dropzone',
  storageDir: path.resolve(process.env.STORAGE_DIR || path.join(backendRoot, 'storage')),
  maxFileBytes: positiveNumber('MAX_FILE_SIZE_MB', 50) * 1024 * 1024,
  maxOutputBytes: 200 * 1024 * 1024,
  retentionHours: positiveNumber('FILE_RETENTION_HOURS', 24),
  ffmpegPath: process.env.FFMPEG_PATH || 'ffmpeg',
  ffprobePath: process.env.FFPROBE_PATH || 'ffprobe',
};
