/**
 * Package marketing — the eight surfaces of a marketing page, composed of the primitives and laid out by `sketch.css`.
 *
 * Design: features/pyramid-v2-epic/__done/design-system-responsive/design-system-responsive.design.md
 * Requirements: R-RESPONSIVE-03, R-RESPONSIVE-22, R-RESPONSIVE-24, R-RESPONSIVE-42, R-RESPONSIVE-43, R-RESPONSIVE-44, R-RESPONSIVE-45, R-RESPONSIVE-63, R-RESPONSIVE-82, R-RESPONSIVE-83, R-RESPONSIVE-101, R-RESPONSIVE-102, R-RESPONSIVE-103, R-RESPONSIVE-104, R-RESPONSIVE-106, R-RESPONSIVE-107
 * Design: features/pyramid-v2-epic/robusta-landing-page/robusta-landing-page.design.md
 * Requirements: R-LANDING-21, R-LANDING-22, R-LANDING-23
 * Design: features/pyramid-v2-epic/multilingual-site/multilingual-site.design.md
 * Requirements: R-MULTILINGUAL-46, R-MULTILINGUAL-65
 */
export { Hero, type HeroProps } from './Hero.js';
export { SiteHeader, type SiteHeaderProps, type NavLink } from './SiteHeader.js';
export {
  SiteFooter,
  type SiteFooterProps,
  type FooterColumn,
  type FooterLink,
} from './SiteFooter.js';
export { ServicesGrid, type ServicesGridProps, type ServiceItem } from './ServicesGrid.js';
export { FlowDiagram, type FlowDiagramProps, type FlowStep } from './FlowDiagram.js';
export { PrinciplesList, type PrinciplesListProps, type Principle } from './PrinciplesList.js';
export { NotesPreview, type NotesPreviewProps, type NotePost } from './NotesPreview.js';
export { CTA, type CTAProps } from './CTA.js';
