import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ServiceWorkerRegister } from './components/ServiceWorkerRegister';

const THEME = '#7044ff';

export const metadata: Metadata = {
  title: 'App Icon Generator',
  description:
    'Upload artwork, tune scaling, shape, and effects, then download Android or iOS PNG icon sets as a ZIP.',
  applicationName: 'App Icon Generator',
  appleWebApp: {
    capable: true,
    title: 'App Icon Generator',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [{ url: '/icon-app-icon-generator.png', type: 'image/png', sizes: '512x512' }],
    apple: [{ url: '/icon-app-icon-generator.png', sizes: '180x180' }],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: THEME },
    { media: '(prefers-color-scheme: dark)', color: THEME },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased font-sans bg-background text-foreground">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
