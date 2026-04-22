// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Proxy API calls to your ASP.NET Core dev server
    // so you don't get CORS issues during development.
    proxy: {
      '/api': {
        target: 'https://localhost:7001',
        changeOrigin: true,
        secure: false,      // allow self-signed certs in dev
      },
    },
  },
});