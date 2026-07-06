'use client';

import * as React from "react";
import { Search, Bell, Command, User, Palette } from "lucide-react";
import { GlassPanel } from "./ui/GlassPanel";
import { PremiumButton } from "./ui/PremiumButton";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function TopNavigation() {
  const { theme, setTheme } = useTheme();
  
  return (
    <GlassPanel intensity="medium" className="h-16 px-6 flex items-center justify-between sticky top-6 z-40 rounded-full mx-6 mb-6">
      
      {/* Global Search / Command Palette Trigger */}
      <div className="flex-1 max-w-md">
        <button className="flex items-center gap-3 w-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground px-4 py-2 rounded-full transition-all border border-border/50">
          <Search className="w-4 h-4" />
          <span className="text-sm font-medium">Search artworks, artists, exhibitions...</span>
          <div className="ml-auto flex items-center gap-1 text-xs opacity-60 font-mono">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Quick Actions & Profile */}
      <div className="flex items-center gap-3 ml-auto">
        <PremiumButton 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Palette className="w-5 h-5" />
        </PremiumButton>
        
        <PremiumButton variant="ghost" size="icon" className="rounded-full relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
        </PremiumButton>
        
        <div className="h-8 w-px bg-border/50 mx-2" />
        
        <PremiumButton variant="ghost" className="rounded-full pl-2 pr-4 py-1.5 h-auto">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mr-3 border border-accent/30 text-accent font-serif font-bold">
            A
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium leading-none">Admin</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Curator</span>
          </div>
        </PremiumButton>
      </div>
    </GlassPanel>
  );
}
