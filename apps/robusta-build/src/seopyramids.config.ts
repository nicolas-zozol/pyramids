/**
 * Site configuration — the site's domain, Locales, contact and the page copy of each Locale, read through getPageCopy and getCategoryLabel.
 *
 * Design: features/pyramid-v2-epic/multilingual-site/multilingual-site.design.md
 * Requirements: R-MULTILINGUAL-41, R-MULTILINGUAL-42, R-MULTILINGUAL-43, R-MULTILINGUAL-44, R-MULTILINGUAL-48, R-MULTILINGUAL-49
 * Design: features/pyramid-v2-epic/blog-rolls/blog-rolls.design.md
 * Requirements: R-BLOGROLLS-41, R-BLOGROLLS-42
 * Design: features/pyramid-v2-epic/seo-excellence/seo-excellence.design.md
 * Requirements: R-SEOEXCELLENCE-44, R-SEOEXCELLENCE-121, R-SEOEXCELLENCE-122
 */
import type { FlowStep, Principle } from '@robusta/pyramids-design-system';
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
  /** Hero eyebrow and footer tagline. */
  tagline: string;
  header: { contactLabel: string };
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

export interface LandingCopy {
  head: { title: string; description: string };
  hero: HeroCopy;
  /** The open source version of the workflow. */
  openSource: FlowCopy;
  /** The complete version, with a paid accompaniment. */
  complete: FlowCopy;
  principles: PrinciplesCopy;
  notes: NotesCopy;
  cta: CtaCopy;
}

