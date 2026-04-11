// axis-rhythm/src/core/types.ts — types and class constants

/** Wave shape for the animated axis-rhythm mode */
export type WaveShape = 'sine' | 'triangle' | 'spring'

/** Options controlling the axis-rhythm effect */
export interface AxisRhythmOptions {
	/** Variable font axis tag, e.g. 'wdth' or 'wght'. Default: 'wdth' */
	axis?: string
	/** Axis values to cycle through across lines. Default: [100, 96] */
	values?: number[]
	/** Number of lines per cycle. Default: 2 */
	period?: number
	/** Anchor alignment: 'top' counts from the first line, 'bottom' from the last. Default: 'top' */
	align?: 'top' | 'bottom'
	/**
	 * Axis value source. Default: 'fixed'
	 *
	 * - **'fixed'** (default) — cycle through `values` in order, repeating every `period` lines.
	 *
	 * - **'syllable-density'** — per-line syllable density drives the axis value.
	 *   `values[0]` is assigned to the line with the lowest syllable density (simple words);
	 *   `values[1]` is assigned to the line with the highest density (complex words);
	 *   lines in between are interpolated. Requires the `syllable` package:
	 *   `npm install syllable`. Falls back to 'fixed' if not installed.
	 */
	source?: 'fixed' | 'syllable-density'
	/**
	 * Line detection method. Default: 'bcr'
	 *
	 * - **'bcr'** (default) — uses `getBoundingClientRect()` on injected word spans.
	 *   Ground truth: reads actual browser layout, handles all inline HTML, variable font
	 *   axes, and any font including `system-ui`. Safe choice when accuracy is critical.
	 *
	 * - **'canvas'** — uses `@chenglou/pretext` canvas measurement for arithmetic line
	 *   breaking. No forced reflow on resize — `layoutWithLines()` is pure arithmetic
	 *   (~0.0002ms per call). Requires `@chenglou/pretext` to be installed. Falls back
	 *   to 'bcr' on the first render while pretext loads. Avoid with `system-ui` font
	 *   (canvas resolves to a different optical variant on macOS).
	 */
	lineDetection?: 'bcr' | 'canvas'
	/**
	 * Line length preservation strategy. Default: 'none'
	 *
	 * Controls how axis-rhythm compensates for the width changes that result from
	 * applying different axis values per line.
	 *
	 * - **'none'** (default) — no compensation. Lines may reflow when the axis alters
	 *   character widths (e.g. wdth or wght). Most visible at wide value ranges.
	 *
	 * - **'spacing'** — adjusts letter-spacing per line to match each line's natural
	 *   (un-modified) width. Preserves glyph shapes; the axis difference is visible
	 *   in weight/form but line endings stay fixed. Requires two BCR read passes.
	 *
	 * - **'scale'** — applies a CSS scaleX transform per line so each line visually
	 *   fits its natural width. GPU-composited, no letter-spacing changes. Slightly
	 *   alters horizontal glyph proportions at large axis ranges.
	 */
	linePreservation?: 'none' | 'spacing' | 'scale'
	/**
	 * Animate the axis rhythm — turns the static snapshot into a slow ambient wave.
	 * Uses `startAxisRhythm` internally. Ignored by `applyAxisRhythm`. Default: false
	 *
	 * The wave advances continuously via rAF. Each line is offset in phase by
	 * `(1 / period) * fullCycle`, so adjacent lines are always at different points
	 * in the oscillation — the effect drifts up or down the paragraph over time.
	 */
	animate?: boolean
	/**
	 * Wave shape for the animated mode. Default: 'sine'
	 *
	 * - **'sine'** — smooth, organic oscillation
	 * - **'triangle'** — linear in, linear out; sharper transitions between values
	 * - **'spring'** — sine with slight overshoot at peaks; more physical feel
	 */
	waveShape?: WaveShape
	/**
	 * Animation speed multiplier. Default: 1
	 *
	 * At `1`, one full cycle takes 4 seconds — a comfortable ambient pace.
	 * At `0.5` the wave moves half as fast; at `2` twice as fast.
	 * Use values below 1 for imperceptible background motion.
	 */
	speed?: number
	/**
	 * Synchronise phase with another element's animation loop.
	 *
	 * Both elements will be at the same point in the oscillation at all times.
	 * The target element must already have `startAxisRhythm` running on it.
	 * The synced element reads phase but does not advance it — the primary
	 * element's loop remains the source of truth.
	 */
	syncTo?: HTMLElement
}

/** CSS class names injected by axis-rhythm — use these to target generated markup */
export const AXIS_RHYTHM_CLASSES = {
	/** Applied to each word measurement span during the read phase */
	word: 'ar-word',
	/** Applied to each line wrapper span in the final output */
	line: 'ar-line',
	/** Applied to probe spans used only for measurement (never appear in final output) */
	probe: 'ar-probe',
} as const
