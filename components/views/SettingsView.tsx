'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Activity, RefreshCw, AlertCircle, Plus, Settings, Wrench } from 'lucide-react';

// ============================================================================
// Inline Data
// ============================================================================

interface Connection {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: string;
  statusTone: 'success' | 'warning';
  subtitle: string;
  syncLabel: string;
  syncTone: 'success' | 'warning';
  actionLabel: string;
  actionIcon?: React.ReactNode;
}

const connections: Connection[] = [
  {
    id: 'yonyou-u8',
    name: '用友U8',
    icon: <Wrench className="h-4 w-4 text-primary" />,
    status: '正常',
    statusTone: 'success',
    subtitle: '上海、广州等3家公司 · 3个账套',
    syncLabel: '最近同步：2分钟前',
    syncTone: 'success',
    actionLabel: '管理映射',
  },
  {
    id: 'kingdee',
    name: '金蝶云星空',
    icon: <Wrench className="h-4 w-4 text-primary" />,
    status: '正常',
    statusTone: 'success',
    subtitle: '杭州、成都等3家公司 · 4个账套',
    syncLabel: '最近同步：5分钟前',
    syncTone: 'success',
    actionLabel: '管理映射',
  },
  {
    id: 'tmall-taobao',
    name: '天猫/淘宝',
    icon: <Settings className="h-4 w-4 text-primary" />,
    status: '已授权',
    statusTone: 'success',
    subtitle: '8个店铺 · 订单与结算单',
    syncLabel: '最近同步：10分钟前',
    syncTone: 'success',
    actionLabel: '管理映射',
  },
  {
    id: 'douyin',
    name: '抖音电商',
    icon: <Settings className="h-4 w-4 text-primary" />,
    status: '1项提醒',
    statusTone: 'warning',
    subtitle: '5个店铺 · 订单与结算单',
    syncLabel: '授权将在28天后到期',
    syncTone: 'warning',
    actionLabel: '续期授权',
    actionIcon: <RefreshCw className="h-3 w-3" />,
  },
];

const statusBadgeClass: Record<Connection['statusTone'], string> = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
};

const activityClass: Record<Connection['syncTone'], string> = {
  success: 'text-success',
  warning: 'text-warning',
};

// ============================================================================
// Main Component
// ============================================================================

export function SettingsView() {
  return (
    <div className="p-6 space-y-6">
      {/* ========== Page Header ========== */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">
            系统连接{' '}
            <span className="text-xs font-normal text-muted-foreground font-sans uppercase tracking-wider align-middle">
              INTEGRATIONS
            </span>
          </h1>
          <p className="page-subtitle">
            通过统一适配层连接各法人公司的ERP与电商平台。
          </p>
        </div>
        <Button size="sm" className="gap-1.5 ripple-container">
          <Plus className="h-4 w-4" />
          新增连接
        </Button>
      </div>

      <Separator />

      {/* ========== Connection Cards ========== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connections.map((conn) => (
          <Card
            key={conn.id}
            className={`elevation-1 ${conn.statusTone === 'warning' ? 'border-warning/30' : ''}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  {conn.icon}
                  {conn.name}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={`text-[10px] border ${statusBadgeClass[conn.statusTone]}`}
                >
                  {conn.status}
                </Badge>
              </div>
              <CardDescription>{conn.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <div className="flex items-center gap-1.5">
                {conn.syncTone === 'warning' ? (
                  <AlertCircle className={`h-3 w-3 ${activityClass[conn.syncTone]}`} />
                ) : (
                  <Activity className={`h-3 w-3 ${activityClass[conn.syncTone]}`} />
                )}
                <span className={conn.syncTone === 'warning' ? 'text-warning' : ''}>
                  {conn.syncLabel}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs ripple-container"
              >
                {conn.actionIcon}
                {conn.actionIcon && <span className="mr-1" />}
                {conn.actionLabel}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
