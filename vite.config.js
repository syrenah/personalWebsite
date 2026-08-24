import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Minimal, fast Vite config tuned for smaller/faster builds:
// - `esbuild` minification (fast)
// - no sourcemaps, no brotli size calculation
// - single CSS output (`cssCodeSplit: false`) to reduce file count
// - target modern JS (reduces transpilation overhead)

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    brotliSize: false,
    cssCodeSplit: false,
    emptyOutDir: true,
    rollupOptions: {
      // Let Rollup do default treeshaking; avoid manual chunking so
      // build includes only what the app imports.
      output: {
        manualChunks: undefined,
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
  },
});
