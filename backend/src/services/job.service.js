import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { copyFile, stat, readdir } from 'node:fs/promises';
import { Op } from 'sequelize';
import { Job } from '../models/Job.js';
import { env } from '../config/env.js';
import { AppError } from '../shared/AppError.js';
import {
  inputDir,
  outputDir,
  outputName,
  cleanName,
  removeFile,
} from '../shared/files.js';
import { convertFile, identifyFile, mimeTypes } from './conversion.service.js';
import { downloadRemote, parsePublicUrl } from './remote.service.js';

const sources = new Map();
let activeJobs = 0;
function reserveJob() {
  if (activeJobs >= 2)
    throw new AppError(
      429,
      'Já há dois arquivos em processamento. Aguarde um deles terminar.',
    );
  activeJobs++;
  return () => {
    activeJobs--;
  };
}
export function serializeJob(instance) {
  const job = instance.get ? instance.get({ plain: true }) : instance;
  const { filePath, sourceUrl, ...publicJob } = job;
  const downloadable =
    job.status === 'completed' && !!filePath && new Date(job.expiresAt) > new Date();
  return {
    ...publicJob,
    sizeBytes: Number(job.sizeBytes || 0),
    downloadable,
    downloadUrl: downloadable ? `/api/files/${job.id}` : null,
  };
}

export async function inspectDownload(url, fetchRemote = downloadRemote) {
  parsePublicUrl(url);
  if (sources.size >= 10)
    throw new AppError(
      429,
      'Há muitas análises aguardando processamento. Aguarde a expiração ou prepare um dos downloads.',
    );
  const release = reserveJob();
  const id = randomUUID();
  const input = path.join(inputDir, id);
  try {
    const file = await fetchRemote(url, input);
    const info = await identifyFile(input);
    const source = {
      id,
      path: input,
      url,
      fileName: file.fileName,
      sizeBytes: file.sizeBytes,
      info,
      expiresAt: Date.now() + 15 * 60 * 1000,
      busy: false,
    };
    sources.set(id, source);
    return {
      sourceId: id,
      fileName: file.fileName,
      sizeBytes: file.sizeBytes,
      ...info,
      formats: ['original', ...info.formats.filter((format) => format !== info.format)],
      expiresAt: new Date(source.expiresAt).toISOString(),
    };
  } catch (error) {
    await removeFile(input);
    throw error;
  } finally {
    release();
  }
}

async function processJob({ kind, input, inputName, info, format, sourceUrl }) {
  if (format !== 'original' && !info.formats.includes(format))
    throw new AppError(
      400,
      'Formato de saída incompatível com este arquivo.',
      'INVALID_FORMAT',
    );
  const release = reserveJob();
  let job, output;
  try {
    const extension = format === 'original' ? info.format : format;
    if (!/^[a-z0-9]{1,12}$/.test(extension || ''))
      throw new AppError(415, 'Formato de arquivo não suportado.');
    job = await Job.create({
      kind,
      inputName: cleanName(inputName),
      inputFormat: info.format,
      outputFormat: extension,
      sourceUrl,
    });
    output = path.join(outputDir, `${job.id}.${extension}`);
    let result;
    if (format === 'original') {
      await copyFile(input, output);
      result = {
        sizeBytes: (await stat(output)).size,
        mimeType: mimeTypes[extension] || 'application/octet-stream',
      };
    } else result = await convertFile(input, output, info, format);
    await job.update({
      ...result,
      outputName: outputName(inputName, extension),
      filePath: output,
      status: 'completed',
      completedAt: new Date(),
      expiresAt: new Date(Date.now() + env.retentionHours * 60 * 60 * 1000),
    });
    return serializeJob(job);
  } catch (error) {
    await removeFile(output);
    if (job)
      await job.update({
        status: 'failed',
        errorMessage:
          error instanceof AppError
            ? error.message
            : 'Não foi possível processar o arquivo.',
        completedAt: new Date(),
      });
    throw error;
  } finally {
    release();
  }
}

export async function createDownload({ sourceId, format = 'original' }) {
  const source = sources.get(sourceId);
  if (!source || source.expiresAt < Date.now())
    throw new AppError(
      410,
      'A análise expirou. Analise o link novamente.',
      'SOURCE_EXPIRED',
    );
  if (source.busy) throw new AppError(409, 'Este arquivo já está em processamento.');
  source.busy = true;
  try {
    return await processJob({
      kind: 'download',
      input: source.path,
      inputName: source.fileName,
      info: source.info,
      format,
      sourceUrl: source.url,
    });
  } finally {
    sources.delete(sourceId);
    await removeFile(source.path);
  }
}

export async function createConversion(file, format) {
  if (!file)
    throw new AppError(400, 'Selecione um arquivo para converter.', 'FILE_REQUIRED');
  try {
    const info = await identifyFile(file.path);
    return await processJob({
      kind: 'conversion',
      input: file.path,
      inputName: file.originalname,
      info,
      format,
    });
  } finally {
    await removeFile(file.path);
  }
}

export async function cleanupStorage({ startup = false } = {}) {
  if (startup) {
    await Job.update(
      {
        status: 'failed',
        errorMessage: 'O servidor foi reiniciado durante o processamento.',
        completedAt: new Date(),
      },
      { where: { status: 'processing' } },
    );
    const inputs = await readdir(inputDir);
    await Promise.all(inputs.map((file) => removeFile(path.join(inputDir, file))));
    const referenced = new Set(
      (await Job.findAll({ attributes: ['filePath'] })).map((job) => job.filePath),
    );
    const outputs = await readdir(outputDir);
    await Promise.all(
      outputs.map((file) => {
        const filePath = path.join(outputDir, file);
        return referenced.has(filePath) ? Promise.resolve() : removeFile(filePath);
      }),
    );
  }
  for (const [id, source] of sources) {
    if (source.expiresAt < Date.now() && !source.busy) {
      sources.delete(id);
      await removeFile(source.path);
    }
  }
  const expired = await Job.findAll({
    where: { expiresAt: { [Op.lt]: new Date() }, filePath: { [Op.ne]: null } },
  });
  for (const job of expired) {
    await removeFile(job.filePath);
    await job.update({ filePath: null });
  }
}
