# QuickPick UI Style Guide

This document outlines the user interface design guidelines for QuickPick. It serves as a reference for developers and designers to ensure consistency across the application and related web properties.

## Design Philosophy
QuickPick features a **modern, dark-themed interface** designed for efficiency and minimal distraction. The core interaction model revolves around a **hexagonal grid** and **circular elements**, providing a unique and ergonomic user experience.

## Color Palette

### Primary Colors
Used for primary actions, active states, and highlights.
- ![#0B5C5E](https://placehold.co/15x15/0B5C5E/0B5C5E.png) **Cyan / Teal**: `#0B5C5E` (Base/Pressed)
- ![#0F7D80](https://placehold.co/15x15/0F7D80/0F7D80.png) **Bright Teal**: `#0F7D80` (Primary Button Background)
- ![#149EA3](https://placehold.co/15x15/149EA3/149EA3.png) **Hover Teal**: `#149EA3` (Primary Button Hover)

### Neutral Colors
Used for backgrounds, borders, and secondary elements.
- ![#303030](https://placehold.co/15x15/303030/303030.png) **Background**: `#303030` (Main Window Background)
- ![#1F1F1F](https://placehold.co/15x15/1F1F1F/1F1F1F.png) **Dark Background**: `#1F1F1F` (Menus, Scrollbars, ComboBoxes)
- ![#F7F7F7](https://placehold.co/15x15/F7F7F7/F7F7F7.png) **Foreground (Text)**: `#F7F7F7` (Primary Text)
- ![#6F6F6F](https://placehold.co/15x15/6F6F6F/6F6F6F.png) **Border**: `#6F6F6F` (Standard Borders)
- ![#3A3A3A](https://placehold.co/15x15/3A3A3A/3A3A3A.png) **Secondary Button Background**: `#3A3A3A`

### Functional Colors
- ![#A9A9A9](https://placehold.co/15x15/A9A9A9/A9A9A9.png) **Hover Overlay**: `DarkGray` (Generic Hover)
- ![#808080](https://placehold.co/15x15/808080/808080.png) **Selection**: `Gray` or `#444444`

## Typography
QuickPick uses the system default sans-serif font (typically **Segoe UI** on Windows) to blend seamlessly with the OS environment.
- **Weight**: Regular for body text, **Bold** for button text.
- **Color**: `#F7F7F7` (White/Off-White) for high contrast against dark backgrounds.

## UI Components

### Hexagons
The core interactive element of QuickPick.
-   **Shape**: Hexagonal.
-   **Fill**: Linear Gradient from `#434343` (Top-Left) to `#303030` (Bottom-Right).
-   **Border**: `#6F6F6F` (1px).
-   **Hover**: Border becomes `LightCyan`.
-   **Icon**: White (`#F7F7F7`) FontAwesome icon, scaled to 30% of the hexagon size.

### Buttons

#### Primary Button (`QpButtonStyle`)
Standard rectangular button for main actions.
- **Background**: `#0F7D80`
- **Text Color**: `White`
- **Corner Radius**: `6px`
- **Padding**: `12px, 8px`
- **Hover**: Lighter Teal (`#149EA3`)
- **Pressed**: Darker Teal (`#0B5C5E`)

#### Secondary Button (`QpSecondaryButtonStyle`)
For less prominent actions.
- **Background**: `#3A3A3A`
- **Text Color**: `White`
- **Corner Radius**: `6px`
- **Hover**: `#4A4A4A`
- **Pressed**: `#2A2A2A`

#### Round Button (`RoundButton`)
Used for icon-only actions or pinned apps.
- **Shape**: Circular (`CornerRadius="100"`)
- **Background**: Radial Gradient (Dark Grey `#303030` to `#434343`)
- **Border**: `#6F6F6F` (2px thickness)
- **Hover**: Border changes to `#979797`

### Input Controls

#### Text Box (`QpTextBoxStyle`)
- **Background**: `#303030`
- **Text Color**: `#F7F7F7`
- **Border**: `#6F6F6F` (1px)
- **Padding**: `8px, 6px`

#### Check Box (`QpCheckBoxStyle`)
- **Box**: 14x14px, Background `#303030`, Border `#6F6F6F`.
- **Check Mark**: Custom path, Color `#F7F7F7`.
- **Checked State**: Background & Border become Cyan (`#0B5C5E`).

#### ComboBox & Menus
- **Background**: `#1F1F1F` (Darker than main window)
- **Border**: `#3E3E3E`
- **Item Hover**: `#333333`
- **Item Selected**: `#444444`

### Scrollbars
Custom styled to match the dark theme.
- **Track**: `#1F1F1F`
- **Thumb**: `#3E3E3E` (Rounded corners)
- **Thumb Hover**: `#505050`

## Layout & Spacing
- **Corner Radius**: Generally `6px` for controls, `4px` for thumbs/popups.
- **Spacing**: Comfortable padding (e.g., `12,8` for buttons) to ensure touch/click targets are accessible.

## Iconography & Assets
- **Logo**: The QuickPick logo is available in SVG and PNG formats (`Assets/QpLogo.svg`, `Assets/QpLogo_large.png`).
- **App Icons**: Displayed within circular buttons or hexagonal grids.
