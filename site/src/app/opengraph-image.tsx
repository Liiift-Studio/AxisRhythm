import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Axis Rhythm — Per-line variable font axis alternation'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
	const interLight = await readFile(join(process.cwd(), 'public/fonts/inter-300.woff'))
	return new ImageResponse(
		(
			<div style={{ background: '#0c0c0c', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '72px 80px', fontFamily: 'Inter, sans-serif' }}>
				<span style={{ fontSize: 13, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>axis rhythm</span>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 48 }}>
						{[100, 94, 100, 94, 100].map((w, i) => (
							<div key={i} style={{ width: `${w * 5}px`, height: 3, background: i % 2 === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
						))}
					</div>
					<div style={{ fontSize: 76, color: '#ffffff', lineHeight: 1.06, fontWeight: 300 }}>Axis Rhythm,</div>
					<div style={{ fontSize: 76, color: 'rgba(255,255,255,0.4)', lineHeight: 1.06, fontWeight: 300 }}>line by line.</div>
				</div>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
					<div style={{ fontSize: 14, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em', display: 'flex', gap: 20 }}>
						<span>TypeScript</span><span style={{ opacity: 0.4 }}>·</span>
						<span>Zero dependencies</span><span style={{ opacity: 0.4 }}>·</span>
						<span>React + Vanilla JS</span>
					</div>
					<div style={{ fontSize: 13, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em' }}>axis-rhythm.liiift.studio</div>
				</div>
			</div>
		),
		{ ...size, fonts: [{ name: 'Inter', data: interLight, style: 'normal', weight: 300 }] },
	)
}
