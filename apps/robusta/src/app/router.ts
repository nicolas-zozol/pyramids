export const PAGES = {
  HOME: 'HOME_PAGE',
  ABOUT: 'ABOUT_PAGE',
  RESUME: 'RESUME_PAGE',
  PORTFOLIO_PAGE: 'PORTFOLIO_PAGE',
  BLOG_HOME: 'BLOG_HOME_PAGE',
  PROSE_MIRROR: 'PROSE_MIRROR_PAGE',
  BLOG_ROLL: 'BLOG_ROLL_PAGE',
  BLOG_POST: 'BLOG_POST_PAGE',
  NOT_FOUND: 'NOT_FOUND',
} as const;

export type AppRouterPage = (typeof PAGES)[keyof typeof PAGES];
