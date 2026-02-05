import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PKS Planeerija',
  description: 'Perearsti kvaliteedisüsteemi planeerija - krooniliste patsientide läbivaatuse jälgimine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="et">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
