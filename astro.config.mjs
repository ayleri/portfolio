import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ailen.ca',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  vite: { server: { strictPort: true } },
});
