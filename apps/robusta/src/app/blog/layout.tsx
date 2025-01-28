import type { Metadata } from 'next';
import { FullHeader } from '@/components/header/FullHeader';

export const metadata: Metadata = {
  title: 'Robusta Build: Blog layout',
  description: 'page description',
};

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header>Blog header</header>
      <FullHeader isHome={false}></FullHeader>
      {children}
      <footer>Blog Footer</footer>
    </>
  );
}
