'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  LayoutDashboard, Users, Briefcase, TrendingUp, FileText, Shield, BarChart3,
  Globe, Settings, Target, ClipboardList, Building2, FolderOpen, Brain,
  DollarSign, Plus, Search,
} from 'lucide-react';

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue>({ open: false, setOpen: () => {} });

export function useCommandPalette() {
  return useContext(CommandPaletteContext);
}

const pages = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, keywords: 'home overview' },
  { href: '/crm', label: 'CRM', icon: Target, keywords: 'leads pipeline sales' },
  { href: '/clients', label: 'Clients', icon: Users, keywords: 'people contacts' },
  { href: '/portfolios', label: 'Portfolios', icon: Briefcase, keywords: 'investments holdings' },
  { href: '/funds', label: 'Funds', icon: TrendingUp, keywords: 'screening investment' },
  { href: '/fna', label: 'Financial Planning', icon: FileText, keywords: 'fna needs analysis' },
  { href: '/proposals', label: 'Proposals', icon: ClipboardList, keywords: 'quotes offers' },
  { href: '/advisory', label: 'AI Advisory', icon: Brain, keywords: 'recommendations ai' },
  { href: '/documents', label: 'Documents', icon: FolderOpen, keywords: 'files upload fica' },
  { href: '/compliance', label: 'Compliance', icon: Shield, keywords: 'reviews regulatory fais' },
  { href: '/commissions', label: 'Commissions', icon: DollarSign, keywords: 'revenue fees income' },
  { href: '/reports', label: 'Reports', icon: BarChart3, keywords: 'export analytics' },
  { href: '/portal', label: 'Client Portal', icon: Globe, keywords: 'portal access' },
  { href: '/firm', label: 'Firm Management', icon: Building2, keywords: 'team members' },
  { href: '/settings', label: 'Settings', icon: Settings, keywords: 'preferences branding' },
];

const quickActions = [
  { label: 'New Client', href: '/clients', icon: Plus, keywords: 'add create client' },
  { label: 'New Lead', href: '/crm', icon: Plus, keywords: 'add create lead' },
  { label: 'Generate AI Advice', href: '/advisory', icon: Brain, keywords: 'ai recommendation' },
  { label: 'Upload Document', href: '/documents', icon: FolderOpen, keywords: 'upload file' },
  { label: 'Record Commission', href: '/commissions', icon: DollarSign, keywords: 'add commission' },
];

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigate = useCallback((href: string) => {
    setOpen(false);
    router.push(href);
  }, [router]);

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 shadow-lg max-w-lg">
          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2.5 [&_[cmdk-input]]:h-12">
            <Command.Input placeholder="Search pages, actions..." className="flex h-12 w-full rounded-md bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-b" />
            <Command.List className="max-h-[300px] overflow-y-auto p-2">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">No results found.</Command.Empty>
              <Command.Group heading="Quick Actions">
                {quickActions.map((action) => (
                  <Command.Item
                    key={action.label}
                    value={`${action.label} ${action.keywords}`}
                    onSelect={() => navigate(action.href)}
                    className="flex items-center gap-2 rounded-md px-2 py-2.5 text-sm cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                  >
                    <action.icon className="h-4 w-4 text-muted-foreground" />
                    {action.label}
                  </Command.Item>
                ))}
              </Command.Group>
              <Command.Separator className="my-1 h-px bg-border" />
              <Command.Group heading="Pages">
                {pages.map((page) => (
                  <Command.Item
                    key={page.href}
                    value={`${page.label} ${page.keywords}`}
                    onSelect={() => navigate(page.href)}
                    className="flex items-center gap-2 rounded-md px-2 py-2.5 text-sm cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                  >
                    <page.icon className="h-4 w-4 text-muted-foreground" />
                    {page.label}
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </CommandPaletteContext.Provider>
  );
}
