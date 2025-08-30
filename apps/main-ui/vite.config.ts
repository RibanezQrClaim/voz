// apps/main-ui/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      // Vite espera un ARRAY de plugins
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
});

