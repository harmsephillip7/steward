'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart2,
  FileText,
  ShieldCheck,
  Settings,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard',    label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/clients',      label: 'Clients',     icon: Users },
  { href: '/portfolios',   label: 'Portfolios',  icon: Briefcase },
  { href: '/funds',        label: 'Funds',       icon: BarChart2 },
  { href: '/fna',          label: 'Planning',    icon: BookOpen },
  { href: '/reports',      label: 'Reports',     icon: FileText },
  { href: '/compliance',   label: 'Compliance',  icon: ShieldCheck },
  { href: '/settings',     label: 'Settings',    icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-brand-900 flex flex-col shrink-0 h-full">
      <div className="px-6 py-5 border-b border-brand-700">
        <span className="text-white font-bold text-xl tracking-tight">Steward</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                active
                  ? 'bg-brand-600 text-white'
                  : 'text-blue-200 hover:bg-brand-700 hover:text-white',
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
