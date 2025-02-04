import type { Metadata } from 'next';
import './globals.css';
import './modern-reset.scss';
import './base.scss';

export const metadata: Metadata = {
  title: 'Robusta Build: Freelance for ethers.js and blockchain',
  description: 'Build robust applications with ethers.js and blockchain.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme={'light'}>
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
