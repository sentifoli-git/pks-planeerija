import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PKS Planeerija',
  description: 'Perearsti kvaliteedisüsteemi planeerija',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="et">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
