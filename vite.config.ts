import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/voz/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
});
