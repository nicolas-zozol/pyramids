import { FullHeader } from '@/components/header/FullHeader';
import { FreelanceContent } from '@/components/freelance/FreelanceContent';
import { AppRouterPage, PAGES } from '@/app/router';
import { setRouterPath } from '@robusta/pyramids-helpers';
import { Footer } from '@/components/footer/Footer';
import { getSortedPostsData } from '@/logic/posts';
import { pickFeatured } from '@/logic/posts/pick-featured';

setRouterPath<AppRouterPage>(PAGES.HOME);

export default async function Home() {
  const allPosts = await getSortedPostsData();
  const featured = pickFeatured(allPosts);

  return (
    <>
      <FullHeader showHomePageLink={false} invertBar={false} />
      <FreelanceContent featured={featured}></FreelanceContent>

      <Footer currentPage={PAGES.HOME}></Footer>
    </>
  );
}
