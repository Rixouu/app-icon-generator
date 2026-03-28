import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Icon Generator',
  description: 'Generate app icons for Android and iOS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased font-sans bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
