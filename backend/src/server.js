import { app } from './app.js';
import { env } from './config/env.js';
import { sequelize } from './config/database.js';
import { migrate } from './database/migrate.js';
import { ensureStorage } from './shared/files.js';
import { cleanupStorage } from './services/job.service.js';
import { capabilities } from './services/conversion.service.js';
import { deleteExpiredSessions } from './services/auth.service.js';

try {
  await ensureStorage();
  await migrate();
  await cleanupStorage({ startup: true });
  await deleteExpiredSessions();
  capabilities();
  const server = app.listen(env.port, env.host, () => {
    console.log(`DropZone API: http://localhost:${env.port}/api`);
    console.log(`Swagger: http://localhost:${env.port}/api-docs`);
    if (!capabilities().ffmpeg)
      console.log(
        'FFmpeg ausente: conversão de imagens disponível; áudio/vídeo desabilitados.',
      );
  });
  const timer = setInterval(
    () => runCleanup().catch((error) => console.error(error.message)),
    60000,
  );
  timer.unref();
  for (const signal of ['SIGINT', 'SIGTERM'])
    process.on(signal, () => {
      clearInterval(timer);
      server.close(async () => {
        await sequelize.close();
        process.exit(0);
      });
    });
} catch (error) {
  console.error('Não foi possível iniciar a API:', error.message);
  process.exit(1);
}
async function runCleanup() {
  await cleanupStorage();
  await deleteExpiredSessions();
}
