import type { Metadata } from 'next';
import { FullHeader } from '@/components/header/FullHeader';
import { Footer } from '@/components/footer/Footer';
import { getRouterPath, setRouterPath } from '@robusta/pyramids-helpers';
import { AppRouterPage, PAGES } from '@/app/router';

export const metadata: Metadata = {
  title: 'Robusta Build: ProseMirror demonstration',
  description: 'ProseMirror is a powerful tool for building rich text editors',
};

setRouterPath<AppRouterPage>(PAGES.PROSE_MIRROR);

export default function ProseMirrorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <FullHeader showHomePageLink={true} invertBar={true}></FullHeader>
      <div className={'my-10 min-h-[400px]'}>{children}</div>
      <Footer currentPage={getRouterPath<AppRouterPage>()}></Footer>
    </>
  );
}
