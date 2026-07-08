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
  gold:    { text: 'text-[#C9A227]',       bg: 'bg-[#C9A227]/10',      glow: 'group-hover:shadow-[0_0_30px_rgba(201,162,39,0.18)]' },
  emerald: { text: 'text-emerald-400',  bg: 'bg-emerald-500/10', glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]' },
  blue:    { text: 'text-blue-400',     bg: 'bg-blue-500/10',    glow: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]' },
  purple:  { text: 'text-purple-400',   bg: 'bg-purple-500/10',  glow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]' },
  amber:   { text: 'text-amber-400',    bg: 'bg-amber-500/10',   glow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]' },
  rose:    { text: 'text-rose-400',     bg: 'bg-rose-500/10',    glow: 'group-hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]' },
  indigo:  { text: 'text-indigo-400',   bg: 'bg-indigo-500/10',  glow: 'group-hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]' },
  teal:    { text: 'text-teal-400',     bg: 'bg-teal-500/10',    glow: 'group-hover:shadow-[0_0_30px_rgba(20,184,166,0.15)]' },
}

export function MetricTile({ title, value, subtitle, icon: Icon, colorTheme, href, trend, trendPositive }: MetricTileProps) {
  const theme = THEMES[colorTheme]

  const card = (
    <div className={cn(
      'group relative flex flex-col p-6 rounded-[20px] border transition-all duration-300 ease-out cursor-default',
      'bg-[#171717]/90 border-white/[0.08] shadow-lg shadow-black/25',
      'hover:-translate-y-1 hover:border-white/[0.16] hover:shadow-2xl hover:shadow-black/40',
      'focus-within:ring-2 focus-within:ring-[#C9A227]/40 focus-within:outline-none',
      theme.glow,
      href && 'cursor-pointer active:scale-[0.98]'
    )}>
      {/* Header Row: Title & Icon */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-semibold text-white/50 uppercase tracking-widest leading-none">{title}</p>
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-md', theme.bg, theme.text)}>
          <Icon className="w-4.5 h-4.5 stroke-[1.8]" />
        </div>
      </div>

      {/* Value */}
      <div className="font-serif text-4xl md:text-5xl font-bold text-white tabular-nums leading-none tracking-tight mb-2 select-all">
        <AnimatedCounter target={value} />
      </div>

      {/* Spacer */}
      <div className="flex-grow" />

      {/* Subtitle or trend */}
      {(subtitle || trend) && (
        <div className="flex items-center gap-1.5 mt-2 border-t border-white/[0.04] pt-2.5">
          <p className={cn('text-xs font-medium', 
            trendPositive !== undefined 
              ? (trendPositive ? 'text-emerald-400' : 'text-rose-400') 
              : 'text-white/60'
          )}>
            {trend || subtitle}
          </p>
        </div>
      )}

      {/* Hover glow border accent */}
      <div className={cn('absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none',
        'ring-1 ring-inset', theme.text.replace('text-', 'ring-').replace('400', '500/20').replace('500', '500/20').replace('[#C9A227]', 'accent/20')
      )} />
    </div>
  )

  if (href) {
    return (
      <Link href={href as any} className="focus:outline-none rounded-[20px]">
        {card}
      </Link>
    )
  }
  return card
}
