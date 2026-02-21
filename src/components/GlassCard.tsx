'use client';

import { cn } from '@/lib/utils';
import { ReactNode, KeyboardEvent } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  gradient?: boolean;
  onClick?: () => void;
  role?: string;
  'aria-label'?: string;
  tabIndex?: number;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
}

export function GlassCard({ 
  children, 
  className, 
  glow = false, 
  gradient = false, 
  onClick,
  role,
  'aria-label': ariaLabel,
  tabIndex,
  onKeyDown,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-6 transition-all duration-300',
        glow && 'glow-orange',
        gradient && 'gradient-border',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={role}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
}
