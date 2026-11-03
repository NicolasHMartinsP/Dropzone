import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_BACKEND_URL || 'http://127.0.0.1:3333';
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      allowedHosts: ['terminal.local'],
      proxy: {
        '/api': { target, changeOrigin: true },
        '/api-docs': { target, changeOrigin: true },
      },
    },
  };
});
