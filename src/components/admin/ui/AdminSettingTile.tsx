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
        'admin-setting-tile flex items-start justify-between gap-4 rounded-2xl border p-4 transition-colors duration-200',
        'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]',
        active && 'border-[#C9A227]/25 bg-[#C9A227]/5',
        className
      )}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {icon && (
          <div className="admin-setting-tile-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/5">
            {icon}
          </div>
        )}
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold leading-snug text-foreground">{title}</p>
          {description && (
            <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children && <div className="shrink-0 self-center">{children}</div>}
    </div>
  )
}
