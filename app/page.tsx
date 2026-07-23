'use client';

import { useAppStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { AIAssistantFAB, AIAssistantPanel } from '@/components/layout/AIAssistant';
import { ViewRenderer } from '@/components/views/ViewRenderer';
import { useEffect } from 'react';

export default function Home() {
  const { setView, currentRole } = useAppStore();

  // Sync URL with view changes
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      if (view) {
        setView(view as any);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setView]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Skip to content */}
      <a href="#main-content" className="skip-link">
        跳到主内容
      </a>

      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <TopBar />

        {/* Main content */}
        <main id="main-content" className="flex-1 overflow-auto custom-scrollbar">
          <ViewRenderer />
        </main>
      </div>

      {/* AI Assistant */}
      <AIAssistantFAB />
      <AIAssistantPanel />
    </div>
  );
}
