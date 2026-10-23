# Focused social ad — v9

26.5 seconds, 1080 × 1920, 60 fps. Review exports:

- `out/social-focused-v9/quickpick-montage-ad.mp4`
- `out/social-focused-v9/quickpick-montage-silent.mp4`

| Time | Content |
| --- | --- |
| 0–3.5 | Introduction: Windows tools and shortcuts at your cursor. |
| 3.5–5.5 | Volume + brightness message. |
| 5.5–9.5 | Volume and brightness demonstration. |
| 9.5–12 | Combined message: Switch apps. Your menu adapts. |
| 12–16 | Chrome hex menu, action list and tooltips. |
| 16–19 | Use QuickPick's app switcher to preview and select Photoshop. |
| 19–24 | Photoshop hex menu, action list and Brush / Layers / Duplicate layer tooltips. |
| 24–26.5 | Closing invitation. |

The return switch and second Chrome menu have been removed. Photoshop retains its full five seconds. Duplicate layer replaces Export in the social configuration, using an overlapping-squares icon, matching hover tooltip and action-list label. The website configuration is unchanged. The override lives in `build-guided-source.mjs`, so regenerating the shared scene assets preserves it.

Branding, background, volume, brightness and original synthesized music are retained. Nothing is published. Render with `node render-guided.mjs`; add `--preview` for screenshots and storyboard checks only. Final video verification checks decoding and 1,590 evenly spaced frames at 60 fps.
