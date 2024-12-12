import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'haircare-ingredients-analyzer',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'umd']
    },
    sourcemap: true,
    rollupOptions: {
      external: ['uuid', 'flexsearch'],
      output: {
        globals: {
          uuid: 'uuid',
          flexsearch: 'FlexSearch'
        }
      }
    }
  }
})
