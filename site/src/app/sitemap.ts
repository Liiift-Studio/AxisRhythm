import type { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap {
	return [{ url: 'https://axisrhythm.com', lastModified: new Date('2026-05-31'), changeFrequency: 'monthly', priority: 1 }]
}
