import { FullHeader } from '@/components/header/FullHeader';
import { FreelanceContent } from '@/components/freelance/FreelanceContent';
import { AppRouterPage, PAGES } from '@/app/router';
import { setRouterPath } from '@robusta/pyramids-helpers';
import { Footer } from '@/components/footer/Footer';

setRouterPath<AppRouterPage>(PAGES.HOME);

export default function Home() {
  return (
    <>
      <FullHeader showHomePageLink={false} />
      <FreelanceContent></FreelanceContent>
      <Footer currentPage={PAGES.HOME}></Footer>
    </>
  );
}
