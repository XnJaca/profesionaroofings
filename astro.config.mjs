import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://pcdmv.com',
  output: 'static',
  adapter: vercel(),
  security: {
    // Sin esta lista Astro descarta el Host/X-Forwarded-Host que envía Vercel y
    // Astro.url pasa a ser https://localhost, así que el chequeo CSRF de
    // checkOrigin rechaza con 403 todo POST de formulario.
    allowedDomains: [
      { hostname: 'pcdmv.com' },
      { hostname: '**.pcdmv.com' },
      { hostname: '**.vercel.app' },
      { hostname: 'localhost' },
    ],
  },
  build: {
    inlineStylesheets: 'auto',
  },
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
