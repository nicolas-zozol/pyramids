import type { Principle } from '@robusta/pyramids-design-system';
import { wordmarkSrc } from './design-system/assets.js';
import { ROLL_SIZE, urlScheme } from './routing/scheme.js';

const mission = 'Building Internet the right way';
const url = 'https://www.robusta.build';

export { ROLL_SIZE };

export interface BlogConfig {
  /** The single segment under which the site publishes its content section. */
  contentRoot: string;
  defaultLocale: string;
  otherLocales: string[];
  debugImagePath: boolean;
  mandatoryKeywords: string[];
  rollSize: typeof ROLL_SIZE;
  author?: string;
}

interface SeoPyramidsConfig {
  domain: string;
  siteName: string;
  /** The title of every page but `/`. */
  siteTitle: string;
  /** The description of every page but `/`. */
  mission?: string;
  logo: string;
  defaultLocale: string;
  otherLocales: string[];
  blogConfig: BlogConfig;
  contact: Contact;
  pageCopy: PageCopy;
}

export interface Contact {
  /** Shown as is; `mailto:` is derived from it. */
  email: string;
  /** Absolute https URL of the profile. */
  linkedIn: string;
}

/** Every text `/`, the header and the footer display, in plain text, in the default Locale. */
export interface PageCopy {
  /** Hero eyebrow and footer tagline. */
  tagline: string;
  header: { contactLabel: string };
  footer: { copyright: string };
  landing: LandingCopy;
  /** Category slug to the label of a note's tag. */
  categoryLabels: Record<string, string>;
}

export interface LandingCopy {
  head: { title: string; description: string };
  hero: HeroCopy;
  principles: PrinciplesCopy;
  notes: NotesCopy;
  cta: CtaCopy;
}

export interface HeroCopy {
  title: string;
  subtitle: string;
  emailLabel: string;
  linkedInLabel: string;
  /** Toulouse, the area served, meetings in person. */
  note: string;
  mascotAlt: string;
  annotation: string;
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

const tagline = 'Sites web rapides et applications sur mesure';

const robustaBuildPyramidsConfig: SeoPyramidsConfig = {
  domain: url,
  siteName: 'Robusta Build',
  siteTitle: 'Robusta Build: Freelance ethers.js, solidity, web, blockchain',
  mission,
  // The design system's wordmark, resolved through the package's assets
  // subpath — no brand file is copied into `public/`. `logo` is a bare URL and
  // `domain` is absolute, so the root-relative hashed path is prefixed here.
  logo: `${url}${wordmarkSrc}`,
  defaultLocale: urlScheme.defaultLocale,
  otherLocales: [...urlScheme.otherLocales],
  blogConfig: {
    // The content section's four values come from the site's scheme module, so
    // the route table and the site configuration cannot state different ones.
    contentRoot: urlScheme.contentRoot,
    defaultLocale: urlScheme.defaultLocale,
    otherLocales: [...urlScheme.otherLocales],
    debugImagePath: false,
    mandatoryKeywords: ['robusta build', 'freelance'],
    rollSize: ROLL_SIZE,
    author: 'Nicolas Zozol',
  },
  contact: {
    email: 'nicolas@robusta.build',
    linkedIn: 'https://www.linkedin.com/in/robustacode/',
  },
  pageCopy: {
    tagline,
    header: { contactLabel: 'me contacter' },
    footer: { copyright: '© Robusta Build · Nicolas Zozol, Toulouse' },
    landing: {
      head: {
        title: `Robusta Build : ${tagline.toLowerCase()} à Toulouse`,
        description:
          'Nicolas Zozol, développeur depuis vingt ans, crée pour les PME de Toulouse et de la Haute-Garonne des sites web rapides et des applications adaptées à leur activité.',
      },
      hero: {
        title: 'vingt ans de logiciel, au service de votre entreprise.',
        subtitle:
          "Je suis Nicolas Zozol, développeur fullstack. Passé par Renault, le BCG et plusieurs startups, j'aide les PME de la région à passer un cap avec des logiciels adaptés à leur activité : back-office, outils internes, portail client, et un site qui s'affiche vite et se trouve sur Google.",
        emailLabel: "m'écrire un e-mail",
        linkedInLabel: 'voir mon profil LinkedIn',
        note: "Basé à Toulouse, j'interviens dans toute la Haute-Garonne et je vous rencontre sur place, dans vos locaux ou sur rendez-vous.",
        mascotAlt: 'Crystal Tux, le manchot mascotte de Robusta Build',
        annotation: 'voici crystal tux. elle veille sur le code.',
      },
      principles: {
        eyebrow: '// ma façon de travailler',
        title: 'des principes, écrits noir sur blanc.',
        principles: [
          {
            k: "je comprends votre métier avant d'écrire du code.",
            v: 'le premier rendez-vous porte sur votre activité, pas sur la technique.',
          },
          {
            k: 'des technologies éprouvées.',
            v: 'moins de pièces mobiles, moins de pannes et moins de frais.',
          },
          {
            k: 'un code simple à faire évoluer.',
            v: 'avec ou sans moi, la personne suivante s’y retrouve.',
          },
          {
            k: 'un seul interlocuteur.',
            v: "c'est moi qui écris le code que je vous propose, du premier rendez-vous à la livraison.",
          },
          {
            k: 'un site rapide, trouvé sur Google.',
            v: 'le référencement se pense dès la première ligne.',
          },
          {
            k: 'des références sérieuses.',
            v: 'Renault, le BCG et plusieurs startups m’ont confié leurs logiciels.',
          },
        ],
      },
      notes: {
        eyebrow: '// derniers articles',
        title: "ce que j'écris.",
        allLinkLabel: 'tous les articles',
      },
      cta: {
        title: 'parlons de votre projet.',
        subtitle:
          'Un premier échange de trente minutes, sans engagement : vous me dites ce qui coince, je vous dis si je suis la bonne personne pour vous aider.',
        footnote:
          'Pas de formulaire ni de newsletter : je lis et je réponds moi-même.',
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
  },
};

export function getSeoPyramidsConfig() {
  return robustaBuildPyramidsConfig;
}
