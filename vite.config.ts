import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'haircare-ingredients-analyzer',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'umd'],
    },
    sourcemap: true,
    rollupOptions: {
      external: ['uuid', 'flexsearch'],
      output: {
        globals: {
          uuid: 'uuid',
          flexsearch: 'FlexSearch',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
