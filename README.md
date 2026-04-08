# Axis Rhythm

Per-line variable font axis alternation for the web. Cycle any OpenType axis (wdth, wght, opsz…) across paragraph lines to create typographic rhythm that reads as design, not noise.

**[axisrhythm.com](https://axisrhythm.com)** · [npm](https://www.npmjs.com/package/@liiift-studio/axisrhythm) · [GitHub](https://github.com/Liiift-Studio/AxisRhythm)

---

## Install

```bash
npm install @liiift-studio/axisrhythm
```

## Usage

```tsx
import { AxisRhythmText } from '@liiift-studio/axisrhythm'

<AxisRhythmText axis="wdth" values={[100, 88]} period={2}>
  Your paragraph text here...
</AxisRhythmText>
```

See [axisrhythm.com](https://axisrhythm.com) for full API docs and a live demo.

---

## Dev notes

### `next` in root devDependencies

`package.json` at the repo root lists `next` as a devDependency. This is a **Vercel detection workaround** — not a real dependency of the npm package. Vercel's build system inspects the root `package.json` to detect the framework; without `next` present it falls back to a static build and skips the Next.js pipeline, breaking the `/site` subdirectory deploy.

The package itself has zero runtime dependencies. Do not remove this entry.

---

Current version: v0.0.13
