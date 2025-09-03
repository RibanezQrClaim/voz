// apps/main-ui/vite.config.ts
// @ts-nocheck
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_AGENT_URL || 'http://localhost:8000';

  return {
    plugins: [react(), tsconfigPaths()],
    server: {
      port: 5173,
      proxy: {
        '/api': { target, changeOrigin: true },
      },
    },
    css: { postcss: './postcss.config.cjs' },
    resolve: { dedupe: ['react', 'react-dom', 'react/jsx-runtime'] },
  };
});



