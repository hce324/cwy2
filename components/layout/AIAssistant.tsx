'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Bot, Sparkles, Send, Trash2, X, ChevronRight, MessageCircle
} from 'lucide-react';
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

const aiModules = [
  {
    module: '资金管理',
    status: '需关注' as const,
    conclusion: '现金流整体健康，但7月18日存在短期缺口需提前安排。',
    analysisCount: 4, warningCount: 0,
    findings: ['✓ 经营现金流占比62.8%', '! 7月18日预计资金缺口¥420,000'],
  },
  {
    module: '应收管理',
    status: '需关注' as const,
    conclusion: '逾期占比较高，2位客户超15天，回款压力集中在王思雨名下。',
    analysisCount: 4, warningCount: 2,
    findings: ['! 逾期占比58%，超行业警戒线', '! 华东优选商贸逾期32天·¥680,000'],
  },
  {
    module: '应付与付款',
    status: '健康' as const,
    conclusion: '偿付能力整体充足，但资产负债率偏高需中期关注。',
    analysisCount: 4, warningCount: 0,
    findings: ['✓ 速动比率1.28 · 流动比率1.82', '! 资产负债率52.3%接近警戒线'],
  },
  {
    module: '产销管理',
    status: '预警' as const,
    conclusion: '整体产销匹配率达标，但达播亏损、低效SKU、供应延迟及库存积压形成4类经营风险。',
    analysisCount: 7, warningCount: 3,
    findings: ['✓ 整体产销匹配率96.4%·达到目标', '! 夏季个护系列产销率仅83.1%'],
  },
  {
    module: '预算执行',
    status: '需关注' as const,
    conclusion: '执行率整体正常，但信息技术费用环比大幅增长需关注。',
    analysisCount: 4, warningCount: 1,
    findings: ['✓ 总体执行率56.6%', '! 信息技术费用环比增长31.8%'],
  },
  {
    module: '风险与异常',
    status: '预警' as const,
    conclusion: '当前13项待处理异常，其中6项高风险；经营风险已成为本期新增重点。',
    analysisCount: 7, warningCount: 2,
    findings: ['! 达人D亏损与低效SKU需立即止损', '! 夏季个护产销差额¥37.8万'],
  },
];

const suggestedQuestions = [
  '上个月哪个模块花钱最多？',
  '现金流还安全吗？',
  '应收账款有没有风险？',
  '帮我做个本季度经营小结',
];

const aiPersona = `你是企业老板专属的财务驾驶舱 AI 助手，名为「财枢」。
你的核心使命：把冰冷的财务数据转化为老板听得懂、用得上的经营洞察。
【角色定位】你不是会计，不是审计，你是站在老板视角的战略级财务翻译官。
【回答规则】
1. 结论先行：一句话说清楚核心结论，再用数据支撑，最后给经营建议
2. 金额默认用万元，大数自动换算（如 1,268.04万 而非 12680400）
3. 涉及同比/环比时标注对比基期
4. 多个数值对比用表格，单指标趋势用文字
5. 预警用标记：🔴紧急 🟡关注 🟢正常
6. 数据缺失时明确说
7. 永远不说"经过综合分析""建议酌情考虑"等空话
常用口径：赚了多少钱、花了多少钱、手里还有多少钱 = 营业利润/期间费用/货币资金`;

export function AIAssistantFAB() {
  const { aiPanelOpen, setAiPanelOpen } = useAppStore();

  return (
    <button
      onClick={() => setAiPanelOpen(!aiPanelOpen)}
      className={cn(
        'fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5',
        'bg-[--primary] text-white rounded-full shadow-lg hover:opacity-90',
        'transition-all elevation-3 ripple-container',
        aiPanelOpen && 'opacity-0 pointer-events-none'
      )}
      aria-label="AI助手"
    >
      <Bot className="h-5 w-5" />
      <span className="text-sm font-medium">AI助手</span>
      <Badge className="bg-white text-[--primary] h-5 min-w-5 px-1 text-[10px]">
        6
      </Badge>
    </button>
  );
}

