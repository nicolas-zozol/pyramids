import type { Metadata } from 'next';
import './globals.css';
import './modern-reset.scss';
import './base.scss';

export const metadata: Metadata = {
  title: 'Robusta Build',
  description: 'Created by Robusta Build',
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
