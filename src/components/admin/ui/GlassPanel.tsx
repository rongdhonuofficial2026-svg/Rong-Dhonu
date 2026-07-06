'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassPanelProps extends HTMLMotionProps<"div"> {
  intensity?: 'light' | 'medium' | 'heavy';
  borderGlow?: boolean;
  children?: React.ReactNode;
}

export function GlassPanel({
  className,
  intensity = 'medium',
  borderGlow = false,
  children,
  ...props
}: GlassPanelProps) {
  const intensityClasses = {
    light: 'bg-white/20 dark:bg-black/20 backdrop-blur-md',
    medium: 'bg-white/40 dark:bg-black/40 backdrop-blur-2xl',
    heavy: 'bg-white/70 dark:bg-black/60 backdrop-blur-3xl'
  };

  return (
    <motion.div
      className={cn(
        'relative rounded-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden',
        intensityClasses[intensity],
        borderGlow && 'glow-border',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {/* Subtle organic noise overlay for realism */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }} 
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
