# axis-rhythm

> Deliberate variable font axis rhythm across paragraph lines — alternating wdth/wght values for typographic texture

## Concept

Lines in a paragraph alternate between two or more variable font axis states (e.g. wdth: 100 / wdth: 96). Not for readability — a typographic surface treatment. The equivalent of sawtooth rag but in the weight/width dimension rather than line-length.

## Install

```bash
npm install axis-rhythm
```

## Usage

### React

```tsx
import { AxisRhythmText } from 'axis-rhythm'

<AxisRhythmText>
  Your paragraph text here.
</AxisRhythmText>
```

### Vanilla JS

```ts
import { applyAxisRhythm, getCleanHTML } from 'axis-rhythm'

const el = document.querySelector('p')
const original = getCleanHTML(el)
applyAxisRhythm(el, original, { /* options */ })
```

## Options

| Option | Description |
|--------|-------------|
| `axis` | which axis: 'wdth' | 'wght' | string |
| `values` | axis values to cycle, e.g. [100, 96] |
| `period` | lines per cycle, default 2 |
| `align` | 'top' | 'bottom' |

## Development

```bash
npm install
npm test
npm run build
```

---

Part of the [Liiift Studio](https://liiift.studio) typography tools family.
See also: [Ragtooth](https://ragtooth.liiift.studio)