export interface HeroCopy {
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
  steps: FlowStep[];
  caveat: string;
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
  tagline: 'RB Compound · building software with AI agents',
  header: { contactLabel: 'contact me' },
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
      title: 'RB Compound: build software with AI agents, documents first',
      description:
        'RB Compound is the workflow Nicolas Zozol uses to build software with AI agents: a story, a design you approve, then test-first code. An open source version, and a complete one with an accompaniment of your team.',
    },
    hero: {
      title: 'documents first. then the agents write the code.',
      subtitle:
        'I’m Nicolas Zozol, twenty years in software. RB Compound is how I build software with AI agents: each feature gets a story and a design, you approve the design, and only then do the agents write the code, tests first. I work with teams and technical leads who build software with agents.',
      emailLabel: 'write me an email',
      linkedInLabel: 'see my LinkedIn profile',
      mascotAlt: 'Crystal Tux, the penguin mascot of Robusta Build',
      annotation: 'this is crystal tux. she watches over the code.',
    },
    openSource: {
      eyebrow: '// open source version',
      title: 'four agents, from epic to code.',
      steps: [
        { n: 1, label: 'epic', sub: 'epicman' },
        { n: 2, label: 'story', sub: 'storyman' },
        { n: 3, label: 'design', sub: 'designman' },
        { n: 4, label: 'validation', sub: 'DRAFT → APPROVED' },
        { n: 5, label: 'code', sub: 'tddman, test-first' },
      ],
      caveat:
        'free and open source. not published yet: it will come out as a plugin.',
    },
    complete: {
      eyebrow: '// complete version',
      title: 'the whole pipeline, with an accompaniment.',
      steps: [
        { n: 1, label: 'story', sub: 'storyman' },
        { n: 2, label: 'brainstorm', sub: 'bsman' },
        { n: 3, label: 'design', sub: 'designman, APPROVED' },
        { n: 4, label: 'code', sub: 'tddman or codeman' },
        { n: 5, label: 'docs', sub: 'docman, archiman' },
      ],
      caveat:
        'boss chains the pipeline, steered by a short slang such as rloq. this version only comes with a paid, personalized accompaniment of your team.',
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
    notes: {
      eyebrow: '// latest articles',
      title: 'what I write.',
      allLinkLabel: 'all articles',
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
  tagline: 'RB Compound · construire du logiciel avec des agents IA',
  header: { contactLabel: 'me contacter' },
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
        'RB Compound : construire du logiciel avec des agents IA, la documentation d’abord',
      description:
        'RB Compound est le workflow de Nicolas Zozol pour construire du logiciel avec des agents IA : une story, un design que vous approuvez, puis du code écrit test-first. Une version open source, et une version complète avec un accompagnement de votre équipe.',
    },
    hero: {
      title: 'la documentation d’abord. ensuite, les agents écrivent le code.',
      subtitle:
        'Je suis Nicolas Zozol, vingt ans de logiciel. RB Compound est ma façon de construire du logiciel avec des agents IA : chaque feature a sa story et son design, vous approuvez le design, et seulement ensuite les agents écrivent le code, tests d’abord. Je travaille avec les équipes et les responsables techniques qui construisent du logiciel avec des agents.',
      emailLabel: 'm’écrire un e-mail',
      linkedInLabel: 'voir mon profil LinkedIn',
      mascotAlt: 'Crystal Tux, le manchot mascotte de Robusta Build',
      annotation: 'voici crystal tux. elle veille sur le code.',
    },
    openSource: {
      eyebrow: '// version open source',
      title: 'quatre agents, de l’epic au code.',
      steps: [
        { n: 1, label: 'epic', sub: 'epicman' },
        { n: 2, label: 'story', sub: 'storyman' },
        { n: 3, label: 'design', sub: 'designman' },
        { n: 4, label: 'validation', sub: 'DRAFT → APPROVED' },
        { n: 5, label: 'code', sub: 'tddman, test-first' },
      ],
      caveat:
        'gratuite et open source. pas encore publiée : elle sortira sous forme de plugin.',
    },
    complete: {
      eyebrow: '// version complète',
      title: 'tout le pipeline, avec un accompagnement.',
      steps: [
        { n: 1, label: 'story', sub: 'storyman' },
        { n: 2, label: 'brainstorm', sub: 'bsman' },
        { n: 3, label: 'design', sub: 'designman, APPROVED' },
        { n: 4, label: 'code', sub: 'tddman ou codeman' },
        { n: 5, label: 'documentation', sub: 'docman, archiman' },
      ],
      caveat:
        'boss enchaîne le pipeline, piloté par un slang court comme rloq. cette version n’existe qu’avec un accompagnement personnalisé et payant de votre équipe.',
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
    notes: {
      eyebrow: '// derniers articles',
      title: 'ce que j’écris.',
      allLinkLabel: 'tous les articles',
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
  tagline: 'RB Compound · construir software con agentes de IA',
  header: { contactLabel: 'contactarme' },
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
        'RB Compound: construir software con agentes de IA, primero la documentación',
      description:
        'RB Compound es el workflow de Nicolas Zozol para construir software con agentes de IA: una story, un design que tú apruebas y luego código escrito test-first. Una versión open source y una versión completa con acompañamiento de tu equipo.',
    },
    hero: {
      title:
        'primero la documentación. después, los agentes escriben el código.',
      subtitle:
        'Soy Nicolas Zozol, veinte años en el software. RB Compound es mi forma de construir software con agentes de IA: cada feature tiene su story y su design, tú apruebas el design, y solo entonces los agentes escriben el código, con los tests primero. Trabajo con equipos y responsables técnicos que construyen software con agentes.',
      emailLabel: 'escribirme un e-mail',
      linkedInLabel: 'ver mi perfil de LinkedIn',
      mascotAlt: 'Crystal Tux, el pingüino mascota de Robusta Build',
      annotation: 'esta es crystal tux. vigila el código.',
    },
    openSource: {
      eyebrow: '// versión open source',
      title: 'cuatro agentes, del epic al código.',
      steps: [
        { n: 1, label: 'epic', sub: 'epicman' },
        { n: 2, label: 'story', sub: 'storyman' },
        { n: 3, label: 'design', sub: 'designman' },
        { n: 4, label: 'validación', sub: 'DRAFT → APPROVED' },
        { n: 5, label: 'código', sub: 'tddman, test-first' },
      ],
      caveat: 'gratuita y open source. aún no publicada: saldrá como plugin.',
    },
    complete: {
      eyebrow: '// versión completa',
      title: 'todo el pipeline, con acompañamiento.',
      steps: [
        { n: 1, label: 'story', sub: 'storyman' },
        { n: 2, label: 'brainstorm', sub: 'bsman' },
        { n: 3, label: 'design', sub: 'designman, APPROVED' },
        { n: 4, label: 'código', sub: 'tddman o codeman' },
        { n: 5, label: 'documentación', sub: 'docman, archiman' },
      ],
      caveat:
        'boss encadena el pipeline, dirigido por un slang corto como rloq. esta versión solo existe con un acompañamiento personalizado y de pago de tu equipo.',
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
    notes: {
      eyebrow: '// últimos artículos',
      title: 'lo que escribo.',
      allLinkLabel: 'todos los artículos',
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
