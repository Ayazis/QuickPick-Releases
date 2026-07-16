# Exporting the landing-page animations for social media

The QuickPick landing animations (`assets/demos/*.html`) are live HTML/CSS/JS.
Social platforms don't run HTML — they need a **video** (or GIF). So we don't
re-implement the animation in a video editor; we **record the real demo running
in a real browser** and encode it once, at high quality.

This document is the ruleset. `record-demos.mjs` implements it.

---

## The golden rule: encode **once**

Most quality loss in UI-animation videos comes from stacking lossy steps:

```
lossy capture → lossy edit → lossy export → platform re-encode   (4 passes)
```

Every platform (Instagram, X, TikTok, LinkedIn…) **re-encodes on upload no
matter what you send them.** You can't stop that. What you *can* do is give
their encoder the best possible source, and make sure *you* only compress once
before it reaches them:

```
lossless frames → single lossy encode → upload            (1 pass on our side)
```

So: **capture lossless, edit on the lossless source, export exactly one final
encode.** Never re-export an already-exported MP4.

---

## Capture rules

1. **Capture lossless.** We grab PNG frames straight from the browser's
   compositor (Chrome DevTools `Page.startScreencast`, `format: png`). No
   capture-layer compression, no screen-recorder artifacts.
2. **Capture at 2× (Retina).** Render with `deviceScaleFactor: 2` so the source
   is twice the delivery resolution. Downscaling sharp UI from 2× looks far
   cleaner than delivering at 1× or upscaling later. Never upscale a 1× capture.
3. **60 fps.** UI micro-interactions (cursor moves, hex pops, gauge drags) look
   noticeably smoother at 60 than 30. We resample the real frame timestamps to a
   constant 60 fps on the single encode.
4. **Disable reduced motion.** The demos have a `prefers-reduced-motion`
   fallback that skips the animation. The capture context forces
   `reduced motion: no-preference` so the full animation always plays.
5. **Consistent rendering.** Same machine, same browser build, same scale factor
   every run, so text antialiasing/subpixel rendering doesn't shift between
   clips.
6. **Even dimensions.** Every output width/height is divisible by 2 (H.264
   `yuv420p` requires it, and it avoids a class of encoder edge artifacts).

---

## Encoding rules

7. **CRF, not a fixed bitrate.** Use x264 **CRF 15–18** (lower = higher
   quality; we default to 16). A constrained/target bitrate starves flat UI
   colors and produces banding; CRF spends bits where the frame needs them.
8. **`-preset slow`.** Slower preset = better compression at the same quality.
   These are short clips; the extra encode time is free.
9. **Flat-UI-friendly pixel format.** `-pix_fmt yuv420p` for universal
   compatibility. Because we start from lossless PNG, the chroma subsampling
   happens exactly once.
10. **Lanczos scaling.** Any resize uses `scale=…:flags=lanczos` — cleaner on
    sharp edges and gradients than the default bilinear scaler.
11. **Pad, don't stretch.** To hit a platform aspect ratio we scale to *fit* and
    pad the remainder with the demo's own background (`#0b0b0d`). The menu is
    never distorted.
12. **One final encode.** The frames → MP4 step is the only lossy pass. Don't
    run the MP4 back through another export.

---

## Platform aspect ratios

Four canonical **aspect presets**:

| Preset      | Size (delivery) | Ratio | Where                                       |
|-------------|-----------------|-------|---------------------------------------------|
| `square`    | 1080 × 1080     | 1:1   | Reddit feed, general-purpose                 |
| `portrait`  | 1080 × 1350     | 4:5   | Instagram feed (takes the most screen)       |
| `story`     | 1080 × 1920     | 9:16  | Stories / Reels / TikTok / Shorts            |
| `landscape` | 1920 × 1080     | 16:9  | X, LinkedIn, YouTube                         |

Plus **platform-named aliases** that just point at one of those sizes (many
platforms share a shape — 9:16 vertical is TikTok = Reels = Shorts = Stories):

| Alias                                   | → resolves to  |
|-----------------------------------------|----------------|
| `tiktok`, `reels`, `shorts`, `stories`  | 1080 × 1920    |
| `reddit`                                | 1080 × 1080    |
| `instagram`                             | 1080 × 1350    |
| `x`, `twitter`, `linkedin`, `youtube`   | 1920 × 1080    |

Or pass an **explicit `WxH`** for anything not listed, e.g.
`--preset 1200x628` (LinkedIn link card). Odd dimensions are rounded to even.

All outputs are even-dimensioned and padded on `#0b0b0d`. `--all` renders the
four aspect presets (not every alias, which would just duplicate them).

---

## GIF (fallback only)

Prefer MP4 everywhere it's accepted — GIF is 256-color, heavy, and bands badly.
Use it only where video isn't supported (some previews, README embeds, chat).
When we must, we do it *right*: a two-pass `palettegen` / `paletteuse` so the
palette is built from the actual clip, dithered, and sized down (GIF is huge at
full res). Never a naive one-pass GIF.

---

## Seamless loops

The demos loop forever. For a clean loop, capture **exactly one loop's
duration** with `--seconds`, so the last frame hands back to the first with no
visible jump. Roughly-known per-demo loop lengths are in `record-demos.mjs`
(`DEMOS[].loopSeconds`) — tune them if a clip stutters at the wrap.

For MP4 you can also just capture 2–3 loops and let the platform's autoplay-loop
handle repetition; for GIF the single-loop capture matters.

---

## Quick start

```bash
cd tools/social-export
npm install          # playwright + browser
# ffmpeg must be on PATH — see README

# one demo, portrait MP4
node record-demos.mjs --demo customize --preset portrait

# every demo, every preset, plus GIFs
node record-demos.mjs --all --gif
```

Outputs land in `tools/social-export/out/`.
