# Portfolio design guidelines

## Spacing and shape

- Use the existing 4px spacing scale in `style/main.css`. Reuse `--space-*` variables for margins, padding, and gaps; add a new multiple of 4 only when the existing scale cannot express the intended layout.
- Avoid negative margins for layout. Small optical adjustments, such as underline offsets and centering the play symbol, may use values outside the spacing scale.
- Use `--radius-media` (0px) for video frames, play controls, and play labels; use `--radius-small` (4px) for other small rectangular controls and technology badges.
- Nested previews, players, and poster images should inherit the frame's radius.
- Keep the initial video play affordance a plain white triangle. Local videos use the existing custom controls; retain native controls for the no-JavaScript fallback and provider controls for embeds.
- Overlay video controls on the footage with a subtle dark gradient and white icons; keep the video itself filling the frame without reserving space for a separate toolbar.
- Keep the layout flat. Do not add decorative shadows; use crisp outlines for video hover and keyboard focus.

## Typography and visual style

- Keep Source Serif 4 at weight 400 for the name, navigation, section labels, and project headings; use Mona Sans at `--sans-weight` (425) for body text, badges, and footer text. Reuse `--serif` and `--sans`.
- Keep serif letter spacing at `--serif-spacing` (-0.035em) and sans-serif spacing at `--sans-spacing` (+0.01em). Use `--text-spacing` to select the appropriate tracking for a font group; resolve it at each element's font size.
- Use 16px for body copy, section labels, and content, project, and video links; use 18px for top navigation and project/hackathon names, and 14px for footer links. The site name uses `--title-size` (44px on desktop, 36px below 600px); keep `h1` sizing independent. Preserve the smaller technology badges.
- Retain the white background, charcoal text, and dusty rose accent (`--accent`, #A65D73). Keep supporting rose surfaces subtle and text readable.
- Preserve the existing link sweep and its reduced-motion support. Avoid adding unnecessary animation.
- Keep the sweep's background and white text reveal aligned when changing link padding or sizing.
- Prefer clear hierarchy, familiar controls, and concise copy over additional visual effects. Treat current project content as placeholder; do not invent accomplishments or replace the user's copy during visual changes.

## Responsive layout

- Check narrow screens before polishing desktop. Retain the 640px content column and 20px side gutters.
- Below 600px, use 40px top and 64px bottom wrapper padding; desktop uses 64px and 96px respectively.
- Standalone navigation, footer, project, and video links must be at least `--touch-target` (44px) tall. Preserve natural wrapping for links within prose.
- Let titles, descriptions, technology badges, and link groups wrap without horizontal overflow, including unusually long labels.
- Keep demo previews within the column and cap their height at `min(560px, 70svh)`. Preserve the configured aspect ratio, center narrower previews, and contain footage without cropping.
- Apply media sizing consistently to previews, active players, placeholders, and no-JavaScript fallbacks.
- Arrange project and hackathon entries as demo, title with wrapping technology badges, description text, then links. Keep the title and tags directly beneath the demo; put the direct video link with the other links after the description.
- Align technology badges to the right of the heading row, including when they wrap onto additional lines.

## Validation and deferred work

- Run `npm run build` after code or style changes.
- For layout changes, check 320px, 375px, 768px, and desktop widths, plus a short landscape viewport. Include long text and landscape, square, and portrait demo shapes when relevant.
- When changing control geometry, verify touch-target size, visible keyboard focus, and the existing hover treatment.
- New loading-state work and a full button/link/social-icon audit are deferred. Do not bundle them into unrelated design changes; verify behavior directly affected by the current task.

## Additional Notes

- Whenever you add a new feature, please first consider whether or not you should make new folders/files or write the code in existing ones! Make your code readable please
