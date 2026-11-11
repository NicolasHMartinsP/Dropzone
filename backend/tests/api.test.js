import test, { before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile, readdir, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import request from 'supertest';
import SwaggerParser from '@apidevtools/swagger-parser';
import { ipKeyGenerator } from 'express-rate-limit';

const testDirectory = await mkdtemp(path.join(os.tmpdir(), 'dropzone-tests-'));
process.env.STORAGE_DIR = testDirectory;
process.env.MAX_FILE_SIZE_MB = '1';

const { app } = await import('../src/app.js');
const { processingLimit } = await import('../src/middlewares/rateLimits.js');
const { sequelize } = await import('../src/config/database.js');
const { migrate } = await import('../src/database/migrate.js');
const { Job } = await import('../src/models/Job.js');
const { ensureStorage, inputDir, outputDir } = await import('../src/shared/files.js');
const { inspectDownload, cleanupStorage } = await import(
  '../src/services/job.service.js'
);
const { capabilities, runTool, identifyFile } = await import(
  '../src/services/conversion.service.js'
);
const { swaggerDocument } = await import('../src/docs/swagger.js');
const { parsePublicUrl, resolvePublicUrl } = await import(
  '../src/services/remote.service.js'
);

let png;
let existingJobs = [];
beforeEach(() => {
  // Cada cenário começa com seu próprio limite; a configuração real continua ativa.
  for (const address of ['127.0.0.1', '::ffff:127.0.0.1']) {
    processingLimit.resetKey(ipKeyGenerator(address));
  }
});
before(async () => {
  await ensureStorage();
  await migrate();
  // Executar duas vezes verifica que a migração é idempotente.
  await migrate();
  existingJobs = await Job.findAll({ raw: true });
  await Job.destroy({ where: {} });
  png = await sharp({
    create: { width: 64, height: 48, channels: 4, background: '#1efd4a' },
  })
    .png()
    .toBuffer();
});
after(async () => {
  await Job.destroy({ where: {} });
  if (existingJobs.length) await Job.bulkCreate(existingJobs);
  await sequelize.close();
  await rm(testDirectory, { recursive: true, force: true });
});

test('API informa as capacidades reais e o Swagger valida contra OpenAPI 3', async () => {
  const health = await request(app).get('/api/health').expect(200);
  assert.equal(health.body.status, 'ok');
  assert.deepEqual(health.body.capabilities.images, ['png', 'jpg', 'webp', 'avif']);
  await SwaggerParser.validate(structuredClone(swaggerDocument));
  await request(app).get('/api-docs/').expect(200).expect('Content-Type', /html/);
  await request(app).get('/api-docs.json').expect(200);
});

test('links locais, credenciais, protocolos impróprios e portas alternativas são bloqueados', async () => {
  for (const url of [
    'file:///etc/passwd',
    'ftp://example.com/a.mp4',
    'http://localhost/a',
    'http://127.0.0.1/a',
    'http://10.0.0.1/a',
    'http://169.254.169.254/a',
    'http://[::1]/a',
    'http://[::ffff:127.0.0.1]/a',
    'https://user:pass@example.com/a',
    'https://example.com:8443/a',
  ]) {
    assert.throws(() => parsePublicUrl(url));
    const response = await request(app)
      .post('/api/downloads/inspect')
      .send({ url })
      .expect(400);
    assert.ok(response.body.error.message);
  }
});

test('DNS misto com endereço privado é rejeitado e DNS público tem IP validado', async () => {
  await assert.rejects(
    resolvePublicUrl('https://example.com/a.png', async () => [
      { address: '93.184.215.14', family: 4 },
      { address: '192.168.1.3', family: 4 },
    ]),
    /público/,
  );
  const resolved = await resolvePublicUrl('https://example.com/a.png', async () => [
    { address: '93.184.215.14', family: 4 },
  ]);
  assert.equal(resolved.address.address, '93.184.215.14');
});

test('conversão real PNG para WebP, JPG, AVIF e PNG gera arquivos válidos e registros', async () => {
  for (const format of ['webp', 'jpg', 'avif', 'png']) {
    const response = await request(app)
      .post('/api/conversions')
      .attach('file', png, 'imagem-teste.png')
      .field('format', format)
      .expect(201);
    const job = response.body;
    assert.equal(job.status, 'completed');
    assert.equal(job.kind, 'conversion');
    assert.equal(job.outputFormat, format);
    assert.equal(job.downloadable, true);
    assert.equal(job.filePath, undefined);
    assert.ok(job.sizeBytes > 0);
    const stored = await Job.findByPk(job.id);
    const metadata = await sharp(stored.filePath).metadata();
    assert.equal(metadata.width, 64);
    assert.equal(metadata.height, 48);
    assert.equal((await identifyFile(stored.filePath)).format, format);
    await request(app)
      .get(job.downloadUrl)
      .expect(200)
      .expect('Content-Disposition', /attachment/);
  }
});

test('arquivos falsos, playlists, formato inválido e requisição sem arquivo são rejeitados', async () => {
  await request(app).post('/api/conversions').field('format', 'png').expect(400);
  await request(app)
    .post('/api/conversions')
    .attach('file', Buffer.from('<html>não sou uma imagem</html>'), 'imagem.png')
    .field('format', 'webp')
    .expect(415);
  await request(app)
    .post('/api/conversions')
    .attach('file', Buffer.from('#EXTM3U\nfile:///etc/passwd'), 'lista.m3u8')
    .field('format', 'mp3')
    .expect(415);
  await request(app)
    .post('/api/conversions')
    .attach('file', png, 'imagem.png')
    .field('format', 'exe')
    .expect(400);
  await request(app)
    .post('/api/conversions')
    .attach(
      'file',
      Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>'),
      'vetor.svg',
    )
    .field('format', 'png')
    .expect(415);
  assert.deepEqual(await readdir(inputDir), []);
});

test('limite de upload é aplicado e o arquivo parcial é removido', async () => {
  await request(app)
    .post('/api/conversions')
    .attach('file', Buffer.alloc(1024 * 1024 + 1), 'grande.png')
    .field('format', 'webp')
    .expect(413);
  assert.deepEqual(await readdir(inputDir), []);
});

test('download usa fonte analisada, preserva bytes no original e consome o sourceId', async () => {
  // Apenas o transporte remoto é substituído: análise, conversão, banco e HTTP são reais.
  const source = await inspectDownload(
    'https://example.com/exemplo.png',
    async (_url, destination) => {
      await writeFile(destination, png);
      return { fileName: 'exemplo.png', mimeType: 'image/png', sizeBytes: png.length };
    },
  );
  assert.ok(source.formats.includes('original'));
  const created = await request(app)
    .post('/api/downloads')
    .send({ sourceId: source.sourceId, format: 'original' })
    .expect(201);
  assert.equal(created.body.kind, 'download');
  const record = await Job.findByPk(created.body.id);
  assert.deepEqual(await readFile(record.filePath), png);
  await request(app)
    .post('/api/downloads')
    .send({ sourceId: source.sourceId, format: 'original' })
    .expect(410);
});

test('histórico filtra, busca sem curingas, pagina e calcula estatísticas', async () => {
  await Job.create({
    kind: 'download',
    status: 'failed',
    inputName: 'relatorio_100%.png',
    inputFormat: 'png',
    outputFormat: 'jpg',
  });
  const conversions = await request(app)
    .get('/api/history?kind=conversion&limit=2&page=1')
    .expect(200);
  assert.equal(conversions.body.items.length, 2);
  assert.ok(conversions.body.pages >= 2);
  assert.ok(conversions.body.items.every((job) => job.kind === 'conversion'));
  const exact = await request(app).get('/api/history').query({ q: '100%' }).expect(200);
  assert.equal(exact.body.total, 1);
  await request(app).get('/api/history?page=0').expect(400);
  await request(app).get('/api/history?kind=invalid').expect(400);
  const stats = await request(app).get('/api/history/stats').expect(200);
  assert.equal(stats.body.total, await Job.count());
  assert.ok(stats.body.totalBytes > 0);
});

test(
  'áudio/vídeo são convertidos por FFmpeg quando instalado',
  { skip: !capabilities().ffmpeg },
  async () => {
    const input = path.join(testDirectory, 'sample.mp4');
    await runTool('ffmpeg', [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-f',
      'lavfi',
      '-i',
      'color=c=blue:s=64x48:d=1',
      '-f',
      'lavfi',
      '-i',
      'sine=frequency=440:duration=1',
      '-shortest',
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      input,
    ]);
    for (const format of ['mp3', 'wav', 'ogg', 'mp4', 'webm']) {
      const result = await request(app)
        .post('/api/conversions')
        .attach('file', input)
        .field('format', format)
        .expect(201);
      const job = await Job.findByPk(result.body.id);
      const probe = JSON.parse(
        await runTool('ffprobe', [
          '-v',
          'error',
          '-show_streams',
          '-of',
          'json',
          job.filePath,
        ]),
      );
      assert.ok(
        probe.streams.some(
          (stream) =>
            stream.codec_type === (['mp4', 'webm'].includes(format) ? 'video' : 'audio'),
        ),
      );
    }
  },
);

test('expiração remove o resultado e mantém os metadados', async () => {
  const job = await Job.findOne({ where: { status: 'completed' } });
  const filePath = job.filePath;
  await job.update({ expiresAt: new Date(Date.now() - 1000) });
  await request(app).get(`/api/files/${job.id}`).expect(410);
  await cleanupStorage();
  await assert.rejects(stat(filePath), { code: 'ENOENT' });
  assert.ok(await Job.findByPk(job.id));
});

test('reinício marca tarefas interrompidas e remove arquivos órfãos', async () => {
  const job = await Job.create({
    kind: 'conversion',
    status: 'processing',
    inputName: 'interrompido.png',
  });
  const orphan = path.join(outputDir, 'orphan.webp');
  await writeFile(orphan, 'incompleto');
  await cleanupStorage({ startup: true });
  assert.equal((await Job.findByPk(job.id)).status, 'failed');
  await assert.rejects(stat(orphan), { code: 'ENOENT' });
});

test('exclusão individual e limpeza removem registros e resultados', async () => {
  const job = await Job.findOne({
    where: { status: 'completed', filePath: { [sequelize.Sequelize.Op.ne]: null } },
  });
  const filePath = job.filePath;
  await request(app).delete(`/api/history/${job.id}`).expect(204);
  assert.equal(await Job.findByPk(job.id), null);
  await assert.rejects(stat(filePath), { code: 'ENOENT' });
  await request(app).get(`/api/files/${job.id}`).expect(404);
  await request(app).delete('/api/history').expect(204);
  assert.equal(await Job.count(), 0);
  assert.deepEqual(await readdir(outputDir), []);
});
