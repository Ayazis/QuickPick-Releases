# Mellow funk social ad — v10

27 seconds, 1080 × 1920, 60 fps. Review files in `out/social-groove-v10/`: `quickpick-montage-ad.mp4`, `quickpick-montage-silent.mp4`, and `mellow-funk.wav`.

Changes: Pen replaces Layers in the Photoshop configuration, icon, tooltip and action list. Brush and Duplicate layer remain. The bottom Windows 11 / illustrated-demo line is removed. The single Chrome → Photoshop sequence remains intact.

The new original soundtrack is synthesized locally without samples: rounded kicks, soft rim/snare, swung hi-hats, ghost notes, syncopated bass and electric-piano chord voicings with a quiet stereo echo. It runs at 120 BPM in 4/4, with the backbeat at half-integer seconds (beats 2 and 4). Stereo 48 kHz PCM is retained; MP4 audio is AAC at 192 kbps. The synthesis reports peak and RMS levels in `edit-notes.json` and leaves headroom without hard clipping.

| Time | Content / musical cue |
| --- | --- |
| 0–3.5 | Introduction. |
| 3.5–5.5 | Controls message; entry on beat 4. |
| 5.5–9.5 | Volume and brightness; entry on beat 4. Existing internal motion timing retained. |
| 9.5–12.5 | Combined switching / adaptive-menu message. |
| 12.5–16.5 | Chrome menu; tooltip arrivals at 13.5, 14.5 and 15.5 (beats 4, 2, 4). |
| 16.5–19.5 | Switch to Photoshop; app-icon arrival at 17.5 (beat 4), click and foreground change at 18.5 (beat 2). |
| 19.5–24.5 | Photoshop menu; Brush at 20.5, Pen at 21.5, Duplicate layer at 22.5 (beats 2, 4, 2). |
| 24.5–27 | Closing card on beat 2. |

Cursor travel remains quick and smooth, with stable reading holds after each tooltip arrival. The extra half-second is added to the combined introduction to align the following actions to the groove. Branding, website and Free / Open source badges remain throughout. Nothing is published.

Run `node build-guided-source.mjs` after artwork changes, then `node render-guided.mjs --preview` or `node render-guided.mjs`. Checks cover the Pen and Duplicate layer configuration, foreground switch, exact tooltip arrival frames, no tooltip during motion, cursor continuity, branding and footer removal. The final output contains 1,620 frames at constant 60 fps.
