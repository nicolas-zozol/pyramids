/**
 * Site configuration — the site's domain, Locales, contact and the page copy of each Locale, read through getPageCopy and getCategoryLabel.
 *
 * Design: features/__done/pyramid-v2-epic/__done/multilingual-site/multilingual-site.design.md
 * Requirements: R-MULTILINGUAL-41, R-MULTILINGUAL-42, R-MULTILINGUAL-43, R-MULTILINGUAL-44, R-MULTILINGUAL-48, R-MULTILINGUAL-49
 * Design: features/__done/pyramid-v2-epic/__done/blog-rolls/blog-rolls.design.md
 * Requirements: R-BLOGROLLS-41, R-BLOGROLLS-42
 * Design: features/__done/pyramid-v2-epic/__done/seo-excellence/seo-excellence.design.md
 * Requirements: R-SEOEXCELLENCE-44, R-SEOEXCELLENCE-121, R-SEOEXCELLENCE-122
 * Design: features/__done/pyramid-v2-epic/__done/rb-compound-positioning/rb-compound-positioning.design.md
 * Requirements: R-RBCOMPOUND-101, R-RBCOMPOUND-102, R-RBCOMPOUND-103
 */
import type {
  FlowExample,
  FlowLink,
  FlowStep,
  Principle,
  QuestionEntry,
  QuestionLabels,
  TextRun,
} from '@robusta/pyramids-design-system';
import { wordmarkSrc } from './design-system/assets.ts';
import {
  LOCALES,
  ROLL_SIZE,
  SITE_ORIGIN,
  urlScheme,
  type Locale,
} from './routing/scheme.ts';

export { ROLL_SIZE };

export interface BlogConfig {
  /** The single segment under which the site publishes its content section. */
  contentRoot: string;
  defaultLocale: string;
  otherLocales: string[];
  debugImagePath: boolean;
  rollSize: typeof ROLL_SIZE;
  author?: string;
}

interface SeoPyramidsConfig {
  domain: string;
  siteName: string;
  logo: string;
  defaultLocale: string;
  otherLocales: string[];
  blogConfig: BlogConfig;
  contact: Contact;
  pageCopy: Record<Locale, PageCopy>;
}

export interface Contact {
  /** Shown as is; `mailto:` is derived from it. */
  email: string;
  /** Absolute https URL of the profile. */
  linkedIn: string;
}

/** Every text a page of one Locale displays, in plain text, in that Locale. */
export interface PageCopy {
  /** The Locale named in its own language. */
  localeName: string;
  /** Footer tagline. */
  tagline: string;
  header: { contactLabel: string; nav: NavCopy };
  footer: { copyright: string };
  /** The title and the description of the page 404 and of the failed navigation state. */
  head: { title: string; description: string };
  /** The end of an article page, its update date and its Related articles. */
  article: {
    navLabel: string;
    categoryPrefix: string;
    versionsPrefix: string;
    relatedTitle: string;
    updatedPrefix: string;
  };
  /** The breadcrumb of an article page and of a Category roll. */
  breadcrumb: { navLabel: string };
  /** The listing pages: the blog home and the Category rolls. */
  listing: ListingCopy;
  landing: LandingCopy;
  /** The page of RB Compound: its agents, their open questions and boss. */
  rbCompound: RbCompoundCopy;
  /** Category slug to its label, for the Categories the Locale's published articles claim. */
  categoryLabels: Record<string, string>;
}

export interface ListingCopy {
  /** The h1 of every page of the blog home's roll. */
  blogTitle: string;
  /** `{category}` stands for the Category label, `{page}` for the page number. */
  head: {
    blogHome: { title: string; description: string };
    category: { title: string; description: string };
    /** Appended to the title and to the description from page 2 on. */
    pageSuffix: string;
  };
  pagination: { navLabel: string; newerLabel: string; olderLabel: string };
  footer: { title: string; blogHomeLabel: string };
}

/** The links of the header to the site's own pages. */
export interface NavCopy {
  rooftop: string;
  rbCompound: string;
  masala: string;
  articles: string;
}

/** The home page: the building, the two products, Masala Parser, the notes and the workshop. */
export interface LandingCopy {
  head: { title: string; description: string };
  hero: HomeHeroCopy;
  products: ProductsCopy;
  masala: MasalaCopy;
  notes: NotesCopy;
  workshop: WorkshopCopy;
}

/** A floor of the building of the home page. */
export interface FloorCopy {
  name: string;
  kind: string;
  say: string;
}

export interface HomeHeroCopy {
  title: string;
  /** The tagline under the title. */
  eyebrow: string;
  /** The paragraph, the names of the two products in bold. */
  lede: TextRun[];
  emailLabel: string;
  linkedInLabel: string;
  mascotAlt: string;
  annotation: string;
  /** Rooftop, the roof. */
  roof: FloorCopy;
  /** RB Compound, the floors. */
  floor: FloorCopy;
  /** The reader's repository, the ground. */
  ground: FloorCopy;
}

/** The two doors: Rooftop, not out yet, and RB Compound. */
export interface ProductsCopy {
  title: string;
  eyebrow: string;
  rooftop: {
    where: string;
    name: string;
    soon: string;
    say: string;
    /** The alt texts of its two screenshots, in their order. */
    shotAlts: [string, string];
    waitingListLabel: string;
    /** The subject of the email the waiting list link opens. */
    waitingListSubject: string;
  };
  rbCompound: { where: string; name: string; say: string; actionLabel: string };
}

/** The texts of Masala Parser's section; its code is the same in every Locale. */
export interface MasalaCopy {
  title: string;
  eyebrow: string;
  lede: string;
  ticks: string[];
  /** The caption of each recipe, in their order. */
  captions: [string, string];
  /** The accessible name of the arrow before what a recipe returns. */
  resultLabel: string;
  wordsLead: string;
  /** What each word of the library means. */
  meanings: Record<MasalaWord, string>;
  installNote: string;
  videoLabel: string;
}

/** The words of Masala Parser the section teaches: three modules, then five combinators. */
export type MasalaWord =
  | 'C'
  | 'N'
  | 'F'
  | 'then'
  | 'or'
  | 'rep'
  | 'opt'
  | 'map';

export interface WorkshopCopy {
  title: string;
  eyebrow: string;
  lede: string;
  /** The price, then where. */
  facts: [{ strong: string; say: string }, { strong: string; say: string }];
  linkedInLabel: string;
  fine: string;
  mascotAlt: string;
  greeting: string;
}

