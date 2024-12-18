import path from 'path';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'haircare-ingredients-analyzer',
      fileName: 'index',
      formats: ['es'],
    },
    outDir: 'next/src/lib/analyzer',
    sourcemap: true,
    rollupOptions: {
      external: ['uuid', 'flexsearch'],
      output: {
        exports: 'named',
        preserveModules: true,
        globals: {
          uuid: 'uuid',
          flexsearch: 'FlexSearch',
        },
      },
    },
  },
  plugins: [
    dts({
      tsconfigPath: './src/tsconfig.json',
      include: ['src'],
      outDir: 'next/src/lib/analyzer/types',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
