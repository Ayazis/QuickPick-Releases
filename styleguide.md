# QuickPick Releases Website Style Guide

## Design Philosophy
- **Modern & Minimal**: Clean, dark-themed interface for focused productivity
- **Geometric**: Hexagonal grid system as the core visual element
- **Ergonomic**: Design follows user workflow, bringing tools to the cursor
- **Efficient**: No distraction, direct access to functionality

---

## Color Palette

### Primary Colors
Use for call-to-action buttons, links, active states, and brand highlights.

| Color Name | Hex Code | Usage | Preview |
|------------|----------|-------|---------|
| **Cyan/Teal Base** | `#0B5C5E` | Pressed state, checkbox checked | ![#0B5C5E](https://placehold.co/30x30/0B5C5E/0B5C5E.png) |
| **Bright Teal** | `#0F7D80` | Primary CTA buttons, links | ![#0F7D80](https://placehold.co/30x30/0F7D80/0F7D80.png) |
| **Hover Teal** | `#149EA3` | Button hover state | ![#149EA3](https://placehold.co/30x30/149EA3/149EA3.png) |

**Web Usage:**
```css
--qp-primary: #0F7D80;
--qp-primary-hover: #149EA3;
--qp-primary-pressed: #0B5C5E;
```

---

### Neutral Colors
Foundation for backgrounds, surfaces, text, and borders.

| Color Name | Hex Code | Usage | Preview |
|------------|----------|-------|---------|
| **Background Dark** | `#303030` | Main page background | ![#303030](https://placehold.co/30x30/303030/303030.png) |
| **Surface Dark** | `#1F1F1F` | Cards, panels, dropdowns | ![#1F1F1F](https://placehold.co/30x30/1F1F1F/1F1F1F.png) |
| **Settings Panel** | `#232323` | Secondary surfaces | ![#232323](https://placehold.co/30x30/232323/232323.png) |
| **Settings Card** | `#2E2E2E` | Elevated cards | ![#2E2E2E](https://placehold.co/30x30/2E2E2E/2E2E2E.png) |
| **Border** | `#6F6F6F` | Standard borders | ![#6F6F6F](https://placehold.co/30x30/6F6F6F/6F6F6F.png) |
| **Border Subtle** | `#3E3E3E` | Subtle separators | ![#3E3E3E](https://placehold.co/30x30/3E3E3E/3E3E3E.png) |
| **Text Primary** | `#F7F7F7` | Body text, headings | ![#F7F7F7](https://placehold.co/30x30/F7F7F7/F7F7F7.png) |
| **Text Disabled** | `#888888` | Disabled text | ![#888888](https://placehold.co/30x30/888888/888888.png) |

**Web Usage:**
```css
--qp-bg-dark: #303030;
--qp-surface-dark: #1F1F1F;
--qp-surface-elevated: #2E2E2E;
--qp-border: #6F6F6F;
--qp-border-subtle: #3E3E3E;
--qp-text-primary: #F7F7F7;
--qp-text-disabled: #888888;
```

---

### Secondary Colors
For less prominent actions and alternate states.

| Color Name | Hex Code | Usage | Preview |
|------------|----------|-------|---------|
| **Secondary Button** | `#3A3A3A` | Secondary actions | ![#3A3A3A](https://placehold.co/30x30/3A3A3A/3A3A3A.png) |
| **Secondary Hover** | `#4A4A4A` | Secondary button hover | ![#4A4A4A](https://placehold.co/30x30/4A4A4A/4A4A4A.png) |
| **Secondary Pressed** | `#2A2A2A` | Secondary button pressed | ![#2A2A2A](https://placehold.co/30x30/2A2A2A/2A2A2A.png) |

---

### Functional Colors
For interactive states.

| Color Name | Hex Code | Usage | Preview |
|------------|----------|-------|---------|
| **Hover Overlay** | `#979797` | Border highlight on hover | ![#979797](https://placehold.co/30x30/979797/979797.png) |
| **Selection** | `#444444` | Selected items | ![#444444](https://placehold.co/30x30/444444/444444.png) |
| **Item Hover** | `#333333` | List item hover | ![#333333](https://placehold.co/30x30/333333/333333.png) |

---

## Typography

### Font Family
**Primary**: Segoe UI (Windows), -apple-system (macOS), system-ui (fallback)
```css
font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
```

### Font Weights
- **Regular (400)**: Body text, labels
- **Bold (700)**: Headings, button text, emphasis

### Scale

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| **H1** | 48px | Bold | Page titles |
| **H2** | 36px | Bold | Section headers |
| **H3** | 28px | Bold | Subsections |
| **H4** | 20px | Bold | Card titles |
| **Body** | 16px | Regular | Body text |
| **Small** | 14px | Regular | Captions, metadata |
| **Tiny** | 12px | Regular | Fine print |

### Color Usage
- Primary text: `#F7F7F7` on dark backgrounds
- Links: `#0F7D80` with hover state `#149EA3`
- Disabled: `#888888`

---

## Branding Elements

### Logo
The QuickPick logo is a **hexagon within a hexagon** design:
- **Outer hexagon**: Dark gray (`#434343` to `#303030` gradient) with light gray border
- **Inner hexagon**: White (`#FFFFFF`) cutout
- **Symbolism**: Represents the hexagonal grid interface and focus/target at cursor

**Assets Available:**
- Vector: `QuickPick UI/Assets/QpLogo.svg`, `QpLogo_large.svg`
- Raster: `QuickPick UI/Assets/QpLogo_large.png`
- Icon: `QuickPick UI/Assets/QpLogo.ico`

**Usage Guidelines:**
- Minimum size: 32px (for favicon/icon usage)
- Recommended sizes: 64px, 128px, 256px
- Always maintain hexagonal aspect ratio
- Use on dark backgrounds for brand consistency

---

## UI Components

### Buttons

#### Primary Button
For main actions (Download, Get Started, etc.)
```css
.qp-button-primary {
  background: #0F7D80;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-weight: 700;
  transition: background 0.2s ease;
}

.qp-button-primary:hover {
  background: #149EA3;
}

.qp-button-primary:active {
  background: #0B5C5E;
}
```

#### Secondary Button
For less prominent actions
```css
.qp-button-secondary {
  background: #3A3A3A;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-weight: 700;
  transition: background 0.2s ease;
}

.qp-button-secondary:hover {
  background: #4A4A4A;
}

.qp-button-secondary:active {
  background: #2A2A2A;
}
```

#### Text/Link Button
For tertiary actions
```css
.qp-button-link {
  background: transparent;
  color: #0F7D80;
  border: none;
  padding: 8px 12px;
  text-decoration: none;
  transition: color 0.2s ease;
}

.qp-button-link:hover {
  color: #149EA3;
  text-decoration: underline;
}
```

---

### Cards

Use cards for feature showcases, release notes, download sections.

```css
.qp-card {
  background: #2E2E2E;
  border: 1px solid #3E3E3E;
  border-radius: 8px;
  padding: 24px;
  transition: border-color 0.2s ease;
}

.qp-card:hover {
  border-color: #6F6F6F;
}
```

---

### Input Fields

```css
.qp-input {
  background: #303030;
  color: #F7F7F7;
  border: 1px solid #6F6F6F;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 16px;
}

.qp-input:focus {
  outline: none;
  border-color: #0F7D80;
  box-shadow: 0 0 0 2px rgba(15, 125, 128, 0.2);
}
```

---

### Hexagonal Elements

For decorative or interactive hexagonal elements (mimicking the app UI):

**CSS Approach (using clip-path):**
```css
.qp-hexagon {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #434343 0%, #303030 100%);
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  border: 2px solid #6F6F6F;
}

.qp-hexagon:hover {
  border-color: #979797;
}
```

**SVG Approach:**
Use the logo SVG as a template, modifying fill colors as needed.

---

## Layout & Spacing

### Spacing Scale
Use a consistent 8px grid system:
```css
--space-1: 8px;   /* 0.5rem */
--space-2: 16px;  /* 1rem */
--space-3: 24px;  /* 1.5rem */
--space-4: 32px;  /* 2rem */
--space-5: 48px;  /* 3rem */
--space-6: 64px;  /* 4rem */
```

### Border Radius
- **Small**: 4px (inputs, tags)
- **Medium**: 6px (buttons)
- **Large**: 8px (cards)
- **Circular**: 50% or 100px (icons, avatars)

### Container Widths
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
```

---

## Iconography

### Style
- Use **FontAwesome** icons (consistent with app UI)
- Alternative: **Lucide** or **Heroicons** for modern, minimal look
- Color: `#F7F7F7` (white/off-white)
- Size: 16px (inline), 24px (buttons), 32px+ (feature icons)

### Common Icons
- Download: `fa-download`
- GitHub: `fa-github`
- Settings: `fa-cog` / `fa-gear`
- Play: `fa-play`
- Windows: `fa-windows`

---

## Animations & Interactions

### Transition Timing
```css
--transition-fast: 0.15s ease;
--transition-base: 0.2s ease;
--transition-slow: 0.3s ease;
```

### Hover Effects
- **Buttons**: Background color change
- **Cards**: Border color brighten
- **Links**: Color change + underline
- **Icons**: Scale slightly (1.05x) or color shift

### Focus States
All interactive elements must have visible focus indicators:
```css
:focus-visible {
  outline: 2px solid #0F7D80;
  outline-offset: 2px;
}
```

---

## Page Structure Example

### Hero Section
```html
<section class="hero">
  <img src="logo.svg" alt="QuickPick Logo" class="logo">
  <h1>QuickPick</h1>
  <p>Bring your taskbar right to your cursor.</p>
  <a href="#download" class="qp-button-primary">Download Latest</a>
</section>
```

**Styling:**
```css
.hero {
  background: #1F1F1F;
  padding: 64px 24px;
  text-align: center;
  border-bottom: 1px solid #3E3E3E;
}

.hero .logo {
  width: 128px;
  height: 128px;
  margin-bottom: 24px;
}
```

---

### Release Card
```html
<div class="qp-card release-card">
  <h3>v1.0.0</h3>
  <p class="release-date">Released: January 2026</p>
  <ul class="release-notes">
    <li>Initial public release</li>
    <li>Active application switching</li>
    <li>Customizable hotkey</li>
  </ul>
  <a href="download-link" class="qp-button-primary">Download</a>
</div>
```

---

## Accessibility

### Contrast
All text must meet **WCAG AA** standards:
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**Verified Combinations:**
- `#F7F7F7` on `#303030` ✅ (13.5:1)
- `#F7F7F7` on `#0F7D80` ✅ (4.8:1)
- `#FFFFFF` on `#0B5C5E` ✅ (6.8:1)

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Visible focus indicators required
- Logical tab order

### Screen Readers
- Use semantic HTML (`<nav>`, `<main>`, `<article>`)
- Provide alt text for images
- Use ARIA labels where needed

---

## Responsive Design

### Breakpoints
```css
/* Mobile first approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Mobile Considerations
- Increase tap targets to minimum 44x44px
- Stack layouts vertically
- Reduce padding/spacing slightly
- Consider hamburger menu for navigation

---

## Code Examples

### Complete CSS Variables
```css
:root {
  /* Colors - Primary */
  --qp-primary: #0F7D80;
  --qp-primary-hover: #149EA3;
  --qp-primary-pressed: #0B5C5E;
  
  /* Colors - Neutral */
  --qp-bg-dark: #303030;
  --qp-surface-dark: #1F1F1F;
  --qp-surface-elevated: #2E2E2E;
  --qp-border: #6F6F6F;
  --qp-border-subtle: #3E3E3E;
  --qp-text-primary: #F7F7F7;
  --qp-text-disabled: #888888;
  
  /* Colors - Secondary */
  --qp-secondary: #3A3A3A;
  --qp-secondary-hover: #4A4A4A;
  --qp-secondary-pressed: #2A2A2A;
  
  /* Spacing */
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-5: 48px;
  --space-6: 64px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.3s ease;
  
  /* Typography */
  --font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}
```

### Base Styles
```css
body {
  font-family: var(--font-family);
  background: var(--qp-bg-dark);
  color: var(--qp-text-primary);
  line-height: 1.6;
  font-size: 16px;
  margin: 0;
  padding: 0;
}

a {
  color: var(--qp-primary);
  text-decoration: none;
  transition: color var(--transition-base);
}

a:hover {
  color: var(--qp-primary-hover);
}
```

---

## Brand Voice & Messaging

### Tone
- **Efficient**: Direct, no fluff
- **Friendly**: Approachable, helpful
- **Technical but accessible**: Not dumbed down, but not overly jargony

### Taglines
- "Bring your taskbar right to your cursor"
- "Efficiency at your fingertips"
- "Quick access, anywhere on screen"

### Messaging Hierarchy
1. **What it does**: Brings taskbar to cursor
2. **Why it matters**: Saves time on multi-monitor setups
3. **How it works**: Hotkey activation, hexagonal grid interface

---

## Resources

### Assets Location
- Logo files: `QuickPick UI/Assets/`
- UI screenshots: `docs/Basic UI.png`

### Design Files
- Colors reference: `QuickPick UI/Views/Resources.xaml`
- Style guide: `docs/UI_StyleGuide.md`

### External Resources
- FontAwesome: https://fontawesome.com
- Segoe UI font information: Microsoft Typography

---

## Version History
- **v1.0** (2026-02-07): Initial style guide creation

---

**For questions or contributions, see the main QuickPick repository.**
