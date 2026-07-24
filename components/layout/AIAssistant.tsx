'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Bot, Sparkles, Send, Trash2, X, ChevronRight, MessageCircle,
  Wallet, ReceiptText, CreditCard, Package, Target, ShieldAlert,
  Users, UserPlus, Clock, Banknote, UserMinus, ShieldCheck,
  type LucideIcon
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from '@/components/ui/sheet';
import { hrDiagnosisModules, type AiModule } from '@/lib/hr-data';

// ============ 财务诊断模块（原有，仅分析财务） ============
const aiModules: AiModule[] = [
  {
    module: '资金管理',
    status: '需关注',
    conclusion: '现金流整体健康，但7月18日存在短期缺口需提前安排。',
    analysisCount: 4, warningCount: 0,
    findings: ['✓ 经营现金流占比62.8%', '! 7月18日预计资金缺口¥420,000'],
  },
  {
    module: '应收管理',
    status: '需关注',
    conclusion: '逾期占比较高，2位客户超15天，回款压力集中在王思雨名下。',
    analysisCount: 4, warningCount: 2,
    findings: ['! 逾期占比58%，超行业警戒线', '! 华东优选商贸逾期32天·¥680,000'],
  },
  {
    module: '应付与付款',
    status: '健康',
    conclusion: '偿付能力整体充足，但资产负债率偏高需中期关注。',
    analysisCount: 4, warningCount: 0,
    findings: ['✓ 速动比率1.28 · 流动比率1.82', '! 资产负债率52.3%接近警戒线'],
  },
  {
    module: '产销管理',
    status: '预警',
    conclusion: '整体产销匹配率达标，但达播亏损、低效SKU、供应延迟及库存积压形成4类经营风险。',
    analysisCount: 7, warningCount: 3,
    findings: ['✓ 整体产销匹配率96.4%·达到目标', '! 夏季个护系列产销率仅83.1%'],
  },
  {
    module: '预算执行',
    status: '需关注',
    conclusion: '执行率整体正常，但信息技术费用环比大幅增长需关注。',
    analysisCount: 4, warningCount: 1,
    findings: ['✓ 总体执行率56.6%', '! 信息技术费用环比增长31.8%'],
  },
  {
    module: '风险与异常',
    status: '预警',
    conclusion: '当前13项待处理异常，其中6项高风险；经营风险已成为本期新增重点。',
    analysisCount: 7, warningCount: 2,
    findings: ['! 达人D亏损与低效SKU需立即止损', '! 夏季个护产销差额¥37.8万'],
  },
];

// 各诊断模块对应的 Material 风格图标
const moduleIcons: Record<string, LucideIcon> = {
  '资金管理': Wallet,
  '应收管理': ReceiptText,
  '应付与付款': CreditCard,
  '产销管理': Package,
  '预算执行': Target,
  '风险与异常': ShieldAlert,
  // 人事模块
  '人才结构': Users,
  '招聘效能': UserPlus,
  '考勤合规': Clock,
  '薪酬公平': Banknote,
  '绩效分布': Target,
  '员工关系与离职': UserMinus,
  '合规与披露': ShieldCheck,
};

// 图标容器配色：随模块健康状态走语义令牌
function statusIconClass(status: string) {
  if (status === '健康') return 'bg-success/10 text-success';
  if (status === '需关注') return 'bg-warning/10 text-warning';
  return 'bg-danger/10 text-danger';
}

// 诊断概览环形图 —— 按模块健康状态聚合
const statusColors: Record<string, string> = {
  '健康': 'var(--success)',
  '需关注': 'var(--warning)',
  '预警': 'var(--danger)',
};

function DiagnosisTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  if (!item) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md">
      <span className="font-medium">{item.name}</span>
      <span className="text-muted-foreground"> · {item.value} 个模块</span>
    </div>
  );
}

const financeSuggestedQuestions = [
  '上个月哪个模块花钱最多？',
  '现金流还安全吗？',
  '应收账款有没有风险？',
  '帮我做个本季度经营小结',
];

const hrSuggestedQuestions = [
  '我们部门这个月招聘进展如何？',
  '张三上个月的考勤情况？',
  '下个季度调薪怎么建议？',
  '帮我生成一份本月人力小结',
];

