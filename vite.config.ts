import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'generate-github-pages-404',
        closeBundle() {
          try {
            const distDir = path.resolve(__dirname, 'dist');
            const indexPath = path.join(distDir, 'index.html');
            const notFoundPath = path.join(distDir, '404.html');
            if (fs.existsSync(indexPath)) {
              fs.copyFileSync(indexPath, notFoundPath);
            }
          } catch (e) {
            console.warn('Could not generate 404.html:', e);
          }
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
