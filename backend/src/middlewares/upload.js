import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { inputDir } from '../shared/files.js';

export const upload = multer({
  storage: multer.diskStorage({
    destination: inputDir,
    filename: (_req, _file, callback) => callback(null, randomUUID()),
  }),
  limits: { fileSize: env.maxFileBytes, files: 1, fields: 1, fieldSize: 100, parts: 2 },
});
