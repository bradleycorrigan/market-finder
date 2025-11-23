import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        market: resolve(__dirname, 'market.html'),
        stall: resolve(__dirname, 'stall.html'),
        submit: resolve(__dirname, 'submit.html')
      }
    }
  }
});