/** The page of RB Compound. */
export interface RbCompoundCopy {
  head: { title: string; description: string };
  hero: HeroCopy;
  /** The agents of RB Compound, one step each. */
  agents: FlowCopy;
  /** The open questions that close every step. */
  openQuestions: QuestionsCopy;
  /** boss, running the six agents in one command; with a paid accompaniment. */
  boss: FlowCopy;
  principles: PrinciplesCopy;
  cta: CtaCopy;
}

export interface HeroCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
  emailLabel: string;
  linkedInLabel: string;
  mascotAlt: string;
  annotation: string;
}

/** The texts of one FlowDiagram, plain strings, named as its props. */
export interface FlowCopy {
  eyebrow: string;
  title: string;
  /** Paragraph under the title; absent, none. */
  intro?: string;
  steps: FlowStep[];
  /** The agent running every step, framing the row; absent, no frame. */
  conductor?: string;
  /** A run of the steps on a real case; absent, none. */
  example?: FlowExample & { title: string };
  caveat: string;
  /** A line under the caveat ending on a link, opened in a new tab; absent, none. */
  caveatLink?: FlowLink;
}

/** The texts of the QuestionsList, plain strings, named as its props. */
export interface QuestionsCopy {
  eyebrow: string;
  title: string;
  intro: string;
  labels: QuestionLabels;
  entries: QuestionEntry[];
  legend: string;
}

export interface PrinciplesCopy {
  eyebrow: string;
  title: string;
  principles: Principle[];
}

export interface NotesCopy {
  eyebrow: string;
  title: string;
  allLinkLabel: string;
}

export interface CtaCopy {
  title: string;
  subtitle: string;
  footnote: string;
}

