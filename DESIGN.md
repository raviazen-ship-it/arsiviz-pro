# DESIGN.md - ArsiViz Pro Design System

## Identity & Architectural Direction
- **Product:** ArsiViz Pro v2.0 (3D Architectural Configurator & Construction Lifecycle Visualizer)
- **Visual Language:** Clean Architectural Studio & Editorial Monograph
- **Design Read:** Interactive 3D architectural workspace for homeowners and building practitioners, in a calm editorial studio register, dial `ENERGY 2 / RHYTHM 2 / MOTION 2`.
- **Differentiator:** Full-bleed interactive 3D procedural architectural model paired with hairline editorial drafting scales, tabular dimension readouts, and deterministic 6-stage construction cutaway choreography.

## Palette & Contrast Rationale
### Light Mode
- Canvas Ground (`--bg-canvas`): `#F7F7F4` (warm architectural paper/plaster neutral so 3D light & shadow read accurately)
- Floating Surface (`--bg-surface`): `rgba(255, 255, 255, 0.92)` (reserved strictly for primary Studio HUD panels)
- Solid Elevated Surface (`--bg-elevated`): `#FFFFFF` (cards, dialogs, tables, print sheet)
- Primary Text (`--text-primary`): `#202522` (>15:1 contrast on surface)
- Secondary Text (`--text-secondary`): `#555D57` (>6.4:1 contrast on `#FFFFFF` and `#F7F7F4`, passing WCAG AA)
- Hairline Border (`--border-subtle`): `#E4E7E2`; Control Border (`--border-strong`): `#858F88` (>3.1:1 non-text contrast)

### Dark Mode
- Canvas Ground (`--bg-canvas`): `#0F1211` (obsidian studio slate)
- Floating Surface (`--bg-surface`): `rgba(23, 28, 26, 0.92)`
- Solid Elevated Surface (`--bg-elevated`): `#171C1A`
- Primary Text (`--text-primary`): `#F3F4F0` (>15:1 contrast)
- Secondary Text (`--text-secondary`): `#A1AAA3` (>7.2:1 contrast on `#171C1A`)
- Hairline Border (`--border-subtle`): `#2B332E`; Control Border (`--border-strong`): `#68736C` (>3.1:1 non-text contrast)

### Accents (Single Primary Accent + Semantic Status)
- **Primary Accent (Warm Terracotta):** `#C25438` in Light Mode with `#FFFFFF` foreground (>4.7:1 AA contrast); `#E07A5F` in Dark Mode with `#181210` foreground (>6.5:1 AA contrast). Used only on primary CTA, active stage indicator, and active tab marker.
- **Supporting Status (Sage Green):** `#2B6CB0` / `#2E6F56` (light text/border) and `#81B29A` (dark mode indicator), always paired with explicit text labels and icons.
- **Architectural Gold:** `#B89225` / `#D4AF37` exclusively for sun-study solar arc and dimension callout accents.

## Typography & Hierarchy
- **Primary Sans:** Plus Jakarta Sans (with Inter and system sans fallback) chosen for clean geometric legibility at compact studio control sizes (12px-14px) and calm editorial headings.
- **Numeric Discipline:** `font-variant-numeric: tabular-nums` on all meter dimensions, stages, sun clock, IDR RAB subtotals, and KPR amortization outputs so figures never jitter when sliders move.

## Elevation, Glass, & Motion Rules
- **Glassmorphism Dose Cap:** Applied only to the floating HUD shell over the 3D canvas (`Header` + active side drawer/timeline dock) so the 3D architecture remains anchored behind the chrome. Inner cards, modals, and tables use solid opaque surfaces.
- **Shadows:** Two strict levels (`panel` for floating studio chrome, `modal` for dialogs).
- **Motion:** Controlled 180-240ms transitions for drawers, modals, and smooth camera interpolation; respects `prefers-reduced-motion` across both Framer Motion UI and 3D camera transitions.
