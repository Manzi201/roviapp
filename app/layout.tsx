import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
  },
  openGraph: {
    title: 'ROVI — Rwanda Education Gap Intelligence',
    description: 'Education gap analysis powered by live NISR data.',
    type: 'website',
    locale: 'en_RW',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 antialiased">
        <Navbar />
        <main className="pt-16 min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
