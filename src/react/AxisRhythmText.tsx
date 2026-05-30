// axis-rhythm/src/react/AxisRhythmText.tsx — React component wrapper
import React, { forwardRef, useCallback, useRef } from 'react'
import { useAxisRhythm } from './useAxisRhythm'
import type { AxisRhythmOptions } from '../core/types'

/** Algorithm options — these are consumed by the hook, not forwarded to the DOM element */
const ALGORITHM_OPTION_KEYS: (keyof AxisRhythmOptions)[] = [
	'axis', 'values', 'period', 'align', 'source', 'lineDetection',
	'linePreservation', 'animate', 'waveShape', 'speed', 'intersect', 'syncTo',
]

interface AxisRhythmTextProps extends AxisRhythmOptions {
	children: React.ReactNode
	className?: string
	style?: React.CSSProperties
	/** HTML element to render. Default: 'p' */
	as?: React.ElementType
	/** Any other HTML attributes (aria-*, data-*, id, etc.) are forwarded to the element */
	[key: string]: unknown
}

/**
 * Drop-in component that applies the axis-rhythm effect to its children.
 * Forwards the ref to the root element while also attaching the internal hook ref.
 * ARIA attributes and other HTML attributes passed as props are forwarded to the element.
 */
export const AxisRhythmText = forwardRef<HTMLElement, AxisRhythmTextProps>(
	function AxisRhythmText({ children, className, style, as: Tag = 'p', ...rest }, ref) {
		// Separate algorithm options from HTML attributes so ARIA/data attrs reach the DOM
		const options: AxisRhythmOptions = {}
		const htmlProps: Record<string, unknown> = {}
		for (const [key, val] of Object.entries(rest)) {
			if ((ALGORITHM_OPTION_KEYS as string[]).includes(key)) {
				;(options as Record<string, unknown>)[key] = val
			} else {
				htmlProps[key] = val
			}
		}

		const innerRef = useAxisRhythm(options)

		// Use a ref to hold the callback so the identity stays stable across renders
		// without needing to list innerRef in the useCallback deps (it is a stable ref object).
		const mergedRefFnRef = useRef<((node: HTMLElement | null) => void) | null>(null)
		if (!mergedRefFnRef.current) {
			mergedRefFnRef.current = (node: HTMLElement | null) => {
				// Assign to the internal hook ref's mutable backing storage.
				// useRef returns an object whose .current is writable; the cast
				// is required because React types it as RefObject (read-only) in React 19.
				;(innerRef as React.MutableRefObject<HTMLElement | null>).current = node
				if (typeof ref === 'function') {
					ref(node)
				} else if (ref) {
					;(ref as React.MutableRefObject<HTMLElement | null>).current = node
				}
			}
		}

		const mergedRef = useCallback(
			(node: HTMLElement | null) => mergedRefFnRef.current?.(node),
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[ref],
		)

		return (
			<Tag ref={mergedRef} className={className} style={style} {...htmlProps}>
				{children}
			</Tag>
		)
	},
)

AxisRhythmText.displayName = 'AxisRhythmText'
