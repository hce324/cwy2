'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { ViewId } from '@/lib/types';
import { canAccess, getDefaultView } from '@/lib/navigation';

/**
 * Client-side providers wrapper.
 * Handles URL-based view restoration on mount.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const { setView, currentRole, isPresentationMode } = useAppStore();

  useEffect(() => {
    // Restore view from URL on mount
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam) {
      const view = viewParam as ViewId;
      if (canAccess(view, currentRole, isPresentationMode)) {
        setView(view);
      } else {
        setView(getDefaultView(currentRole));
      }
    } else {
      setView(getDefaultView(currentRole));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