const en: PageCopy = {
  localeName: 'English',
  tagline: 'Robusta Build · building software with AI agents',
  header: {
    contactLabel: 'contact me',
    nav: {
      rooftop: 'Rooftop',
      rbCompound: 'RB Compound',
      masala: 'Masala Parser',
      articles: 'articles',
    },
  },
  footer: { copyright: '© Robusta Build · Nicolas Zozol, Toulouse' },
  head: {
    title: 'Robusta Build',
    description:
      'Articles by Nicolas Zozol on software: the web, JavaScript, TypeScript, blockchain and privacy.',
  },
  article: {
    navLabel: 'Keep reading',
    categoryPrefix: 'Filed under ',
    versionsPrefix: 'Also in: ',
    relatedTitle: 'Related articles',
    updatedPrefix: 'Updated on',
  },
  breadcrumb: { navLabel: 'Breadcrumb' },
  listing: {
    blogTitle: 'articles',
    head: {
      blogHome: {
        title: 'Articles by Nicolas Zozol, Robusta Build',
        description:
          'Every article by Nicolas Zozol on software, newest first: the web, JavaScript, TypeScript, blockchain and privacy.',
      },
      category: {
        title: '{category}: articles by Nicolas Zozol',
        description:
          'The articles by Nicolas Zozol filed under {category}, newest first.',
      },
      pageSuffix: ' (page {page})',
    },
    pagination: {
      navLabel: 'Pages of articles',
      newerLabel: 'newer articles',
      olderLabel: 'older articles',
    },
    footer: { title: 'articles', blogHomeLabel: 'all articles' },
  },
  landing: {
    head: {
      title: 'Robusta Build: Nicolas Zozol, building software with AI agents',
      description:
        'Nicolas Zozol makes RB Compound, six agents for Claude Code, and Rooftop, the view from above that lets you steer them. Also Masala Parser, a library of parser combinators, and AI workshops for teams.',
    },
    hero: {
      title: 'your agents write the code. you keep the plans.',
      eyebrow: '// Robusta Build · building software with AI agents',
      lede: [
        'I’m Nicolas Zozol, twenty years in software. I make two tools for teams who build with AI agents: ',
        { strong: 'RB Compound' },
        ', six agents that write a story and a design before any code, and ',
        { strong: 'Rooftop' },
        ', the view from above that lets you steer them. and I work alongside the teams who use them.',
      ],
      emailLabel: 'write me an email',
      linkedInLabel: 'see my LinkedIn profile',
      mascotAlt:
        'Nicolas drawn as Niktux, a penguin in a Robusta Build hoodie: 25 years of coding, sees the big picture, flexible frontend, solid foundations',
      annotation: 'this is niktux, watching over the code.',
      roof: {
        name: 'Rooftop',
        kind: 'the roof · a desktop app',
        say: 'the view from above: every module, epic and story of your repository on one plan, and the open questions that wait for you.',
      },
      floor: {
        name: 'RB Compound',
        kind: 'the floors · agents for Claude Code',
        say: 'six agents, one job each. each one leaves a written file, and the next one starts from it.',
      },
      ground: {
        name: 'your repository',
        kind: 'the ground',
        say: 'stories, designs and decisions are Markdown files, next to your code.',
      },
    },
    products: {
      title: 'steer from the roof. build at the terminal.',
      eyebrow: '// two tools',
      rooftop: {
        where: 'from the roof · when you decide',
        name: 'Rooftop',
        soon: 'coming soon',
        say: 'a desktop app that reads the Markdown of your repository and shows the whole plan: modules, epics, batches, stories, and the open questions that wait for you.',
        shotAlts: [
          'a screenshot of Rooftop: the batches of a module laid on the mat, the first one with its open questions',
          'a screenshot of Rooftop: the stories of the first batch, with the step each one has reached',
        ],
        waitingListLabel: 'join the waiting list',
        waitingListSubject: 'Rooftop waiting list',
      },
      rbCompound: {
        where: 'at the terminal · when you build',
        name: 'RB Compound',
        say: 'six agents for Claude Code. each one does one job and leaves a written file. when a choice stays open, it writes the question down, with the answer it proposes.',
        actionLabel: 'meet the six agents',
      },
    },
    masala: {
      title: 'Masala Parser: small parsers, combined.',
      eyebrow: '// open source since 2016',
      lede: 'Masala Parser is a JavaScript library of parser combinators: you write small parsers, each one reads one thing, and you combine them into the parser you need. it replaces the regexp nobody dares to touch, and it can carry a whole language.',
      ticks: [
        'zero dependency',
        'runs in the browser and in Node',
        'a TypeScript API',
        'more than 500 unit tests, on 100% of the lines',
      ],
      captions: [
        'small parsers, one after the other:',
        'text in, your data out:',
      ],
      resultLabel: 'returns',
      wordsLead: 'a handful of words to learn:',
      meanings: {
        C: 'characters: char, string, letters',
        N: 'numbers: digits, integer, number',
        F: 'the flow: try, not, lazy',
        then: 'one after the other',
        or: 'this one, or that one',
        rep: 'again and again',
        opt: 'or nothing at all',
        map: 'from text to your data',
      },
      installNote: 'LGPL license, maintained by Robusta Build',
      videoLabel: 'how to write a parser, in seven minutes →',
    },
    notes: {
      eyebrow: '// latest articles',
      title: 'what I write.',
      allLinkLabel: 'all articles →',
    },
    workshop: {
      title: 'AI workshops, by the day.',
      eyebrow: '// let’s talk about your team',
      lede: 'need a custom workshop on using AI to build software? tell me how your team works today: I shape the days around it, and I come to you.',
      facts: [
        { strong: 'starting at €2,000', say: 'per day' },
        { strong: 'anywhere in EMEA', say: 'Europe, the Middle East, Africa' },
      ],
      linkedInLabel: 'see my LinkedIn profile',
      fine: 'no form, no newsletter: I read and answer every message myself.',
      mascotAlt: 'Niktux, the Robusta Build penguin, thinking',
      greeting: 'hi there!',
    },
  },
  rbCompound: {
    head: {
      title: 'RB Compound: build software with AI agents, documents first',
      description:
        'RB Compound is the workflow Nicolas Zozol uses to build software with AI agents: a story, a design you approve, then test-first code. Free for noncommercial use, and a complete version with an accompaniment of your team.',
    },
    hero: {
      eyebrow: 'RB Compound · building software with AI agents',
      title: 'documents first. then the agents write the code.',
      subtitle:
        'I’m Nicolas Zozol, twenty years in software. RB Compound is how I build software with AI agents: each feature gets a story and a design, you approve the design, and only then do the agents write the code, tests first. I work with teams and technical leads who build software with agents.',
      emailLabel: 'write me an email',
      linkedInLabel: 'see my LinkedIn profile',
      mascotAlt:
        'Nicolas drawn as Niktux, a penguin in a Robusta Build hoodie: 25 years of coding, sees the big picture, flexible frontend, solid foundations',
      annotation: 'this is niktux, watching over the code.',
    },
    agents: {
      eyebrow: '// RB Compound, the agents',
      title: 'six agents, from the epic to the docs.',
      intro:
        'RB Compound is a suite of agents for Claude Code. each one does one job and leaves a written file behind: the next agent starts from that file, and so do you.',
      steps: [
        { n: 1, label: 'epicman', sub: 'cuts the project into stories' },
        { n: 2, label: 'storyman', sub: 'writes what the feature must do' },
        { n: 3, label: 'bsman', sub: 'challenges the story before any code' },
        { n: 4, label: 'designman', sub: 'writes the design you approve' },
        { n: 5, label: 'tddman', sub: 'writes the tests, then the code' },
        { n: 6, label: 'docman', sub: 'updates the docs to what shipped' },
      ],
      example: {
        title: 'for example, an epic that compares todo-list algorithms:',
        lines: [
          {
            agent: 'epicman',
            command:
              'create an epic for comparing todo-list algorithms, and its stories',
            note: 'writes the epic and five stories, benchmark among them',
          },
          {
            agent: 'bsman',
            command: 'on benchmark',
            note: 'asks the open questions, each with a proposition and its rationale',
          },
          {
            agent: 'storyman',
            command: 'update',
            note: 'folds your answers into the story',
          },
          {
            agent: 'designman',
            command: 'on benchmark',
            note: 'plans the code from what the repository holds today',
          },
          {
            agent: 'tddman',
            command: 'on benchmark',
            note: 'writes the tests, sees them fail, then writes the code',
          },
          {
            agent: 'docman',
            command: 'on benchmark',
            note: 'completes the documentation',
          },
          {
            agent: 'storyman',
            command: 'submit',
            note: 'closes the story: it no longer blocks the others',
          },
        ],
      },
      caveat:
        'license PolyForm Noncommercial 1.0.0: free for noncommercial use.',
      caveatLink: {
        lead: 'open code:',
        label: 'github.com/robusta-build/rb-compound',
        href: 'https://github.com/robusta-build/rb-compound',
      },
    },
    openQuestions: {
      eyebrow: '// open questions',
      title: 'every step ends on questions.',
      intro:
        'an agent never guesses what you did not say. when the epic, a story, a brainstorm or a design leaves a choice open, its agent writes an open question at the end of the file: the question, the one answer it proposes, and why. you answer in a line, and the next agent starts from your answer. one step after the other, the project gets sharper.',
      labels: {
        proposition: 'Proposition:',
        rationale: 'Rationale:',
        resolution: 'Resolution:',
      },
      entries: [
        {
          key: 'OQ-BENCH-2',
          question: 'how many items does the benchmark measure?',
          proposition: '1,000, 10,000 and 100,000 items.',
          rationale:
            'three orders of magnitude show where an algorithm stops scaling, and a run stays under a minute.',
          resolution: 'lgtm',
        },
        {
          key: 'OQ-BENCH-3',
          question: 'which algorithms go into the first comparison?',
          proposition: 'an array, a linked list and a balanced tree.',
          rationale:
            'they cover the three costs of an insertion: shifting, linking, rebalancing.',
          resolution:
            'keep the array and the list, add a skip list instead of the tree.',
        },
      ],
      legend:
        'lgtm, “looks good to me”: the proposition is taken as it is. any other answer is yours, in your own words.',
    },
    boss: {
      eyebrow: '// boss, the complete version',
      title: 'one command, the whole pipeline.',
      intro:
        'boss runs the six agents in your place, one after the other, story after story. it answers the open questions their propositions settle, signs each answer, and leaves you the ones that need you. it stops where you tell it to, and logs every decision in one file.',
      conductor: 'boss',
      steps: [
        { n: 1, label: 'epicman', sub: 'the epic' },
        { n: 2, label: 'storyman', sub: 'the story' },
        { n: 3, label: 'bsman', sub: 'the questions' },
        { n: 4, label: 'designman', sub: 'the design' },
        { n: 5, label: 'tddman', sub: 'the tests, the code' },
        { n: 6, label: 'docman', sub: 'the docs' },
      ],
      example: {
        title: 'the same epic, with boss:',
        lines: [
          {
            agent: 'epicman',
            command:
              'create an epic for comparing todo-list algorithms, and its stories',
            note: 'writes the epic and five stories',
          },
          {
            agent: 'boss',
            command: 'atw todo-list-algorithms',
            note: 'runs the five stories to the commit, answers the open questions and logs why',
          },
        ],
      },
      caveat:
        'this version only comes with a paid, personalized accompaniment of your team.',
    },
    principles: {
      eyebrow: '// the rules of the workflow',
      title: 'rules, written down.',
      principles: [
        {
          k: 'documentation before code.',
          v: 'the story and the design are written before the first line of code.',
        },
        {
          k: 'one story per feature.',
          v: 'it carries its acceptance criteria, which the design and the tests follow.',
        },
        {
          k: 'contracts before code.',
          v: 'the design states the types and interfaces, and is approved before any implementation.',
        },
        {
          k: 'one glossary.',
          v: 'every document uses the same terms, those of the project’s glossary.',
        },
      ],
    },
    cta: {
      title: 'let’s talk about your team.',
      subtitle:
        'Tell me how your team builds software with agents today. I will tell you whether the accompaniment fits.',
      footnote:
        'No form, no newsletter: I read and answer every message myself.',
    },
  },
  categoryLabels: {
    blockchain: 'blockchain',
    javascript: 'javascript',
    typescript: 'typescript',
    privacy: 'privacy',
    web: 'web',
  },
};

