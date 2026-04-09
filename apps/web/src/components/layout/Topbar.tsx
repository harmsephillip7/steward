'use client';
import { signOut, useSession } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';

export function Topbar() {
  const { data: session } = useSession();
  const advisor = (session as any)?.advisor;

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="text-sm text-gray-500">
        {advisor?.firm_name ?? 'Steward Platform'}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <User size={16} />
          {advisor?.name ?? 'Advisor'}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </header>
  );
}
