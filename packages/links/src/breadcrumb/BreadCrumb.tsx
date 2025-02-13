// BreadCrumb.tsx
import Link from 'next/link';
import React from 'react';

export interface BreadCrumbProps {
  locale: string;
  defaultLocale: boolean;
  categories?: string[];
  homeUrl: string;
}

/**
 * Renders a breadcrumb using DaisyUI and Tailwind classes.
 * The 'homeUrl' is often '/blog'.
 * If 'defaultLocale' is false (e.g. 'fr'), we insert that into the path.
 * Each category is appended to build a nested path.
 */
export function BreadCrumb({
  locale,
  defaultLocale,
  categories = [],
  homeUrl,
}: BreadCrumbProps) {
  // This array will hold each "segment" for the breadcrumb.
  // Example: if homeUrl = "/blog", locale = "fr", categories=["blockchain","security"]
  // We'll build segment links for:
  //    "/blog/fr" => "Home"
  //    "/blog/fr/blockchain" => "blockchain"
  //    "/blog/fr/blockchain/security" => "security"

  const segments = [];
  let path = homeUrl.replace(/\/+$/, ''); // ensure no trailing slash

  // Insert locale if it's NOT the default
  if (!defaultLocale) {
    path += `/${locale}`;
  }

  // Push the "home" breadcrumb
  segments.push({ name: 'Home', href: path });

  // For each category, extend the path
  for (const category of categories) {
    path += `/${category}`;
    segments.push({ name: category, href: path });
  }

  return (
    <div className="breadcrumbs mb-4 text-sm">
      <ul>
        {segments.map((seg, index) => (
          <li key={index}>
            <Link href={seg.href}>{seg.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
