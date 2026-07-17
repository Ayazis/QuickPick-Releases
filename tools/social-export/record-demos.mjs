// Record the QuickPick landing-page demos to high-quality social-media video.
//
// Pipeline (see SOCIAL-MEDIA-EXPORT.md for the reasoning behind every step):
//   1. Launch Chromium at deviceScaleFactor 2, reduced-motion disabled.
//   2. Open a demo HTML file and capture LOSSLESS png frames straight from the
//      compositor via CDP Page.startScreencast, keeping each frame's real
//      timestamp.
//   3. Hand the frames to ffmpeg for a SINGLE lossy encode: resample to a
//      constant 60fps, lanczos-scale the whole captured stage to FIT the
//      platform aspect ratio (never cropped, so nothing drops out of frame),
//      pad the rest with the demo background, x264 CRF 16, preset slow, yuv420p.
//   4. Optionally emit a properly-dithered two-pass GIF as a fallback.
//
// Usage:
//   node record-demos.mjs --demo customize --preset portrait
//   node record-demos.mjs --all --gif
//   node record-demos.mjs --demo hex --preset story --seconds 9 --crf 15
//
// Requires: `npm install` (playwright) and ffmpeg on PATH.

import { spawn } from "node:child_process";
import { mkdir, rm, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEMOS_DIR = path.resolve(__dirname, "../../assets/demos");
const OUT_DIR = path.resolve(__dirname, "out");
const BG = "0x0b0b0d"; // demo background (#0b0b0d) — used for padding

// Per-demo config. `loopSeconds` is only a rough estimate of one loop's length,
// used as a safety-timeout multiplier — actual capture start/end are detected
// live from the animation's own loop-boundary counter (see captureFrames), not
// timed off this value. Only matters if a demo's loop is unexpectedly slow.
//
// stageW/stageH: the demo's native stage size (from its qp-core config) — every
// element the animation ever touches (hex menu, cursor path, the "Ctrl+Space"
// hotkey chip) is positioned within these bounds BY THE DEMO ITSELF, so capturing
// exactly this box captures the whole animation, guaranteed, with no manual
// measuring or guessing at a crop. We render at SCALE× this size (see
// captureFrames) so the captured surface is stageW*SCALE × stageH*SCALE pixels,
// then scale+pad (never crop) into the delivery aspect ratio.
const DEMOS = {
  hex:       { file: "quickpick-hex-demo.html",       loopSeconds: 11, stageW: 380, stageH: 370 },
  appswitch: { file: "quickpick-appswitch-demo.html", loopSeconds: 12, stageW: 380, stageH: 370 },
  customize: { file: "quickpick-customize-demo.html", loopSeconds: 16, stageW: 380, stageH: 370 },
};

// Delivery sizes (even dimensions, padded on BG). See the doc's table.
// Generic aspect-ratio presets…
const PRESETS = {
  square:    { w: 1080, h: 1080 }, // 1:1
  portrait:  { w: 1080, h: 1350 }, // 4:5
  story:     { w: 1080, h: 1920 }, // 9:16
  landscape: { w: 1920, h: 1080 }, // 16:9

  // …and platform-named aliases. Many platforms share a shape (9:16 vertical
  // is TikTok = Reels = Shorts = Stories), so these point at the canonical
  // sizes above rather than duplicating them.
  tiktok:    { w: 1080, h: 1920 }, // 9:16 vertical
  reels:     { w: 1080, h: 1920 }, // Instagram Reels, 9:16
  shorts:    { w: 1080, h: 1920 }, // YouTube Shorts, 9:16
  stories:   { w: 1080, h: 1920 }, // IG/FB Stories, 9:16
  reddit:    { w: 1080, h: 1080 }, // feed video plays best square/1:1
  instagram: { w: 1080, h: 1350 }, // IG feed favors 4:5
  x:         { w: 1920, h: 1080 }, // X/Twitter feed, 16:9
  twitter:   { w: 1920, h: 1080 },
  linkedin:  { w: 1920, h: 1080 }, // LinkedIn feed, 16:9
  youtube:   { w: 1920, h: 1080 }, // standard 16:9
};

// Accept an explicit "WxH" (e.g. "1200x628") as a one-off preset.
function parseSize(name) {
  const m = /^(\d{2,5})x(\d{2,5})$/i.exec(name);
  if (!m) return null;
  // Force even dimensions (yuv420p requirement).
  const w = Math.round(Number(m[1]) / 2) * 2;
  const h = Math.round(Number(m[2]) / 2) * 2;
  return { w, h };
}

function resolvePreset(name) {
  return PRESETS[name] || parseSize(name) || null;
}

const FPS = 60;
// Supersample factor. CDP screencast captures the render surface at CSS-pixel
// size and ignores deviceScaleFactor, so we can't get a hi-res capture by
// scaling the device. Instead we make the demo physically larger in real CSS
// pixels: qp-core sizes its stage to the container width (stage scale =
// clientWidth / stageWidth) via a ResizeObserver, so widening the container to
// stageWidth×SCALE makes the whole demo re-render (crisp, re-rasterized) at
// SCALE×. The 1× screencast then captures that at full resolution. At 3× a
// 380px stage renders 1140px — after cropping to the menu we downscale to the
// delivery size, never upscale, which keeps sharp UI band-free.
const SCALE = 3;

function parseArgs(argv) {
  const args = { presets: [], demos: [], gif: false, seconds: null, crf: 16 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "--all") { args.demos = Object.keys(DEMOS); args.presets = ["square", "portrait", "story", "landscape"]; }
    else if (a === "--demo") args.demos.push(next());
    else if (a === "--preset") args.presets.push(next());
    else if (a === "--gif") args.gif = true;
    else if (a === "--seconds") args.seconds = Number(next());
    else if (a === "--crf") args.crf = Number(next());
    else if (a === "--help" || a === "-h") { printHelp(); process.exit(0); }
    else { console.error(`Unknown arg: ${a}`); printHelp(); process.exit(1); }
  }
  if (args.demos.length === 0) args.demos = ["customize"];
  if (args.presets.length === 0) args.presets = ["portrait"];
  return args;
}

