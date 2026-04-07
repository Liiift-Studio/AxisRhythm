import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
	title: "Axis Rhythm — Per-line variable font axis alternation",
	icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
	description:
		"Axis Rhythm cycles any variable font axis — wdth, wght, opsz — across paragraph lines, creating a subtle typographic texture impossible in CSS alone. Works with React, vanilla JS, or any framework.",
	keywords: [
		"axis rhythm", "variable font", "font axis", "wdth", "wght", "typography",
		"TypeScript", "npm", "react typography", "letter spacing", "typesetting",
	],
	openGraph: {
		title: "Axis Rhythm — Per-line variable font axis alternation",
		description: "Cycle any variable font axis across paragraph lines. A typographic texture technique, now in one npm package.",
		url: "https://axis-rhythm.liiift.studio",
		siteName: "Axis Rhythm",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Axis Rhythm — Per-line variable font axis alternation",
		description: "Cycle any variable font axis across paragraph lines. A typographic texture technique, now in one npm package.",
	},
	metadataBase: new URL("https://axis-rhythm.liiift.studio"),
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className="h-full antialiased">
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	)
}