const fr: PageCopy = {
  localeName: 'Français',
  tagline: 'Robusta Build · construire du logiciel avec des agents IA',
  header: {
    contactLabel: 'me contacter',
    nav: {
      rooftop: 'Rooftop',
      rbCompound: 'RB Compound',
      masala: 'Masala Parser',
      articles: 'articles',
    },
  },
  footer: { copyright: '© Robusta Build · Nicolas Zozol, Toulouse' },
  head: {
    title: 'Robusta Build',
    description:
      'Articles de Nicolas Zozol sur le logiciel : le web, JavaScript, TypeScript, la blockchain et la vie privée.',
  },
  article: {
    navLabel: 'Pour continuer la lecture',
    categoryPrefix: 'Classé dans ',
    versionsPrefix: 'Autres langues : ',
    relatedTitle: 'Articles liés',
    updatedPrefix: 'Mis à jour le',
  },
  breadcrumb: { navLabel: "Fil d'Ariane" },
  listing: {
    blogTitle: 'articles',
    head: {
      blogHome: {
        title: 'Articles de Nicolas Zozol, Robusta Build',
        description:
          'Tous les articles de Nicolas Zozol sur le logiciel, du plus récent au plus ancien : le web, JavaScript, TypeScript, la blockchain et la vie privée.',
      },
      category: {
        title: '{category} : articles de Nicolas Zozol',
        description:
          'Les articles de Nicolas Zozol classés dans {category}, du plus récent au plus ancien.',
      },
      pageSuffix: ' (page {page})',
    },
    pagination: {
      navLabel: 'Pages des articles',
      newerLabel: 'articles plus récents',
      olderLabel: 'articles plus anciens',
    },
    footer: { title: 'articles', blogHomeLabel: 'tous les articles' },
  },
  landing: {
    head: {
      title:
        'Robusta Build : Nicolas Zozol, construire du logiciel avec des agents IA',
      description:
        'Nicolas Zozol fait RB Compound, six agents pour Claude Code, et Rooftop, la vue d’en haut pour les piloter. Et aussi Masala Parser, une bibliothèque de parser combinators, et des workshops IA pour les équipes.',
    },
    hero: {
      title: 'vos agents écrivent le code. vous gardez les plans.',
      eyebrow: '// Robusta Build · construire du logiciel avec des agents IA',
      lede: [
        'Je suis Nicolas Zozol, vingt ans de logiciel. Je fais deux outils pour les équipes qui construisent avec des agents IA : ',
        { strong: 'RB Compound' },
        ', six agents qui écrivent une story et un design avant tout code, et ',
        { strong: 'Rooftop' },
        ', la vue d’en haut qui permet de les piloter. et je travaille aux côtés des équipes qui les utilisent.',
      ],
      emailLabel: 'm’écrire un e-mail',
      linkedInLabel: 'voir mon profil LinkedIn',
      mascotAlt:
        'Nicolas dessiné en Niktux, un manchot en sweat Robusta Build : 25 ans de code, la vue d’ensemble, un frontend souple, des fondations solides',
      annotation: 'voici niktux, qui veille sur le code.',
      roof: {
        name: 'Rooftop',
        kind: 'le toit · une app de bureau',
        say: 'la vue d’en haut : chaque module, epic et story de votre dépôt sur un seul plan, et les questions ouvertes qui vous attendent.',
      },
      floor: {
        name: 'RB Compound',
        kind: 'les étages · des agents pour Claude Code',
        say: 'six agents, un travail chacun. chacun laisse un fichier écrit, et le suivant part de ce fichier.',
      },
      ground: {
        name: 'votre dépôt',
        kind: 'le sol',
        say: 'stories, designs et décisions sont des fichiers Markdown, à côté de votre code.',
      },
    },
    products: {
      title: 'pilotez depuis le toit. construisez au terminal.',
      eyebrow: '// deux outils',
      rooftop: {
        where: 'depuis le toit · quand vous décidez',
        name: 'Rooftop',
        soon: 'bientôt',
        say: 'une app de bureau qui lit le Markdown de votre dépôt et montre tout le plan : modules, epics, lots, stories, et les questions ouvertes qui vous attendent.',
        shotAlts: [
          'une capture de Rooftop : les lots d’un module posés sur le tapis, le premier avec ses questions ouvertes',
          'une capture de Rooftop : les stories du premier lot, avec l’étape où chacune en est',
        ],
        waitingListLabel: 'rejoindre la liste d’attente',
        waitingListSubject: 'Liste d’attente Rooftop',
      },
      rbCompound: {
        where: 'au terminal · quand vous construisez',
        name: 'RB Compound',
        say: 'six agents pour Claude Code. chacun fait un seul travail et laisse un fichier écrit. quand un choix reste ouvert, il écrit la question, avec la réponse qu’il propose.',
        actionLabel: 'découvrir les six agents',
      },
    },
    masala: {
      title: 'Masala Parser : de petits parsers, combinés.',
      eyebrow: '// open source depuis 2016',
      lede: 'Masala Parser est une bibliothèque JavaScript de parser combinators : vous écrivez de petits parsers, chacun lit une seule chose, et vous les combinez pour obtenir le parser qu’il vous faut. elle remplace la regexp que personne n’ose toucher, et elle peut porter un langage entier.',
      ticks: [
        'zéro dépendance',
        'tourne dans le navigateur et dans Node',
        'une API TypeScript',
        'plus de 500 tests unitaires, sur 100 % des lignes',
      ],
      captions: [
        'de petits parsers, l’un après l’autre :',
        'du texte en entrée, vos données en sortie :',
      ],
      resultLabel: 'renvoie',
      wordsLead: 'une poignée de mots à apprendre :',
      meanings: {
        C: 'les caractères : char, string, letters',
        N: 'les nombres : digits, integer, number',
        F: 'le flux : try, not, lazy',
        then: 'l’un après l’autre',
        or: 'celui-ci, ou celui-là',
        rep: 'encore et encore',
        opt: 'ou rien du tout',
        map: 'du texte à vos données',
      },
      installNote: 'licence LGPL, maintenue par Robusta Build',
      videoLabel: 'écrire un parser, en sept minutes →',
    },
    notes: {
      eyebrow: '// derniers articles',
      title: 'ce que j’écris.',
      allLinkLabel: 'tous les articles →',
    },
    workshop: {
      title: 'des workshops IA, à la journée.',
      eyebrow: '// parlons de votre équipe',
      lede: 'besoin d’un workshop sur mesure pour construire du logiciel avec l’IA ? dites-moi comment votre équipe travaille aujourd’hui : je construis les journées autour, et je viens chez vous.',
      facts: [
        { strong: 'à partir de 2 000 €', say: 'la journée' },
        { strong: 'partout en EMEA', say: 'Europe, Moyen-Orient, Afrique' },
      ],
      linkedInLabel: 'voir mon profil LinkedIn',
      fine: 'pas de formulaire ni de newsletter : je lis et je réponds moi-même à chaque message.',
      mascotAlt: 'Niktux, le manchot de Robusta Build, en pleine réflexion',
      greeting: 'bonjour !',
    },
  },
  rbCompound: {
    head: {
      title:
        'RB Compound : construire du logiciel avec des agents IA, la documentation d’abord',
      description:
        'RB Compound est le workflow de Nicolas Zozol pour construire du logiciel avec des agents IA : une story, un design que vous approuvez, puis du code écrit test-first. Gratuit pour un usage non commercial, et une version complète avec un accompagnement de votre équipe.',
    },
    hero: {
      eyebrow: 'RB Compound · construire du logiciel avec des agents IA',
      title: 'la documentation d’abord. ensuite, les agents écrivent le code.',
      subtitle:
        'Je suis Nicolas Zozol, vingt ans de logiciel. RB Compound est ma façon de construire du logiciel avec des agents IA : chaque feature a sa story et son design, vous approuvez le design, et seulement ensuite les agents écrivent le code, tests d’abord. Je travaille avec les équipes et les responsables techniques qui construisent du logiciel avec des agents.',
      emailLabel: 'm’écrire un e-mail',
      linkedInLabel: 'voir mon profil LinkedIn',
      mascotAlt:
        'Nicolas dessiné en Niktux, un manchot en sweat Robusta Build : 25 ans de code, la vue d’ensemble, un frontend souple, des fondations solides',
      annotation: 'voici niktux, qui veille sur le code.',
    },
    agents: {
      eyebrow: '// RB Compound, les agents',
      title: 'six agents, de l’epic à la documentation.',
      intro:
        'RB Compound est une suite d’agents pour Claude Code. chacun fait un seul travail et laisse un fichier écrit derrière lui : l’agent suivant part de ce fichier, et vous aussi.',
      steps: [
        { n: 1, label: 'epicman', sub: 'découpe le projet en stories' },
        { n: 2, label: 'storyman', sub: 'écrit ce que la feature doit faire' },
        { n: 3, label: 'bsman', sub: 'challenge la story avant tout code' },
        {
          n: 4,
          label: 'designman',
          sub: 'rédige le design que vous approuvez',
        },
        { n: 5, label: 'tddman', sub: 'écrit les tests, puis le code' },
        { n: 6, label: 'docman', sub: 'met la doc à jour de ce qui est livré' },
      ],
      example: {
        title:
          'par exemple, une epic qui compare des algorithmes de todo-list :',
        lines: [
          {
            agent: 'epicman',
            command:
              'crée une epic pour comparer des algorithmes de todo-list, et ses stories',
            note: 'écrit l’epic et cinq stories, dont benchmark',
          },
          {
            agent: 'bsman',
            command: 'on benchmark',
            note: 'pose les questions ouvertes, chacune avec une proposition et sa justification',
          },
          {
            agent: 'storyman',
            command: 'update',
            note: 'reporte vos réponses dans la story',
          },
          {
            agent: 'designman',
            command: 'on benchmark',
            note: 'planifie le code d’après ce que contient le dépôt aujourd’hui',
          },
          {
            agent: 'tddman',
            command: 'on benchmark',
            note: 'écrit les tests, les voit échouer, puis écrit le code',
          },
          {
            agent: 'docman',
            command: 'on benchmark',
            note: 'complète la documentation',
          },
          {
            agent: 'storyman',
            command: 'submit',
            note: 'clôt la story : elle ne bloque plus les autres',
          },
        ],
      },
      caveat:
        'licence PolyForm Noncommercial 1.0.0 : gratuit pour un usage non commercial.',
      caveatLink: {
        lead: 'code consultable :',
        label: 'github.com/robusta-build/rb-compound',
        href: 'https://github.com/robusta-build/rb-compound',
      },
    },
    openQuestions: {
      eyebrow: '// open questions',
      title: 'chaque étape finit par des questions.',
      intro:
        'un agent ne devine jamais ce que vous n’avez pas dit. quand l’epic, une story, un brainstorm ou un design laisse un choix ouvert, son agent écrit une open question à la fin du fichier : la question, la seule réponse qu’il propose, et pourquoi. vous répondez en une ligne, et l’agent suivant part de votre réponse. étape après étape, le projet se précise.',
      labels: {
        proposition: 'Proposition:',
        rationale: 'Rationale:',
        resolution: 'Resolution:',
      },
      entries: [
        {
          key: 'OQ-BENCH-2',
          question: 'combien d’éléments le benchmark mesure-t-il ?',
          proposition: '1 000, 10 000 et 100 000 éléments.',
          rationale:
            'trois ordres de grandeur montrent où un algorithme cesse de tenir la charge, et une exécution reste sous la minute.',
          resolution: 'lgtm',
        },
        {
          key: 'OQ-BENCH-3',
          question: 'quels algorithmes entrent dans la première comparaison ?',
          proposition: 'un tableau, une liste chaînée et un arbre équilibré.',
          rationale:
            'ils couvrent les trois coûts d’une insertion : décaler, chaîner, rééquilibrer.',
          resolution:
            'garder le tableau et la liste, remplacer l’arbre par une skip list.',
        },
      ],
      legend:
        'lgtm, « looks good to me » : la proposition est prise telle quelle. toute autre réponse est la vôtre, avec vos mots.',
    },
    boss: {
      eyebrow: '// boss, la version complète',
      title: 'une commande, tout le pipeline.',
      intro:
        'boss lance les six agents à votre place, l’un après l’autre, story après story. il répond aux open questions que leurs propositions tranchent, signe chaque réponse, et vous laisse celles qui ont besoin de vous. il s’arrête là où vous le lui dites, et note chaque décision dans un seul fichier.',
      conductor: 'boss',
      steps: [
        { n: 1, label: 'epicman', sub: 'l’epic' },
        { n: 2, label: 'storyman', sub: 'la story' },
        { n: 3, label: 'bsman', sub: 'les questions' },
        { n: 4, label: 'designman', sub: 'le design' },
        { n: 5, label: 'tddman', sub: 'les tests, le code' },
        { n: 6, label: 'docman', sub: 'la doc' },
      ],
      example: {
        title: 'la même epic, avec boss :',
        lines: [
          {
            agent: 'epicman',
            command:
              'crée une epic pour comparer des algorithmes de todo-list, et ses stories',
            note: 'écrit l’epic et cinq stories',
          },
          {
            agent: 'boss',
            command: 'atw todo-list-algorithms',
            note: 'mène les cinq stories jusqu’au commit, répond aux open questions et note pourquoi',
          },
        ],
      },
      caveat:
        'cette version n’existe qu’avec un accompagnement personnalisé et payant de votre équipe.',
    },
    principles: {
      eyebrow: '// les règles du workflow',
      title: 'des règles, écrites noir sur blanc.',
      principles: [
        {
          k: 'la documentation avant le code.',
          v: 'la story et le design sont écrits avant la première ligne de code.',
        },
        {
          k: 'une story par feature.',
          v: 'elle porte ses critères d’acceptation, que le design et les tests suivent.',
        },
        {
          k: 'des contrats avant le code.',
          v: 'le design fixe les types et les interfaces, et il est approuvé avant toute implémentation.',
        },
        {
          k: 'un seul glossaire.',
          v: 'chaque document emploie les mêmes termes, ceux du glossaire du projet.',
        },
      ],
    },
    cta: {
      title: 'parlons de votre équipe.',
      subtitle:
        'Dites-moi comment votre équipe construit du logiciel avec des agents aujourd’hui. Je vous dis si l’accompagnement lui convient.',
      footnote:
        'Pas de formulaire ni de newsletter : je lis et je réponds moi-même.',
    },
  },
  categoryLabels: {
    blockchain: 'blockchain',
    javascript: 'javascript',
    typescript: 'typescript',
    privacy: 'vie privée',
    theory: 'théorie',
    web: 'web',
  },
};

