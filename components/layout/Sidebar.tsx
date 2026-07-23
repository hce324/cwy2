'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getNavMenus } from '@/lib/navigation';
import { ViewId, MenuGroup, MenuItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, ChevronLeft, ChevronRight, ChevronDown, MessageSquare, Settings,
  TrendingUp, Wallet, FileText, Receipt, Shield, BarChart3, Calculator,
  BookOpen, ClipboardCheck, Building2, Scale, Users, Presentation
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const iconMap: Record<string, React.ReactNode> = {
  overview: <BarChart3 className="h-4 w-4" />,
  workbench: <LayoutDashboard className="h-4 w-4" />,
  cash: <Wallet className="h-4 w-4" />,
  receivable: <Receipt className="h-4 w-4" />,
  payable: <FileText className="h-4 w-4" />,
  inventory: <TrendingUp className="h-4 w-4" />,
  budget: <Calculator className="h-4 w-4" />,
  profit: <TrendingUp className="h-4 w-4" />,
  closing: <ClipboardCheck className="h-4 w-4" />,
  risk: <Shield className="h-4 w-4" />,
  import: <FileText className="h-4 w-4" />,
  blueprint: <Users className="h-4 w-4" />,
  data: <BarChart3 className="h-4 w-4" />,
  boundary: <Shield className="h-4 w-4" />,
  'hz-documents': <FileText className="h-4 w-4" />,
  'hz-sourcevoucher': <Receipt className="h-4 w-4" />,
  'hz-cashmanagement': <Wallet className="h-4 w-4" />,
  'hz-voucher': <BookOpen className="h-4 w-4" />,
  'hz-voucherorganize': <BookOpen className="h-4 w-4" />,
  'hz-vouchervoid': <BookOpen className="h-4 w-4" />,
  'hz-voucherquery': <BookOpen className="h-4 w-4" />,
  'hz-reconcile': <Calculator className="h-4 w-4" />,
  'hz-bankrecon': <Building2 className="h-4 w-4" />,
  'hz-ledger': <BookOpen className="h-4 w-4" />,
  'hz-balance': <Scale className="h-4 w-4" />,
  subjects: <BookOpen className="h-4 w-4" />,
  'opening-balance': <Scale className="h-4 w-4" />,
  'business-entry': <BookOpen className="h-4 w-4" />,
  'asset-management': <Building2 className="h-4 w-4" />,
  'inventory-management': <Building2 className="h-4 w-4" />,
  'accounting-check': <ClipboardCheck className="h-4 w-4" />,
  'hz-reports': <FileText className="h-4 w-4" />,
  'hz-closing': <ClipboardCheck className="h-4 w-4" />,
  'hz-tax': <Receipt className="h-4 w-4" />,
  'hz-settings': <Settings className="h-4 w-4" />,
};

function NavGroup({
  group,
  groupIndex,
  sidebarCollapsed,
  currentView,
  defaultExpanded,
  onNavigate,
}: {
  group: MenuGroup;
  groupIndex: number;
  sidebarCollapsed: boolean;
  currentView: string;
  defaultExpanded: boolean;
  onNavigate: (viewId: ViewId) => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isCurrentGroup = group.items.some((item) => item.viewId === currentView);

  return (
    <div className="mb-1">
      {/* Group header */}
      {!sidebarCollapsed && (
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'w-full flex items-center gap-1.5 px-4 pt-2 pb-1',
            'text-xs font-semibold uppercase tracking-[0.05em]',
            'text-[#9CA3AF] hover:text-[#6B7280] transition-colors',
            'cursor-pointer select-none'
          )}
        >
          <span className="flex-1 text-left">{group.label}</span>
          <ChevronDown
            className={cn(
              'h-3 w-3 transition-transform duration-200',
              expanded && 'rotate-180'
            )}
          />
        </button>
      )}

      {/* Group items */}
      {(sidebarCollapsed || expanded) &&
        group.items.map((item) => (
          <button
            key={item.viewId}
            onClick={() => onNavigate(item.viewId)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 text-sm transition-all duration-200 rounded-lg mx-2',
              'hover:bg-sidebar-accent/80',
              currentView === item.viewId
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm'
                : 'text-sidebar-foreground'
            )}
            aria-current={currentView === item.viewId ? 'page' : undefined}
          >
            <span className="flex-shrink-0">
              {iconMap[item.viewId] || <FileText className="h-4 w-4" />}
            </span>
            {!sidebarCollapsed && (
              <>
                <span className="flex-1 text-left truncate">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="h-5 min-w-5 px-1 text-[10px]">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </button>
        ))}
    </div>
  );
}

export function Sidebar() {
  const {
    currentRole, currentView, setView, isPresentationMode,
    sidebarCollapsed, toggleSidebar
  } = useAppStore();

  const menus = getNavMenus(currentRole, isPresentationMode);

  // Determine which group should be expanded by default (the one containing current view)
  const currentGroupIndex = menus.findIndex((g) =>
    g.items.some((item) => item.viewId === currentView)
  );

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-sidebar border-r border-sidebar-border elevation-1 transition-all duration-300 z-20',
        sidebarCollapsed ? 'w-[70px]' : 'w-[250px]'
      )}
      aria-label="主导航"
    >
      {/* Logo area */}
      <div className={cn(
        'flex items-center gap-3 p-4',
        sidebarCollapsed && 'justify-center px-2'
      )}>
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-base">财</span>
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <div className="text-base font-bold text-sidebar-foreground leading-tight font-heading tracking-tight">
              财务云
            </div>
            <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">
              财务管理协同平台
            </div>
          </div>
        )}
      </div>

      {/* Company selector */}
      {!sidebarCollapsed && (
        <div className="px-4 py-3 border-b border-sidebar-border/50">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">当前公司</div>
          <div className="text-sm font-medium text-sidebar-foreground flex items-center gap-1 mt-0.5">
            澜川数字科技有限公司
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
          </div>
        </div>
      )}

      {/* Nav menus — collapsible groups */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-2" aria-label="主导航菜单">
        {menus.map((group, gi) => (
          <NavGroup
            key={gi}
            group={group}
            groupIndex={gi}
            sidebarCollapsed={sidebarCollapsed}
            currentView={currentView}
            defaultExpanded={gi === 0 || gi === currentGroupIndex}
            onNavigate={setView}
          />
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-sidebar-border/50 p-2 space-y-0.5">
        {[
          { icon: <MessageSquare className="h-4 w-4" />, label: '帮助与反馈' },
          { icon: <Settings className="h-4 w-4" />, label: '系统设置' },
        ].map((item, i) => (
          <button
            key={i}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 rounded-lg transition-all duration-200',
              sidebarCollapsed && 'justify-center px-2'
            )}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!sidebarCollapsed && <span>{item.label}</span>}
          </button>
        ))}

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/40 rounded-lg transition-all duration-200',
            sidebarCollapsed && 'justify-center px-2'
          )}
          aria-label={sidebarCollapsed ? '展开侧边栏' : '收起菜单'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>收起菜单</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
