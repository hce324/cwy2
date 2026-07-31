'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc-client';
import {
  Sparkles, Send, Trash2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
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

const suggestedQuestions = [
  '这个月赚了多少钱？收入同比怎么样？',
  '净利润和净利率表现如何？',
  '现金流够用吗？有没有缺口？',
  '毛利率跑赢基准了吗？',
];

export function AIAssistantFAB() {
  const { aiPanelOpen, setAiPanelOpen } = useAppStore();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: -1, y: -1 }); // -1 = use CSS default
  const dragRef = useRef({ startX: 0, startY: 0, posX: 0, posY: 0, moved: false });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: pos.x === -1 ? r.left : pos.x,
      posY: pos.y === -1 ? r.top : pos.y,
      moved: false,
    };
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
      if (!dragRef.current.moved) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const newX = Math.max(0, Math.min(vw - 56, dragRef.current.posX + dx));
      const newY = Math.max(0, Math.min(vh - 56, dragRef.current.posY + dy));
      setPos({ x: newX, y: newY });
    };
    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      if (!dragRef.current.moved) setAiPanelOpen(!aiPanelOpen);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }, [aiPanelOpen, setAiPanelOpen, pos.x, pos.y]);

  const style: React.CSSProperties = { position: 'fixed', zIndex: 9999 };
  if (pos.x === -1) {
    // CSS defaults
    style.bottom = 24;
    style.right = 24;
  } else {
    style.left = pos.x;
    style.top = pos.y;
  }

  return (
    <button
      ref={btnRef}
      onPointerDown={onPointerDown}
      className={cn(
        'fixed w-14 h-14 rounded-full',
        'bg-primary text-white shadow-lg',
        'flex items-center justify-center',
        'hover:opacity-90 active:scale-95',
        'transition-transform duration-200 elevation-3 ripple-container',
        'cursor-grab active:cursor-grabbing'
      )}
      aria-label="AI助手"
      style={style}
    >
      <Sparkles className="h-6 w-6 text-white" />
    </button>
  );
}

export function AIAssistantPanel() {
  const {
    aiPanelOpen, setAiPanelOpen, aiPanelTab, setAiPanelTab,
    chatHistory, addChatMessage, clearChatHistory
  } = useAppStore();
  const [input, setInput] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      addChatMessage({
        id: `msg-${Date.now()}`,
        role: 'ai',
        content: data.content,
        timestamp: Date.now(),
      });
    },
    onError: (err) => {
      addChatMessage({
        id: `msg-${Date.now()}`,
        role: 'ai',
        content: `⚠️ 出错了：${err.message}`,
        timestamp: Date.now(),
      });
    },
  });

  const isLoading = chatMutation.isPending;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || isLoading) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: msg,
      timestamp: Date.now(),
    };
    addChatMessage(userMsg);
    setInput('');

    // Build history: recent 20 messages before the current one
    const recentHistory = chatHistory.slice(-20).map((h) => ({
      role: h.role,
      content: h.content,
    }));

    chatMutation.mutate({ message: msg, history: recentHistory });
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
              AI 助手
              <span className="text-xs font-normal text-muted-foreground">
                财务总览
              </span>
            </SheetTitle>
          </SheetHeader>

          <Tabs value={aiPanelTab} onValueChange={(v) => setAiPanelTab(v as 'diagnosis' | 'chat')} className="h-[calc(100vh-57px)] flex flex-col">
            <TabsList className="mx-4 mt-2 grid grid-cols-2">
              <TabsTrigger value="diagnosis">AI 诊断</TabsTrigger>
              <TabsTrigger value="chat">AI 财务问答</TabsTrigger>
            </TabsList>

            {/* Diagnosis tab — placeholder */}
            <TabsContent value="diagnosis" className="flex-1 px-4 overflow-auto flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">即将上线 · 财务总览智能诊断</p>
                <p className="text-xs mt-1">基于真实财务数据自动生成诊断报告，敬请期待。</p>
              </div>
            </TabsContent>

            {/* Chat tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 py-2">
                <h3 className="text-sm font-semibold">AI 助手</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  基于当前财务总览数据，可以问我收入、利润、现金流、毛利率等问题：
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
                  对话记录 · {chatHistory.length} 条
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
              <ScrollArea className="flex-1 px-4">
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
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[--primary] text-primary-foreground flex items-center justify-center text-[10px] font-bold">AI</span>
                      )}
                      <div className={cn(
                        'max-w-[80%] rounded-lg p-2.5 text-sm',
                        msg.role === 'user'
                          ? 'bg-[--primary] text-primary-foreground whitespace-pre-wrap'
                          : 'bg-muted text-foreground prose prose-sm dark:prose-invert max-w-none'
                      )}>
                        {msg.role === 'ai' ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        ) : (
                          msg.content
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted-foreground text-foreground flex items-center justify-center text-[10px]">我</span>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-2 justify-start">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[--primary] text-primary-foreground flex items-center justify-center text-[10px] font-bold">AI</span>
                      <div className="bg-muted rounded-lg p-2.5 text-sm text-muted-foreground">
                        AI 正在分析数据，请稍候...
                        <span className="animate-pulse">...</span>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={bottomRef} />
              </ScrollArea>

              {/* Input */}
              <div className="border-t p-3 flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="试试问经营、现金流、应收..."
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
