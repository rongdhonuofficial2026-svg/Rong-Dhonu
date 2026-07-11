'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface AdminSettingTileProps {
  icon?: React.ReactNode
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
  active?: boolean
}

export function AdminSettingTile({
  icon,
  title,
  description,
  children,
  className,
  active = false,
}: AdminSettingTileProps) {
  return (
    <div
      className={cn(
        'admin-setting-tile flex flex-col sm:flex-row items-start justify-between gap-5 sm:gap-4 rounded-3xl sm:rounded-2xl border p-5 sm:p-4 transition-all duration-300',
        'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]',
        active && 'border-[#C9A227]/30 bg-[#C9A227]/5 shadow-[0_4px_24px_rgba(201,162,39,0.08)] scale-[1.01] sm:scale-100',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-3 flex-1 min-w-0">
        {icon && (
          <div className="admin-setting-tile-icon flex h-12 w-12 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl sm:rounded-xl border border-white/[0.08] bg-white/5 shadow-sm">
            {icon}
          </div>
        )}
        <div className="min-w-0 space-y-1.5 sm:space-y-1">
          <p className="text-base sm:text-sm font-semibold leading-snug text-foreground">{title}</p>
          {description && (
            <p className="text-sm sm:text-xs leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="shrink-0 self-start sm:self-center w-full sm:w-auto flex justify-start sm:justify-end mt-2 sm:mt-0">
          {children}
        </div>
      )}
    </div>
  )
}
