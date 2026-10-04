import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {execFileSync} from 'child_process';
import path from 'path';
import {defineConfig} from 'vite';

let lastWbsRefresh = 0;

const refreshWbsDataOnPageLoad = () => ({
  name: 'refresh-wbs-data-on-page-load',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const acceptsHtml = req.headers.accept?.includes('text/html');
      const shouldRefresh =
        req.method === 'GET' &&
        acceptsHtml &&
        process.env.VITE_DATA_SOURCE !== 'mock' &&
        process.env.DISABLE_WBS_REFRESH !== 'true';

      if (shouldRefresh) {
        const now = Date.now();
        if (now - lastWbsRefresh > 2000) {
          lastWbsRefresh = now;
          try {
            execFileSync('python', ['data\\transform_powerautomate_schemas.py'], {
              cwd: __dirname,
              stdio: 'inherit',
            });
          } catch (error) {
            console.error('[wbs-refresh] Failed to refresh WBS data before page load.', error);
          }
        }
      }

      next();
    });
  },
});

export default defineConfig(() => {
  return {
    plugins: [refreshWbsDataOnPageLoad(), react(), tailwindcss()],
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
