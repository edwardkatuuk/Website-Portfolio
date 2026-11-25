import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  appType: 'mpa',
  base: './',
  build: {
    target: 'es2022',
    outDir: 'dist',
    rolldownOptions: {
      input: {
        portfolio: resolve(import.meta.dirname, 'index.html'),
        vanoworship: resolve(import.meta.dirname, 'vanoworship/index.html'),
      },
      output: {
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[\\/]three[\\/]/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom)[\\/]/ },
          ],
        },
      },
    },
  },
});
