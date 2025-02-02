import type { Metadata } from 'next';
import { FullHeader } from '@/components/header/FullHeader';
import { Footer } from '@/components/footer/Footer';
import { getRouterPath } from '@robusta/pyramids-helpers';
import { AppRouterPage } from '@/app/router';

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
      <FullHeader showHomePageLink={true}></FullHeader>
      {children}
      <Footer
        currentPage={getRouterPath<AppRouterPage>()}
        className={'my-10'}
      ></Footer>
    </>
  );
}
