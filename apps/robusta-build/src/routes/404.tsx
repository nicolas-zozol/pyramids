import { createFileRoute } from '@tanstack/react-router';
import { NotFoundPage } from '@/components/NotFoundPage.js';

export const Route = createFileRoute('/404')({
  component: NotFoundPage,
});
