# portfoliobuilt

built with Astro. One source page holds the content and shared structure; Astro produces static HTML for each URL.

## Preview

Use Node.js 22.22 or newer. Install dependencies once, then start development:

```sh
npm install
npm run dev
```

Open <http://localhost:3000>. Changes update automatically. `/` and `/about/` show About; `/projects/` shows Projects; `/hackathons/` shows Hackathons. Direct links and refreshes return the correct HTML without a 404 redirect or waiting for JavaScript to choose a section.

## Customize

Edit `src/pages/[...page].astro` for the header, navigation, footer, and all page content. Every page includes all sections. The `active` value sets their initial `hidden` attributes before the HTML reaches the browser, so only the requested section appears from the first paint. Typography and spacing live in `style/main.css`; browser code lives in `js/`.

`js/index.mjs` switches sections in place using their `hidden` attributes and updates the URL through the browser History API. No next-page HTML is fetched: the body, main content, sections, header, navigation, and footer all remain the same DOM nodes. Demo players are cleared when their section is hidden. Back/Forward switch the existing sections too. Active navigation uses `aria-current="page"`; normal modified clicks still allow opening a link in another tab. Astro handles only the initial HTML and static route generation, without its client router.

With JavaScript disabled or still downloading, each route remains styled and readable, and links work as ordinary page navigation.

### Add a page

Add a route name to `getStaticPaths()`, update the `active` selection, and add a section with `data-panel="name"` and a matching navigation link with `data-tab="name"` in the same source page. Set the section's `hidden` attribute from `active`, as the existing sections do. The browser script discovers routes from those links; no separate HTML source is needed.

### Add project demos

Edit the `projects` array at the top of `src/pages/[...page].astro`. Each entry has a `title`, `premise`, and `description`, with optional `technologies`, `links`, and `media`. Entries without media show “demo coming soon”; omit links until you have real destinations.

The `hackathons` array uses the same fields and shared `ProjectJournal.astro` layout. Its Soundscape entry imports `media/hackathon-demos/soundscape-demo.mp4` with `?url`, so Astro/Vite includes the original file in the build and generates its served URL. Keep the source video in `media/`; there is no need for another copy in `public/`. Playback starts only when the visitor presses play.

Entries show the demo first, followed by the title and technology badges, then the premise and description, and finally the video/project links. Video frames and controls have square corners with crisp keyboard focus outlines. The initial preview shows a plain white play triangle. Local videos use custom play/pause, seek, timestamp, mute/volume, and fullscreen controls, plus a captions toggle when a captions track is supplied. Narrow players keep mute available and hide the volume slider. Hosted embeds retain their provider's controls. `ProjectDemo` accepts `showDirectLink` (default `true`); the journal sets it to `false` and places that link after the description instead.

Add technology badges with a simple list:

```js
technologies: ['TypeScript', 'React', 'PostgreSQL'],
```

Badges appear below the description and above project links, in the order you supply. Omit `technologies` or use `[]` to hide the row without extra spacing. Three to five key technologies usually scan well; there is no enforced limit. The placeholder projects include example tags to replace with your own.

For a local video, put files in `public/demos/` and add:

```js
links: [{ label: 'source', href: 'https://github.com/you/project' }],
media: {
  kind: 'file',
  src: '/demos/project.mp4',
  poster: '/demos/project.webp', // optional still image
  aspectRatio: '16 / 9', // use '9 / 16' for portrait or '1 / 1' for square
  captions: '/demos/project.en.vtt', // optional English captions
},
```

For YouTube or Vimeo, use the provider’s **embed URL**, rather than a normal watch URL:

```js
media: {
  kind: 'embed',
  src: 'https://www.youtube.com/embed/VIDEO_ID',
  watchUrl: 'https://www.youtube.com/watch?v=VIDEO_ID',
  poster: '/demos/project.webp', // optional; no remote thumbnail is fetched automatically
},
```

Vimeo embed URLs use `https://player.vimeo.com/video/VIDEO_ID`; retain any provider-supplied parameters needed for unlisted videos. Only use videos with embedding enabled. `watchUrl` supplies the “open video” link and the no-JavaScript fallback (defaults to `src`).

The reusable player lives in `src/components/ProjectDemo.astro`; `js/demo.mjs` activates it on click. Video sources and iframes stay inside inert templates until playback is requested. Navigating away pauses and clears players, and returning restores their previews. Without JavaScript, local videos have native controls with `preload="none"`, and hosted demos have direct viewing links. Posters load lazily; footage is contained without cropping. Playback failures leave an “open video” link available.

## Mouse decoration

