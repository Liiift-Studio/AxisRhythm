// axis-rhythm/src/react/useAxisRhythm.ts — React hook
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { applyAxisRhythm, startAxisRhythm, getCleanHTML } from '../core/adjust'
import type { AxisRhythmOptions } from '../core/types'

/**
 * React hook that applies the axis-rhythm effect to a ref'd element.
 * When `options.animate` is true, starts a continuous rAF wave via `startAxisRhythm`
 * and returns a stop function on unmount. Otherwise uses `applyAxisRhythm` as a
 * static snapshot and re-runs on resize (width changes only).
 */
export function useAxisRhythm(options: AxisRhythmOptions) {
	const ref = useRef<HTMLElement>(null)
	const originalHTMLRef = useRef<string | null>(null)
	const optionsRef = useRef(options)
	optionsRef.current = options
	const stopRef = useRef<(() => void) | null>(null)

	const { axis, values, period, align, lineDetection, linePreservation, animate, waveShape, speed, syncTo } = options
	const v0 = values?.[0]
	const v1 = values?.[1]

	const run = useCallback(() => {
		const el = ref.current
		if (!el) return
		if (originalHTMLRef.current === null) {
			originalHTMLRef.current = getCleanHTML(el)
		}
		// Stop any running animation before re-running
		if (stopRef.current) {
			stopRef.current()
			stopRef.current = null
		}
		if (optionsRef.current.animate) {
			stopRef.current = startAxisRhythm(el, originalHTMLRef.current, optionsRef.current)
		} else {
			applyAxisRhythm(el, originalHTMLRef.current, optionsRef.current)
		}
	}, [axis, v0, v1, period, align, lineDetection, linePreservation, animate, waveShape, speed, syncTo])

	useLayoutEffect(() => {
		run()

		if (typeof ResizeObserver === 'undefined') return

		// Only re-run on resize when not animated — the rAF loop handles continuous
		// updates in animated mode, and rebuilding the DOM on every resize tick
		// would interrupt the wave mid-cycle.
		if (optionsRef.current.animate) {
			return () => {
				if (stopRef.current) {
					stopRef.current()
					stopRef.current = null
				}
			}
		}

		let lastWidth = 0
		let rafId = 0
		const ro = new ResizeObserver((entries) => {
			const w = Math.round(entries[0].contentRect.width)
			if (w === lastWidth) return
			lastWidth = w
			cancelAnimationFrame(rafId)
			rafId = requestAnimationFrame(run)
		})
		ro.observe(ref.current!)
		return () => {
			ro.disconnect()
			cancelAnimationFrame(rafId)
		}
	}, [run])

	// Rerun after fonts finish loading — measurements taken before font-swap
	// (font-display: swap) use the fallback font's widths and produce wrong
	// letter-spacing or scaleX compensation. document.fonts.ready resolves once
	// all @font-face rules have finished loading.
	useEffect(() => {
		document.fonts.ready.then(run)
	}, [run])

	return ref
}
