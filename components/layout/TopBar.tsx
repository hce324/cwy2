'use client';

import { useAppStore } from '@/lib/store';
import { viewMeta } from '@/lib/navigation';
import { Role } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Search, Bell, ChevronDown, Presentation, User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const roleAvatars: Record<Role, string> = {
  '财务负责人': '林',
  '财务专员': '财',
  '出纳': '出',
};

export function TopBar() {
  const {
    currentRole, currentView, setRole, isPresentationMode,
    togglePresentationMode
  } = useAppStore();

  const meta = viewMeta[currentView];

  return (
    <header className="flex items-center h-14 px-5 border-b border-border bg-background gap-4 z-10 shrink-0 elevation-1" aria-label="顶栏">
      {/* Breadcrumb — module path only, no company name (it's in sidebar) */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink className="text-xs font-semibold text-foreground">
              {meta?.breadcrumb || currentView}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Presentation mode toggle — prominent primary button */}
      <Button
        variant={isPresentationMode ? "default" : "outline"}
        size="sm"
        className="gap-1.5 text-xs h-8 transition-all duration-200"
        onClick={togglePresentationMode}
      >
        <Presentation className="h-3.5 w-3.5" />
        {isPresentationMode ? '退出汇报模式' : '进入汇报模式'}
      </Button>
      {isPresentationMode && (
        <Badge variant="secondary" className="text-[10px] h-5 animate-in fade-in">汇报模式</Badge>
      )}

      {/* Search */}
      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="搜索">
        <Search className="h-4 w-4" />
      </Button>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="h-8 w-8 relative text-muted-foreground hover:text-foreground" aria-label="通知">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 bg-danger text-white text-[10px] font-semibold rounded-full leading-none">
          13
        </span>
      </Button>

      {/* Role selector */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold">
              {roleAvatars[currentRole]}
            </span>
            <span className="hidden sm:inline text-muted-foreground">模拟登录角色：</span>
            <span className="hidden sm:inline font-medium text-foreground">{currentRole}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <div className="px-3 py-2 text-xs text-muted-foreground font-medium">模拟登录角色</div>
          {(['财务负责人', '财务专员', '出纳'] as Role[]).map(role => (
            <DropdownMenuItem
              key={role}
              onClick={() => setRole(role)}
              className={cn('gap-2 text-sm cursor-pointer', currentRole === role && 'bg-accent font-medium')}
            >
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-[11px] font-bold">
                {roleAvatars[role]}
              </span>
              <span>{role}</span>
              {currentRole === role && <span className="ml-auto text-xs text-primary">✓</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
