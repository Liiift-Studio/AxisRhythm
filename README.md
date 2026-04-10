# Axis Rhythm

CSS applies `font-variation-settings` to the whole element — every line gets the same axis value. Axis Rhythm works line by line, cycling any OpenType axis through a sequence of values across paragraph lines. The result is a texture the eye reads as rhythm, not noise. Like column highlighting for text.

**[axisrhythm.com](https://axisrhythm.com)** · [npm](https://www.npmjs.com/package/@liiift-studio/axisrhythm) · [GitHub](https://github.com/Liiift-Studio/AxisRhythm)

TypeScript · Zero dependencies · React + Vanilla JS

---

## Install

```bash
npm install @liiift-studio/axisrhythm
```

---

## Usage

### React component

```tsx
import { AxisRhythmText } from '@liiift-studio/axisrhythm'

<AxisRhythmText axis="wdth" values={[100, 88]} period={2} linePreservation="spacing">
  Your paragraph text here...
</AxisRhythmText>
```

### React hook

```tsx
import { useAxisRhythm } from '@liiift-studio/axisrhythm'

const ref = useAxisRhythm({ axis: 'wdth', values: [100, 88], period: 2 })
<p ref={ref}>{children}</p>
```

### Vanilla JS

```ts
import { applyAxisRhythm, getCleanHTML } from '@liiift-studio/axisrhythm'

const el = document.querySelector('p')
const original = getCleanHTML(el)

// Run once, then re-run on resize
applyAxisRhythm(el, original, { axis: 'wdth', values: [100, 88], period: 2 })
```

---

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `axis` | `'wdth'` | Variable font axis tag, e.g. `'wdth'`, `'wght'`, `'opsz'` |
| `values` | `[100, 96]` | Axis values to cycle through across lines. Pass more than two for longer cycles |
| `period` | `2` | Lines per cycle |
| `align` | `'top'` | `'top'` counts from the first line; `'bottom'` counts from the last |
| `lineDetection` | `'bcr'` | `'bcr'` reads actual browser layout — ground truth, works with any font and inline HTML. `'canvas'` uses [`@chenglou/pretext`](https://github.com/chenglou/pretext) for arithmetic line breaking with no forced reflow on resize. Install pretext separately |
| `linePreservation` | `'none'` | `'none'` — no compensation. `'spacing'` — adjusts letter-spacing per line to match natural widths; prevents reflow. `'scale'` — applies a GPU scaleX transform per line; faster, minor horizontal compression at large ranges |
| `as` | `'p'` | HTML element to render, e.g. `'h1'`, `'div'`, `'li'`. Accepts any valid React element type. *(React component only)* |

---

## How it works

The algorithm detects visual lines by measuring word span positions with `getBoundingClientRect()`, then wraps each line in a `<span>` with its own `font-variation-settings`. The injected value overrides only the target axis — the parent element's other axes (`opsz`, `wdth`, etc.) are preserved by reading and patching the computed `fontVariationSettings` string. Runs on mount and on every resize via `ResizeObserver`. Re-runs when fonts finish loading (`document.fonts.ready`).

The `linePreservation` pass measures each line's natural width before applying the axis value, then applies axis and measures again. The delta becomes either a letter-spacing correction (`'spacing'`) or a `scaleX` transform (`'scale'`) per line.

---

## Dev notes

### `next` in root devDependencies

`package.json` at the repo root lists `next` as a devDependency. This is a **Vercel detection workaround** — not a real dependency of the npm package. Vercel's build system inspects the root `package.json` to detect the framework; without `next` present it falls back to a static build and skips the Next.js pipeline, breaking the `/site` subdirectory deploy.

The package itself has zero runtime dependencies. Do not remove this entry.

---

## Future improvements

- **Multi-axis variation** — cycle more than one axis simultaneously per line (e.g. alternate both `wdth` and `wght` independently)
- **Intersection Observer** — defer the layout pass until the element enters the viewport, then re-run each time it scrolls back in
- **SSR hydration** — generate stable line spans on the server to eliminate the flash-of-unstyled-text on first paint
- **RTL support** — `align: 'end'` to anchor the cycle to the reading direction rather than the visual start
- **Smooth re-layout** — animate axis values on resize instead of snapping, for a less jarring transition when viewport width changes

---

Current version: v1.0.0