export function AIAssistantFAB() {
  const { aiPanelOpen, setAiPanelOpen, aiModule } = useAppStore();
  const badge = aiModule === 'hr' ? hrDiagnosisModules.length : aiModules.length;

  return (
    <button
      onClick={() => setAiPanelOpen(!aiPanelOpen)}
      className={cn(
        'fixed bottom-6 right-6 z-[9999]',
        'w-14 h-14 rounded-full',
        'bg-[--primary] text-white',
        'flex items-center justify-center',
        'shadow-lg hover:opacity-90 active:scale-95',
        'transition-all duration-200 elevation-3 ripple-container',
        aiPanelOpen && 'opacity-0 pointer-events-none scale-75'
      )}
      aria-label="AI助手"
      style={{ position: 'fixed' }}
    >
      <Bot className="h-6 w-6" />
      {/* 模块数量角标 */}
      <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-white text-[--primary] text-[10px] font-bold flex items-center justify-center leading-none">
        {badge}
      </span>
    </button>
  );
}

export function AIAssistantPanel() {
  const {
    aiPanelOpen, setAiPanelOpen, aiPanelTab, setAiPanelTab,
    aiModule, setAiModule,
    chatHistory, addChatMessage, clearChatHistory
  } = useAppStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const modules = aiModule === 'hr' ? hrDiagnosisModules : aiModules;
  const history = chatHistory[aiModule];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [history, isLoading, aiModule]);

  const sendFinance = (msg: string) => {
    // 财务助手：规则模拟（与 DeepSeek 无关）
    let response = '';
    if (msg.includes('花钱') || msg.includes('费用')) {
      response = '🔴 上个月（2026年7月）总费用 ¥1,238.04万，占收入97.6%\n\n费用构成：\n| 类别 | 金额 | 占比 |\n|---|---|---|\n| 营业成本 | ¥760.82万 | 61.5% |\n| 销售费用 | ¥184.26万 | 14.9% |\n| 管理费用 | ¥126.84万 | 10.3% |\n\n市场推广部花钱最多，已用 ¥126万（执行率84%），接近预算上限。';
    } else if (msg.includes('现金流') || msg.includes('安全')) {
      response = '🟡 现金流整体安全，但需关注短期缺口\n\n当前可用现金 ¥842.66万，安全线 ¥600万。\n但7月18日预计出现 ¥42.00万资金缺口，主要因为供应商集中付款 ¥126万。\n\n建议提前调整付款节奏或安排短期融资。';
    } else if (msg.includes('应收') || msg.includes('风险')) {
      response = '🔴 应收风险偏高，需重点关注\n\n应收总额 ¥384.26万，逾期 ¥161.43万（逾期率42%）。\n华东优选商贸逾期32天·¥68万为最大单笔逾期。\n回款压力集中在王思雨名下（达成率仅38.4%）。';
    } else if (msg.includes('经营小结') || msg.includes('季度')) {
      response = '🟢 2026年7月经营小结\n\n收入：¥1,268.04万（同比+8.6%）\n净利润：¥214.68万（同比+12.4%）\n净利率：16.9%\n\n🔴 关注：逾期应收 ¥161.43万 | 资金缺口 ¥42万（7-18）\n\n建议：优先锁定回款，控制投流预算，处理达人D亏损。';
    } else {
      response = '感谢您的提问。根据当前数据，我建议您关注以下关键指标：\n\n1. 🟡 应收逾期 ¥161.43万（占比42%）\n2. 🟡 7月18日资金缺口 ¥42万\n3. 🟢 净利润 ¥214.68万（同比+12.4%）\n\n您可以尝试问我：\n• 上个月哪个模块花钱最多？\n• 现金流还安全吗？';
    }
    addChatMessage('finance', {
      id: `msg-${Date.now()}`,
      role: 'ai',
      content: response,
      timestamp: Date.now(),
    });
  };

  const sendHr = async (msg: string) => {
    // 人事助手：调用 DeepSeek（服务端代理 /api/chat）
    try {
      const payloadMsgs = [
        ...history.map((m) => ({ role: m.role === 'ai' ? 'assistant' : m.role, content: m.content })),
        { role: 'user', content: msg },
      ];
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payloadMsgs, mode: 'hr' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || '调用失败');
      addChatMessage('hr', {
        id: `msg-${Date.now()}`,
        role: 'ai',
        content: data.content,
        timestamp: Date.now(),
      });
    } catch (e: unknown) {
      const msgText = e instanceof Error ? e.message : '网络异常';
      addChatMessage('hr', {
        id: `msg-${Date.now()}`,
        role: 'ai',
        content: `⚠️ 人事AI助手暂时无法连接（${msgText}），请稍后重试。`,
        timestamp: Date.now(),
      });
    }
  };

  const handleSend = () => {
    const msg = input.trim();
    if (!msg) return;
    addChatMessage(aiModule, {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: msg,
      timestamp: Date.now(),
    });
    setInput('');
    setIsLoading(true);
    if (aiModule === 'hr') {
      sendHr(msg).finally(() => setIsLoading(false));
    } else {
      setTimeout(() => {
        sendFinance(msg);
        setIsLoading(false);
      }, 1500);
    }
  };

  const handleClear = () => {
    clearChatHistory(aiModule);
    setShowClearConfirm(false);
  };

  // 诊断概览（随当前模块动态聚合）
  const statusSummary = [
    { key: '健康', name: '健康', value: modules.filter((m) => m.status === '健康').length },
    { key: '需关注', name: '需关注', value: modules.filter((m) => m.status === '需关注').length },
    { key: '预警', name: '预警', value: modules.filter((m) => m.status === '预警').length },
  ];

  // 问答页元信息（按模块）
  const chatMeta =
    aiModule === 'hr'
      ? {
          title: '人事 · HR AI 助手',
          desc: '我已接入 DeepSeek 大模型，可解答招聘、考勤、绩效、薪酬、培训、员工关系等人事问题。试试问我：',
          questions: hrSuggestedQuestions,
          placeholder: '问人事AI助手任何 HR 问题...',
          avatar: '人',
          loading: '人事AI助手正在分析...',
          engine: 'DeepSeek · deepseek-chat',
        }
      : {
          title: '财枢 · 财务AI助手',
          desc: '我可以帮您分析经营数据、监控风险指标、解答财务问题。试试问我：',
          questions: financeSuggestedQuestions,
          placeholder: '问财枢任何财务问题...',
          avatar: '财',
          loading: '财枢正在分析数据...',
          engine: '',
        };

  return (
    <>
      <Sheet open={aiPanelOpen} onOpenChange={setAiPanelOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[480px] p-0">
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[--primary]" />
              AI 智能中心
              <span className="text-xs font-normal text-muted-foreground">
                {modules.length} 个模块智能分析
              </span>
            </SheetTitle>
            {/* 财务 / 人事 模块切换 */}
            <div className="flex gap-1 mt-2 p-1 rounded-lg bg-muted">
              <button
                onClick={() => setAiModule('finance')}
                className={cn(
                  'flex-1 text-xs font-medium rounded-md py-1.5 transition-colors',
                  aiModule === 'finance'
                    ? 'bg-[--primary] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                财务
              </button>
              <button
                onClick={() => setAiModule('hr')}
                className={cn(
                  'flex-1 text-xs font-medium rounded-md py-1.5 transition-colors',
                  aiModule === 'hr'
                    ? 'bg-[--primary] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                人事（HR）
              </button>
            </div>
          </SheetHeader>

          <Tabs value={aiPanelTab} onValueChange={(v) => setAiPanelTab(v as 'diagnosis' | 'chat')} className="h-[calc(100vh-101px)] flex flex-col">
            <TabsList className="mx-4 mt-2 grid grid-cols-2">
              <TabsTrigger value="diagnosis">AI 诊断</TabsTrigger>
              <TabsTrigger value="chat">智能问答</TabsTrigger>
            </TabsList>

            {/* Diagnosis tab */}
            <TabsContent value="diagnosis" className="flex-1 px-4 overflow-auto">
              <div className="flex gap-2 py-3 flex-wrap">
                <Badge variant="outline">已分析 {modules.length}</Badge>
                <Badge className="bg-success/10 text-success border-success/20">健康 {statusSummary[0].value}</Badge>
                <Badge className="bg-warning/10 text-warning border-warning/20">关注 {statusSummary[1].value}</Badge>
                <Badge className="bg-danger/10 text-danger border-danger/20">预警 {statusSummary[2].value}</Badge>
              </div>

              {/* 诊断概览图表 */}
              <div className="border rounded-lg p-3 elevation-1 bg-card">
                <div className="text-xs font-medium text-foreground mb-2">诊断概览</div>
                <div className="relative h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusSummary}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={48}
                        outerRadius={66}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {statusSummary.map((s) => (
                          <Cell key={s.key} fill={statusColors[s.key]} />
                        ))}
                      </Pie>
                      <Tooltip content={<DiagnosisTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-foreground tabular-nums leading-none">
                      {modules.length}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">个模块</span>
                  </div>
                </div>
                <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 mt-2">
                  {statusSummary.map((s) => (
                    <div key={s.key} className="flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: statusColors[s.key] }}
                      />
                      <span className="text-[11px] text-muted-foreground">
                        {s.name} {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {modules.map((mod) => {
                  const ModuleIcon = moduleIcons[mod.module] ?? Sparkles;
                  return (
                  <div key={mod.module} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                          statusIconClass(mod.status)
                        )}
                        aria-label={`${mod.module} 状态：${mod.status}`}
                      >
                        <ModuleIcon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium flex-1 truncate">{mod.module}</span>
                      <Badge className={cn(
                        'text-[10px] shrink-0',
                        mod.status === '健康' && 'bg-success/10 text-success',
                        mod.status === '需关注' && 'bg-warning/10 text-warning',
                        mod.status === '预警' && 'bg-danger/10 text-danger',
                      )}>
                        {mod.status}
                      </Badge>
                    </div>
                    <div className="space-y-1.5 mt-2">
                      <p className="text-xs text-muted-foreground">{mod.conclusion}</p>
                      <div className="text-xs text-muted-foreground">
                        {mod.analysisCount}项分析 · 发现{mod.warningCount}项预警
                      </div>
                      <ul className="space-y-0.5 pt-1">
                        {mod.findings.map((f, i) => (
                          <li key={i} className={cn(
                            'text-xs',
                            f.startsWith('!') ? 'text-danger' : 'text-success'
                          )}>{f}</li>
                        ))}
                      </ul>
                      <button className="text-xs text-[--primary] font-medium mt-1">
                        查看详细诊断 →
                      </button>
                    </div>
                  </div>
                  );
                })}
                <p className="text-xs text-muted-foreground italic pb-4">
                  以上诊断基于当前模拟数据与规则分析；财务诊断由财枢规则引擎生成，人事诊断由 HR AI 助手基于人事数据生成。
                </p>
              </div>
            </TabsContent>

            {/* Chat tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 py-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{chatMeta.title}</h3>
                  {chatMeta.engine && (
                    <Badge variant="outline" className="text-[10px] text-[--chart-1] border-[--chart-1]/30">
                      {chatMeta.engine}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {chatMeta.desc}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {chatMeta.questions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(q); }}
                      className="text-[11px] px-2 py-1 rounded-full border bg-muted/50 hover:bg-accent transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* History header */}
              <div className="flex items-center justify-between px-4 py-1 border-t">
                <span className="text-xs text-muted-foreground">
                  历史记录 · {history.length} 条回复
                </span>
                {history.length > 0 && (
                  <Button
                    variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground"
                    onClick={() => setShowClearConfirm(true)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    清空全部
                  </Button>
                )}
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 px-4" ref={scrollRef}>
                <div className="space-y-3 py-3">
                  {history.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      暂无对话记录，试试上面的问题开始对话
                    </p>
                  )}
                  {history.map(msg => (
                    <div key={msg.id} className={cn(
                      'flex gap-2',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}>
                      {msg.role === 'ai' && (
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[--primary] text-white flex items-center justify-center text-[10px] font-bold">
                          {chatMeta.avatar}
                        </span>
                      )}
                      <div className={cn(
                        'max-w-[80%] rounded-lg p-2.5 text-sm whitespace-pre-wrap',
                        msg.role === 'user'
                          ? 'bg-[--primary] text-white'
                          : 'bg-muted text-foreground'
                      )}>
                        {msg.content}
                      </div>
                      {msg.role === 'user' && (
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted-foreground text-white flex items-center justify-center text-[10px]">我</span>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-2 justify-start">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[--primary] text-white flex items-center justify-center text-[10px] font-bold">
                        {chatMeta.avatar}
                      </span>
                      <div className="bg-muted rounded-lg p-2.5 text-sm text-muted-foreground">
                        {chatMeta.loading}
                        <span className="animate-pulse">...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t p-3 flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={chatMeta.placeholder}
                  className="text-sm h-9"
                />
                <Button size="icon" className="h-9 w-9" onClick={handleSend} disabled={!input.trim() || isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要清空当前模块的聊天记录吗？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作不可恢复（仅清空「{aiModule === 'hr' ? '人事' : '财务'}」模块记录）。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleClear}>确定清空</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
