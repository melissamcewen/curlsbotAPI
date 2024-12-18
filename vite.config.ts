import path from 'path';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'haircare-ingredients-analyzer',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'umd'],
    },
    sourcemap: true,
  },
  plugins: [
    dts({
      tsconfigPath: './src/tsconfig.json',
      // This will ensure types are built from src only
      include: ['src'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
