import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import sharp from 'sharp';

// This test only exercises analyzed temporary files; it never connects to the database.
test('preview serves validated bytes and ranges without exposing paths or fetching a new URL', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'dropzone-preview-'));
  process.env.STORAGE_DIR = directory;
  const { app } = await import('../src/app.js');
  const { ensureStorage } = await import('../src/shared/files.js');
  const { inspectDownload, getSourcePreview } =
    await import('../src/services/job.service.js');
  try {
    await ensureStorage();
    const png = await sharp({
      create: { width: 32, height: 24, channels: 3, background: '#355834' },
    })
      .png()
      .toBuffer();
    const source = await inspectDownload(
      'https://example.com/test.png',
      async (_url, target) => {
        await writeFile(target, png);
        return { fileName: 'test.png', sizeBytes: png.length };
      },
    );
    assert.equal(source.path, undefined);
    assert.equal(source.previewUrl, `/api/downloads/${source.sourceId}/preview`);
    const response = await request(app)
      .get(source.previewUrl)
      .expect(200)
      .expect('Content-Type', /image\/png/)
      .expect('Cache-Control', 'no-store');
    assert.deepEqual(response.body, png);
    const part = await request(app)
      .get(source.previewUrl)
      .set('Range', 'bytes=0-7')
      .expect(206);
    assert.deepEqual(part.body, png.subarray(0, 8));
    await request(app).get('/api/downloads/unknown/preview').expect(410);
    assert.throws(() => getSourcePreview('../../etc/passwd'), { status: 410 });
    const originalNow = Date.now;
    try {
      Date.now = () => originalNow() + 16 * 60 * 1000;
      assert.throws(() => getSourcePreview(source.sourceId), { status: 410 });
    } finally {
      Date.now = originalNow;
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
