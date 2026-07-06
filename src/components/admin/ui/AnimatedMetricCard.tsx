'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GlassPanel } from './GlassPanel';
import { LucideIcon } from 'lucide-react';

interface AnimatedMetricCardProps extends Omit<HTMLMotionProps<"div">, "title"> {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  colorTheme?: 'gold' | 'emerald' | 'blue' | 'purple';
}

export function AnimatedMetricCard({
  className,
  title,
  value,
  trend,
  icon: Icon,
  colorTheme = 'gold',
  ...props
}: AnimatedMetricCardProps) {
  
  const themeStyles = {
    gold: {
      text: 'text-accent',
      bg: 'bg-accent/10',
      shadow: 'group-hover:shadow-[0_0_20px_rgba(200,169,106,0.2)]'
    },
    emerald: {
      text: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      shadow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'
    },
    blue: {
      text: 'text-blue-500',
      bg: 'bg-blue-500/10',
      shadow: 'group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]'
    },
    purple: {
      text: 'text-purple-500',
      bg: 'bg-purple-500/10',
      shadow: 'group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]'
    }
  };

  return (
    <GlassPanel
      intensity="medium"
      className={cn("p-6 flex flex-col group overflow-visible transition-all duration-500", themeStyles[colorTheme].shadow, className)}
      whileHover={{ y: -5, scale: 1.02 }}
      {...props}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-2xl transition-all duration-500 group-hover:scale-110", themeStyles[colorTheme].bg, themeStyles[colorTheme].text)}>
          <Icon className="w-5 h-5 stroke-[1.5]" />
        </div>
        {trend && (
          <div className={cn("px-2.5 py-1 rounded-full text-xs font-medium border glass", 
            trend.isPositive ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'text-rose-600 dark:text-rose-400 border-rose-500/20'
          )}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">{title}</h4>
        <div className="flex items-baseline gap-2">
          <motion.p 
            className="text-4xl font-serif font-bold text-foreground"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
          >
            {value}
          </motion.p>
        </div>
      </div>
    </GlassPanel>
  );
}