const es: PageCopy = {
  localeName: 'Español',
  tagline: 'Robusta Build · construir software con agentes de IA',
  header: {
    contactLabel: 'contactarme',
    nav: {
      rooftop: 'Rooftop',
      rbCompound: 'RB Compound',
      masala: 'Masala Parser',
      articles: 'artículos',
    },
  },
  footer: { copyright: '© Robusta Build · Nicolas Zozol, Toulouse' },
  head: {
    title: 'Robusta Build',
    description:
      'Artículos de Nicolas Zozol sobre software: la web, JavaScript, TypeScript, blockchain y privacidad.',
  },
  article: {
    navLabel: 'Seguir leyendo',
    categoryPrefix: 'Archivado en ',
    versionsPrefix: 'Otros idiomas: ',
    relatedTitle: 'Artículos relacionados',
    updatedPrefix: 'Actualizado el',
  },
  breadcrumb: { navLabel: 'Ruta de navegación' },
  listing: {
    blogTitle: 'artículos',
    head: {
      blogHome: {
        title: 'Artículos de Nicolas Zozol, Robusta Build',
        description:
          'Todos los artículos de Nicolas Zozol sobre software, del más reciente al más antiguo: la web, JavaScript, TypeScript, blockchain y privacidad.',
      },
      category: {
        title: '{category}: artículos de Nicolas Zozol',
        description:
          'Los artículos de Nicolas Zozol archivados en {category}, del más reciente al más antiguo.',
      },
      pageSuffix: ' (página {page})',
    },
    pagination: {
      navLabel: 'Páginas de artículos',
      newerLabel: 'artículos más recientes',
      olderLabel: 'artículos más antiguos',
    },
    footer: { title: 'artículos', blogHomeLabel: 'todos los artículos' },
  },
  landing: {
    head: {
      title:
        'Robusta Build: Nicolas Zozol, construir software con agentes de IA',
      description:
        'Nicolas Zozol hace RB Compound, seis agentes para Claude Code, y Rooftop, la vista desde arriba para dirigirlos. Y también Masala Parser, una biblioteca de parser combinators, y talleres de IA para equipos.',
    },
    hero: {
      title: 'tus agentes escriben el código. tú guardas los planos.',
      eyebrow: '// Robusta Build · construir software con agentes de IA',
      lede: [
        'Soy Nicolas Zozol, veinte años en el software. Hago dos herramientas para los equipos que construyen con agentes de IA: ',
        { strong: 'RB Compound' },
        ', seis agentes que escriben una story y un design antes de cualquier código, y ',
        { strong: 'Rooftop' },
        ', la vista desde arriba que te permite dirigirlos. y trabajo junto a los equipos que los usan.',
      ],
      emailLabel: 'escribirme un e-mail',
      linkedInLabel: 'ver mi perfil de LinkedIn',
      mascotAlt:
        'Nicolas dibujado como Niktux, un pingüino con sudadera de Robusta Build: 25 años programando, visión de conjunto, frontend flexible, bases sólidas',
      annotation: 'aquí está niktux, que vigila el código.',
      roof: {
        name: 'Rooftop',
        kind: 'el tejado · una app de escritorio',
        say: 'la vista desde arriba: cada módulo, epic y story de tu repositorio en un solo plano, y las preguntas abiertas que te esperan.',
      },
      floor: {
        name: 'RB Compound',
        kind: 'los pisos · agentes para Claude Code',
        say: 'seis agentes, un trabajo cada uno. cada uno deja un archivo escrito, y el siguiente parte de él.',
      },
      ground: {
        name: 'tu repositorio',
        kind: 'el suelo',
        say: 'stories, designs y decisiones son archivos Markdown, junto a tu código.',
      },
    },
    products: {
      title: 'dirige desde el tejado. construye en la terminal.',
      eyebrow: '// dos herramientas',
      rooftop: {
        where: 'desde el tejado · cuando decides',
        name: 'Rooftop',
        soon: 'muy pronto',
        say: 'una app de escritorio que lee el Markdown de tu repositorio y muestra todo el plano: módulos, epics, lotes, stories, y las preguntas abiertas que te esperan.',
        shotAlts: [
          'una captura de Rooftop: los lotes de un módulo sobre la alfombra, el primero con sus preguntas abiertas',
          'una captura de Rooftop: las stories del primer lote, con la etapa a la que ha llegado cada una',
        ],
        waitingListLabel: 'unirme a la lista de espera',
        waitingListSubject: 'Lista de espera de Rooftop',
      },
      rbCompound: {
        where: 'en la terminal · cuando construyes',
        name: 'RB Compound',
        say: 'seis agentes para Claude Code. cada uno hace un solo trabajo y deja un archivo escrito. cuando una decisión queda abierta, escribe la pregunta, con la respuesta que propone.',
        actionLabel: 'conocer los seis agentes',
      },
    },
    masala: {
      title: 'Masala Parser: pequeños parsers, combinados.',
      eyebrow: '// open source desde 2016',
      lede: 'Masala Parser es una biblioteca JavaScript de parser combinators: escribes pequeños parsers, cada uno lee una sola cosa, y los combinas en el parser que necesitas. sustituye a la regexp que nadie se atreve a tocar, y puede llevar un lenguaje entero.',
      ticks: [
        'cero dependencias',
        'funciona en el navegador y en Node',
        'una API TypeScript',
        'más de 500 tests unitarios, sobre el 100 % de las líneas',
      ],
      captions: [
        'pequeños parsers, uno tras otro:',
        'texto de entrada, tus datos de salida:',
      ],
      resultLabel: 'devuelve',
      wordsLead: 'un puñado de palabras que aprender:',
      meanings: {
        C: 'los caracteres: char, string, letters',
        N: 'los números: digits, integer, number',
        F: 'el flujo: try, not, lazy',
        then: 'uno tras otro',
        or: 'este, o aquel',
        rep: 'una y otra vez',
        opt: 'o nada en absoluto',
        map: 'del texto a tus datos',
      },
      installNote: 'licencia LGPL, mantenida por Robusta Build',
      videoLabel: 'escribir un parser, en siete minutos →',
    },
    notes: {
      eyebrow: '// últimos artículos',
      title: 'lo que escribo.',
      allLinkLabel: 'todos los artículos →',
    },
    workshop: {
      title: 'talleres de IA, por días.',
      eyebrow: '// hablemos de tu equipo',
      lede: '¿necesitas un taller a medida para construir software con IA? cuéntame cómo trabaja tu equipo hoy: organizo los días a partir de eso, y voy a verte.',
      facts: [
        { strong: 'desde 2.000 €', say: 'por día' },
        { strong: 'en toda EMEA', say: 'Europa, Oriente Medio, África' },
      ],
      linkedInLabel: 'ver mi perfil de LinkedIn',
      fine: 'sin formulario ni newsletter: leo y respondo yo mismo cada mensaje.',
      mascotAlt: 'Niktux, el pingüino de Robusta Build, pensando',
      greeting: '¡hola!',
    },
  },
  rbCompound: {
    head: {
      title:
        'RB Compound: construir software con agentes de IA, primero la documentación',
      description:
        'RB Compound es el workflow de Nicolas Zozol para construir software con agentes de IA: una story, un design que tú apruebas y luego código escrito test-first. Gratis para uso no comercial, y una versión completa con acompañamiento de tu equipo.',
    },
    hero: {
      eyebrow: 'RB Compound · construir software con agentes de IA',
      title:
        'primero la documentación. después, los agentes escriben el código.',
      subtitle:
        'Soy Nicolas Zozol, veinte años en el software. RB Compound es mi forma de construir software con agentes de IA: cada feature tiene su story y su design, tú apruebas el design, y solo entonces los agentes escriben el código, con los tests primero. Trabajo con equipos y responsables técnicos que construyen software con agentes.',
      emailLabel: 'escribirme un e-mail',
      linkedInLabel: 'ver mi perfil de LinkedIn',
      mascotAlt:
        'Nicolas dibujado como Niktux, un pingüino con sudadera de Robusta Build: 25 años programando, visión de conjunto, frontend flexible, bases sólidas',
      annotation: 'aquí está niktux, que vigila el código.',
    },
    agents: {
      eyebrow: '// RB Compound, los agentes',
      title: 'seis agentes, del epic a la documentación.',
      intro:
        'RB Compound es un conjunto de agentes para Claude Code. cada uno hace un solo trabajo y deja un archivo escrito: el siguiente agente parte de ese archivo, y tú también.',
      steps: [
        { n: 1, label: 'epicman', sub: 'divide el proyecto en stories' },
        {
          n: 2,
          label: 'storyman',
          sub: 'escribe lo que la feature debe hacer',
        },
        {
          n: 3,
          label: 'bsman',
          sub: 'cuestiona la story antes de cualquier código',
        },
        { n: 4, label: 'designman', sub: 'redacta el design que tú apruebas' },
        { n: 5, label: 'tddman', sub: 'escribe los tests y luego el código' },
        {
          n: 6,
          label: 'docman',
          sub: 'actualiza la documentación con lo entregado',
        },
      ],
      example: {
        title:
          'por ejemplo, un epic que compara algoritmos de lista de tareas:',
        lines: [
          {
            agent: 'epicman',
            command:
              'crea un epic para comparar algoritmos de lista de tareas, y sus stories',
            note: 'escribe el epic y cinco stories, entre ellas benchmark',
          },
          {
            agent: 'bsman',
            command: 'on benchmark',
            note: 'plantea las preguntas abiertas, cada una con una propuesta y su justificación',
          },
          {
            agent: 'storyman',
            command: 'update',
            note: 'incorpora tus respuestas a la story',
          },
          {
            agent: 'designman',
            command: 'on benchmark',
            note: 'planifica el código a partir de lo que contiene hoy el repositorio',
          },
          {
            agent: 'tddman',
            command: 'on benchmark',
            note: 'escribe los tests, los ve fallar y luego escribe el código',
          },
          {
            agent: 'docman',
            command: 'on benchmark',
            note: 'completa la documentación',
          },
          {
            agent: 'storyman',
            command: 'submit',
            note: 'cierra la story: ya no bloquea a las demás',
          },
        ],
      },
      caveat:
        'licencia PolyForm Noncommercial 1.0.0: gratis para uso no comercial.',
      caveatLink: {
        lead: 'código consultable:',
        label: 'github.com/robusta-build/rb-compound',
        href: 'https://github.com/robusta-build/rb-compound',
      },
    },
    openQuestions: {
      eyebrow: '// open questions',
      title: 'cada etapa termina con preguntas.',
      intro:
        'un agente nunca adivina lo que no dijiste. cuando el epic, una story, un brainstorm o un design deja una elección abierta, su agente escribe una open question al final del archivo: la pregunta, la única respuesta que propone y por qué. respondes en una línea, y el siguiente agente parte de tu respuesta. etapa tras etapa, el proyecto se precisa.',
      labels: {
        proposition: 'Proposition:',
        rationale: 'Rationale:',
        resolution: 'Resolution:',
      },
      entries: [
        {
          key: 'OQ-BENCH-2',
          question: '¿cuántos elementos mide el benchmark?',
          proposition: '1.000, 10.000 y 100.000 elementos.',
          rationale:
            'tres órdenes de magnitud muestran dónde un algoritmo deja de escalar, y una ejecución dura menos de un minuto.',
          resolution: 'lgtm',
        },
        {
          key: 'OQ-BENCH-3',
          question: '¿qué algoritmos entran en la primera comparación?',
          proposition: 'un array, una lista enlazada y un árbol equilibrado.',
          rationale:
            'cubren los tres costes de una inserción: desplazar, enlazar, reequilibrar.',
          resolution:
            'mantener el array y la lista, cambiar el árbol por una skip list.',
        },
      ],
      legend:
        'lgtm, «looks good to me»: la propuesta se acepta tal cual. cualquier otra respuesta es tuya, con tus palabras.',
    },
    boss: {
      eyebrow: '// boss, la versión completa',
      title: 'un comando, todo el pipeline.',
      intro:
        'boss ejecuta los seis agentes en tu lugar, uno tras otro, story tras story. responde a las open questions que sus propuestas resuelven, firma cada respuesta y te deja las que te necesitan. se detiene donde le indicas y anota cada decisión en un solo archivo.',
      conductor: 'boss',
      steps: [
        { n: 1, label: 'epicman', sub: 'el epic' },
        { n: 2, label: 'storyman', sub: 'la story' },
        { n: 3, label: 'bsman', sub: 'las preguntas' },
        { n: 4, label: 'designman', sub: 'el design' },
        { n: 5, label: 'tddman', sub: 'los tests, el código' },
        { n: 6, label: 'docman', sub: 'la documentación' },
      ],
      example: {
        title: 'el mismo epic, con boss:',
        lines: [
          {
            agent: 'epicman',
            command:
              'crea un epic para comparar algoritmos de lista de tareas, y sus stories',
            note: 'escribe el epic y cinco stories',
          },
          {
            agent: 'boss',
            command: 'atw todo-list-algorithms',
            note: 'lleva las cinco stories hasta el commit, responde a las open questions y anota por qué',
          },
        ],
      },
      caveat:
        'esta versión solo existe con un acompañamiento personalizado y de pago de tu equipo.',
    },
    principles: {
      eyebrow: '// las reglas del workflow',
      title: 'reglas, por escrito.',
      principles: [
        {
          k: 'la documentación antes del código.',
          v: 'la story y el design se escriben antes de la primera línea de código.',
        },
        {
          k: 'una story por feature.',
          v: 'lleva sus criterios de aceptación, que siguen el design y los tests.',
        },
        {
          k: 'contratos antes del código.',
          v: 'el design fija los tipos y las interfaces, y se aprueba antes de cualquier implementación.',
        },
        {
          k: 'un solo glosario.',
          v: 'cada documento usa los mismos términos, los del glosario del proyecto.',
        },
      ],
    },
    cta: {
      title: 'hablemos de tu equipo.',
      subtitle:
        'Cuéntame cómo construye software tu equipo con agentes hoy. Te diré si el acompañamiento le encaja.',
      footnote: 'Sin formulario ni newsletter: leo y respondo yo mismo.',
    },
  },
  categoryLabels: {},
};

