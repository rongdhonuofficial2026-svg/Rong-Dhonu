import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Link } from '@/lib/i18n/routing'
import { AnimatedCounter } from './AnimatedCounter'

interface MetricTileProps {
  title: string
  value: number
  subtitle?: string
  icon: LucideIcon
  colorTheme: 'gold' | 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'indigo' | 'teal'
  href?: string
  trend?: string
  trendPositive?: boolean
}

const THEMES = {
  gold:    { text: 'text-accent',       bg: 'bg-accent/10',      glow: 'group-hover:shadow-[0_0_24px_rgba(200,169,106,0.25)]' },
  emerald: { text: 'text-emerald-500',  bg: 'bg-emerald-500/10', glow: 'group-hover:shadow-[0_0_24px_rgba(16,185,129,0.2)]' },
  blue:    { text: 'text-blue-400',     bg: 'bg-blue-500/10',    glow: 'group-hover:shadow-[0_0_24px_rgba(59,130,246,0.2)]' },
  purple:  { text: 'text-purple-400',   bg: 'bg-purple-500/10',  glow: 'group-hover:shadow-[0_0_24px_rgba(168,85,247,0.2)]' },
  amber:   { text: 'text-amber-400',    bg: 'bg-amber-500/10',   glow: 'group-hover:shadow-[0_0_24px_rgba(245,158,11,0.2)]' },
  rose:    { text: 'text-rose-400',     bg: 'bg-rose-500/10',    glow: 'group-hover:shadow-[0_0_24px_rgba(244,63,94,0.2)]' },
  indigo:  { text: 'text-indigo-400',   bg: 'bg-indigo-500/10',  glow: 'group-hover:shadow-[0_0_24px_rgba(99,102,241,0.2)]' },
  teal:    { text: 'text-teal-400',     bg: 'bg-teal-500/10',    glow: 'group-hover:shadow-[0_0_24px_rgba(20,184,166,0.2)]' },
}

export function MetricTile({ title, value, subtitle, icon: Icon, colorTheme, href, trend, trendPositive }: MetricTileProps) {
  const theme = THEMES[colorTheme]

  const card = (
    <div className={cn(
      'group relative flex flex-col p-5 rounded-2xl border transition-all duration-500 cursor-default',
      'bg-white/40 dark:bg-black/40 backdrop-blur-2xl',
      'border-white/40 dark:border-white/10',
      'hover:-translate-y-1 hover:border-white/60 dark:hover:border-white/20',
      theme.glow,
      href && 'cursor-pointer'
    )}>
      {/* Icon */}
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110', theme.bg, theme.text)}>
        <Icon className="w-5 h-5 stroke-[1.5]" />
      </div>

      {/* Value */}
      <div className="font-serif text-4xl font-bold text-foreground tabular-nums leading-none mb-1">
        <AnimatedCounter target={value} />
      </div>

      {/* Title */}
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">{title}</p>

      {/* Subtitle or trend */}
      {(subtitle || trend) && (
        <p className={cn('text-xs mt-2 font-medium', trendPositive !== undefined ? (trendPositive ? 'text-emerald-500' : 'text-rose-400') : 'text-muted-foreground/60')}>
          {trend || subtitle}
        </p>
      )}

      {/* Hover glow border accent */}
      <div className={cn('absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none',
        'ring-1 ring-inset', theme.text.replace('text-', 'ring-').replace('400', '500/20').replace('500', '500/20')
      )} />
    </div>
  )

  if (href) {
    return <Link href={href as any}>{card}</Link>
  }
  return card
}
