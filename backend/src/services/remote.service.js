import http from 'node:http';
import https from 'node:https';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { createWriteStream } from 'node:fs';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import ipaddr from 'ipaddr.js';
import { env } from '../config/env.js';
import { AppError } from '../shared/AppError.js';
import { cleanName, removeFile } from '../shared/files.js';

export function parsePublicUrl(value) {
  let url;
  try {
    if (typeof value !== 'string' || value.length > 2048) throw new Error();
    url = new URL(value);
  } catch {
    throw new AppError(400, 'Informe um link HTTP ou HTTPS válido.', 'INVALID_URL');
  }
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.port
  ) {
    throw new AppError(
      400,
      'Use um link público HTTP/HTTPS, sem credenciais e na porta padrão.',
      'INVALID_URL',
    );
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    (!hostname.includes('.') && !isIP(hostname))
  ) {
    throw new AppError(400, 'Endereços locais não são permitidos.', 'PRIVATE_URL');
  }
  if (isIP(hostname)) assertPublicIp(hostname);
  return url;
}

export function assertPublicIp(value) {
  if (!ipaddr.isValid(value) || ipaddr.process(value).range() !== 'unicast') {
    throw new AppError(
      400,
      'O link precisa apontar para um endereço público.',
      'PRIVATE_URL',
    );
  }
}

export async function resolvePublicUrl(value, resolver = lookup) {
  const url = parsePublicUrl(value);
  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  const addresses = isIP(hostname)
    ? [{ address: hostname, family: isIP(hostname) }]
    : await resolver(hostname, { all: true });
  if (!addresses.length)
    throw new AppError(400, 'Não foi possível encontrar o endereço do site.');
  addresses.forEach(({ address }) => assertPublicIp(address));
  return { url, address: addresses[0] };
}

async function requestPublic(value) {
  const { url, address } = await resolvePublicUrl(value);
  return new Promise((resolve, reject) => {
    const request = (url.protocol === 'https:' ? https : http).get(
      url,
      {
        agent: false,
        maxHeaderSize: 16384,
        headers: {
          'User-Agent': 'DropZone-Academic/1.0',
          Accept: '*/*',
          'Accept-Encoding': 'identity',
        },
        // O IP validado é fixado na conexão para impedir troca de DNS entre validação e acesso.
        lookup: (_hostname, options, callback) =>
          options.all
            ? callback(null, [address])
            : callback(null, address.address, address.family),
      },
      resolve,
    );
    const timer = setTimeout(
      () =>
        request.destroy(
          new AppError(
            504,
            'O site demorou demais para enviar o arquivo.',
            'REMOTE_TIMEOUT',
          ),
        ),
      30000,
    );
    request.on('response', (response) =>
      response.once('close', () => clearTimeout(timer)),
    );
    request.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

export async function downloadRemote(value, destination) {
  let current = parsePublicUrl(value).href;
  try {
    for (let redirects = 0; redirects <= 3; redirects++) {
      const response = await requestPublic(current);
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        const location = response.headers.location;
        response.destroy();
        if (!location || redirects === 3)
          throw new AppError(
            400,
            'O site redirecionou muitas vezes. Use o link direto do arquivo.',
          );
        current = parsePublicUrl(new URL(location, current).href).href;
        continue;
      }
      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.destroy();
        throw new AppError(
          422,
          'O site não liberou o arquivo. Confira se o link é público e direto.',
        );
      }
      const mimeType = String(response.headers['content-type'] || '').split(';')[0];
      if (/html|json|javascript|xml|text\//i.test(mimeType)) {
        response.destroy();
        throw new AppError(
          422,
          'Esse link abre uma página. Cole o endereço direto de uma imagem, um áudio ou um vídeo.',
          'NOT_DIRECT_MEDIA',
        );
      }
      if (Number(response.headers['content-length']) > env.maxFileBytes) {
        response.destroy();
        throw new AppError(
          413,
          `O limite por arquivo é ${env.maxFileBytes / 1024 / 1024} MB.`,
        );
      }
      let bytes = 0;
      const limiter = new Transform({
        transform(chunk, _encoding, callback) {
          bytes += chunk.length;
          if (bytes > env.maxFileBytes)
            return callback(new AppError(413, 'O arquivo excedeu o limite permitido.'));
          callback(null, chunk);
        },
      });
      await pipeline(response, limiter, createWriteStream(destination, { flags: 'wx' }));
      let fileName;
      try {
        fileName = decodeURIComponent(
          new URL(current).pathname.split('/').pop() || 'arquivo',
        );
      } catch {
        fileName = 'arquivo';
      }
      return { fileName: cleanName(fileName), mimeType, sizeBytes: bytes };
    }
  } catch (error) {
    await removeFile(destination);
    if (error instanceof AppError) throw error;
    throw new AppError(
      502,
      'Não foi possível acessar esse arquivo. Verifique o link e sua conexão.',
      'REMOTE_ERROR',
    );
  }
}
