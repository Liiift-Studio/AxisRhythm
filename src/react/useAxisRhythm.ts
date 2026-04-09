// axis-rhythm/src/react/useAxisRhythm.ts — React hook
import { useCallback, useLayoutEffect, useRef } from 'react'
import { applyAxisRhythm, getCleanHTML } from '../core/adjust'
import type { AxisRhythmOptions } from '../core/types'

/**
 * React hook that applies the axis-rhythm effect to a ref'd element.
 * Automatically re-runs on resize (width changes only).
 */
export function useAxisRhythm(options: AxisRhythmOptions) {
	const ref = useRef<HTMLElement>(null)
	const originalHTMLRef = useRef<string | null>(null)
	const optionsRef = useRef(options)
	optionsRef.current = options

	const { axis, values, period, align, lineDetection } = options
	const v0 = values?.[0]
	const v1 = values?.[1]

	const run = useCallback(() => {
		const el = ref.current
		if (!el) return
		if (originalHTMLRef.current === null) {
			originalHTMLRef.current = getCleanHTML(el)
		}
		applyAxisRhythm(el, originalHTMLRef.current, optionsRef.current)
	}, [axis, v0, v1, period, align, lineDetection])

	useLayoutEffect(() => {
		run()

		if (typeof ResizeObserver === 'undefined') return

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

	return ref
}
