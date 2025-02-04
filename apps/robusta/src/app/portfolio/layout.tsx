import type { Metadata } from 'next';
import { FullHeader } from '@/components/header/FullHeader';
import { Footer } from '@/components/footer/Footer';
import { getRouterPath, setRouterPath } from '@robusta/pyramids-helpers';
import { AppRouterPage, PAGES } from '@/app/router';

export const metadata: Metadata = {
  title: 'Robusta Build Portfolio',
  description: 'More than 20 years of experience in software development',
};

setRouterPath<AppRouterPage>(PAGES.PORTFOLIO_PAGE);

export default function StandardLayout({
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
