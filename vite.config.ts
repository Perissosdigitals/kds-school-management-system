import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      root: '.',
      build: {
        outDir: 'dist',
        emptyOutDir: true,
      },
      server: {
        port: 5173,
        strictPort: true, // Fail if port unavailable instead of trying another port
        host: '0.0.0.0',
        hmr: {
          overlay: true, // Show errors in browser overlay
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
