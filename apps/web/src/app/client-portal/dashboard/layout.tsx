'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { usePortalAuth } from '../portal-auth';
import { Button } from '@/components/ui/button';
import { Home, Briefcase, Target, Shield, LogOut } from 'lucide-react';

const NAV = [
  { label: 'Dashboard', href: '/client-portal/dashboard', icon: Home },
  { label: 'Portfolios', href: '/client-portal/dashboard/portfolios', icon: Briefcase },
  { label: 'Goals', href: '/client-portal/dashboard/goals', icon: Target },
  { label: 'Insurance', href: '/client-portal/dashboard/insurance', icon: Shield },
];

export default function PortalDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = usePortalAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/client-portal/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Portal Top Bar */}
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/client-portal/dashboard" className="font-bold text-lg">
              Steward <span className="text-primary">Portal</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href}>
                  <Button variant={pathname === href ? 'secondary' : 'ghost'} size="sm">
                    <Icon className="w-4 h-4 mr-1.5" />{label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={() => { logout(); router.push('/client-portal/login'); }}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <nav className="md:hidden flex gap-1 p-2 border-b overflow-x-auto bg-card">
        {NAV.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href}>
            <Button variant={pathname === href ? 'secondary' : 'ghost'} size="sm" className="whitespace-nowrap">
              <Icon className="w-4 h-4 mr-1" />{label}
            </Button>
          </Link>
        ))}
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
