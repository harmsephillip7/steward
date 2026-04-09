import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Steward — Christian Values Advisory Platform',
  description: 'Ethical investment screening and financial planning for South African advisors.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
