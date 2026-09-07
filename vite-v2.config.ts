import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist-v2',
    emptyOutDir: true,
    rollupOptions: { input: 'index-v2.html' }
  },
  test: {
    include: ['tests-v2/**/*.test.ts'],
    environment: 'node'
  }
});
