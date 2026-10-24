# Frame-aligned social ad — v11

26 seconds, 1080 × 1920, 60 fps. Outputs in `out/social-beatlocked-v11/`.

At 120 BPM, each beat is 30 video frames. With frame 0 at the music's first downbeat, beat 2 is `30 + 120 × bar`, beat 4 is `90 + 120 × bar`. Together, the backbeats fall on frames 30, 90, 150, 210… At 48 kHz, every video frame spans exactly 800 audio samples.

| Cue | Frame (zero-based) | Time | Beat |
| --- | ---: | ---: | ---: |
| Controls message | 210 | 3.5 s | 4 |
| Controls menu appears | 330 | 5.5 s | 4 |
| Volume press / drag begins | 390 | 6.5 s | 2 |
| Brightness press / dim begins | 450 | 7.5 s | 4 |
| Brightness return begins | 510 | 8.5 s | 2 |
| Combined message | 570 | 9.5 s | 4 |
| Chrome menu appears | 750 | 12.5 s | 2 |
| New tab / Bookmark / Downloads | 810 / 870 / 930 | 13.5 / 14.5 / 15.5 s | 4 / 2 / 4 |
| App icon arrival / preview appears | 990 | 16.5 s | 2 |
| Click / Photoshop foreground / preview dismissed | 1050 | 17.5 s | 4 |
| Photoshop menu appears | 1110 | 18.5 s | 2 |
| Brush / Pen / Duplicate layer | 1170 / 1230 / 1290 | 19.5 / 20.5 / 21.5 s | 4 / 2 / 4 |
| Closing card | 1410 | 23.5 s | 4 |

All discrete appearances and clicks happen on the hit frame. Cursor travel takes nine frames (150 ms), leading into the hit. Menus are fully visible immediately, with a six-frame scale settle rather than a fade. Controls are rebuilt from the same shared UI components on the same frame clock; their clicks and drag/reversal starts are on backbeats, with twelve-frame (200 ms) adjustments. The controls are no longer cut from separately timed video.

The original mellow-funk groove is retained. `beat-grid.js` drives both the frame schedule and snare scheduling. Synthesis measures the isolated backbeat onsets and records their exact audio sample positions. `verify-beat-story.mjs` checks the DOM immediately before, on and after every cue, plus actual cursor/gauge synchronization. `beat-frame-map.json` contains the results. `verify-social-video.mjs` decodes both finished MP4s and checks frame cadence, then measures decoded AAC alignment against the original PCM.

Build: `node build-guided-source.mjs`, then `node render-guided.mjs` (`--preview` for stills/checks). Verify the finished videos with `node verify-social-video.mjs`. Earlier versions remain available. Nothing is published.
