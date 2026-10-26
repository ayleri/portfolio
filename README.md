my personal site!

## Temporary catalogue

The standalone Electric Moon catalogue is hosted at <https://ailen.ca/temp/>.
Its HTML and local images, font, and stylesheet live in `public/temp/`, which
Astro copies into the built website unchanged. The snapshot was downloaded from
<https://e-moom.carrd.co/>; its original artwork, branding, and outbound links are
preserved.

To refresh it, validate a fresh Carrd download, then replace the complete
`public/temp/` directory with that download's `index.html` and `assets/` directory.
Keep asset references relative so the page continues to work under `/temp/`.
Do not edit the imported files directly; apply any future local customizations
through a separate build layer.

Run `npm run build` and `npm run preview`, then check `/temp/`, each catalogue
section, and the print gallery before pushing. Pushing to `main` triggers the
existing GitHub Pages deployment. To remove the temporary site, delete
`public/temp/` and deploy again.