`js/particles.mjs` draws a sparse trail of small snowflakes and stars behind the content only while the mouse moves. Particles start within 1px of the cursor tip, appear immediately at low opacity, and drift and fade away. Each particle independently picks a weighted random color: 15% site `--accent`, 18% light grey (`#C4C1C2`, visible against white), 47% grey, and 20% charcoal. `MAX_PARTICLES` and `SPAWN_INTERVAL` control density; particle lifetimes, size, and drift are set in the same module.

The canvas never intercepts clicks. New particles stop when the mouse stops moving, and drawing stops after the remaining particles fade. No new particles appear while dragging. It clears on blur, hidden tabs, and resize, and is disabled for touch-only pointers, reduced-motion preferences, forced colors, and print. No external assets or libraries are needed.

## Fonts

Open `/font-preview/` to mix and match twelve serif fonts and thirty sans-serif fonts using independent selectors. Changing one keeps the other selected. The selectors update the sample layout and URL fragment so you can bookmark any combination, such as `/font-preview/#serif=lora&sans=work-sans`. Earlier pairing links such as `#lora` still work. The main site continues to use its existing fonts.

The sans-serif weight selector compares regular (400), intermediate 425 and 450, medium (500), and semibold (600), applying to body text, badges, and footer links while serif text stays regular. Weight is included in bookmarked URLs as `sans-weight`, defaulting to 425 when omitted. All sans-serif options include real 400–600 variable weights, so intermediate weights are rendered directly by the font.

Separate letter-spacing inputs adjust each preview font group in `em`, from `-0.08` to `0.12` in `0.001` increments. The default pairing matches the main site: Source Serif 4 at `-0.035em` and Mona Sans at `+0.01em`, weight 425. Serif tracking applies to the name, navigation, labels, and project headings; sans-serif tracking applies to body text, badges, and footer links. Spacing values are included in bookmarked URLs as `serif-spacing` and `sans-spacing`. Invalid input keeps the last valid spacing and resets on blur.

Alternative font declarations live in `style/font-preview.css`. Their Latin WOFF2 files and OFL licenses are stored in `public/fonts/previews/`, with the earlier STIX Two Text, Zalando Sans, and Work Sans files retained in `public/fonts/`. Alternatives load only when used on the preview page; no external font requests are needed.

Source Serif 4 is used for the name, navigation, section labels, and project headings at `-0.035em`, weight 400. Mona Sans is used for body text, badges, and the footer at `+0.01em`, weight 425. Both fonts are served locally from `public/fonts/` through `@font-face` rules in `style/main.css`, with system fallbacks. The two main font files are preloaded. Body copy, project/hackathon names, and content/project/video links are 16px, top navigation is 18px, and footer links are 14px. The site name uses `--title-size`: 44px on desktop and 36px on mobile. General `h1` sizing remains independent at `2.6rem`.

The main font files come from the Google Fonts repository: [Source Serif 4](https://github.com/google/fonts/tree/main/ofl/sourceserif4) and [Mona Sans](https://github.com/google/fonts/tree/main/ofl/monasans). Their OFL license files are included in `public/fonts/`.

## GoatCounter

To enable analytics, add `<meta name="goatcounter" content="https://YOUR-SITE.goatcounter.com/count">` to the source page's `<head>`. The module in `js/index.mjs` loads GoatCounter's script only when this value is filled in. Until then, analytics stays inactive.

## Build and publish

```sh
npm run build
npm run preview
```

The production site is generated in `dist/`. Stop the development server before previewing production on port 3000. Publish `dist/` to your static host; do not publish the source directory directly. The build contains real `about/index.html`, `projects/index.html`, and `hackathons/index.html` files, plus a normal `404.html` for unknown URLs. No redirect fallback or server-side Node.js process is required on the host.

The site is configured for `https://ailen.ca`. `.github/workflows/deploy.yml` builds and deploys `dist/` to GitHub Pages on every push to `main`, using Node 24 and the official Astro deployment action. The workflow can also be run manually from the repository's Actions tab.

In the repository's Settings → Pages, select GitHub Actions as the build source and set the custom domain to `ailen.ca`. GitHub manages this setting separately from the deployment artifact; a `CNAME` file is not required for an Actions deployment.

In GoDaddy DNS, point the apex (`@`) to GitHub Pages with four A records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`. Point `www` to `ayleri.github.io` with a CNAME record. Replace conflicting web-hosting records for these names, preserving email and domain-verification records. Once GitHub validates the DNS and issues the certificate, enable Enforce HTTPS in Pages settings.

Paths assume hosting at the domain root. A repository subdirectory deployment requires configuring Astro's `base` and using it in asset and navigation URLs.
