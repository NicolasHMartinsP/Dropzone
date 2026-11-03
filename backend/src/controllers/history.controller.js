import * as jobs from '../services/history.service.js';

export async function list(req, res) {
  res.json(await jobs.getHistory(req.query));
}
export async function stats(_req, res) {
  res.json(await jobs.getStats());
}
export async function remove(req, res) {
  await jobs.deleteJob(req.params.id);
  res.status(204).end();
}
export async function clear(_req, res) {
  await jobs.clearHistory();
  res.status(204).end();
}
export async function file(req, res, next) {
  const job = await jobs.getFile(req.params.id);
  res.download(
    job.filePath,
    job.outputName,
    { headers: { 'Content-Type': job.mimeType, 'Cache-Control': 'no-store' } },
    (error) => {
      if (error) next(error);
    },
  );
}
