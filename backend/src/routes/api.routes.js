import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import * as downloads from '../controllers/download.controller.js';
import * as conversions from '../controllers/conversion.controller.js';
import * as history from '../controllers/history.controller.js';
import { upload } from '../middlewares/upload.js';
import { capabilities } from '../services/conversion.service.js';
import { env } from '../config/env.js';

export const apiRoutes = Router();
export const processingLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: { code: 'RATE_LIMIT', message: 'Muitas solicitações. Aguarde um minuto.' },
  },
});
apiRoutes.get('/health', (_req, res) =>
  res.json({
    status: 'ok',
    app: 'DropZone',
    capabilities: capabilities(),
    retentionHours: env.retentionHours,
  }),
);
apiRoutes.get('/formats', (_req, res) => res.json(capabilities()));
apiRoutes.post('/downloads/inspect', processingLimit, downloads.inspect);
apiRoutes.post('/downloads', processingLimit, downloads.create);
apiRoutes.post(
  '/conversions',
  processingLimit,
  upload.single('file'),
  conversions.create,
);
apiRoutes.get('/history/stats', history.stats);
apiRoutes.get('/history', history.list);
apiRoutes.delete('/history', history.clear);
apiRoutes.delete('/history/:id', history.remove);
apiRoutes.get('/files/:id', history.file);
