my personal site!

## Temporary catalogue

The standalone Electric Moon catalogue is hosted at <https://ailen.ca/temp/>.
Its HTML and local images, font, and stylesheet live in `public/temp/`, which
Astro copies into the built website. The snapshot was downloaded from
<https://e-moom.carrd.co/>; its original artwork, branding, and outbound links are
preserved.

To refresh it, validate a fresh Carrd download, then replace the complete
`public/temp/` directory with that download's `index.html` and `assets/` directory.
Keep asset references relative so the page continues to work under `/temp/`.
Do not edit the imported files directly; apply any future local customizations
through a separate build layer.

The build integration in `src/lib/temp-catalogue/` adds a scroll-driven fade to
the star background in the built HTML only. Stars fade from full opacity to 10%
over the first 60% of a viewport of scrolling (or the available scroll distance
on shorter pages), returning when scrolling up.
Reduced-motion visitors get a constant 10% opacity. Product artwork and the
imported source files remain unchanged. Use the built preview to review this
customization; it is not applied by the development server.

Run `npm run build` and `npm run preview`, then check `/temp/`, each catalogue
section, and the print gallery before pushing. Pushing to `main` triggers the
existing GitHub Pages deployment. To remove the temporary site, delete
`public/temp/` and deploy again.
