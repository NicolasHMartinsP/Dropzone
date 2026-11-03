import { createConversion } from '../services/job.service.js';
import { AppError } from '../shared/AppError.js';

export async function create(req, res) {
  if (typeof req.body?.format !== 'string' || req.body.format === 'original')
    throw new AppError(400, 'Informe um formato de conversão válido.');
  res.status(201).json(await createConversion(req.file, req.body.format));
}
