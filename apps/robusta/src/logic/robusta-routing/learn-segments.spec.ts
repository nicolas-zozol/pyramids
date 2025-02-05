// RobustaBlogSegmentsResolver.test.ts
import { describe, it, expect, vi } from 'vitest';
import { Post } from '@/logic/posts';
import * as localesModule from '@/logic/robusta-routing/get-locales';
import { RobustaBlogSegmentsResolver } from '@/logic/robusta-routing/learn-segment';

describe('RobustaBlogSegmentsResolver', () => {
  // 1. Mock locale utilities to control returned locales in tests
  vi.spyOn(localesModule, 'getDefaultLocale').mockReturnValue('en');
  vi.spyOn(localesModule, 'getAllLocales').mockReturnValue(['en', 'fr']);

  // 2. Example posts
  const allPosts: Post[] = [
    new Post(
      {
        date: '2023-01-01',
        title: 'English Blockchain Post',
        category: 'blockchain',
        tags: ['crypto'],
        locale: 'en',
        image: '...',
        slug: 'my-content',
        excerpt: '...',
        author: 'AuthorEn',
        featured: false,
        content: 'Content in English',
        keywords: [],
      },
      'en',
      true,
    ),
    new Post(
      {
        date: '2023-01-02',
        title: 'French Blockchain Post',
        category: 'blockchain',
        tags: ['crypto'],
        locale: 'fr',
        image: '...',
        slug: 'mon-contenu',
        excerpt: '...',
        author: 'AuthorFr',
        featured: false,
        content: 'Contenu en Français',
        keywords: [],
      },
      'fr',
      false,
    ),
  ];

  const BLOG_SLUG = 'blog';

  // 3. Initialize the resolver once for all tests
  const resolver = new RobustaBlogSegmentsResolver(allPosts, BLOG_SLUG);

  it('returns the default blog home when no segments', () => {
    const segments: string[] = [];
    const result = resolver.resolve(segments);
    expect(result).toEqual({
      blogHome: true,
      locale: undefined,
      categories: [],
      slug: undefined,
      defaultLocale: true,
    });
  });

  it('throws an error if the first segment matches the blog slug', () => {
    const segments = ['blog', 'fr', 'some-post'];
    expect(() => resolver.resolve(segments)).toThrowError(
      `Blog slug ${BLOG_SLUG} should not be in the segments : ${segments.join('/')}`,
    );
  });

  it('handles /blog => full blog roll for default locale (en)', () => {
    // Typically the route matching might consume '/blog',
    // so the actual segments passed might be [].
    // We simulate that by testing empty.
    const segments: string[] = [];
    const result = resolver.resolve(segments);
    expect(result).toEqual({
      blogHome: true,
      locale: undefined,
      categories: [],
      slug: undefined,
      defaultLocale: true,
    });
  });

  it('handles /blog/fr => full blog roll for fr', () => {
    const segments = ['fr'];
    const result = resolver.resolve(segments);
    expect(result).toEqual({
      blogHome: true,
      locale: 'fr',
      categories: [],
      slug: undefined,
      defaultLocale: false,
    });
  });

  it('handles /blog/fr/blockchain => category page in fr', () => {
    const segments = ['fr', 'blockchain'];
    const result = resolver.resolve(segments);
    expect(result).toEqual({
      blogHome: false,
      locale: 'fr',
      categories: ['blockchain'],
      slug: '',
      defaultLocale: false,
    });
  });

  it('handles /blog/blockchain => category page in default locale (en)', () => {
    const segments = ['blockchain'];
    const result = resolver.resolve(segments);
    expect(result).toEqual({
      blogHome: false,
      locale: 'en',
      categories: ['blockchain'],
      slug: '',
      defaultLocale: true,
    });
  });

  it('matches a known post slug in the default locale (en)', () => {
    // e.g. /blog/blockchain/my-content
    const segments = ['blockchain', 'my-content'];
    const result = resolver.resolve(segments);
    expect(result).toEqual({
      blogHome: false,
      locale: 'en',
      categories: ['blockchain'],
      slug: 'my-content',
      defaultLocale: true,
    });
  });

  it('matches a known post slug in fr locale', () => {
    // e.g. /blog/fr/blockchain/mon-contenu
    const segments = ['fr', 'blockchain', 'mon-contenu'];
    const result = resolver.resolve(segments);
    expect(result).toEqual({
      blogHome: false,
      locale: 'fr',
      categories: ['blockchain'],
      slug: 'mon-contenu',
      defaultLocale: false,
    });
  });

  it('handles unknown locale gracefully by falling back to default locale', () => {
    // e.g. /blog/es/blockchain => 'es' not recognized, so we treat it as default (en)
    const segments = ['es', 'blockchain'];
    const result = resolver.resolve(segments);
    expect(result).toEqual({
      blogHome: false,
      locale: 'en',
      categories: ['es', 'blockchain'],
      slug: '',
      defaultLocale: true,
    });
  });
});
