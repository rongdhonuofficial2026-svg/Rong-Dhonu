'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, AlertCircle, Loader2, RefreshCw, Server, Shield, HardDrive, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

type HealthStatus = 'ok' | 'error' | 'checking'

interface ServiceCheck {
  name: string
  icon: React.ElementType
  status: HealthStatus
  detail: string
}

export function SystemHealthPanel() {
  const [checks, setChecks] = useState<ServiceCheck[]>([
    { name: 'Database',        icon: Server,    status: 'checking', detail: 'Connecting...' },
    { name: 'Authentication',  icon: Shield,    status: 'checking', detail: 'Validating session...' },
    { name: 'Storage',         icon: HardDrive, status: 'checking', detail: 'Pinging bucket...' },
    { name: 'Application',     icon: Globe,     status: 'ok',       detail: 'Server-side render OK' },
  ])
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  async function runChecks() {
    setIsRefreshing(true)
    const supabase = createClient()

    const updated: ServiceCheck[] = [
      { name: 'Database',        icon: Server,    status: 'checking', detail: 'Checking...' },
      { name: 'Authentication',  icon: Shield,    status: 'checking', detail: 'Checking...' },
      { name: 'Storage',         icon: HardDrive, status: 'checking', detail: 'Checking...' },
      { name: 'Application',     icon: Globe,     status: 'ok',       detail: 'Server-side render OK' },
    ]

    // Database: try a lightweight query
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1)
      updated[0] = { ...updated[0], status: error ? 'error' : 'ok', detail: error ? error.message : 'Connected' }
    } catch {
      updated[0] = { ...updated[0], status: 'error', detail: 'Connection failed' }
    }

    // Auth: check session
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      updated[1] = {
        ...updated[1],
        status: error || !session ? 'error' : 'ok',
        detail: error ? error.message : session ? 'Session active' : 'No active session',
      }
    } catch {
      updated[1] = { ...updated[1], status: 'error', detail: 'Auth check failed' }
    }

    // Storage: try listing a bucket
    try {
      const { error } = await supabase.storage.from('catalogs').list('', { limit: 1 })
      updated[2] = { ...updated[2], status: error ? 'error' : 'ok', detail: error ? error.message : 'Bucket accessible' }
    } catch {
      updated[2] = { ...updated[2], status: 'error', detail: 'Storage unreachable' }
    }

    setChecks(updated)
    setLastChecked(new Date())
    setIsRefreshing(false)
  }

  useEffect(() => { runChecks() }, [])

  const allOk = checks.every(c => c.status === 'ok')

  return (
    <div className="bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full', allOk ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400')} />
          <h2 className="font-serif text-xl font-semibold tracking-tight">System Health</h2>
        </div>
        <div className="flex items-center gap-3">
          {lastChecked && (
            <span className="text-xs font-mono text-muted-foreground/60">
              Last checked {lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={runChecks}
            disabled={isRefreshing}
            aria-label="Refresh system health checks"
            className="p-1.5 rounded-lg hover:bg-muted/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4 text-muted-foreground', isRefreshing && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {checks.map((check) => {
          const Icon = check.icon
          return (
            <div
              key={check.name}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border transition-all',
                check.status === 'ok'       && 'border-emerald-500/20 bg-emerald-500/5',
                check.status === 'error'    && 'border-rose-500/20 bg-rose-500/5',
                check.status === 'checking' && 'border-muted/30 bg-muted/5'
              )}
            >
              <div className={cn('shrink-0 w-9 h-9 rounded-xl flex items-center justify-center',
                check.status === 'ok'       && 'bg-emerald-500/15',
                check.status === 'error'    && 'bg-rose-500/15',
                check.status === 'checking' && 'bg-muted/20'
              )}>
                <Icon className={cn('w-4 h-4',
                  check.status === 'ok'       && 'text-emerald-400',
                  check.status === 'error'    && 'text-rose-400',
                  check.status === 'checking' && 'text-muted-foreground'
                )} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{check.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {check.status === 'checking' ? (
                    <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                  ) : check.status === 'ok' ? (
                    <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                  )}
                  <p className="text-xs text-muted-foreground truncate">{check.detail}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Platform info footer */}
      <div className="mt-4 pt-4 border-t border-border/30 dark:border-white/5 flex flex-wrap gap-4 text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider">
        <span>Rongdhono Administrative OS · v1.0.0</span>
        <span>Next.js 16.2.10</span>
        <span>Supabase SSR</span>
        <span className="ml-auto">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
    </div>
  )
}
