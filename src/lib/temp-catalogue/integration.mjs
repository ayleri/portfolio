import { readFile, writeFile } from 'node:fs/promises';

// Customize only the built copy; public/temp remains the original Carrd snapshot.
export default function tempCatalogue() {
  return {
    name: 'temp-catalogue',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const page = new URL('temp/index.html', dir);
        const [html, css, script] = await Promise.all([
          readFile(page, 'utf8'),
          readFile(new URL('./scroll-fade.css', import.meta.url), 'utf8'),
          readFile(new URL('./scroll-fade.js', import.meta.url), 'utf8'),
        ]);

        if (!html.includes('</head>') || !html.includes('</body>')) {
          throw new Error('The temporary catalogue must have a closing head and body.');
        }

        await writeFile(page, html
          .replace('</head>', () => `<style id="catalogue-scroll-fade">${css}</style></head>`)
          .replace('</body>', () => `<script>${script}</script></body>`));
      },
    },
  };
}