export function AIAssistantPanel() {
  const {
    aiPanelOpen, setAiPanelOpen, aiPanelTab, setAiPanelTab,
    chatHistory, addChatMessage, clearChatHistory
  } = useAppStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleSend = () => {
    const msg = input.trim();
    if (!msg) return;
    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: msg,
      timestamp: Date.now(),
    };
    addChatMessage(userMsg);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
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
      addChatMessage({
        id: `msg-${Date.now()}`,
        role: 'ai',
        content: response,
        timestamp: Date.now(),
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleClear = () => {
    clearChatHistory();
    setShowClearConfirm(false);
  };

  return (
    <>
      <Sheet open={aiPanelOpen} onOpenChange={setAiPanelOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[480px] p-0">
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[--primary]" />
              AI 诊断中心
              <span className="text-xs font-normal text-muted-foreground">
                6 个模块智能分析
              </span>
            </SheetTitle>
          </SheetHeader>

          <Tabs value={aiPanelTab} onValueChange={(v) => setAiPanelTab(v as 'diagnosis' | 'chat')} className="h-[calc(100vh-57px)] flex flex-col">
            <TabsList className="mx-4 mt-2 grid grid-cols-2">
              <TabsTrigger value="diagnosis">AI 诊断</TabsTrigger>
              <TabsTrigger value="chat">财枢问答</TabsTrigger>
            </TabsList>

            {/* Diagnosis tab */}
            <TabsContent value="diagnosis" className="flex-1 px-4 overflow-auto">
              <div className="flex gap-2 py-3 flex-wrap">
                <Badge variant="outline">已分析 6</Badge>
                <Badge className="bg-success/10 text-success border-success/20">健康 1</Badge>
                <Badge className="bg-warning/10 text-warning border-warning/20">关注 3</Badge>
                <Badge className="bg-danger/10 text-danger border-danger/20">预警 2</Badge>
              </div>

              <div className="space-y-3">
                {aiModules.map((mod) => (
                  <div key={mod.module} className="border rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{mod.module}</span>
                      <Badge className={cn(
                        'text-[10px]',
                        mod.status === '健康' && 'bg-success/10 text-success',
                        mod.status === '需关注' && 'bg-warning/10 text-warning',
                        mod.status === '预警' && 'bg-danger/10 text-danger',
                      )}>
                        {mod.status}
                      </Badge>
                    </div>
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
                ))}
                <p className="text-xs text-muted-foreground italic pb-4">
                  以上诊断基于当前模拟数据与规则分析，实际系统将结合历史趋势与AI模型给出更精确结论。
                </p>
              </div>
            </TabsContent>

            {/* Chat tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 py-2">
                <h3 className="text-sm font-semibold">财枢 · 财务AI助手</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  我可以帮您分析经营数据、监控风险指标、解答财务问题。试试问我：
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {suggestedQuestions.map((q, i) => (
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
                  历史记录 · {chatHistory.length} 条回复
                </span>
                {chatHistory.length > 0 && (
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
                  {chatHistory.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      暂无对话记录，试试上面的问题开始对话
                    </p>
                  )}
                  {chatHistory.map(msg => (
                    <div key={msg.id} className={cn(
                      'flex gap-2',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}>
                      {msg.role === 'ai' && (
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[--primary] text-white flex items-center justify-center text-[10px] font-bold">财</span>
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
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[--primary] text-white flex items-center justify-center text-[10px] font-bold">财</span>
                      <div className="bg-muted rounded-lg p-2.5 text-sm text-muted-foreground">
                        财枢正在分析数据...
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
                  placeholder="问财枢任何财务问题..."
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
            <AlertDialogTitle>确定要清空全部聊天记录吗？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作不可恢复。
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
