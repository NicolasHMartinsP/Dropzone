import path from 'node:path';
import { mkdir, rm } from 'node:fs/promises';
import { env } from '../config/env.js';

export const inputDir = path.join(env.storageDir, 'inputs');
export const outputDir = path.join(env.storageDir, 'outputs');
export async function ensureStorage() {
  await mkdir(inputDir, { recursive: true });
  await mkdir(outputDir, { recursive: true });
}
export const removeFile = (file) =>
  file ? rm(file, { force: true }).catch(() => {}) : Promise.resolve();
export function cleanName(name = 'arquivo') {
  return (
    path
      .basename(name.replaceAll('\\', '/'))
      .normalize('NFKC')
      .replace(/[\x00-\x1f\x7f<>:"/\\|?*]/g, '_')
      .slice(0, 120) || 'arquivo'
  );
}
export function outputName(input, extension) {
  return `${path.parse(cleanName(input)).name || 'arquivo'}.${extension}`;
}
