import multer from 'multer';
import { AppError } from '../shared/AppError.js';
import { env } from '../config/env.js';
import { removeFile } from '../shared/files.js';

export async function errorHandler(error, req, res, _next) {
  await removeFile(req.file?.path);
  if (res.headersSent) return res.end();
  if (error instanceof multer.MulterError)
    return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({
      error: {
        code: error.code,
        message:
          error.code === 'LIMIT_FILE_SIZE'
            ? `O limite por arquivo é ${env.maxFileBytes / 1024 / 1024} MB.`
            : 'Envie somente um arquivo e o campo format.',
      },
    });
  if (error instanceof SyntaxError && error.status === 400)
    return res
      .status(400)
      .json({ error: { code: 'INVALID_JSON', message: 'O corpo JSON é inválido.' } });
  if (!(error instanceof AppError)) console.error('[DropZone]', error.message);
  res.status(error.status || 500).json({
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message:
        error instanceof AppError
          ? error.message
          : 'Não foi possível concluir a operação. Tente novamente.',
    },
  });
  if (error.name === 'SequelizeValidationError')
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: error.errors[0].message },
    });

  if (error.name === 'SequelizeUniqueConstraintError')
    return res.status(409).json({
      error: { code: 'ALREADY_EXISTS', message: 'Este e-mail já está cadastrado.' },
    });
}
