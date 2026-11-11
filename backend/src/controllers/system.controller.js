import { env } from '../config/env.js';
import { capabilities } from '../services/conversion.service.js';

// Informa que a API está no ar e o que ela consegue converter.
export function health(_req, res) {
  res.json({
    status: 'ok',
    app: 'DropZone',
    capabilities: capabilities(),
    retentionHours: env.retentionHours,
  });
}

// Lista os formatos de conversão disponíveis neste servidor.
export function formats(_req, res) {
  res.json(capabilities());
}
