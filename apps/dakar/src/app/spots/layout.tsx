import type { Metadata } from 'next';
//import './globals.css';
import './modern-reset.scss';
import './base.scss';
import { Header } from '@/components/header/Header';

export const metadata: Metadata = {
  title: 'Robusta Build: Freelance for ethers.js and blockchain',
  description: 'Build robust applications with ethers.js and blockchain.',
};

export default function SpotsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Header />
      <div>{children}</div>
    </div>
  );
}
