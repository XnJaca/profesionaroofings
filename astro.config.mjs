import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://pcdmv.com',
  output: 'static',
  adapter: vercel(),
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/api/'),
    }),
  ],
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
  vite: {
    // three.js is loaded with a lazy import(); pre-bundle it so the dev server
    // doesn't discover it late, re-optimize and answer 504 for stale chunks.
    optimizeDeps: {
      include: [
        'three',
        'three/examples/jsm/environments/RoomEnvironment.js',
        'three/examples/jsm/postprocessing/EffectComposer.js',
        'three/examples/jsm/postprocessing/RenderPass.js',
        'three/examples/jsm/postprocessing/GTAOPass.js',
        'three/examples/jsm/postprocessing/OutputPass.js',
      ],
    },
  },
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
