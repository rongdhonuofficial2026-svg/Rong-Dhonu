import type { DashboardKPIs } from '@/types/dashboard'
import { Link } from '@/lib/i18n/routing'
import { Users } from 'lucide-react'

interface UserOverviewPanelProps {
  kpis: DashboardKPIs
}

function RoleBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold text-foreground">{count}</span>
      </div>
      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function UserOverviewPanel({ kpis }: UserOverviewPanelProps) {
  const totalUsers = kpis.totalArtists + kpis.totalAdmins

  return (
    <div className="bg-[#171717]/90 border border-white/[0.08] rounded-[20px] p-6 h-full shadow-xl shadow-black/25 hover:border-white/[0.15] transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-white/50" />
          <h2 className="font-serif text-xl font-semibold tracking-tight text-white">User Overview</h2>
        </div>
        <Link href="/admin/users" className="text-xs text-accent hover:text-accent/80 font-medium transition-colors">
          Directory →
        </Link>
      </div>

      {/* Total count */}
      <div className="mb-6 p-5 rounded-xl bg-black/30 border border-white/[0.06] shadow-inner">
        <p className="text-4xl font-serif font-bold text-foreground">{totalUsers}</p>
        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Total Platform Users</p>
        {kpis.newArtistsThisMonth > 0 && (
          <p className="text-xs text-emerald-500 mt-2 font-medium">+{kpis.newArtistsThisMonth} new this month</p>
        )}
      </div>

      {/* Role distribution */}
      <div className="space-y-4">
        <RoleBar
          label="Artists (Members)"
          count={kpis.totalArtists}
          total={totalUsers}
          color="bg-emerald-500"
        />

        <RoleBar
          label="Administrators"
          count={kpis.totalAdmins}
          total={totalUsers}
          color="bg-accent"
        />
      </div>

      {/* Approval rate */}
      {kpis.approvalRate > 0 && (
        <div className="mt-6 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/60">Artwork Approval Rate</span>
            <span className="text-sm font-bold text-accent">{kpis.approvalRate}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C9A227] to-[#e0b83b] rounded-full transition-all duration-700"
              style={{ width: `${kpis.approvalRate}%` }}
            />
          </div>
          <p className="text-[10px] text-white/40 mt-1">
            {kpis.approvedArtworks} approved · {kpis.rejectedArtworks} rejected
          </p>
        </div>
      )}
    </div>
  )
}
