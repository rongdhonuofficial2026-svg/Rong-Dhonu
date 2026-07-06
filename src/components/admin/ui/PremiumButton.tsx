'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Slot } from '@radix-ui/react-slot';

export interface PremiumButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: 'primary' | 'secondary' | 'glass' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

export const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, asChild = false, children, disabled, ...props }, ref) => {
    
    const baseStyles = "relative inline-flex items-center justify-center overflow-hidden font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 group";
    
    const variants = {
      primary: "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg dark:bg-accent dark:text-accent-foreground dark:hover:bg-accent/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      glass: "glass text-foreground hover:bg-white/50 dark:hover:bg-black/50 border border-white/20 dark:border-white/10 hover:shadow-lg",
      ghost: "hover:bg-accent/10 hover:text-accent",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
    };

    const sizes = {
      sm: "h-9 px-4 text-xs rounded-lg",
      md: "h-11 px-6 text-sm rounded-xl",
      lg: "h-14 px-8 text-base rounded-2xl",
      icon: "h-11 w-11 rounded-xl"
    };

    const Comp = asChild ? Slot : "button";
    const MotionComp = motion.create(Comp as any);

    return (
      <MotionComp
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isLoading || disabled}
        {...props as any}
      >
        {/* Subtle hover glow effect */}
        {variant === 'primary' && !asChild && (
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        )}
        
        {asChild ? (
          children
        ) : (
          <>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </MotionComp>
    );
  }
);
PremiumButton.displayName = "PremiumButton";

