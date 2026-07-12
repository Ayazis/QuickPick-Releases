# QuickPick visual/behavior reference (for building landing-page demos)

Extracted from the real desktop app's XAML/code-behind so future hex-menu
demos in `docs/landing/` match QuickPick's actual look and behavior instead
of guessing. Read this before styling a new demo or touching
`qp-thumbnail.*` / `qp-appbar.*`.

Source files (all under `QuickPick UI/`):
- `Views/Resources.xaml` — shared brushes/styles
- `Views/Thumbnail/ThumbnailView.xaml` + `.xaml.cs`, `PreviewImageProperties.cs`
- `Views/QuickPickMainWindow/ClickWindow.xaml.cs` — thumbnail popup placement/timing
- `TaskbarShortCuts/AppLink.cs` — pinned app bar

## Color palette (`Views/Resources.xaml`)

| Brush | Hex | Use |
|---|---|---|
| `BackgroundBrush` | `#303030` | general dark background |
| `ForegroundBrush` | `#F7F7F7` | text/icons on dark |
| `BorderBrush` | `#6F6F6F` | default borders, hex/app-icon rings |
| `CyanBrush` | `#0B5C5E` | selection/accent (dark teal) |
| `SettingsPanelBrush` | `#232323` | settings surfaces |
| `SettingsCardBrush` | `#2E2E2E` | settings cards |
| `SettingsBorderBrush` | `#3E3E3E` | settings borders |
| `ExperimentalBadgeBrush` | `#6E4A00` | badge |
| `QpButtonStyle` background | `#0F7D80` → hover `#149EA3` → pressed `#0B5C5E` | primary button / teal accent used in demos |
| `QpSecondaryButtonStyle` | `#3A3A3A` → hover `#4A4A4A` | secondary button |
| Context menu / popup background | `#1F1F1F`, border `#3E3E3E` | flyouts |

Corners in the real app are **not heavily rounded** — buttons/menus use
small radii (4–6px) or none. Round shapes are reserved for the round
hex-menu buttons and app-icon circles; rectangular surfaces (thumbnails,
context menus) are square or very slightly rounded.

## Thumbnail card (`ThumbnailView.xaml` / `.xaml.cs`)

- Background `#E6202020` (translucent near-black), `BorderThickness="1"`,
  `BorderBrush="Black"`, **`CornerRadius="0"`** — square corners, no rounding.
- On `MouseEnter`: background lightens to `SemiGray` = `#333333`, close
  button (`Visibility="Collapsed"` by default) becomes visible, title text
  margin shifts to make room for it. `ClickWindow.MouseLeftTimer` is
  stopped while hovered (keeps the popup open) and restarted on
  `MouseLeave`.
- Content: 15×15 app icon top-left (`Margin="8,17"`), window title
  (`TextTrimming="CharacterEllipsis"`) filling the rest, close `✕` button
  top-right (only visible on hover).
- `MouseUp` on the card: `DeactivatePeek` then `ActivateWindow` then
  `ClickWindow.Instance.HideUI()` — i.e. clicking anywhere on the thumbnail
  (not just a button) switches to that window and closes QuickPick.
- Sizing (`PreviewImageProperties.cs`): `MAX_SIZE = 150 * appScale / dpiScaling`;
  height = `MAX_SIZE + 15` (room for the title strip), width =
  `MAX_SIZE * windowAspectRatio`. So thumbnails are **not a fixed
  aspect ratio** — width varies per-window to match its real aspect ratio.

## Thumbnail popup show/hide timing (`ClickWindow.xaml.cs`)

- `_showThumbnailsTimer` interval **250ms** — hovering an app-bar icon
  waits ~250ms before the thumbnail(s) appear (debounces quick mouse
  passes). If a thumbnail popup is already open, the delay drops to 0ms
  when switching directly to another app icon.
- `HideThumbnails()` hides all popups for other apps before showing the
  new app's thumbnails — only one app's thumbnail set is visible at a time.
- Multiple windows for one app are laid out via `RowPositionsCalculator`
  with a **30 × appScale** px gap from the app icon, stacked/offset per
  window index.
- Hovering a thumbnail calls `ActivatePeek(windowHandle, currentHandle)`
  (Aero Peek): this shows a live preview of *only* that window on the real
  desktop — other windows are not merely dimmed, they're not part of the
  peek at all. **Demo takeaway: on peek, hide other placeholder windows
  entirely (`opacity: 0`), don't just dim them.**
- Closing a thumbnail's `✕` sets a timestamp on `ClickWindow` and calls
  `WindowInteractions.CloseWindow`, then removes that thumbnail; it does
  not close QuickPick itself.

## Pinned app bar (`qp-appbar.*` mirrors this; see `TaskbarShortCuts/AppLink.cs` + XAML app-bar styles already ported)

- Each app button: 37×37 circle, `BorderThickness="2"`, border `#6F6F6F`,
  radial gradient `#434343 → #303030`. Hover: border turns cyan-ish
  (`#00e5ff` in the demo port). Icon is a small (≈20×20) glyph centered
  in the circle.
- Running apps get an underline bar (`#ADD8E6`, 16×2px) beneath the icon;
  non-running pinned apps have no underline.
- `AppLinkBarWidth = appCount * 35` — bar width is purely a function of
  app count, buttons are laid out edge-to-edge in a row.

## Hex menu buttons (`HexGridCreator.cs`, `HexagonShape.cs`, `QpButton.cs`)

- Already fully ported in `qp-core.js`/`qp-core.css`: 40×40 `QpButton`
  hexagon centered on a 50×50 backdrop hex (`#1a1a1a`), 1px `#6F6F6F`
  stroke, default gradient `#434343 → #303030`, hover gradient darker
  (`#393939 → #262626`), gauge/value stroke overlay for drag interactions
  (volume/brightness). No changes needed here for new demos — reuse
  `QuickPickHex.create()`.

## Known demo-engine gotcha

`qp-core.js`'s `offsetRelativeTo()` walks `offsetLeft`/`offsetTop` up the
`offsetParent` chain — it does **not** account for CSS `transform`
(e.g. `translateX(-50%)` used to center `.qp-appbar` and
`.qp-appbar-strip`). Any code reading an app-bar element's position
(cursor targeting in `qp-appbar.js`'s `center()`, thumbnail placement in
`qp-thumbnail.js`'s `showFor()`) must subtract half the *bar's*
`offsetWidth` to correct for that centering transform, or the reported
position will be off by half the total bar width (this caused the cursor
to hover apps 2 slots to the right of the intended one before the fix).

## Demo files in `docs/landing/`

| File | Purpose |
|---|---|
| `qp-core.js` / `qp-core.css` | Shared hex-menu engine (cursor, window, hotkey, hex buttons) |
| `qp-icons.js` | Shared hex icon glyphs |
| `qp-appbar.js` / `qp-appbar.css` | Pinned app-bar add-on (running-app underline, hover) |
| `qp-thumbnail.js` / `qp-thumbnail.css` | Window-thumbnail add-on (styled per `ThumbnailView.xaml` above: square corners, `#202024` bg, hover → `#333` + teal border, close ✕ on hover) |
| `quickpick-hex-demo.html` | Basic hex-menu functionality demo |
| `quickpick-appswitch-demo.html` | Active-apps demo: hover app icon → thumbnail after ~250ms → hover thumbnail → peek (others hidden) → click → switch |

When adding a new demo, prefer extending the shared `qp-*` modules over
duplicating markup/CSS in the demo HTML, and check this file's color
table before picking any new color.
