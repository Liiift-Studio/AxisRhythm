// axis-rhythm/src/react/AxisRhythmText.tsx — React component wrapper
import { forwardRef } from 'react'
import { useAxisRhythm } from './useAxisRhythm'
import type { AxisRhythmOptions } from '../core/types'

interface AxisRhythmTextProps extends AxisRhythmOptions {
	children: React.ReactNode
	className?: string
	style?: React.CSSProperties
	as?: keyof JSX.IntrinsicElements
}

/**
 * Drop-in component that applies the axis-rhythm effect to its children.
 */
export const AxisRhythmText = forwardRef<HTMLElement, AxisRhythmTextProps>(
	function AxisRhythmText({ children, className, style, as: Tag = 'p', ...options }, _ref) {
		const innerRef = useAxisRhythm(options)
		return (
			<Tag ref={innerRef as React.Ref<HTMLParagraphElement>} className={className} style={style}>
				{children}
			</Tag>
		)
	},
)

AxisRhythmText.displayName = 'AxisRhythmText'
