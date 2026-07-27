import { cn } from '@/lib/utils';
import { AlertTriangle, Info } from 'lucide-react';

function Alert({
  variant = 'default',
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  variant?: 'default' | 'destructive';
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 text-sm',
        variant === 'destructive' &&
          'border-[--danger-border] bg-[--danger-surface] text-[--danger]',
        variant === 'default' && 'border-border bg-muted text-foreground',
        className,
      )}
      {...props}
    >
      {variant === 'destructive' ? (
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
      ) : (
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'h5'>) {
  return (
    <h5
      className={cn('font-medium leading-none tracking-tight mb-1', className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div className={cn('text-sm opacity-90', className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };
