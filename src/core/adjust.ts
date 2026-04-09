// axis-rhythm/src/core/adjust.ts — framework-agnostic axis-rhythm algorithm
import { AXIS_RHYTHM_CLASSES, type AxisRhythmOptions } from './types'

// ─── Pretext (canvas line detection) ─────────────────────────────────────────

/** Minimal surface of @chenglou/pretext that we use */
type PretextModule = {
	prepareWithSegments: (text: string, font: string) => unknown
	layoutWithLines: (prepared: unknown, maxWidth: number, lineHeight: number) => { lines: { text: string }[] }
}

let _pretext: PretextModule | null = null
let _pretextLoading = false

/**
 * Kick off a one-time background import of @chenglou/pretext.
 * No-ops if already loading or loaded. Falls back silently if not installed.
 */
function tryLoadPretext(): void {
	if (_pretext !== null || _pretextLoading) return
	_pretextLoading = true
	import('@chenglou/pretext' as string)
		.then((m) => { _pretext = m as PretextModule })
		.catch(() => {
			console.warn('[axisrhythm] canvas lineDetection requires @chenglou/pretext — falling back to BCR')
		})
}

/** Cache: per-element pretext prepared object, keyed by originalHTML to invalidate on content change */
type PreparedEntry = { originalHTML: string; prepared: unknown }
const pretextCache = new WeakMap<HTMLElement, PreparedEntry>()

