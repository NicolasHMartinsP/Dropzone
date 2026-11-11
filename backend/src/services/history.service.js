import { stat } from 'node:fs/promises';
import { Op, fn, col, where as sqlWhere } from 'sequelize';
import { Job } from '../models/Job.js';
import { AppError } from '../shared/AppError.js';
import { removeFile } from '../shared/files.js';
import { serializeJob } from './job.service.js';
import { isUuid } from '../shared/validators.js';

export async function findJobOrFail(id) {
  const job = isUuid(id) ? await Job.findByPk(id) : null;
  if (!job) throw new AppError(404, 'Registro não encontrado.', 'NOT_FOUND');
  return job;
}

export async function getHistory({ kind, status, q, page = 1, limit = 10 }) {
  const where = {};
  if (kind) {
    if (!['download', 'conversion'].includes(kind))
      throw new AppError(400, 'Tipo de operação inválido.');
    where.kind = kind;
  }
  if (status) {
    if (!['completed', 'processing', 'failed'].includes(status))
      throw new AppError(400, 'Situação inválida.');
    where.status = status;
  }
  if (
    !/^\d+$/.test(String(page)) ||
    !/^\d+$/.test(String(limit)) ||
    Number(page) < 1 ||
    Number(limit) < 1 ||
    Number(limit) > 50
  )
    throw new AppError(400, 'Paginação inválida. Use limit entre 1 e 50.');
  if (q)
    where[Op.and] = sqlWhere(
      fn('strpos', fn('lower', col('inputName')), String(q).slice(0, 100).toLowerCase()),
      { [Op.gt]: 0 },
    );
  const result = await Job.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: Number(limit),
    offset: (Number(page) - 1) * Number(limit),
  });
  return {
    items: result.rows.map(serializeJob),
    total: result.count,
    page: Number(page),
    pages: Math.max(1, Math.ceil(result.count / Number(limit))),
  };
}

export async function getStats() {
  const [total, downloads, conversions, completed, failed, processing, totalBytes] =
    await Promise.all([
      Job.count(),
      Job.count({ where: { kind: 'download' } }),
      Job.count({ where: { kind: 'conversion' } }),
      Job.count({ where: { status: 'completed' } }),
      Job.count({ where: { status: 'failed' } }),
      Job.count({ where: { status: 'processing' } }),
      Job.sum('sizeBytes', { where: { status: 'completed' } }),
    ]);
  return {
    total,
    downloads,
    conversions,
    completed,
    failed,
    processing,
    totalBytes: Number(totalBytes || 0),
  };
}

export async function getFile(id) {
  const job = await findJobOrFail(id);
  if (!serializeJob(job).downloadable)
    throw new AppError(
      410,
      'O arquivo expirou ou não está disponível. Faça a operação novamente.',
    );
  try {
    await stat(job.filePath);
  } catch {
    throw new AppError(410, 'O arquivo não está mais disponível.');
  }
  return job;
}

export async function deleteJob(id) {
  const job = await findJobOrFail(id);
  if (job.status === 'processing')
    throw new AppError(409, 'Aguarde o processamento terminar para excluir.');
  await removeFile(job.filePath);
  await job.destroy();
}

export async function clearHistory() {
  if (await Job.count({ where: { status: 'processing' } }))
    throw new AppError(409, 'Aguarde todos os processamentos terminarem.');
  const jobs = await Job.findAll();
  for (const job of jobs) {
    await removeFile(job.filePath);
    await job.destroy();
  }
}
