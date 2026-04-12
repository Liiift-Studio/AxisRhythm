"use client"

// Interactive axis rhythm demo with live controls, cursor/gyro modes, and period slider
import { useState, useEffect, useDeferredValue } from "react"
import { AxisRhythmText } from "@liiift-studio/axisrhythm"
import type { AxisRhythmOptions } from "@liiift-studio/axisrhythm"

type LinePreservation = NonNullable<AxisRhythmOptions['linePreservation']>

const PARAGRAPHS = [
	`Typography has always been as much about texture as legibility. The even grey of a well-set paragraph — called its colour by compositors — depends on consistency: consistent spacing, consistent weight, consistent rhythm from line to line.`,
	`Variable fonts crack this open. The wdth axis can compress or expand a letterform; the wght axis can lighten or darken it; the opsz axis can adjust optical weight for the point size. Applied uniformly, these give you a different typeface.`,
	`Applied line by line, they give you something more interesting: a paragraph with rhythm. Each line carries a different setting but the text reads as one. The difference is a texture the eye feels before the mind names it.`,
]

/** Per-axis slider config: range and sensible defaults */
const AXIS_CONFIG = {
	wdth: { min: 60, max: 125, step: 1, defaultHigh: 110, defaultLow: 70 },
	wght: { min: 100, max: 900, step: 10, defaultHigh: 700, defaultLow: 300 },
} as const

type AxisKey = keyof typeof AXIS_CONFIG

/** Labelled range slider with value displayed below the track */
function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-xs uppercase tracking-widest opacity-50">{label}</span>
			<input type="range" min={min} max={max} step={step} value={value} aria-label={label} onChange={e => onChange(Number(e.target.value))} onTouchStart={e => e.stopPropagation()} style={{ touchAction: 'none' }} />
			<span className="tabular-nums text-xs opacity-50 text-right">{value}</span>
		</div>
	)
}

/** Before/after toggle — left half = without effect, right half filled = with effect */
function BeforeAfterToggle({ active, onClick }: { active: boolean; onClick: () => void }) {
	return (
		<button
			onClick={onClick}
			aria-label="Toggle before/after comparison"
			title={active ? 'Hide comparison' : 'Compare without effect'}
			style={{
				position: 'absolute', bottom: 0, right: 0,
				width: 32, height: 32, borderRadius: '50%',
				border: '1px solid currentColor',
				opacity: active ? 0.8 : 0.25,
				background: 'transparent',
				display: 'flex', alignItems: 'center', justifyContent: 'center',
				cursor: 'pointer', transition: 'opacity 0.15s ease',
			}}
		>
			<svg width="14" height="10" viewBox="0 0 14 10" fill="none">
				<rect x="0.5" y="0.5" width="13" height="9" rx="1" stroke="currentColor" strokeWidth="1"/>
				<line x1="7" y1="0.5" x2="7" y2="9.5" stroke="currentColor" strokeWidth="1"/>
				<rect x="8" y="1.5" width="5" height="7" fill="currentColor"/>
			</svg>
		</button>
	)
}

/** Cursor icon SVG */
function CursorIcon() {
	return (
		<svg width="11" height="14" viewBox="0 0 11 14" fill="currentColor" aria-hidden>
			<path d="M0 0L0 11L3 8L5 13L6.8 12.3L4.8 7.3L8.5 7.3Z" />
		</svg>
	)
}

/** Gyroscope icon SVG — circle with rotation arrow */
function GyroIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
			<circle cx="7" cy="7" r="5.5" />
			<circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
			<path d="M7 1.5 A5.5 5.5 0 0 1 12.5 7" strokeWidth="1.4" />
			<path d="M11.5 5.5 L12.5 7 L13.8 6" strokeWidth="1.2" />
		</svg>
	)
}

