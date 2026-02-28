# QuickPick Website Design Specification

This document defines the exact visual and structural design for the QuickPick homepage.  
It is written to be used as a prompt for generating or implementing the website.

The tone must be controlled, minimal, technical, and restrained.  
No marketing style. No startup aesthetics. No decorative elements.

---

# Overall Design Principles

- Dark-only theme
- Flat design (no gradients)
- No glassmorphism
- No drop shadows
- No background images
- No animation-heavy UI
- No oversized typography
- No decorative color blocks

The page should feel:

- Quiet
- Competent
- Engineered
- Intentional

If it looks like a SaaS landing page, it is wrong.

---

# Color System

Background (primary):
- #1F1F1F

Background (alternate sections, optional):
- #303030

Primary text:
- #F7F7F7

Muted text:
- #B0B0B0

Accent (ONLY for actions and active states):
- #0F7D80

Borders:
- #3A3A3A

Teal must only be used for:
- Primary buttons
- Active navigation item
- Links
- Actionable elements

Never use teal as a large background area.

---

# Typography

Font stack:
"Segoe UI", Inter, system-ui, -apple-system, sans-serif

H1:
- 40px
- 600 weight
- White

H2:
- 28px
- 600 weight
- White

H3:
- 20px
- 600 weight
- White

Body text:
- 16px–18px
- 400 weight
- Line-height 1.6
- White or muted

No dramatic font scaling.
No extra-bold marketing typography.

---

# Layout Rules

- Max content width: ~980px
- Centered layout
- Generous vertical spacing (80px between sections)
- Horizontal padding: 24px
- No card grids unless necessary
- Use spacing instead of heavy borders

---

# Page Structure

## 1. Header

Top navigation bar with subtle bottom border.

Left:
- "QuickPick" (text logo only)

Right:
- Home (active, accent color)
- Download
- Changelog
- Privacy

Navigation links are muted by default.
Active page link uses accent color.
Hover slightly brightens text.

No animated underline effects.

---

## 2. Hero Section

Centered.

Large headline:

Execute predefined actions instantly from your cursor.

Below it, supporting text:

QuickPick is a Windows action launcher designed for speed, precision, and control.

Spacing between headline and paragraph should feel deliberate and calm.

Primary CTA button:

[ Download for Windows ]

Button styling:
- Background: #0F7D80
- Text: white
- Moderate border radius (6px)
- Slight brightness increase on hover
- No glow
- No shadow

Optional secondary link below:

View Changelog

Muted or simple accent link.

---

## 3. What It Is Section

Section heading:

What It Is

Paragraph:

QuickPick allows you to define actions such as media controls, volume changes, text insertion, key combinations, or application launch. When invoked, QuickPick appears at your cursor. Select an action. Execute. Done.

Followed by bullet list:

- Media controls  
- Volume changes  
- Text insertion  
- Key combinations  
- Application launch  

Then a short clarification block:

It is not a search launcher.  
It does not rank results.  
It executes exactly what you define.

Keep tone factual.

---

## 4. Screenshot Section (Summon UI)

Insert placeholder:

<screenshot of summon UI>

Caption below image:

Appears at the cursor. Select. Execute.

Screenshot styling:
- Thin border (#3A3A3A)
- Slight rounded corners (6px)
- No drop shadow

---

## 5. Why Hexagons Section

Heading:

Why Hexagons

Paragraph:

QuickPick uses a hexagonal layout for action selection. The structure ensures equal distance between targets and eliminates directional bias. The layout is designed for repeated spatial use and muscle memory.

Follow with short declarative lines:

Hexagons represent actions.  
Circles represent applications.

No decorative graphics required.

---

## 6. Configuration Screenshot Section

Insert placeholder:

<screenshot of configuration screen>

Caption:

Define actions once. Reuse them instantly.

Same screenshot styling as before.

---

## 7. Technical Characteristics Section

Heading:

Technical Characteristics

Bullet list:

- Windows only  
- Local configuration  
- No cloud dependency  
- No background telemetry  
- Deterministic behavior  

Optional closing line:

QuickPick performs only the actions you explicitly configure.

Tone must remain direct and factual.

---

## 8. Download Section

Heading:

Download

Text:

Latest Version: vX.X.X  
Release Date: <date>

Primary button:

[ Download Latest Version ]

Below:

See full version history on the Changelog page.

---

## 9. Footer

Thin top border.

Content:

QuickPick  
Windows Action Launcher  

© <year> All rights reserved.

Muted text color.
Small font size (~14px).
No decorative elements.

---

# Final Visual Check

The page should feel:

- Structured
- Minimal
- Calm
- Technical

If it feels exciting, bold, or sales-driven, it is wrong.

The product should speak through restraint.