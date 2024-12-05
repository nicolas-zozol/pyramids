import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import './standard.css';
import './app.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Dakar.surf: The best guide to surf in Dakar',
  description: 'Created by Robusta Build',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background-body`}
      >
        <main className={'container mx-auto'}>{children}</main>
      </body>
    </html>
  );
}
