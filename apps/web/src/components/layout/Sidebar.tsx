'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  TrendingUp,
  FileText,
  Shield,
  BarChart3,
  Globe,
  Settings,
  Cross,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/portfolios', label: 'Portfolios', icon: Briefcase },
  { href: '/funds', label: 'Funds', icon: TrendingUp },
  { href: '/fna', label: 'Financial Planning', icon: FileText },
  { href: '/compliance', label: 'Compliance', icon: Shield },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/portal', label: 'Client Portal', icon: Globe },
];

const bottomItems = [{ href: '/settings', label: 'Settings', icon: Settings }];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 bg-white border-r border-gray-200 h-full">
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
          <Cross className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <span className="font-semibold text-gray-900 text-base leading-none">Steward</span>
          <p className="text-xs text-gray-500 mt-0.5">Advisory Platform</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-primary' : 'text-gray-400')} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-gray-200 space-y-0.5">
        {bottomItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-primary' : 'text-gray-400')} />
              {label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
