import sharp from 'sharp';
import { spawn, spawnSync } from 'node:child_process';
import { stat, open } from 'node:fs/promises';
import { env } from '../config/env.js';
import { AppError } from '../shared/AppError.js';

sharp.cache(false);

export const imageFormats = ['png', 'jpg', 'webp', 'avif'];
export const audioFormats = ['mp3', 'wav', 'ogg'];
export const videoFormats = ['mp4', 'webm', ...audioFormats];
export const mimeTypes = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
};
let mediaAvailable;

export function capabilities() {
  if (mediaAvailable === undefined)
    mediaAvailable = [env.ffmpegPath, env.ffprobePath].every(
      (cmd) =>
        spawnSync(cmd, ['-version'], {
          timeout: 5000,
          windowsHide: true,
          stdio: 'ignore',
        }).status === 0,
    );
  return {
    images: imageFormats,
    audio: mediaAvailable ? audioFormats : [],
    video: mediaAvailable ? videoFormats : [],
    ffmpeg: mediaAvailable,
    maxFileSizeMB: env.maxFileBytes / 1024 / 1024,
    maxMediaDurationSeconds: 600,
  };
}

export function runTool(command, args, timeout = 120000) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      windowsHide: true,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    let settled = false;
    const finish = (error, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) reject(error);
      else resolve(result);
    };
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      finish(
        new AppError(
          422,
          'O processamento levou mais de 2 minutos. Tente um arquivo menor.',
          'PROCESS_TIMEOUT',
        ),
      );
    }, timeout);
    child.stdout.on('data', (chunk) => {
      output = (output + chunk).slice(-65536);
    });
    child.stderr.resume();
    child.once('error', () =>
      finish(
        new AppError(
          503,
          'FFmpeg e FFprobe precisam estar instalados para processar áudio e vídeo.',
          'FFMPEG_UNAVAILABLE',
        ),
      ),
    );
    child.once('close', (code) =>
      finish(
        code === 0
          ? null
          : new AppError(
              422,
              'O arquivo ou o formato não pôde ser processado. Verifique se o arquivo está íntegro.',
              'PROCESS_ERROR',
            ),
        output,
      ),
    );
  });
}

export async function identifyFile(input) {
  let metadata;
  try {
    metadata = await sharp(input, {
      limitInputPixels: 20000000,
      failOn: 'error',
    }).metadata();
  } catch {
    /* Se não for imagem válida, tenta os formatos de mídia. */
  }
  if (metadata) {
    const format =
      metadata.format === 'jpeg'
        ? 'jpg'
        : metadata.format === 'heif' && metadata.compression === 'av1'
          ? 'avif'
          : metadata.format;
    if (!imageFormats.includes(format) || (metadata.pages || 1) > 1) {
      throw new AppError(
        415,
        'Use imagens estáticas PNG, JPG, WebP ou AVIF.',
        'UNSUPPORTED_IMAGE',
      );
    }
    return {
      kind: 'image',
      format,
      width: metadata.width,
      height: metadata.height,
      formats: imageFormats,
    };
  }
  // Assinaturas binárias evitam tratar playlists e páginas como arquivos de mídia.
  const handle = await open(input, 'r');
  const signature = Buffer.alloc(16);
  try {
    await handle.read(signature, 0, 16, 0);
  } finally {
    await handle.close();
  }
  const riff = signature.subarray(0, 4).toString() === 'RIFF';
  const isMediaContainer =
    (riff && ['WAVE', 'AVI '].includes(signature.subarray(8, 12).toString())) ||
    ['fLaC', 'OggS'].includes(signature.subarray(0, 4).toString()) ||
    signature.subarray(0, 3).toString() === 'ID3' ||
    (signature[0] === 0xff && (signature[1] & 0xe0) === 0xe0) ||
    ['ftyp', 'moov', 'mdat', 'wide'].includes(signature.subarray(4, 8).toString()) ||
    signature.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  if (!isMediaContainer)
    throw new AppError(
      415,
      'Arquivo incompatível. Envie uma imagem, um áudio ou um vídeo; páginas e playlists não são aceitas.',
      'UNSUPPORTED_FILE',
    );
  if (!capabilities().ffmpeg)
    throw new AppError(
      415,
      'Use uma imagem PNG, JPG, WebP ou AVIF. Para áudio/vídeo, instale FFmpeg e FFprobe.',
      'UNSUPPORTED_FILE',
    );
  const raw = await runTool(
    env.ffprobePath,
    [
      '-v',
      'error',
      '-protocol_whitelist',
      'file,pipe',
      '-show_format',
      '-show_streams',
      '-of',
      'json',
      input,
    ],
    15000,
  );
  const probe = JSON.parse(raw);
  const streams = probe.streams || [];
  const hasVideo = streams.some(
    (s) => s.codec_type === 'video' && !s.disposition?.attached_pic,
  );
  const hasAudio = streams.some((s) => s.codec_type === 'audio');
  if (!hasVideo && !hasAudio)
    throw new AppError(415, 'O arquivo não contém imagem, áudio ou vídeo compatível.');
  const duration = Number(probe.format?.duration);
  if (!Number.isFinite(duration) || duration <= 0 || duration > 600)
    throw new AppError(422, 'Áudios e vídeos devem ter duração de até 10 minutos.');
  const formats = String(probe.format?.format_name || '').split(',');
  const format = formats.includes('mp4')
    ? 'mp4'
    : formats.includes('webm')
      ? 'webm'
      : formats[0];
  return {
    kind: hasVideo ? 'video' : 'audio',
    format,
    duration,
    formats: hasVideo ? (hasAudio ? videoFormats : ['mp4', 'webm']) : audioFormats,
  };
}

export async function convertFile(input, output, info, format) {
  if (!info.formats.includes(format))
    throw new AppError(
      400,
      'Formato de saída incompatível com este arquivo.',
      'INVALID_FORMAT',
    );
  if (info.kind === 'image') {
    await sharp(input, { limitInputPixels: 20000000 })
      .rotate()
      .flatten(format === 'jpg' ? { background: '#ffffff' } : false)
      .toFormat(format === 'jpg' ? 'jpeg' : format, { quality: 85 })
      .toFile(output);
  } else {
    const codecs = {
      mp3: ['-vn', '-c:a', 'libmp3lame', '-b:a', '192k'],
      wav: ['-vn', '-c:a', 'pcm_s16le', '-ar', '44100', '-ac', '2'],
      ogg: ['-vn', '-c:a', 'libvorbis', '-q:a', '5'],
      mp4: [
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-crf',
        '23',
        '-vf',
        'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'aac',
        '-movflags',
        '+faststart',
      ],
      webm: [
        '-c:v',
        'libvpx-vp9',
        '-deadline',
        'realtime',
        '-cpu-used',
        '8',
        '-crf',
        '32',
        '-b:v',
        '0',
        '-c:a',
        'libopus',
      ],
    };
    await runTool(env.ffmpegPath, [
      '-nostdin',
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-protocol_whitelist',
      'file,pipe',
      '-i',
      input,
      ...codecs[format],
      '-threads',
      '2',
      output,
    ]);
  }
  const result = await stat(output);
  if (!result.size || result.size > env.maxOutputBytes)
    throw new AppError(
      422,
      'O resultado excedeu o limite de 200 MB. Tente um arquivo menor.',
    );
  return { sizeBytes: result.size, mimeType: mimeTypes[format] };
}
