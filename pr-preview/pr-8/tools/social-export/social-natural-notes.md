# Natural cursor — v12

26 seconds, 1080 × 1920, 60 fps. Exports are in `out/social-natural-v12/`.

The music and every event frame from v11 remain unchanged. Cursor movement no longer uses a fixed nine-frame burst. Travel time depends on distance, bounded between 24 and 48 frames (400–800 ms), with smoothstep easing that starts and ends at zero velocity. Movement starts wherever needed between musical beats; arrivals, clicks, menu appearances and tooltips retain their existing beat-2/4 frames.

Volume and brightness adjustments take 24 frames (400 ms), with the gauge, cursor and screen dimming driven by the same progress value. The slower movement does not stretch the video or soundtrack.

The preflight still verifies before/on/after frames for all musical cues, as well as the actual SVG gauges and cursor positions. It now scans every frame of visible movement to catch jumps at handoffs. The finished MP4s are decoded to check 1,560 constant-rate frames and audio timing against the original PCM.

Render: `node render-guided.mjs`. Preview: add `--preview`. Verify the final export: `node verify-social-video.mjs`. Earlier versions remain available. Nothing is published.
