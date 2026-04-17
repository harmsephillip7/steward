'use client';

import { Command } from 'cmdk';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface PageItem {
  href: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  keywords: string;
}

interface ActionItem {
  label: string;
  href: string;
  icon: React.FC<{ className?: string }>;
  keywords: string;
}

interface CommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pages: PageItem[];
  quickActions: ActionItem[];
  onNavigate: (href: string) => void;
}

export default function CommandDialog({ open, onOpenChange, pages, quickActions, onNavigate }: CommandDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  onSelect={() => onNavigate(action.href)}
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
                  onSelect={() => onNavigate(page.href)}
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
  );
}
