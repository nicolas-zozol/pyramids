export type BlogSearchParams = Record<string, string | string[] | undefined>;

export interface BlogPageProps {
  pSearchParams?: Promise<BlogSearchParams>;
}

export function getCurrentBlogPage(
  searchParams: BlogSearchParams | undefined,
): number {
  let page = 1;
  if (searchParams && searchParams.page) {
    const parsed = parseInt(searchParams.page as string, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      page = parsed;
    }
  }
  return page;
}