const robustaBuildPyramidsConfig: SeoPyramidsConfig = {
  domain: SITE_ORIGIN,
  siteName: 'Robusta Build',
  // The design system's wordmark, resolved through the package's assets
  // subpath — no brand file is copied into `public/`. `logo` is a bare URL and
  // `domain` is absolute, so the root-relative hashed path is prefixed here.
  logo: `${SITE_ORIGIN}${wordmarkSrc}`,
  defaultLocale: urlScheme.defaultLocale,
  otherLocales: [...urlScheme.otherLocales],
  blogConfig: {
    // The content section's four values come from the site's scheme module, so
    // the route table and the site configuration cannot state different ones.
    contentRoot: urlScheme.contentRoot,
    defaultLocale: urlScheme.defaultLocale,
    otherLocales: [...urlScheme.otherLocales],
    debugImagePath: false,
    rollSize: ROLL_SIZE,
    author: 'Nicolas Zozol',
  },
  contact: {
    email: 'nicolas@robusta.build',
    linkedIn: 'https://www.linkedin.com/in/robustacode/',
  },
  pageCopy: { en, fr, es },
};

/** The site configuration the base packages read: content section, contact and the page copy of every Locale. */
export function getSeoPyramidsConfig() {
  return robustaBuildPyramidsConfig;
}

/** The page copy of a Locale; throws naming the Locale when the site declares none. */
export function getPageCopy(locale: string): PageCopy {
  if (!isLocale(locale)) {
    throw new Error(
      `The site declares no Locale "${locale}": its Locales are ${LOCALES.join(', ')}`,
    );
  }
  return robustaBuildPyramidsConfig.pageCopy[locale];
}

/** The label of a Category in the page copy of a Locale; throws naming both when that Locale has none. */
export function getCategoryLabel(locale: string, category: string): string {
  const { categoryLabels } = getPageCopy(locale);
  if (!Object.hasOwn(categoryLabels, category)) {
    throw new Error(
      `The Category "${category}" has no label in the page copy of the Locale "${locale}"`,
    );
  }
  return categoryLabels[category];
}

function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
