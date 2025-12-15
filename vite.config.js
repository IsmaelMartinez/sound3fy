import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'sound3fy',
      fileName: (format) => `sound3fy.${format === 'es' ? 'esm' : format}.js`
    },
    rollupOptions: {
      external: ['d3'],
      output: {
        globals: {
          d3: 'd3'
        },
        exports: 'named'
      }
    }
  },
  server: {
    open: '/examples/basic/index.html'
  }
});

