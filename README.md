# Axis Rhythm

Cycle any variable font axis — `wdth`, `wght`, `opsz` — across paragraph lines to create typographic texture. Each line gets a different axis value; the paragraph reads as one. Like column highlighting for text.

**[axisrhythm.com](https://axisrhythm.com)** · [npm](https://www.npmjs.com/package/@liiift-studio/axisrhythm) · [GitHub](https://github.com/Liiift-Studio/AxisRhythm)

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
import { useAxisRhythm, getCleanHTML } from '@liiift-studio/axisrhythm'

function Paragraph({ children }) {
  const ref = useAxisRhythm({ axis: 'wght', values: [700, 300], period: 2 })
  return <p ref={ref}>{children}</p>
}
```

### Vanilla JS

```ts
import { applyAxisRhythm, getCleanHTML } from '@liiift-studio/axisrhythm'

const el = document.querySelector('p')
const originalHTML = getCleanHTML(el)

// Run once, then re-run on resize
applyAxisRhythm(el, originalHTML, { axis: 'wdth', values: [100, 88] })
```

---

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `axis` | `string` | `'wdth'` | Variable font axis tag, e.g. `'wdth'`, `'wght'`, `'opsz'` |
| `values` | `number[]` | `[100, 96]` | Axis values to cycle across lines |
| `period` | `number` | `2` | Number of lines per cycle |
| `align` | `'top' \| 'bottom'` | `'top'` | Anchor alignment — `'top'` counts from first line, `'bottom'` from last |
| `lineDetection` | `'bcr' \| 'canvas'` | `'bcr'` | Line detection method — `'bcr'` reads browser layout (ground truth); `'canvas'` uses `@chenglou/pretext` for zero-reflow resize |
| `linePreservation` | `'none' \| 'spacing' \| 'scale'` | `'none'` | Compensate for line-length changes caused by axis variation — `'spacing'` applies letter-spacing, `'scale'` applies scaleX transform |

---

## Dev notes

### `next` in root devDependencies

`package.json` at the repo root lists `next` as a devDependency. This is a **Vercel detection workaround** — not a real dependency of the npm package. Vercel's build system inspects the root `package.json` to detect the framework; without `next` present it falls back to a static build and skips the Next.js pipeline, breaking the `/site` subdirectory deploy.

The package itself has zero runtime dependencies. Do not remove this entry.

---

Current version: v1.0.0
