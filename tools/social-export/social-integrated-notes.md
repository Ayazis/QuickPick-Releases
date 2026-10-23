# Integrated social ad — v8

31.5 seconds, 1080 × 1920, 60 fps. Review exports:

- `out/social-integrated-v8/quickpick-montage-ad.mp4`
- `out/social-integrated-v8/quickpick-montage-silent.mp4`

| Time | Content |
| --- | --- |
| 0–3.5 | Introduction: Windows tools and shortcuts at your cursor. |
| 3.5–5.5 | Volume + brightness message. |
| 5.5–9.5 | Volume and brightness demonstration. |
| 9.5–12 | One combined message: Switch apps. Your menu adapts. |
| 12–16 | Chrome menu, action list, New tab / Bookmark / Downloads tooltips. |
| 16–19 | Continue from the open menu into QuickPick's app switcher; preview and select Photoshop. |
| 19–24 | Photoshop menu, action list, Brush / Layers / Export tooltips. |
| 24–27 | Continue into the same switcher; preview and select Chrome. |
| 27–29 | Chrome's original menu returns, with the Reload tooltip. |
| 29–31.5 | Closing invitation. |

The standalone switching demonstration and second introduction have been removed. Both requested app switches remain in the combined sequence, and each leads into the matching menu. The app bar stays visible while the menus are demonstrated. At both handoffs, the cursor starts from the last highlighted hex and the menu remains fully open, avoiding a reset between features.

Branding, background, website, Free / Open source badges, volume, brightness and original synthesized music are retained. Marketing messages remain separate from demonstrations; action lists hold steady and tooltips appear after the cursor arrives. Nothing is published.

Run `node render-guided.mjs --preview` for screenshots and layout checks, or omit `--preview` for both MP4s. The renderer verifies the foreground apps and corresponding menu shapes before and after both switches, cursor/menu continuity, card/demo separation, branding and browser errors. Final video verification checks decoding and 1,890 evenly spaced frames at 60 fps.