function printHelp() {
  console.log(`Record QuickPick demos to social-media video.

  --demo <name>      hex | appswitch | customize   (repeatable; default: customize)
  --preset <name>    aspect: square | portrait | story | landscape
                     platform: tiktok | reels | shorts | stories | reddit |
                               instagram | x | twitter | linkedin | youtube
                     or explicit WxH, e.g. 1200x628   (repeatable; default: portrait)
  --all              every demo × the 4 aspect presets
  --gif              also emit a two-pass GIF fallback
  --seconds <n>      fixed capture length in seconds; default: auto-detect one
                     full loop (boundary-to-boundary, frame-perfect seamless)
  --crf <n>          x264 quality 15-18, lower = better (default 16)

Outputs to tools/social-export/out/`);
}

function run(cmd, cmdArgs) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, cmdArgs, { stdio: ["ignore", "inherit", "inherit"] });
    p.on("error", reject);
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

function checkFfmpeg() {
  return new Promise((resolve) => {
    const p = spawn("ffmpeg", ["-version"], { stdio: "ignore" });
    p.on("error", () => resolve(false));
    p.on("close", (code) => resolve(code === 0));
  });
}

// Capture lossless png frames from a demo via CDP screencast. Returns the temp
// frame directory and the wall-clock timestamps (seconds) of each frame.
// `seconds`: null = auto (capture exactly one loop, boundary-to-boundary, for a
// frame-perfect seamless loop); a number = capture that fixed duration instead
// (e.g. to grab multiple loops).
async function captureFrames(demo, seconds) {
  const { chromium } = await import("playwright");
  const demoPath = path.join(DEMOS_DIR, demo.file);
  if (!existsSync(demoPath)) throw new Error(`Demo not found: ${demoPath}`);

  const framesDir = path.join(OUT_DIR, `.frames-${demo.file}-${Date.now()}`);
  await mkdir(framesDir, { recursive: true });

  const browser = await chromium.launch({ args: ["--force-color-profile=srgb"] });
  const context = await browser.newContext({
    // Viewport = the demo rendered at SCALE×, so it fills the frame and the
    // screencast (captured at CSS-pixel size) is a true SCALE× surface.
    viewport: { width: demo.stageW * SCALE, height: demo.stageH * SCALE },
    reducedMotion: "no-preference", // force the full animation, not the RM fallback
    colorScheme: "dark",
  });
  const page = await context.newPage();
  // Every demo's animation is `QuickPickHex.runSequence(instance, steps, {loop:
  // true})`, which starts the instant the page loads and loops forever — so
  // starting capture after an arbitrary settle delay lands us mid-loop, not at
  // the animation's actual start. Before any page script runs, wrap
  // `runSequence` (via its public `{fn: async (instance) => ...}` step escape
  // hatch — see qp-core.js) to bump a counter at the top of every iteration, so
  // we can wait for a real loop boundary instead of guessing a timeout.
  await page.addInitScript(() => {
    Object.defineProperty(window, "QuickPickHex", {
      configurable: true,
      set(qph) {
        const origRunSequence = qph.runSequence;
        qph.runSequence = function (instance, steps, opts) {
          const marker = { fn: async () => { window.__qpLoopCount = (window.__qpLoopCount || 0) + 1; } };
          return origRunSequence(instance, [marker, ...steps], opts);
        };
        Object.defineProperty(window, "QuickPickHex", { value: qph, writable: true, configurable: true });
      },
    });
  });
  await page.goto("file://" + demoPath.replace(/\\/g, "/"));
  // Widen the demo container to stageW×SCALE. qp-core's ResizeObserver reacts by
  // rescaling the stage (scale = clientWidth / stageWidth = SCALE), so the whole
  // demo re-renders — crisply re-rasterized, not upscaled — at SCALE× real px.
  await page.evaluate((w) => {
    const d = document.querySelector(".qp-demo");
    d.style.maxWidth = w + "px";
    d.style.width = w + "px";
    window.dispatchEvent(new Event("resize")); // nudge in case ResizeObserver is async
  }, demo.stageW * SCALE);
  // Wait for the SECOND loop boundary (not the first): the first iteration
  // starts at page load, before fonts/first paint have necessarily settled.
  // By the second boundary everything is warmed up, and we start capturing
  // frame-synced to that boundary — the true start of the animation, every time.
  await page.waitForFunction(() => window.__qpLoopCount >= 2, { timeout: 30000 });

  const client = await context.newCDPSession(page);
  const frames = [];
  const timestamps = [];
  let idx = 0;

  client.on("Page.screencastFrame", async (frame) => {
    const n = idx++;
    frames.push(
      writeFile(path.join(framesDir, `f${String(n).padStart(5, "0")}.png`), Buffer.from(frame.data, "base64"))
    );
    timestamps.push(frame.metadata.timestamp);
    try { await client.send("Page.screencastFrameAck", { sessionId: frame.sessionId }); } catch {}
  });

  await client.send("Page.startScreencast", { format: "png", everyNthFrame: 1 });
  if (seconds == null) {
    // Auto: stop at the NEXT loop boundary (count 2 → 3), so the clip covers
    // exactly one full iteration, start to end. Combined with starting capture
    // at a boundary, this makes the last frame hand back to the first with no
    // visible jump — a true seamless loop, not a guessed duration.
    const safetyMs = (demo.loopSeconds * 3 + 15) * 1000;
    await page.waitForFunction(() => window.__qpLoopCount >= 3, { timeout: safetyMs });
  } else {
    await page.waitForTimeout(seconds * 1000);
  }
  await client.send("Page.stopScreencast");
  await Promise.all(frames);
  await browser.close();

  if (timestamps.length < 2) throw new Error("Screencast produced no frames");
  // Normalize timestamps to start at 0 (seconds).
  const t0 = timestamps[0];
  return { framesDir, times: timestamps.map((t) => t - t0), count: timestamps.length };
}

