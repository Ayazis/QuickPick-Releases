# Social-media export

Turn the landing-page hex-menu demos (`assets/demos/*.html`) into
high-quality, artifact-free MP4/GIF for Instagram, X, TikTok, LinkedIn, etc.

- **`SOCIAL-MEDIA-EXPORT.md`** — the full ruleset (why each capture/encode
  choice is made). Read this if you want to understand or tweak the quality
  knobs.
- **`record-demos.mjs`** — the pipeline that implements those rules.

## Prerequisites

1. **Node 18+** and this folder's deps:
   ```bash
   cd tools/social-export
   npm install        # installs playwright + the Chromium build
   ```
2. **ffmpeg** on your PATH:
   - Windows: `winget install Gyan.FFmpeg` (or `choco install ffmpeg`)
   - macOS: `brew install ffmpeg`
   - Linux: `sudo apt install ffmpeg`

   Verify: `ffmpeg -version`

## Use

```bash
# default: customize demo, portrait (Instagram 4:5) MP4
node record-demos.mjs

# a specific demo + platform shape (platform name or generic aspect both work)
node record-demos.mjs --demo hex --preset tiktok       # 9:16
node record-demos.mjs --demo hex --preset reddit       # 1:1
node record-demos.mjs --demo appswitch --preset landscape

# an arbitrary size on the fly (rounded to even dimensions)
node record-demos.mjs --demo customize --preset 1200x628

# everything, with GIF fallbacks too
node record-demos.mjs --all --gif

# tune capture length (for a seamless loop) and quality
node record-demos.mjs --demo customize --preset square --seconds 16 --crf 15
```

Demos: `hex`, `appswitch`, `customize`

Presets — generic aspect:
- `square` 1080×1080 · `portrait` 1080×1350 · `story` 1080×1920 · `landscape` 1920×1080

Presets — platform aliases (map onto the above):
- `tiktok` `reels` `shorts` `stories` → 9:16 · `reddit` → 1:1 · `instagram` → 4:5
- `x` `twitter` `linkedin` `youtube` → 16:9

Or any explicit `WxH`, e.g. `1200x628`.

Output MP4/GIF land in `tools/social-export/out/`. Intermediate lossless
frames are written to a temp dir and deleted after encoding.

## Notes

- Upload the **MP4** wherever it's accepted — GIF is a last-resort fallback.
- Every platform re-encodes on upload; this pipeline just gives their encoder
  the cleanest possible source (2× Retina capture, lossless frames, a single
  CRF-16 x264 encode). See `SOCIAL-MEDIA-EXPORT.md`.
- Don't re-export the produced MP4 through another tool — that adds a second
  lossy pass. Trim/crop from the source frames or re-run the script instead.
