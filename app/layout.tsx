import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'ROVI — Rwanda Education Gap Intelligence',
  description:
    'Education Gap Intelligence & Priority Platform for Rwanda. Live NISR data — ICT adoption, smart classrooms, textbook ratios. NST2 & Vision 2050 aligned.',
  keywords: [
    'Rwanda', 'NISR', 'education', 'ICT', 'NST2', 'smart classrooms',
    'textbooks', 'gap analysis', 'Vision 2050', 'Rwanda Analytics Lab',
  ],
  authors: [{ name: 'Rwanda Analytics Lab' }],
  creator: 'Rwanda Analytics Lab',
  icons: { icon: '/icon.svg', shortcut: '/icon.svg' },
  openGraph: {
    title: 'ROVI — Rwanda Education Gap Intelligence',
    description: 'Education gap analysis powered by live NISR data.',
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
      <body className="antialiased transition-colors duration-300">
        <ThemeProvider>
          <Navbar />
          <main className="pt-14 min-h-screen">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
