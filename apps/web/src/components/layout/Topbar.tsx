'use client';

import { useAuth } from '@/lib/auth-context';
import { Bell, LogOut, ChevronDown, Sun, Moon, Search } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MobileSidebar } from './Sidebar';
import { useNotifications } from '@/lib/hooks/use-notifications';
import { useCommandPalette } from '@/components/command-palette';

function getInitials(name?: string | null): string {
  if (!name) return 'A';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Topbar() {
  const { advisor, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const { setOpen: setCommandOpen } = useCommandPalette();
  const userName = advisor?.name || advisor?.email || 'Advisor';

  return (
    <header className="flex items-center justify-between h-14 px-4 lg:px-6 bg-card border-b shrink-0">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <h1 className="text-sm text-muted-foreground font-medium hidden sm:block">
          Welcome back, <span className="text-foreground">{userName}</span>
        </h1>
      </div>

      <div className="flex items-center gap-1">
        {/* Search trigger */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:flex items-center gap-2 text-muted-foreground"
          onClick={() => setCommandOpen(true)}
        >
          <Search className="w-4 h-4" />
          <span className="text-xs">Search...</span>
          <kbd className="pointer-events-none text-xs bg-muted px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:block">
                {userName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{advisor?.name || 'Advisor'}</p>
                <p className="text-xs text-muted-foreground">{advisor?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