// Build an ffmpeg concat file that preserves each frame's real on-screen
// duration, so the constant-60fps resample downstream is timed correctly.
async function writeConcat(framesDir, times) {
  const files = (await readdir(framesDir)).filter((f) => f.endsWith(".png")).sort();
  const lines = [];
  for (let i = 0; i < files.length; i++) {
    const dur = i < times.length - 1 ? times[i + 1] - times[i] : 1 / FPS;
    lines.push(`file '${path.join(framesDir, files[i]).replace(/\\/g, "/")}'`);
    lines.push(`duration ${Math.max(dur, 1 / 1000).toFixed(6)}`);
  }
  // concat demuxer needs the last file repeated so its duration is honored.
  lines.push(`file '${path.join(framesDir, files[files.length - 1]).replace(/\\/g, "/")}'`);
  const concatPath = path.join(framesDir, "frames.txt");
  await writeFile(concatPath, lines.join("\n"));
  return concatPath;
}

// Scale-to-fit → pad-to-fill, on the demo background. No cropping: the source
// is already exactly the demo's stage bounds, which contain the entire
// animation by construction, so fitting the whole frame in is what keeps
// everything — hex menu, cursor path, hotkey chip — always in shot.
function fitPad(w, h, extra = "") {
  return (
    `scale=${w}:${h}:force_original_aspect_ratio=decrease:flags=lanczos,` +
    `pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=${BG}` +
    (extra ? "," + extra : "")
  );
}

