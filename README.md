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

> **Next.js App Router:** this library uses browser APIs. Add `"use client"` to any component file that imports from it.

> **Variable font required:** Axis Rhythm sets `font-variation-settings` per line. The target font must support the axis you specify (e.g. a font with a `wdth` axis for `axis: 'wdth'`). The effect is invisible with fonts that do not have variable axis support.

### React component

```tsx
import { AxisRhythmText } from '@liiift-studio/axisrhythm'

<AxisRhythmText axis="wdth" values={[100, 88]} period={2} linePreservation="spacing">
  Your paragraph text here...
</AxisRhythmText>
```

`linePreservation="spacing"` prevents line overflow by compensating each line's width with letter-spacing. For display or headline text where overflow is acceptable (or part of the effect), omit it or set `linePreservation="none"`.

### React hook

```tsx
import { useAxisRhythm } from '@liiift-studio/axisrhythm'

// Inside a React component:
const ref = useAxisRhythm({ axis: 'wdth', values: [100, 88], period: 2 })
return <p ref={ref}>{children}</p>
```

The hook re-runs automatically on resize via `ResizeObserver` and after fonts load via `document.fonts.ready`.

### Vanilla JS

```ts
import { applyAxisRhythm, removeAxisRhythm, getCleanHTML } from '@liiift-studio/axisrhythm'

const el = document.querySelector('p')
const original = getCleanHTML(el)
const opts = { axis: 'wdth', values: [100, 88], period: 2 }

function run() {
  applyAxisRhythm(el, original, opts)
}

run()
document.fonts.ready.then(run)

const ro = new ResizeObserver(() => run())
ro.observe(el)

// Later — disconnect and restore original markup:
// ro.disconnect()
// removeAxisRhythm(el, original)
```

### TypeScript

```ts
import type { AxisRhythmOptions } from '@liiift-studio/axisrhythm'

const opts: AxisRhythmOptions = { axis: 'wdth', values: [100, 88], period: 2 }
```

---

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `axis` | `'wdth'` | Variable font axis tag, e.g. `'wdth'`, `'wght'`, `'opsz'` |
| `values` | `[100, 96]` | Axis values to cycle through across lines. Set `period` equal to the number of values for all values to appear exactly once per cycle |
| `period` | `2` | Lines per cycle. Set equal to `values.length` — if smaller, trailing values are never reached; if larger, values repeat within the cycle |
| `align` | `'top'` | `'top'` counts from the first line; `'bottom'` counts from the last |
| `lineDetection` | `'bcr'` | `'bcr'` reads actual browser layout — ground truth, works with any font and inline HTML. `'canvas'` uses `@chenglou/pretext` for arithmetic line breaking with no forced reflow on resize (`npm install @chenglou/pretext`). Falls back to `'bcr'` while pretext loads |
| `linePreservation` | `'none'` | `'none'` — no compensation; line widths vary with the axis value (best for display type where reflow is part of the effect). `'spacing'` — adjusts letter-spacing per line to match natural widths; prevents overflow; **recommended for body text**. `'scale'` — applies a GPU scaleX transform per line; no letter-spacing changes, slight horizontal glyph compression at large axis ranges |
| `as` | `'p'` | HTML element to render, e.g. `'h1'`, `'div'`, `'li'`. Accepts any valid React element type. *(React component only)* |

---

## How it works

The algorithm detects visual lines by measuring word span positions with `getBoundingClientRect()`, then wraps each line in a `<span>` with its own `font-variation-settings`. The injected value overrides only the target axis — all other axes set on the parent element are preserved by reading and patching the computed `fontVariationSettings` string before writing. Runs on mount and on every resize via `ResizeObserver`. Re-runs when fonts finish loading (`document.fonts.ready`). The effect is skipped entirely if `prefers-reduced-motion: reduce` is set.

**Line break safety:** Each run starts from the original HTML, detects lines at the element's natural layout, then locks them with `white-space: nowrap`. Word breaks never change as a result of the axis variation.

**Width overflow:** Applying different axis values per line alters character widths, so lines may grow wider or narrower than the container. `linePreservation: 'none'` (default) is appropriate for display or headline type where the axis range is large and overflow is intentional. For body text — or any context where line edges must stay flush — use `linePreservation: 'spacing'` (adjusts letter-spacing to compensate) or `'scale'` (GPU scaleX transform).

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

Current version: v1.1.9
