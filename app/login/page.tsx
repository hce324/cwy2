'use client';

import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DEMO_ACCOUNTS = [
  { username: 'huangyy', label: '财务负责人', sub: '全部模块权限' },
  { username: 'liuzw', label: '财务专员', sub: '核算操作权限' },
  { username: 'lina', label: '出纳', sub: '资金相关权限' },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('请输入用户名');
      return;
    }

    setLoading(true);

    try {
      const result = await signIn('credentials', {
        username: username.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error === 'CredentialsSignin'
          ? '用户名不存在或密码错误'
          : '登录失败，请重试');
        return;
      }

      if (result?.ok) {
        router.push('/');
      } else {
        toast.error('登录失败，请重试');
      }
    } catch {
      toast.error('网络错误，请检查连接后重试');
    } finally {
      setLoading(false);
    }
  }

  function fillAccount(accountUsername: string) {
    setUsername(accountUsername);
    setPassword('');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card
        className={cn(
          'w-full max-w-sm',
          'elevation-3',
        )}
      >
        <CardHeader className="text-center">
          <div
            className={cn(
              'text-2xl font-heading font-bold text-[--primary]',
              'mb-1',
            )}
          >
            财务云
          </div>
          <CardTitle className="text-xl">登录</CardTitle>
          <CardDescription>
            请输入您的账号信息以继续
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[--primary] text-[--primary-foreground]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  登录中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  登录
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 border-t pt-4">
            <p className="text-center text-xs font-medium text-muted-foreground mb-3">
              演示账号（密码任意）
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.username}
                  type="button"
                  onClick={() => fillAccount(account.username)}
                  disabled={loading}
                  className={cn(
                    'flex flex-col items-center gap-0.5 rounded-md border px-2 py-2',
                    'text-xs transition-colors',
                    'hover:bg-[--accent] hover:border-[--primary]/30',
                    'focus:outline-none focus:ring-2 focus:ring-[--ring] focus:ring-offset-1',
                    'disabled:pointer-events-none disabled:opacity-50',
                    'ripple-container',
                  )}
                >
                  <span className="font-medium text-[--primary]">
                    {account.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-tight">
                    {account.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
