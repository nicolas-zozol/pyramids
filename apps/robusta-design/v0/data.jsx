// Content for the homepage. Real profile: Nicolas Zozol / robusta.build
const SITE = {
  name: "Nicolas Zozol",
  handle: "robusta.build",
  role: "Senior fullstack engineer",
  location: "Toulouse, FR · Remote · CET",
  available: "Available · accepting Q3 engagements",
  email: "nicolas@robusta.build",
  cal: "robusta.build/intro",
  github: "github.com/nicolas-zozol",
  rss: "/feed.xml",
  cred: "Oracle Certified Java Master · Toptal top 3%",
};

const SERVICES = [
  {
    num: "01",
    title: "Fullstack product engineering",
    body: "End-to-end work on serious software: from API design to React frontends. The kind of engagement where one engineer can carry a product from demo to production.",
    bullets: [
      "Java / Spring · Node / TypeScript",
      "React, Angular, design-system work",
      "Postgres · MongoDB · API design",
      "Toptal-screened, since 2018",
    ],
  },
  {
    num: "02",
    title: "Web3 & smart-contract systems",
    body: "Hands-on DeFi engineering — from first contract to multi-chain monorepo. I was Swaap Finance's first engineer; I know what production looks like at $1B+ monthly volume.",
    bullets: [
      "Solidity · ethers.js · web3.js",
      "TheGraph · subgraph indexing",
      "DeFi protocol architecture",
      "Audit-ready code & docs",
    ],
  },
  {
    num: "03",
    title: "Parsers, compilers & dev tooling",
    body: "I maintain Masala Parser, a Parsec-style combinator library. I write tools for engineers and treat the API surface like a literary form.",
    bullets: [
      "Combinator parsers · DSLs",
      "TypeScript SDK design",
      "CI/CD · TDD · DX audits",
      "Docs engineers actually read",
    ],
  },
];

const OSS = [
  {
    idx: "01",
    name: "masala-parser",
    scope: "/parsing",
    desc: "A Parsec-inspired combinator library for TypeScript. Lets you build anything from a regex alternative to a fully featured compiler — composably, with proper backtracking.",
    tags: ["TypeScript", "Parsec", "MIT"],
    stars: "140+",
    sub: "stars · 8 contributors",
  },
  {
    idx: "02",
    name: "swaap-monorepo",
    scope: "/defi",
    desc: "First-employee work on Swaap Finance: grew the codebase from a demo to a multi-site Web3 platform, $5M TVL, $1B+ monthly traded volume.",
    tags: ["Solidity", "ethers.js", "TheGraph"],
    stars: "—",
    sub: "production · 2021–2024",
  },
  {
    idx: "03",
    name: "robusta/notes",
    scope: "/essays",
    desc: "The repo behind the writing on this site. Long-form notes on parsers, type systems, Web3, and the parts of fullstack engineering nobody documents properly.",
    tags: ["MDX", "Astro"],
    stars: "—",
    sub: "open · always WIP",
  },
  {
    idx: "04",
    name: "stack-overflow",
    scope: "/answers",
    desc: "Seven thousand reputation points across Java, JavaScript, and TypeScript. The questions I answer publicly are the questions clients hire me for.",
    tags: ["Java", "TS", "badges"],
    stars: "7k+",
    sub: "rep · since 2010",
  },
];

const POSTS = [
  {
    date: "Apr 2026",
    read: "18 min",
    topic: "Parsers",
    title: "Why combinator parsers beat regex for everything that grows",
    excerpt: "A walk through three real parsing problems where regex got us 80% of the way and then quietly failed. With Masala Parser examples and the moment you realize you've reinvented Yacc.",
  },
  {
    date: "Feb 2026",
    read: "24 min",
    topic: "Web3",
    title: "What I learned writing Solidity for a billion in volume",
    excerpt: "Four years on Swaap Finance, three audit cycles, and the patterns that survive contact with mainnet. What changes when 'down for maintenance' isn't an option.",
  },
  {
    date: "Dec 2025",
    read: "12 min",
    topic: "TypeScript",
    title: "Type-driven API design: the contract is the documentation",
    excerpt: "How to make TypeScript do the talking — discriminated unions, branded types, and the surprisingly low cost of refusing to ship optional fields.",
  },
  {
    date: "Oct 2025",
    read: "9 min",
    topic: "Craft",
    title: "Twenty years of being the engineer they call when it's already on fire",
    excerpt: "I started as a science teacher, became a freelancer in 2007, joined Toptal in 2018. Here's what changed, what didn't, and why I still pick the boring stack.",
  },
];

const NOW = [
  { k: "Building", v: "Masala Parser v3 — async streams + better error recovery" },
  { k: "Reading", v: "Crafting Interpreters (Bob Nystrom) — for the second time" },
  { k: "Writing", v: "An essay on combinator design vs. parser generators" },
  { k: "Mentoring", v: "Toulouse JUG — monthly meetup, organizing since 2019" },
];

const SELECTED_WORK = [
  {
    idx: "→",
    client: "Swaap Finance",
    role: "First engineer · Web3 platform",
    duration: "3 yr · 2021–2024",
    outcome: "Demo → multi-site monorepo · TVL 0 → $5M · $1B+ monthly volume",
  },
  {
    idx: "→",
    client: "Boston Consulting Group",
    role: "Toptal · CMS supervisor",
    duration: "1 yr · 2018",
    outcome: "Saved $25k+ in consulting fees with an ETL rewrite; data pipeline for AI team",
  },
  {
    idx: "→",
    client: "Diool Payments",
    role: "Toptal · frontend lead",
    duration: "2 yr · 2019–2021",
    outcome: "Migrated legacy AngularJS to a maintainable Angular app for Cameroon's mobile-money leader",
  },
  {
    idx: "→",
    client: "Nauto AI",
    role: "Toptal · React engineer",
    duration: "2019",
    outcome: "Real-time alarm-signal dashboard for an AI driving-safety scale-up",
  },
];

window.SITE = SITE;
window.SERVICES = SERVICES;
window.OSS = OSS;
window.POSTS = POSTS;
window.NOW = NOW;
window.SELECTED_WORK = SELECTED_WORK;
