// axis-rhythm/src/react/AxisRhythmText.tsx — React component wrapper
import React, { forwardRef, useCallback } from 'react'
import { useAxisRhythm } from './useAxisRhythm'
import type { AxisRhythmOptions } from '../core/types'

interface AxisRhythmTextProps extends AxisRhythmOptions {
	children: React.ReactNode
	className?: string
	style?: React.CSSProperties
	/** HTML element to render. Default: 'p' */
	as?: React.ElementType
}

/**
 * Drop-in component that applies the axis-rhythm effect to its children.
 * Forwards the ref to the root element while also attaching the internal hook ref.
 */
export const AxisRhythmText = forwardRef<HTMLElement, AxisRhythmTextProps>(
	function AxisRhythmText({ children, className, style, as: Tag = 'p', ...options }, ref) {
		const innerRef = useAxisRhythm(options)

		/** Callback ref that satisfies both the forwarded ref and the internal hook ref */
		const mergedRef = useCallback(
			(node: HTMLElement | null) => {
				;(innerRef as React.MutableRefObject<HTMLElement | null>).current = node
				if (typeof ref === 'function') {
					ref(node)
				} else if (ref) {
					ref.current = node
				}
			},
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[ref],
		)

		return (
			<Tag ref={mergedRef} className={className} style={style}>
				{children}
			</Tag>
		)
	},
)

AxisRhythmText.displayName = 'AxisRhythmText'
