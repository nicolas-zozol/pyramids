/**
 * Package marketing — the eight sections of a marketing page, composed of the primitives and laid out by `sketch.css`.
 *
 * Design: features/pyramid-v2-epic/__done/design-system-responsive/design-system-responsive.design.md
 * Requirements: R-RESPONSIVE-03, R-RESPONSIVE-22, R-RESPONSIVE-24, R-RESPONSIVE-42, R-RESPONSIVE-43, R-RESPONSIVE-45, R-RESPONSIVE-63, R-RESPONSIVE-82, R-RESPONSIVE-83, R-RESPONSIVE-101, R-RESPONSIVE-102, R-RESPONSIVE-103, R-RESPONSIVE-104
 * Design: features/pyramid-v2-epic/__done/robusta-landing-page/robusta-landing-page.design.md
 * Requirements: R-LANDING-21, R-LANDING-22, R-LANDING-23
 * Design: features/pyramid-v2-epic/__done/multilingual-site/multilingual-site.design.md
 * Requirements: R-MULTILINGUAL-46, R-MULTILINGUAL-65
 * Design: features/pyramid-v2-epic/__done/drop-section-default-copy/drop-section-default-copy.design.md
 * Requirements: R-SECTIONCOPY-01, R-SECTIONCOPY-02, R-SECTIONCOPY-03, R-SECTIONCOPY-04, R-SECTIONCOPY-05
 */
export { Hero, type HeroProps } from './Hero.tsx';
export { SiteHeader, type SiteHeaderProps, type NavLink } from './SiteHeader.tsx';
export {
  SiteFooter,
  type SiteFooterProps,
  type FooterColumn,
  type FooterLink,
} from './SiteFooter.tsx';
export { ServicesGrid, type ServicesGridProps, type ServiceItem } from './ServicesGrid.tsx';
export { FlowDiagram, type FlowDiagramProps, type FlowStep } from './FlowDiagram.tsx';
export { PrinciplesList, type PrinciplesListProps, type Principle } from './PrinciplesList.tsx';
export { NotesPreview, type NotesPreviewProps, type NotePost } from './NotesPreview.tsx';
export { CTA, type CTAProps } from './CTA.tsx';
