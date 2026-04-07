// axis-rhythm/src/core/types.ts — types and class constants

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
