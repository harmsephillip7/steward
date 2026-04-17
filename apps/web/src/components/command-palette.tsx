'use client';

import { createContext, useContext, useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Briefcase, TrendingUp, FileText, Shield, BarChart3,
  Globe, Settings, Target, ClipboardList, Building2, FolderOpen, Brain,
  DollarSign, Plus, Search,
} from 'lucide-react';

const CommandDialog = lazy(() => import('./command-dialog'));

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
      {open && (
        <Suspense fallback={null}>
          <CommandDialog
            open={open}
            onOpenChange={setOpen}
            pages={pages}
            quickActions={quickActions}
            onNavigate={navigate}
          />
        </Suspense>
      )}
    </CommandPaletteContext.Provider>
  );
}
