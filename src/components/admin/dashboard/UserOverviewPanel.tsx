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
  const totalUsers = kpis.totalArtists + kpis.totalAdmins + kpis.totalCommitteeUsers

  return (
    <div className="bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-serif text-xl font-semibold tracking-tight">User Overview</h2>
        </div>
        <Link href="/admin/users" className="text-xs text-accent hover:text-accent/80 font-medium transition-colors">
          Directory →
        </Link>
      </div>

      {/* Total count */}
      <div className="mb-6 p-4 rounded-xl bg-muted/10 border border-border/30">
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
          label="Committee Members"
          count={kpis.totalCommitteeUsers}
          total={totalUsers}
          color="bg-indigo-500"
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
        <div className="mt-6 pt-4 border-t border-border/30 dark:border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Artwork Approval Rate</span>
            <span className="text-sm font-bold text-foreground">{kpis.approvalRate}%</span>
          </div>
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
              style={{ width: `${kpis.approvalRate}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            {kpis.approvedArtworks} approved · {kpis.rejectedArtworks} rejected
          </p>
        </div>
      )}
    </div>
  )
}
