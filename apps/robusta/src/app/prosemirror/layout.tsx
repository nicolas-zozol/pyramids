import type { Metadata } from 'next';
import { FullHeader } from '@/components/header/FullHeader';
import { Footer } from '@/components/footer/Footer';
import { getRouterPath } from '@robusta/pyramids-helpers';
import { AppRouterPage } from '@/app/router';

export const metadata: Metadata = {
  title: 'Robusta Build: ProseMirror demonstration',
  description: 'ProseMirror is a powerful tool for building rich text editors',
};

export default function ProseMirrorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <FullHeader showHomePageLink={true} invertBar={true}></FullHeader>
      <div className={'min-h-[400px]'}>{children}</div>
      <Footer currentPage={getRouterPath<AppRouterPage>()}></Footer>
    </>
  );
}
