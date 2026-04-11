// vitest.config.ts — test configuration
import { defineConfig } from 'vitest/config'

// Optional peer deps that are loaded via dynamic import() at runtime.
// They're not installed in the test environment, so we stub them as empty
// virtual modules. The library's tryLoad* functions handle missing deps
// gracefully via .catch() — these stubs just make Vite's resolver happy.
const OPTIONAL_PEER_DEPS = ['syllable', '@chenglou/pretext']

export default defineConfig({
	plugins: [
		{
			name: 'stub-optional-peer-deps',
			resolveId(id) {
				if (OPTIONAL_PEER_DEPS.includes(id)) return `\0${id}`
			},
			load(id) {
				if (OPTIONAL_PEER_DEPS.some((dep) => id === `\0${dep}`)) return 'export default null'
			},
		},
	],
	test: {
		environment: 'happy-dom',
	},
})
