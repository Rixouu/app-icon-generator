import type { MetadataRoute } from 'next';

const THEME = '#6A3DE8';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'App Icon Generator',
    short_name: 'Icon Gen',
    description:
      'Upload artwork, tune scaling, shape, and effects, then download Android or iOS PNG icon sets as a ZIP.',
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
