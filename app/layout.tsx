import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ROVI — Rwanda Opportunity & Vulnerability Intelligence',
  description:
    'District-level socioeconomic vulnerability mapping and policy intelligence for Rwanda. Built on NISR data to support NST2 and Vision 2050 evidence-based planning.',
  keywords: [
    'Rwanda', 'NISR', 'NST2', 'vulnerability', 'poverty', 'dashboard',
    'district', 'planning', 'socioeconomic', 'Vision 2050',
  ],
  authors: [{ name: 'Rwanda Analytics Lab' }],
  creator: 'Rwanda Analytics Lab',
  openGraph: {
    title: 'ROVI — Rwanda Opportunity & Vulnerability Intelligence',
    description: 'District-level vulnerability mapping powered by NISR data.',
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
