import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'ArsiViz Pro v2.0 - 3D Architectural Configurator & Construction Visualizer',
  description:
    'Interactive 3D residential architectural configurator, 6-stage construction lifecycle visualizer, RAB/BoQ estimator, and KPR mortgage simulator.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F7F4' },
    { media: '(prefers-color-scheme: dark)', color: '#0F1211' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className={plusJakarta.variable}>
      <body className="min-h-[100dvh] bg-studio-bg font-sans text-studio-text antialiased">
        {children}
      </body>
    </html>
  );
}
