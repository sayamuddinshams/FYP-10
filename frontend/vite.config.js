import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The site is published to GitHub Pages under the repository name
// (https://sayamuddinshams.github.io/FYP-10/). Override with VITE_BASE when
// serving from a custom domain, e.g. VITE_BASE=/ npm run build.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Keep the local dev URL clean (http://localhost:5174/). Production builds
  // and `vite preview` (which serves those builds) keep the /FYP-10/ base.
  base: process.env.VITE_BASE || (process.env.NODE_ENV === 'development' ? '/' : '/FYP-10/'),
  server: {
    port: 5174,
    host: true,
  },
  build: {
    outDir: 'dist',
  },
});
