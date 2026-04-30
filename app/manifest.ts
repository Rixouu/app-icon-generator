import type { MetadataRoute } from 'next';

const THEME = '#0A0B14';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'App Icon Generator',
    short_name: 'Icon Gen',
    description:
      'Create Android, iOS, and web/PWA icon packs from uploaded art, clipart, or text, then export platform-ready assets as a ZIP.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: THEME,
    theme_color: THEME,
    categories: ['utilities', 'productivity', 'developer tools'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
