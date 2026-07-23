'use client';

import { useCallback, useRef } from 'react';

/**
 * RippleContainer — Material Design 涟漪动效容器
 * 自定义组件原因：shadcn/ui 无此能力（CLAUDE.md §允许自定义组件）
 */
export function RippleContainer({
  children,
  className,
  disabled = false,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const container = containerRef.current;
    if (!container) return;

    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';

    const rect = container.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

    container.appendChild(ripple);

    ripple.addEventListener('animationend', () => {
      ripple.remove();
    });
  }, [disabled]);

  return (
    <div
      ref={containerRef}
      className={`ripple-container ${className || ''}`}
      onPointerDown={handlePointerDown}
    >
      {children}
    </div>
  );
}