/** Build the canvas-compatible font string from an element's computed style */
function getCanvasFont(el: HTMLElement): string {
	const s = getComputedStyle(el)
	const family = s.fontFamily.split(',')[0].replace(/['"]/g, '').trim()
	return `${s.fontWeight} ${s.fontSize} ${family}`
}

/** Get the computed line height in px, falling back to fontSize × 1.2 */
function getLineHeightPx(el: HTMLElement): number {
	const s = getComputedStyle(el)
	const lh = parseFloat(s.lineHeight)
	return isNaN(lh) ? parseFloat(s.fontSize) * 1.2 : lh
}

/**
 * Assign word spans to line groups using pretext's line texts.
 * Accumulates span text content until it matches each line's text, in order.
 * Any trailing spans (from text normalisation differences) are appended to the last group.
 */
function groupSpansByPretext(
	wordSpans: HTMLElement[],
	lines: { text: string }[],
): HTMLElement[][] {
	const groups: HTMLElement[][] = lines.map(() => [])
	let si = 0

	for (let li = 0; li < lines.length && si < wordSpans.length; li++) {
		const target = lines[li].text.replace(/\s+/g, ' ').trim()
		let acc = ''
		while (si < wordSpans.length) {
			const word = (wordSpans[si].textContent ?? '').replace(/\s+/g, ' ').trim()
			acc = acc ? acc + ' ' + word : word
			groups[li].push(wordSpans[si])
			si++
			if (acc === target) break
		}
	}

	// Fallback: attach any remaining spans to the last group
	while (si < wordSpans.length) {
		groups[groups.length - 1]?.push(wordSpans[si++])
	}

	return groups
}

/**
 * Override a single axis value inside a font-variation-settings string,
 * preserving all other axis values. Adds the axis if it is not already present.
 *
 * e.g. overrideAxis('"wght" 300, "opsz" 18', 'wght', 700) → '"wght" 700, "opsz" 18'
 */
function overrideAxis(baseFVS: string, axis: string, value: number): string {
	if (!baseFVS || baseFVS === 'normal') return `"${axis}" ${value}`
	const pattern = new RegExp(`(["'])${axis}\\1\\s+[\\d.eE+-]+`)
	const replacement = `"${axis}" ${value}`
	return pattern.test(baseFVS)
		? baseFVS.replace(pattern, replacement)
		: `${baseFVS}, ${replacement}`
}

/** Resolved defaults applied when options are omitted */
const DEFAULTS: Required<AxisRhythmOptions> = {
	axis: 'wdth',
	values: [100, 96],
	period: 2,
	align: 'top',
	lineDetection: 'bcr',
	linePreservation: 'none',
}

/**
 * Returns the innerHTML of an element with all axis-rhythm injected markup removed,
 * unwrapping their children in place. Safe to call multiple times — idempotent.
 *
 * @param el - Element that may contain axis-rhythm markup
 */
export function getCleanHTML(el: HTMLElement): string {
	const clone = el.cloneNode(true) as HTMLElement
	// Remove all injected line and word spans by unwrapping their children in place.
	// Query for both old data-attribute pattern and current class-based pattern.
	const injected = clone.querySelectorAll(
		`[data-axis-rhythm], .${AXIS_RHYTHM_CLASSES.line}, .${AXIS_RHYTHM_CLASSES.word}`,
	)
	// Iterate in reverse to handle nested spans safely.
	const nodes = Array.from(injected).reverse()
	nodes.forEach((node) => {
		const parent = node.parentNode
		if (!parent) return
		while (node.firstChild) parent.insertBefore(node.firstChild, node)
		parent.removeChild(node)
	})
	// Remove any injected <br> elements left between lines.
	clone.querySelectorAll('br[data-ar-break]').forEach((br) => br.parentNode?.removeChild(br))
	return clone.innerHTML
}

/**
 * Apply the axis-rhythm effect to an element.
 *
 * The algorithm runs five passes:
 *  1. Reset — restore the element to the original HTML snapshot (idempotent)
 *  2. Word wrap — wrap every word in a measurement span (.ar-word)
 *  3. Read phase — set display:inline-block; white-space:nowrap on word spans,
 *     read getBoundingClientRect().top for each, group by rounded top into lines
 *  4. Write phase — wrap each line group in a .ar-line span with font-variation-settings,
 *     remove word spans, insert <br> between lines
 *  5. Scroll restore — rAF to undo any scroll jump caused by DOM mutations
 *
 * @param element      - Target element (must be in the live DOM and visible)
 * @param originalHTML - Clean HTML snapshot from getCleanHTML()
 * @param options      - AxisRhythmOptions (merged with defaults)
 */
export function applyAxisRhythm(
	element: HTMLElement,
	originalHTML: string,
	options: AxisRhythmOptions = {},
): void {
	if (typeof window === 'undefined') return

	// The axis alternation is a decorative typographic effect — skip it entirely
	// when the user has requested reduced motion.
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		element.innerHTML = originalHTML
		return
	}

	// Save scroll position — iOS Safari does not support overflow-anchor: none
	const scrollY = window.scrollY

	// Resolve options against defaults.
	const axis = options.axis ?? DEFAULTS.axis
	const values = options.values ?? DEFAULTS.values
	if (values.length === 0) return  // guard: empty values array would cause modulo-by-zero
	const period = Math.max(1, Math.round(options.period ?? DEFAULTS.period))
	const align = options.align ?? DEFAULTS.align
	const lineDetection = options.lineDetection ?? 'bcr'
	const linePreservation = options.linePreservation ?? DEFAULTS.linePreservation

	// Kick off pretext background load when canvas mode is requested
	if (lineDetection === 'canvas') tryLoadPretext()

	// --- Pass 1: Reset ---
	element.innerHTML = originalHTML

	// --- Pass 2: Word wrap ---
	// Collect all text nodes via recursive childNodes walk.
	// createTreeWalker is intentionally avoided — it skips inline elements in happy-dom 12.
	const textNodes: Text[] = []
	;(function collectTextNodes(node: Node) {
		if (node.nodeType === Node.TEXT_NODE) {
			textNodes.push(node as Text)
		} else {
			node.childNodes.forEach(collectTextNodes)
		}
	})(element)

	// Word spans collected in DOM order for later measurement.
	const wordSpans: HTMLElement[] = []

	for (const textNode of textNodes) {
		const text = textNode.textContent ?? ''
		if (!text.trim()) continue

		// Split into alternating [whitespace, word, whitespace, word, …] tokens.
		const tokens = text.split(/(\S+)/)
		const fragment = document.createDocumentFragment()

		for (let i = 0; i < tokens.length; i += 2) {
			const space = tokens[i]       // whitespace gap before this word
			const word  = tokens[i + 1]  // word (undefined at end of string)
			if (!word) continue

			// Include trailing whitespace in the last word of this text node to avoid
			// orphan text nodes at inline-element boundaries dropping inter-word spaces.
			const isLastWord = tokens[i + 3] === undefined
			const trailingSpace = isLastWord ? (tokens[i + 2] ?? '') : ''

			const span = document.createElement('span')
			span.className = AXIS_RHYTHM_CLASSES.word
			span.textContent = space + word + trailingSpace
			fragment.appendChild(span)
			wordSpans.push(span)
		}

		textNode.parentNode!.replaceChild(fragment, textNode)
	}

	// If no words were found, nothing more to do.
	if (wordSpans.length === 0) {
		requestAnimationFrame(() => {
			if (Math.abs(window.scrollY - scrollY) > 2) {
				window.scrollTo({ top: scrollY, behavior: 'instant' })
			}
		})
		return
	}

	// --- Pass 3: Line grouping ---
	// Two paths: canvas (pretext arithmetic) or bcr (getBoundingClientRect).
	// Canvas path: reuses cached segment widths on resize — no forced reflow.
	// BCR path: reads actual browser layout — ground truth, always accurate.

	interface LineGroup {
		spans: HTMLElement[]
		top: number
	}
	const lineGroups: LineGroup[] = []

	const useCanvas = lineDetection === 'canvas' && _pretext !== null

	if (useCanvas) {
		// --- Canvas path (pretext) ---
		// Get or compute the prepared segment widths for this element's text.
		const cached = pretextCache.get(element)
		let prepared: unknown
		if (cached && cached.originalHTML === originalHTML) {
			prepared = cached.prepared
		} else {
			prepared = _pretext!.prepareWithSegments(
				element.textContent ?? '',
				getCanvasFont(element),
			)
			pretextCache.set(element, { originalHTML, prepared })
		}

		const maxWidth = element.offsetWidth
		const lineHeight = getLineHeightPx(element)
		const { lines } = _pretext!.layoutWithLines(prepared, maxWidth, lineHeight)

		// Map pretext line texts back to word spans.
		const grouped = groupSpansByPretext(wordSpans, lines)
		grouped.forEach((spans, i) => {
			lineGroups.push({ spans, top: i }) // top is synthetic — only used as identity key
		})
	} else {
		// --- BCR path (default) ---
		// Force inline-block so getBoundingClientRect().top identifies the visual row.
		wordSpans.forEach((span) => {
			span.style.display = 'inline-block'
			span.style.whiteSpace = 'nowrap'
		})

		let currentGroup: LineGroup | null = null
		for (const span of wordSpans) {
			const top = Math.round(span.getBoundingClientRect().top)
			if (currentGroup === null || top !== currentGroup.top) {
				currentGroup = { spans: [], top }
				lineGroups.push(currentGroup)
			}
			currentGroup.spans.push(span)
		}
	}

	const totalLines = lineGroups.length

	// --- Pass 4: Write phase — wrap lines (no axis value yet) ---
	// Build line spans and insert into DOM before measuring widths.
	// axis values are applied in Pass 5 so we can read natural widths first.

	// Computed axis value per line (stored for use in Pass 5).
	const lineAxisValues: number[] = []
	const lineElements: HTMLElement[] = []

	lineGroups.forEach((group, lineIndex) => {
		const cyclePos = align === 'bottom'
			? (totalLines - 1 - lineIndex) % period
			: lineIndex % period
		lineAxisValues.push(values[cyclePos % values.length])

		// Create the line wrapper span — no fontVariationSettings yet.
		const lineSpan = document.createElement('span')
		lineSpan.className = AXIS_RHYTHM_CLASSES.line
		lineSpan.style.display = 'inline-block'
		lineSpan.style.whiteSpace = 'nowrap'

		// Move word spans into the line span, unwrapping them (keeping text content).
		// We preserve inline element ancestry by rebuilding the structure.
		for (const wordSpan of group.spans) {
			// Walk ancestors up to element to collect inline wrappers.
			const ancestors: Element[] = []
			let node: Element | null = wordSpan.parentElement
			while (node && node !== element) {
				ancestors.push(node)
				node = node.parentElement
			}

			// The word's text node content.
			const textContent = wordSpan.textContent ?? ''

			if (ancestors.length === 0) {
				// Word span is a direct child of element — just append text.
				lineSpan.appendChild(document.createTextNode(textContent))
			} else {
				// Rebuild ancestor inline elements (innermost first in ancestors array).
				// ancestors[0] = immediate parent of wordSpan, ancestors[last] = child of element.
				let innerNode: Node = document.createTextNode(textContent)
				for (let a = 0; a < ancestors.length; a++) {
					const wrapper = ancestors[a].cloneNode(false) as Element
					wrapper.appendChild(innerNode)
					innerNode = wrapper
				}
				lineSpan.appendChild(innerNode)
			}
		}

		lineElements.push(lineSpan)
	})

	// Insert line spans into the live DOM, separated by <br>.
	// Spans are now measurable but inherit axis values from the parent element.
	element.innerHTML = ''

	lineElements.forEach((lineEl, i) => {
		element.appendChild(lineEl)
		if (i < lineElements.length - 1) {
			const br = document.createElement('br')
			br.setAttribute('data-ar-break', '')
			element.appendChild(br)
		}
	})

	// --- Pass 5: Apply axis values + optional line-length preservation ---
	// Read the element's full font-variation-settings once so we can override only
	// the target axis while preserving opsz, wdth, and any others the parent set.
	// Setting just `'wght' 700` on a span would drop the parent's `opsz 18` entirely,
	// making axis-width measurements inconsistent with natural-width measurements.
	const baseFVS = getComputedStyle(element).fontVariationSettings

	if (linePreservation === 'none') {
		// Simple path: apply axis variation directly, preserving parent axes.
		lineElements.forEach((el, i) => {
			el.style.fontVariationSettings = overrideAxis(baseFVS, axis, lineAxisValues[i])
		})
	} else {
		// Preservation path: measure natural widths before applying axis values,
		// then apply compensation (letter-spacing or scaleX) to keep line lengths stable.

		// Batch read 1: natural widths (spans inherit parent's fontVariationSettings).
		const naturalWidths = lineElements.map(el => el.getBoundingClientRect().width)

		// Apply axis values to all spans, preserving all other parent axes.
		lineElements.forEach((el, i) => {
			el.style.fontVariationSettings = overrideAxis(baseFVS, axis, lineAxisValues[i])
		})

		// Batch read 2: widths after axis application.
		const axisWidths = lineElements.map(el => el.getBoundingClientRect().width)

		if (linePreservation === 'spacing') {
			// Adjust letter-spacing per line so the total advance width matches
			// the natural (un-modified) width. Same technique as HoverBoldly.
			lineElements.forEach((el, i) => {
				const delta = naturalWidths[i] - axisWidths[i]
				const charCount = (el.textContent ?? '').length
				if (charCount > 0) {
					const fontSize = parseFloat(getComputedStyle(el).fontSize)
					el.style.letterSpacing = fontSize > 0
						? `${(delta / charCount) / fontSize}em`
						: ''
				}
			})
		} else if (linePreservation === 'scale') {
			// Apply a scaleX transform so each line visually occupies its natural width.
			// The explicit width constrains the layout box; the transform scales content within it.
			lineElements.forEach((el, i) => {
				if (axisWidths[i] > 0 && naturalWidths[i] > 0) {
					el.style.width = `${naturalWidths[i]}px`
					el.style.transform = `scaleX(${(naturalWidths[i] / axisWidths[i]).toFixed(6)})`
					el.style.transformOrigin = 'left center'
				}
			})
		}
	}

	// --- Pass 6: Restore scroll via rAF ---
	requestAnimationFrame(() => {
		if (Math.abs(window.scrollY - scrollY) > 2) {
			window.scrollTo({ top: scrollY, behavior: 'instant' })
		}
	})
}

/**
 * Remove axis-rhythm markup and restore the element to its original HTML.
 *
 * @param element      - The element that was previously adjusted
 * @param originalHTML - The snapshot passed to the original applyAxisRhythm call
 */
export function removeAxisRhythm(element: HTMLElement, originalHTML: string): void {
	element.innerHTML = originalHTML
}
