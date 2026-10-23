# Guided social ad — v7

35 seconds, 1080 × 1920, 60 fps. Review exports:

- `out/social-guided-v7/quickpick-montage-ad.mp4`
- `out/social-guided-v7/quickpick-montage-silent.mp4`

| Time | Content |
| --- | --- |
| 0–3.5 | Introduction: QuickPick brings Windows tools and app shortcuts to your cursor. |
| 3.5–5.5 | Volume + brightness message. |
| 5.5–9.5 | Existing synchronized controls demonstration. |
| 9.5–11 | Preview, click, switch message. |
| 11–18 | Chrome → Photoshop → Chrome. Both switches include hovering the app icon, previewing the target window, clicking, and holding the new foreground app. |
| 18–20.5 | Explain that menus adapt to the active app. |
| 20.5–24.5 | Chrome menu, stable list of six actions, and New tab / Bookmark / Downloads hover tooltips. |
| 24.5–27.5 | Use QuickPick's app switcher and preview to switch Chrome → Photoshop. |
| 27.5–32.5 | Photoshop menu, stable list of six tools plus two app shortcuts, and Brush / Layers / Export hover tooltips. |
| 32.5–35 | Closing invitation. |

The branding, website, Free / Open source badges and outer background persist. Full-screen marketing messages remain separate from the demonstrations. Within the final demonstration, action lists remain static; tooltips appear only after the cursor has arrived at its target.

The illustrated windows, icons, menus, desktop, app bar and previews reuse existing website components. Only the social storyboard is changed. Native CSS transitions are disabled for these new scenes; every movement and click uses an explicit timestamp, making seeking and 60 fps export deterministic. The earlier synchronized controls master is reused without slowing it down.

The music is the same original synthesized 120 BPM bed used in v6, extended to the new duration with accents aligned to the new section starts. No stock music is used. This is a review draft; nothing is published.

Run `node render-guided.mjs --preview` for layout and foreground-state assertions plus representative screenshots. Run without `--preview` to export both MP4s. Rendering checks the two switch outcomes, the Chrome → Photoshop transition in the final section, separation of cards and action, persistent branding, and browser errors. Encoded output should also be decoded to verify 2,100 frames with constant 60 fps timestamps.
