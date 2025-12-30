import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://givehope.org'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/mc/',
          '/mc',
          '/admin-dashboard/',
          '/admin-dashboard',
          '/missionary-dashboard/',
          '/missionary-dashboard',
          '/donor-dashboard/',
          '/donor-dashboard',
          '/login',
          '/register',
          '/auth/',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
