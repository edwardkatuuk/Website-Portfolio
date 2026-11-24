import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  appType: 'mpa',
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        portfolio: resolve(import.meta.dirname, 'index.html'),
        vanoworship: resolve(import.meta.dirname, 'vanoworship/index.html'),
      },
    },
  },
});
