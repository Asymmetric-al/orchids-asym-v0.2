import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://givehope.org'

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = [
    '',
    '/about',
    '/faq',
    '/financials',
    '/ways-to-give',
    '/workers',
  ]

  return publicRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.8,
  }))
}
