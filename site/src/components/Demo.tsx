"use client"

import { useState, useDeferredValue } from "react"
import { AxisRhythmText } from "@liiift-studio/axisrhythm"

const SAMPLE = `Typography has always been as much about texture as legibility. The even grey of a well-set paragraph — called its colour by compositors — depends on consistency: consistent spacing, consistent weight, consistent rhythm from line to line. Variable fonts crack this open. The wdth axis can compress or expand a letterform; the wght axis can lighten or darken it; the opsz axis can adjust optical weight for the point size. Applied uniformly, these give you a different typeface. Applied line by line, they give you something more interesting: a paragraph with rhythm. Each line carries a different setting but the text reads as one. The difference is a texture the eye feels before the mind names it.`

/** Per-axis slider config: range and sensible defaults */
const AXIS_CONFIG = {
	wdth: { min: 60, max: 125, step: 1, defaultHigh: 110, defaultLow: 70 },
	wght: { min: 100, max: 900, step: 10, defaultHigh: 700, defaultLow: 300 },
} as const

type AxisKey = keyof typeof AXIS_CONFIG

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-xs uppercase tracking-widest opacity-50">{label}</span>
			<input type="range" min={min} max={max} step={step} value={value} aria-label={label} onChange={e => onChange(Number(e.target.value))} onTouchStart={e => e.stopPropagation()} style={{ touchAction: 'none' }} />
			<span className="tabular-nums text-xs opacity-50 text-right">{value}</span>
		</div>
	)
}

export default function Demo() {
	const [axis, setAxis] = useState<AxisKey>('wdth')
	const [valueHigh, setValueHigh] = useState(AXIS_CONFIG.wdth.defaultHigh)
	const [valueLow, setValueLow] = useState(AXIS_CONFIG.wdth.defaultLow)
	const [period, setPeriod] = useState(2)
	const [align, setAlign] = useState<'top' | 'bottom'>('top')

	const dValueHigh = useDeferredValue(valueHigh)
	const dValueLow = useDeferredValue(valueLow)
	const dPeriod = useDeferredValue(period)

	const cfg = AXIS_CONFIG[axis]

	function handleAxisChange(next: AxisKey) {
		setAxis(next)
		// Reset values to sensible defaults for the new axis
		setValueHigh(AXIS_CONFIG[next].defaultHigh)
		setValueLow(AXIS_CONFIG[next].defaultLow)
	}

	const sampleStyle: React.CSSProperties = {
		fontFamily: "var(--font-merriweather), serif",
		fontSize: "1.125rem",
		lineHeight: "1.8",
	}

	return (
		<div className="w-full">
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-6">
				<Slider label="Axis High" value={valueHigh} min={cfg.min} max={cfg.max} step={cfg.step} onChange={setValueHigh} />
				<Slider label="Axis Low" value={valueLow} min={cfg.min} max={cfg.max} step={cfg.step} onChange={setValueLow} />
				<Slider label="Period" value={period} min={2} max={6} step={1} onChange={setPeriod} />
			</div>
			<div className="flex flex-wrap items-center gap-3 mb-8">
				<span className="text-xs uppercase tracking-widest opacity-50">Axis</span>
				{(['wdth', 'wght'] as const).map(v => (
					<button key={v} onClick={() => handleAxisChange(v)} className="text-xs px-3 py-1 rounded-full border transition-opacity" style={{ borderColor: 'currentColor', opacity: axis === v ? 1 : 0.5, background: axis === v ? 'var(--btn-bg)' : 'transparent' }}>{v}</button>
				))}
				<span className="text-xs uppercase tracking-widest opacity-50 ml-4">Align</span>
				{(['top', 'bottom'] as const).map(v => (
					<button key={v} onClick={() => setAlign(v)} className="text-xs px-3 py-1 rounded-full border transition-opacity" style={{ borderColor: 'currentColor', opacity: align === v ? 1 : 0.5, background: align === v ? 'var(--btn-bg)' : 'transparent' }}>{v}</button>
				))}
			</div>
			<AxisRhythmText axis={axis} values={[dValueHigh, dValueLow]} period={dPeriod} align={align} style={sampleStyle}>
				{SAMPLE}
			</AxisRhythmText>
			<p className="text-xs opacity-50 italic mt-6">Each line gets a different axis value. The paragraph reads as one.</p>
		</div>
	)
}
