'use client';

import { PortalAuthProvider } from './portal-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } }));

  return (
    <QueryClientProvider client={queryClient}>
      <PortalAuthProvider>
        {children}
      </PortalAuthProvider>
    </QueryClientProvider>
  );
}
