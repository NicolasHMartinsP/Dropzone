import { inspectDownload, createDownload } from '../services/job.service.js';
import { AppError } from '../shared/AppError.js';

export async function inspect(req, res) {
  res.json(await inspectDownload(req.body?.url));
}
export async function create(req, res) {
  if (typeof req.body?.sourceId !== 'string' || typeof req.body?.format !== 'string')
    throw new AppError(400, 'Informe sourceId e format.');
  res.status(201).json(await createDownload(req.body));
}
