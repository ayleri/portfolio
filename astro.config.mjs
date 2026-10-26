import { defineConfig } from 'astro/config';
import tempCatalogue from './src/lib/temp-catalogue/integration.mjs';

export default defineConfig({
  site: 'https://ailen.ca',
  output: 'static',
  trailingSlash: 'always',
  integrations: [tempCatalogue()],
  devToolbar: { enabled: false },
  vite: { server: { strictPort: true } },
});
