'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  crm: 'CRM',
  clients: 'Clients',
  portfolios: 'Portfolios',
  funds: 'Funds',
  fna: 'Financial Planning',
  proposals: 'Proposals',
  advisory: 'AI Advisory',
  documents: 'Documents',
  compliance: 'Compliance',
  commissions: 'Commissions',
  reports: 'Reports',
  portal: 'Client Portal',
  firm: 'Firm',
  settings: 'Settings',
  profile: 'Profile',
  onboarding: 'Onboarding',
};

function isUUID(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/');
    const label = routeLabels[seg] || (isUUID(seg) ? 'Details' : seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
      <Link href="/dashboard" className="hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map(({ href, label, isLast }) => (
        <Fragment key={href}>
          <ChevronRight className="h-3.5 w-3.5" />
          {isLast ? (
            <span className="font-medium text-foreground">{label}</span>
          ) : (
            <Link href={href} className="hover:text-foreground transition-colors">
              {label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
