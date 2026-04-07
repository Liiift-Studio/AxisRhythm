// axis-rhythm/src/core/types.ts — types and class constants
export interface AxisRhythmOptions {
	// axis (which axis: 'wdth' | 'wght' | string)
	// values (axis values to cycle, e.g. [100, 96])
	// period (lines per cycle, default 2)
	// align ('top' | 'bottom')
}

/** CSS class names injected by axis-rhythm — use these to target generated markup */
export const AXIS_RHYTHM_CLASSES = {
	word: 'axis-rhythm-word',
	line: 'axis-rhythm-line',
	probe: 'axis-rhythm-probe',
} as const