export default function Demo() {
	const [axis, setAxis] = useState<AxisKey>('wght')
	const [valueHigh, setValueHigh] = useState<number>(AXIS_CONFIG.wght.defaultHigh)
	const [valueLow, setValueLow] = useState<number>(AXIS_CONFIG.wght.defaultLow)
	const [period, setPeriod] = useState(2)
	const [align, setAlign] = useState<'top' | 'bottom'>('top')
	const [linePreservation, setLinePreservation] = useState<LinePreservation>('spacing')
	const [beforeAfter, setComparing] = useState(false)

	// Interaction modes — mutually exclusive
	const [cursorMode, setCursorMode] = useState(false)
	const [gyroMode, setGyroMode] = useState(false)

	// Gyro-driven values — kept separate from slider state so slider value props
	// never change during gyro mode (which would cause mobile to scroll to the input)
	const [gyroHigh, setGyroHigh] = useState<number>(AXIS_CONFIG.wght.defaultHigh)
	const [gyroLow, setGyroLow] = useState<number>(AXIS_CONFIG.wght.defaultLow)

	// Detected capabilities — resolved client-side after mount
	const [showCursor, setShowCursor] = useState(false)
	const [showGyro, setShowGyro] = useState(false)

	useEffect(() => {
		const isHover = window.matchMedia('(hover: hover)').matches
		const isTouch = window.matchMedia('(hover: none)').matches
		setShowCursor(isHover)
		setShowGyro(isTouch && 'DeviceOrientationEvent' in window)
	}, [])

	const cfg = AXIS_CONFIG[axis]

	function handleAxisChange(next: AxisKey) {
		setAxis(next)
		setValueHigh(AXIS_CONFIG[next].defaultHigh)
		setValueLow(AXIS_CONFIG[next].defaultLow)
		setGyroHigh(AXIS_CONFIG[next].defaultHigh)
		setGyroLow(AXIS_CONFIG[next].defaultLow)
	}

	// Effective values: gyro-driven when gyroMode is active, slider-driven otherwise
	const effectiveHigh = gyroMode ? gyroHigh : valueHigh
	const effectiveLow = gyroMode ? gyroLow : valueLow

	const dValueHigh = useDeferredValue(effectiveHigh)
	const dValueLow = useDeferredValue(effectiveLow)
	const dPeriod = useDeferredValue(period)

	// Cursor mode — X controls valueHigh (mapped to cfg.min–cfg.max), Y controls valueLow (inverted: top=high)
	useEffect(() => {
		if (!cursorMode) return
		const step = cfg.step
		const handleMove = (e: MouseEvent) => {
			const rawHigh = (e.clientX / window.innerWidth) * (cfg.max - cfg.min) + cfg.min
			const rawLow = (1 - e.clientY / window.innerHeight) * (cfg.max - cfg.min) + cfg.min
			setValueHigh(Math.round(rawHigh / step) * step)
			setValueLow(Math.round(rawLow / step) * step)
		}
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setCursorMode(false)
		}
		window.addEventListener('mousemove', handleMove)
		window.addEventListener('keydown', handleKey)
		return () => {
			window.removeEventListener('mousemove', handleMove)
			window.removeEventListener('keydown', handleKey)
		}
	}, [cursorMode, cfg])

	// Gyro mode — gamma → gyroHigh, beta → gyroLow.
	// Updates gyroHigh/gyroLow (not slider state) so slider value props stay frozen,
	// preventing mobile browsers from scrolling to the input on each orientation update.
	// rAF throttle limits re-renders to one per frame.
	useEffect(() => {
		if (!gyroMode) return
		let rafId: number | null = null
		const step = cfg.step
		const handleOrientation = (e: DeviceOrientationEvent) => {
			if (rafId !== null) return
			rafId = requestAnimationFrame(() => {
				rafId = null
				if (e.gamma !== null) {
					// gamma: -90 (tilt left) to 90 (tilt right) → cfg.min–cfg.max
					const raw = ((e.gamma + 90) / 180) * (cfg.max - cfg.min) + cfg.min
					setGyroHigh(Math.round(raw / step) * step)
				}
				if (e.beta !== null) {
					// beta when holding portrait: ~90 upright, decreases when tilted back toward you
					// Clamp to [15, 90] then invert: tilt back = higher value
					const clamped = Math.max(15, Math.min(90, e.beta))
					const raw = ((90 - clamped) / 75) * (cfg.max - cfg.min) + cfg.min
					setGyroLow(Math.round(raw / step) * step)
				}
			})
		}
		window.addEventListener('deviceorientation', handleOrientation)
		return () => {
			window.removeEventListener('deviceorientation', handleOrientation)
			if (rafId !== null) cancelAnimationFrame(rafId)
		}
	}, [gyroMode, cfg])

	// Toggle cursor mode — turns off gyro if active
	const toggleCursor = () => {
		setGyroMode(false)
		setCursorMode(v => !v)
	}

	// Toggle gyro mode — requests iOS permission if needed, turns off cursor if active
	const toggleGyro = async () => {
		if (gyroMode) {
			setGyroMode(false)
			return
		}
		setCursorMode(false)
		const DOE = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
			requestPermission?: () => Promise<PermissionState>
		}
		if (typeof DOE.requestPermission === 'function') {
			const permission = await DOE.requestPermission()
			if (permission === 'granted') setGyroMode(true)
		} else {
			setGyroMode(true)
		}
	}

	const sampleStyle: React.CSSProperties = {
		fontFamily: "var(--font-merriweather), serif",
		fontSize: "1.125rem",
		lineHeight: "1.8",
		fontVariationSettings: '"wght" 300, "opsz" 18, "wdth" 100',
	}

	const activeMode = cursorMode || gyroMode

	return (
		<div className="w-full">
			<div className="grid grid-cols-3 gap-6 mb-6">
				<Slider label="Axis High" value={valueHigh} min={cfg.min} max={cfg.max} step={cfg.step} onChange={setValueHigh} />
				<Slider label="Axis Low" value={valueLow} min={cfg.min} max={cfg.max} step={cfg.step} onChange={setValueLow} />
				<Slider label="Period" value={period} min={1} max={6} step={1} onChange={setPeriod} />
			</div>
			<div className="flex flex-wrap items-center gap-3 mb-8">
				<span className="text-xs uppercase tracking-widest opacity-50">Axis</span>
				{(['wdth', 'wght'] as const).map(v => (
					<button key={v} onClick={() => handleAxisChange(v)} aria-pressed={axis === v} className="text-xs px-3 py-1 rounded-full border transition-opacity" style={{ borderColor: 'currentColor', opacity: axis === v ? 1 : 0.5, background: axis === v ? 'var(--btn-bg)' : 'transparent' }}>{v}</button>
				))}
				<span className="text-xs uppercase tracking-widest opacity-50 ml-4">Align</span>
				{(['top', 'bottom'] as const).map(v => (
					<button key={v} onClick={() => setAlign(v)} aria-pressed={align === v} className="text-xs px-3 py-1 rounded-full border transition-opacity" style={{ borderColor: 'currentColor', opacity: align === v ? 1 : 0.5, background: align === v ? 'var(--btn-bg)' : 'transparent' }}>{v}</button>
				))}
				<span className="text-xs uppercase tracking-widest opacity-50 ml-4">Preserve</span>
				{(['none', 'spacing', 'scale'] as const).map(v => (
					<button key={v} onClick={() => setLinePreservation(v)} aria-pressed={linePreservation === v} className="text-xs px-3 py-1 rounded-full border transition-opacity" style={{ borderColor: 'currentColor', opacity: linePreservation === v ? 1 : 0.5, background: linePreservation === v ? 'var(--btn-bg)' : 'transparent' }}>{v}</button>
				))}

				{/* Cursor mode — desktop/hover-capable devices only */}
				{showCursor && (
					<button
						onClick={toggleCursor}
						title="Move your cursor to control high value (X) and low value (Y)"
						className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all ml-auto"
						style={{
							borderColor: 'currentColor',
							opacity: cursorMode ? 1 : 0.5,
							background: cursorMode ? 'var(--btn-bg)' : 'transparent',
						}}
					>
						<CursorIcon />
						<span>{cursorMode ? 'Esc to exit' : 'Cursor'}</span>
					</button>
				)}

				{/* Gyro mode — touch devices with DeviceOrientationEvent */}
				{showGyro && (
					<button
						onClick={toggleGyro}
						title="Tilt your device to control high value (left/right) and low value (front/back)"
						className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all ml-auto"
						style={{
							borderColor: 'currentColor',
							opacity: gyroMode ? 1 : 0.5,
							background: gyroMode ? 'var(--btn-bg)' : 'transparent',
						}}
					>
						<GyroIcon />
						<span>{gyroMode ? 'Tilt active' : 'Tilt'}</span>
					</button>
				)}
			</div>
			<div className="relative pb-8">
				<div className="flex flex-col gap-8">
					{PARAGRAPHS.map((para, i) => (
						<AxisRhythmText key={i} axis={axis} values={[dValueHigh, dValueLow]} period={dPeriod} align={align} linePreservation={linePreservation} style={sampleStyle}>
							{para}
						</AxisRhythmText>
					))}
				</div>
				{beforeAfter && (
					<div aria-hidden style={{ position: 'absolute', top: 0, left: 0, width: '100%', pointerEvents: 'none', opacity: 0.25 }} className="flex flex-col gap-8">
						{PARAGRAPHS.map((para, i) => (
							<p key={i} style={{ ...sampleStyle, margin: 0 }}>{para}</p>
						))}
					</div>
				)}
				<BeforeAfterToggle active={beforeAfter} onClick={() => setComparing(v => !v)} />
			</div>
			<div className="flex items-center gap-3 mt-8">
				{activeMode && (
					<p className="text-xs opacity-50 italic" style={{ lineHeight: "1.8" }}>
						{cursorMode ? 'Move cursor: X for high value, Y for low. Press Esc to exit.' : 'Tilt left/right for high value, front/back for low.'}
					</p>
				)}
				{!activeMode && (
					<p className="text-xs opacity-50 italic" style={{ lineHeight: "1.8" }}>Each line gets a different axis value. The paragraph reads as one — like column highlighting for text. The alternation gives the eye a subtle landmark on every line, so it can track its position and find the start of the next without losing its place.</p>
				)}
			</div>
		</div>
	)
}
