# Portrait exports

## Social story pilot

Latest review: `node render-montage.mjs --alternating` produces `out/social-alternating-v3/`. It alternates static full-screen text cards and clean demonstration footage, with no marketing text over the action. The 17-second edit gives each message its own reading time; the animations retain the native speed of the 60 fps masters.

The revised multi-feature ad is generated with `node render-montage.mjs` and saved in `out/social-montage-v2/`. It cuts three feature beats from the existing `out/snappy/` masters at their native 60 fps, adds animated copy and an original rhythmic soundtrack, and includes a silent export. See `social-montage-post.md` for the matching copy and edit notes.

Run `node render-social.mjs` for the standalone 18-second volume ad. It uses a seekable storyboard in `social-volume.html`, including context, a volume adjustment, a return to work, and a closing CTA. Outputs are in `out/social-volume-v1/`. See `social-volume-post.md` for post/ad copy and `social-strategy.md` for the content plan. This is separate from the website-demo exports below.

Run `npm ci` in this folder, then `node export.mjs`. Requires Node 18+ and installed Chrome (or set `BROWSER_CHANNEL=msedge`).

Outputs in `out/snappy/`: five individual 1080×1920 H.264 MP4s, PNG posters, `all-features-portrait.mp4`, and `original-demo-portrait.mp4` (the original GIF fitted with padding, without cropping). Run `node export.mjs controls` to export just one feature. Other IDs: customize, context, workflow, switching.

Edit `features.json` for copy/order; edit `portrait.html` for the layout. Animation changes belong in the existing `assets/demos` files, so the website and videos stay in sync. Export mode runs one complete animation cycle; normal website looping is unchanged.

The default export is 60 fps at 1.5× pacing, with a 0.35-second extra end hold. Cursor movement, gauges, camera moves, typing, and pauses all share the same speed multiplier. Configure these in `render-settings.json`. The previous exports remain in `out/` for comparison. Playwright advances animation time 25 ms per output frame at these settings. `animation-clock.js` synchronizes CSS effects at every timer callback and DOM mutation, as well as each screenshot. This matters for the 25 ms gauge updates: the cursor's 24 ms transition must finish before the next update replaces it. Native animation playback stays frozen. Screenshot/encoding time cannot slow the animation or drop frames. FFmpeg consumes the image sequence at the configured output frame rate without frame duplication for rate conversion. Deliberate holds naturally contain identical frames. The original GIF conversion retains the source's motion cadence; encoding it at 30 fps cannot add missing motion detail.

Run `node test-animation-clock.mjs` to check the actual shared cursor/gauge implementation through 32 drag updates in both directions using the current frame rate and speed settings.

Clips are silent, with burned-in descriptive copy. The exporter uses local files only, checks browser errors, and times out after 120 seconds of animation time if a demo fails to complete. FFmpeg is installed through ffmpeg-static; override with FFMPEG_PATH if needed.

The combined export includes every full demo, so its length follows the animations. For a shorter campaign cut, create dedicated short sequences with complete action/payoff beats instead of truncating arbitrary seconds. Preview the final composition in each social platform before publishing.

Suggested next improvements: a short campaign storyboard, optional voiceover/subtitles, and a release workflow that exports videos as downloadable build artifacts. Keep generated media out of Git.

