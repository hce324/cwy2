import { NextRequest, NextResponse } from 'next/server';
import { HR_AI_SYSTEM_PROMPT } from '@/lib/hrAiPrompt';

// 服务端代理调用 DeepSeek，API Key 仅保留在环境变量，不进入客户端代码。
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body?.messages;
    const mode: string = body?.mode === 'hr' ? 'hr' : 'finance';

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages 不能为空' }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: '未配置 DEEPSEEK_API_KEY，请在 .env.local 中设置后重启服务。' },
        { status: 500 }
      );
    }

    // 人事模块使用 HR 智能助手提示词；财务模块由前端模拟，不在此调用。
    const systemPrompt = mode === 'hr' ? HR_AI_SYSTEM_PROMPT : '';
    const payloadMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    const resp = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: payloadMessages,
        temperature: 0.7,
        max_tokens: 1200,
        stream: false,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { error: `DeepSeek 调用失败（${resp.status}）：${text.slice(0, 300)}` },
        { status: 502 }
      );
    }

    const data = await resp.json();
    const content: string = data?.choices?.[0]?.message?.content ?? '';
    return NextResponse.json({ content });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '未知错误';
    return NextResponse.json({ error: `服务异常：${msg}` }, { status: 500 });
  }
}