async function encodeMp4(demo, concatPath, preset, crf, outPath) {
  const { w, h } = preset;
  await run("ffmpeg", [
    "-y",
    "-f", "concat", "-safe", "0", "-i", concatPath,
    "-vf", fitPad(w, h, `fps=${FPS},format=yuv420p`),
    "-c:v", "libx264", "-crf", String(crf), "-preset", "slow",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    outPath,
  ]);
}

// Two-pass GIF: build a palette from the clip, then apply it with dithering.
// Sized down (GIF is heavy) but still fit+padded to the preset aspect ratio.
async function encodeGif(demo, concatPath, preset, outPath) {
  const gw = preset.w >= preset.h ? 640 : Math.round((preset.w / preset.h) * 640 / 2) * 2;
  const gh = preset.w >= preset.h ? Math.round((preset.h / preset.w) * 640 / 2) * 2 : 640;
  const gfps = 30; // GIFs above ~30fps balloon for little gain
  const vf = fitPad(gw, gh, `fps=${gfps}`);
  const palette = outPath.replace(/\.gif$/, ".palette.png");
  await run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", concatPath,
    "-vf", `${vf},palettegen=stats_mode=diff`, palette]);
  await run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", concatPath, "-i", palette,
    "-lavfi", `${vf}[x];[x][1:v]paletteuse=dither=sierra2_4a`, outPath]);
  await rm(palette, { force: true });
}

async function main() {
  const args = parseArgs(process.argv);

  if (!(await checkFfmpeg())) {
    console.error("ffmpeg not found on PATH. Install it (see README) and retry.");
    process.exit(1);
  }
  for (const d of args.demos) if (!DEMOS[d]) { console.error(`Unknown demo: ${d}`); process.exit(1); }
  for (const p of args.presets) if (!resolvePreset(p)) {
    console.error(`Unknown preset: ${p} (use a name or WxH like 1200x628)`); process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  for (const demoName of args.demos) {
    const demo = DEMOS[demoName];
    console.log(
      args.seconds == null
        ? `\n▶ ${demoName}: capturing one full loop (boundary-to-boundary) of lossless frames…`
        : `\n▶ ${demoName}: capturing ${args.seconds}s of lossless frames…`
    );
    const { framesDir, times, count } = await captureFrames(demo, args.seconds);
    console.log(`  captured ${count} frames`);
    const concatPath = await writeConcat(framesDir, times);

    try {
      for (const presetName of args.presets) {
        const preset = resolvePreset(presetName);
        const mp4 = path.join(OUT_DIR, `${demoName}-${presetName}.mp4`);
        console.log(`  encoding ${presetName} → ${path.basename(mp4)} (crf ${args.crf})`);
        await encodeMp4(demo, concatPath, preset, args.crf, mp4);
        if (args.gif) {
          const gif = path.join(OUT_DIR, `${demoName}-${presetName}.gif`);
          console.log(`  encoding ${presetName} GIF → ${path.basename(gif)}`);
          await encodeGif(demo, concatPath, preset, gif);
        }
      }
    } finally {
      await rm(framesDir, { recursive: true, force: true }); // keep only final encodes
    }
  }
  console.log(`\n✓ Done. Files in ${OUT_DIR}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
