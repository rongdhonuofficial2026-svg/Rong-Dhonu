'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GlassPanel } from './GlassPanel';

interface LuxuryCardProps extends Omit<HTMLMotionProps<"div">, "title" | "children"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  borderGlow?: boolean;
  withNoise?: boolean;
  children?: React.ReactNode;
}

export function LuxuryCard({
  className,
  title,
  description,
  action,
  footer,
  children,
  padding = 'md',
  borderGlow = true,
  ...props
}: LuxuryCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6 sm:p-8',
    lg: 'p-8 sm:p-12'
  };

  return (
    <GlassPanel 
      intensity="medium"
      borderGlow={borderGlow}
      className={cn("flex flex-col h-full group", className)}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      {...props}
    >
      {(title || description || action) && (
        <div className={cn("flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/40 dark:border-white/10", paddingClasses[padding])}>
          <div className="space-y-1.5">
            {title && (
              <h3 className="font-serif text-2xl tracking-tight text-foreground group-hover:text-gradient-gold transition-all duration-500">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground/80">
                {description}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      
      <div className={cn("flex-1", paddingClasses[padding])}>
        {children}
      </div>

      {footer && (
        <div className={cn("mt-auto border-t border-border/40 dark:border-white/10 bg-muted/20 dark:bg-black/20", paddingClasses.sm)}>
          {footer}
        </div>
      )}
    </GlassPanel>
  );
}
