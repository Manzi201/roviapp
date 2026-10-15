import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'EduGap Rwanda — Education Intelligence Platform',
  description:
    'Rwanda Education Gap Intelligence Platform. Identifying where education resources are most needed using live NISR data. ICT, smart classrooms, textbooks. NST2 & Vision 2050.',
  keywords: [
    'Rwanda', 'NISR', 'education', 'ICT', 'NST2', 'smart classrooms',
    'textbooks', 'gap analysis', 'Vision 2050', 'Rwanda Analytics Lab',
  ],
  authors: [{ name: 'Rwanda Analytics Lab' }],
  creator: 'Rwanda Analytics Lab',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icons/icon-192.svg',
  },
  openGraph: {
    title: 'EduGap Rwanda — Education Intelligence Platform',
    description: 'Rwanda education gap analysis powered by live NISR data.',
    type: 'website',
    locale: 'en_RW',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="EduGap" />
        <meta name="theme-color" content="#2563eb" />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        `}} />
      </head>
      <body className="antialiased transition-colors duration-300">
        <ThemeProvider>
          <Navbar />
          <main className="pt-14 min-h-[calc(100dvh-3.5rem)] pb-16 md:pb-0">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
