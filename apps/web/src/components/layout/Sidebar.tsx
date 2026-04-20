'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Users, Briefcase, TrendingUp, FileText, Shield, BarChart3,
  Globe, Settings, Cross, Target, ClipboardList, Building2, FolderOpen,
  Brain, DollarSign, ChevronDown, Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface NavItem {
  href: string;
  label: string;
  icon: React.FC<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Practice',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/crm', label: 'CRM', icon: Target },
      { href: '/clients', label: 'Clients', icon: Users },
    ],
  },
  {
    label: 'Planning',
    items: [
      { href: '/portfolios', label: 'Portfolios', icon: Briefcase },
      { href: '/funds', label: 'Funds', icon: TrendingUp },
      { href: '/fna', label: 'Financial Planning', icon: FileText },
      { href: '/proposals', label: 'Proposals', icon: ClipboardList },
      { href: '/advisory', label: 'AI Advisory', icon: Brain },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/documents', label: 'Document Vault', icon: FolderOpen },
      { href: '/compliance', label: 'Compliance', icon: Shield },
      { href: '/commissions', label: 'Commissions', icon: DollarSign },
      { href: '/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Admin',
    items: [
      { href: '/portal', label: 'Client Portal', icon: Globe },
      { href: '/firm', label: 'Firm', icon: Building2 },
    ],
  },
];

const bottomItems: NavItem[] = [{ href: '/settings', label: 'Settings', icon: Settings }];

function NavLink({ item, pathname, onClick }: { item: NavItem; pathname: string; onClick?: () => void }) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary dark:bg-primary/20'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <item.icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
      {item.label}
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (label: string) => setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-6 py-5 border-b">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
          <Cross className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div>
          <span className="font-semibold text-foreground text-base leading-none">Steward</span>
          <p className="text-xs text-muted-foreground mt-0.5">Advisory Platform</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {navGroups.map((group) => {
          const isCollapsed = collapsed[group.label];
          return (
            <div key={group.label}>
              <button
                onClick={() => toggle(group.label)}
                className="flex items-center justify-between w-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                {group.label}
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', isCollapsed && '-rotate-90')} />
              </button>
              {!isCollapsed && (
                <div className="mt-1 space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink key={item.href} item={item} pathname={pathname} onClick={onNavigate} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t space-y-0.5">
        {bottomItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} onClick={onNavigate} />
        ))}
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-card border-r h-full">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <SidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
