import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://professional-roofing.onrender.com',
  build: {
    inlineStylesheets: 'auto',
  },
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
