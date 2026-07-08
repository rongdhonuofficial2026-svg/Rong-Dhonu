'use client'

import { useRouter } from '@/lib/i18n/routing'
import { Paintbrush, Eye, UserPlus, Upload, BookOpen, Globe, Users, Calendar, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickAction {
  label: string
  icon: React.ElementType
  href: string
  color: string
  bg: string
}

const ACTIONS: QuickAction[] = [
  { label: 'New Exhibition',   icon: Paintbrush, href: '/admin/exhibitions/new', color: 'text-purple-400', bg: 'bg-purple-500/10 hover:bg-purple-500/20' },
  { label: 'Review Artworks',  icon: Eye,        href: '/admin/artworks',         color: 'text-amber-400',  bg: 'bg-amber-500/10  hover:bg-amber-500/20' },
  { label: 'Upload Gallery',   icon: Upload,     href: '/admin/gallery',           color: 'text-rose-400',   bg: 'bg-rose-500/10   hover:bg-rose-500/20' },
  { label: 'New Catalog',      icon: BookOpen,   href: '/admin/catalogs/new',      color: 'text-teal-400',   bg: 'bg-teal-500/10   hover:bg-teal-500/20' },
  { label: 'Edit Homepage',    icon: Globe,      href: '/admin/cms',               color: 'text-cyan-400',   bg: 'bg-cyan-500/10   hover:bg-cyan-500/20' },
  { label: 'Manage Users',     icon: Users,      href: '/admin/users',             color: 'text-emerald-400',bg: 'bg-emerald-500/10 hover:bg-emerald-500/20' },
  { label: 'Exhibitions',      icon: Calendar,   href: '/admin/exhibitions',       color: 'text-blue-400',   bg: 'bg-blue-500/10   hover:bg-blue-500/20' },
  { label: 'System Logs',      icon: Zap,        href: '/admin',                   color: 'text-accent',     bg: 'bg-accent/10     hover:bg-accent/20' },
]

export function QuickActions() {
  const router = useRouter()

  return (
    <div className="bg-[#171717]/90 border border-white/[0.08] rounded-[20px] p-6 h-full shadow-xl shadow-black/25 hover:border-white/[0.15] transition-all duration-300">
      <h2 className="font-serif text-xl font-semibold tracking-tight text-white mb-6">Quick Actions</h2>
      <div className="grid grid-cols-3 gap-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.label}
              onClick={() => router.push(action.href)}
              aria-label={action.label}
              className={cn(
                'group flex flex-col items-center gap-2 p-3 rounded-xl border border-transparent transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 dark:hover:border-white/10',
                action.bg
              )}
            >
              <div className={cn('w-8 h-8 flex items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110', action.bg.split(' ')[0])}>
                <Icon className={cn('w-4 h-4', action.color)} />
              </div>
              <span className="text-[10px] font-medium text-center text-muted-foreground leading-tight tracking-wide">{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
