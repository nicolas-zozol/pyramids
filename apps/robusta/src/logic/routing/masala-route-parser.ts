import { C, N, F, SingleParser, Tuple } from '@masala/parser';
import { X } from '@masala/x';
type RouteType = 'BLOG_ROLL' | 'CATEGORY' | 'POST';

interface ParseResultNoLocale {
  type: RouteType;
  categories?: string[] | undefined; // e.g. ['blockchain', 'security']
  slug?: string | undefined;
  page?: number; // 2 if
}

interface ParseResult extends ParseResultNoLocale {
  isDefaultLocale: boolean;
  locale: string; // 'en' or 'fr'
}

type PR = Partial<ParseResult>;

const slugDiscriminant = 's';

const slash = C.string('/');
const word = F.not(slash)
  .rep()
  .map((c) => c.join(''));

const categoryWord = word.filter((w) => w !== 'page' && w !== slugDiscriminant);

export const firstWordParser = C.char('/').then(word).last();

export const pageParser = C.string('/page/')
  .then(N.integer())
  .last()
  .map((n) => ({ page: n }))
  .then(F.eos())
  .first() as SingleParser<{ page: number }>;

const singleCategory = (allCategories: string[][]) =>
  slash
    .then(
      categoryWord.filter((w) =>
        allCategories.some((cats) => cats.includes(w)),
      ),
    )
    .last();

const categoriesParser = (allCategories: string[][]) =>
  singleCategory(allCategories)
    .rep()
    .array()
    .filter((found) =>
      allCategories.some((cats) => {
        return JSON.stringify(cats) === JSON.stringify(found);
      }),
    )
    .map((list) => ({ categories: list }));

const categories = (allCategories: string[][]) =>
  X.split(slash.drop())
    .filter((urlCategories: string[]) =>
      allCategories.some(
        (list) => JSON.stringify(list) == JSON.stringify(urlCategories),
      ),
    )
    .map((list: string[]) => ({ categories: list }));

const slugParser = C.string(`/${slugDiscriminant}/`)
  .then(word)
  .last()
  .map((slug) => ({ slug }));

export const categoriesHome = (allCategories: string[][]) =>
  categoriesParser(allCategories).then(F.eos()).first() as SingleParser<{
    categories: string[];
  }>;

export const categoriesHomeParser = (allCategories: string[][]) =>
  categoriesParser(allCategories)
    .then(F.eos())
    .map((tuple) => {
      const data = tuple.array() as PR[];
      const categories = data[0];
      return {
        type: 'CATEGORY',
        ...categories,
        page: 1,
      } as ParseResultNoLocale;
    });

export const categoriesPageParser = (allCategories: string[][]) =>
  categoriesParser(allCategories)
    .then(pageParser)
    .map((tuple) => {
      const data = tuple.array() as PR[];
      const categories = data[0];
      const page = data[1];

      return {
        type: 'CATEGORY',
        ...categories,
        ...page,
      } as ParseResultNoLocale;
    });

export const postParser = (allCategories: string[][]) =>
  categoriesParser(allCategories)
    .then(slugParser)
    .map((tuple) => {
      const data = tuple.array() as PR[];
      const categories = data[0];
      const slug = data[1];
      return {
        type: 'POST',
        ...slug,
        ...categories,
      } as ParseResultNoLocale;
    })
    .then(F.eos().drop())
    .single();

export const routeParsersForSpecs = {
  categoriesParser,
  slugParser,
};
