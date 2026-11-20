import type { CodeLine, LibraryWord } from '@robusta/pyramids-design-system';
import type { MasalaWord } from '../seopyramids.config.ts';

/** A recipe of Masala Parser as the home page shows it: its source, then what it returns. Code is the same in every Locale. */
export interface MasalaRecipe {
  lines: CodeLine[];
  result: string;
}

const key = (word: string) => ({ key: word });
const BLANK: CodeLine = { runs: [] };

/** The two recipes: small parsers one after the other, then text turned into data. */
export const MASALA_RECIPES: [MasalaRecipe, MasalaRecipe] = [
  {
    lines: [
      { runs: ["const name = C.string('Hello')"] },
      {
        indent: 1,
        runs: ['.', key('then'), "(C.char(' ').", key('rep'), '())'],
      },
      { indent: 1, runs: ['.', key('then'), '(C.letters())'] },
      { indent: 1, runs: ['.', key('last'), '()'] },
      BLANK,
      { runs: ['name.', key('val'), "('Hello Gandhi')"] },
    ],
    result: "'Gandhi'",
  },
  {
    lines: [
      { runs: ["const sep = C.char('/').", key('drop'), '()'] },
      BLANK,
      { runs: ['const date = N.integer()'] },
      { indent: 1, runs: ['.', key('then'), '(sep)'] },
      { indent: 1, runs: ['.', key('then'), '(N.integer())'] },
      { indent: 1, runs: ['.', key('then'), '(sep)'] },
      { indent: 1, runs: ['.', key('then'), '(N.integer())'] },
      { indent: 1, runs: ['.', key('array'), '()'] },
      { indent: 1, runs: ['.', key('map'), '(([day, month, year]) =>'] },
      { indent: 2, runs: ['({ day, month, year }))'] },
      BLANK,
      { runs: ['date.', key('val'), "('25/12/2026')"] },
    ],
    result: '{ day: 25, month: 12, year: 2026 }',
  },
];

/** The words the section teaches, in their order: the three modules in gold, then the five combinators in purple. */
export const MASALA_WORDS: { term: MasalaWord; tone: LibraryWord['tone'] }[] = [
  { term: 'C', tone: 'secondary' },
  { term: 'N', tone: 'secondary' },
  { term: 'F', tone: 'secondary' },
  { term: 'then', tone: 'primary' },
  { term: 'or', tone: 'primary' },
  { term: 'rep', tone: 'primary' },
  { term: 'opt', tone: 'primary' },
  { term: 'map', tone: 'primary' },
];

/** The package Masala Parser is installed from. */
export const MASALA_PACKAGE = '@masala/parser';

/** Masala Parser's repository, and the video that writes a parser in seven minutes. */
export const MASALA_GITHUB = 'https://github.com/masala/masala-parser';
export const MASALA_VIDEO = 'https://www.youtube.com/watch?v=VNUrvWdtM2g';
