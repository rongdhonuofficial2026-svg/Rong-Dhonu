'use client'

/**
 * Admin card: manages late-submission links for an exhibition.
 * Embedded in the ExhibitionDashboardPage sidebar.
 *
 * Features:
 *  - List existing tokens with status indicators
 *  - Generate a new token (optional label, expiry, max-uses)
 *  - Copy the one-time link to clipboard
 *  - Revoke an active token
 *
 * Security: raw tokens are returned by the server action exactly once.
 * After the admin copies the link and the card re-renders, the raw token
 * is gone from state. Only the metadata (label, created_at, status) persists.
 */

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  generateLateSubmissionToken,
  revokeLateSubmissionToken,
  getLateSubmissionTokens,
  type LateTokenRecord,
} from '@/actions/admin/late-tokens'
import {
  Link2, Copy, ShieldX, Plus, Loader2, CheckCircle2,
  Clock, AlertTriangle, RefreshCw, Lock
} from 'lucide-react'

interface LateSubmissionCardProps {
  exhibition: any
}

export function LateSubmissionCard({ exhibition }: LateSubmissionCardProps) {
  const [tokens, setTokens] = React.useState<LateTokenRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [generating, setGenerating] = React.useState(false)
  const [showForm, setShowForm] = React.useState(false)

  // Form state
  const [label, setLabel] = React.useState('')
  const [expiresInHours, setExpiresInHours] = React.useState<string>('48')
  const [maxUses, setMaxUses] = React.useState<string>('')

  // Store the just-generated raw token (one-time only)
  const [newRawToken, setNewRawToken] = React.useState<string | null>(null)
  const [newTokenExhibitionId, setNewTokenExhibitionId] = React.useState<string | null>(null)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  // Build the late-submission URL for a raw token
  const buildLink = (rawToken: string, eid: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return `${origin}/en/dashboard/artworks/late?token=${encodeURIComponent(rawToken)}&eid=${encodeURIComponent(eid)}`
  }

  const loadTokens = React.useCallback(async () => {
    setLoading(true)
    const { tokens: data, error } = await getLateSubmissionTokens(exhibition.id)
    if (error) toast.error('Failed to load tokens', { description: error })
    else setTokens(data)
    setLoading(false)
  }, [exhibition.id])

  React.useEffect(() => { loadTokens() }, [loadTokens])

  const handleGenerate = async () => {
    try {
      setGenerating(true)
      const res = await generateLateSubmissionToken(exhibition.id, {
        label: label.trim() || undefined,
        expiresInHours: expiresInHours ? Number(expiresInHours) : null,
        maxUses: maxUses ? Number(maxUses) : null,
      })

      if (res.error) {
        toast.error('Failed to generate link', { description: res.error })
        return
      }

      // Store raw token temporarily so the admin can copy it
      setNewRawToken(res.rawToken!)
      setNewTokenExhibitionId(exhibition.id)
      setShowForm(false)
      setLabel('')
      setExpiresInHours('48')
      setMaxUses('1')
      await loadTokens()
      toast.success('Late submission link generated', {
        description: 'Copy the link now — it cannot be retrieved later.'
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = async (rawToken: string, eid: string, id?: string) => {
    const link = buildLink(rawToken, eid)
    try {
      await navigator.clipboard.writeText(link)
      setCopiedId(id || 'new')
      setTimeout(() => setCopiedId(null), 2500)
      toast.success('Link copied to clipboard')
    } catch {
      toast.error('Copy failed', { description: 'Please copy the link manually.' })
    }
  }

  const handleRevoke = async (tokenId: string) => {
    if (!confirm('Revoke this link? Anyone using it after revocation will be rejected.')) return
    const res = await revokeLateSubmissionToken(tokenId, exhibition.id)
    if (res.error) {
      toast.error('Revoke failed', { description: res.error })
    } else {
      toast.success('Link revoked')
      await loadTokens()
    }
  }

  // Token status helpers
  const getTokenStatus = (t: LateTokenRecord): 'active' | 'revoked' | 'expired' | 'exhausted' => {
    if (t.revoked_at) return 'revoked'
    if (t.expires_at && new Date() > new Date(t.expires_at)) return 'expired'
    if (t.max_uses !== null && t.used_count >= t.max_uses) return 'exhausted'
    return 'active'
  }

  const statusBadge = (status: ReturnType<typeof getTokenStatus>) => {
    const map = {
      active: { label: 'Active', cls: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
      revoked: { label: 'Revoked', cls: 'bg-red-500/10 text-red-700 border-red-500/20' },
      expired: { label: 'Expired', cls: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
      exhausted: { label: 'Used Up', cls: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
    }
    const { label, cls } = map[status]
    return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>
  }

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : '—'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Late Submission Links
            </CardTitle>
            <CardDescription className="mt-1">
              Admin-only. Generate a secure link to accept an artwork after the normal deadline.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="icon" onClick={loadTokens} className="h-8 w-8" title="Refresh">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            {!showForm && (
              <Button
                size="sm"
                onClick={() => { setShowForm(true); setNewRawToken(null) }}
                className="h-8 rounded-full gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                New Link
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* ── One-time display of newly generated token ── */}
        {newRawToken && newTokenExhibitionId && (
          <div className="p-4 rounded-xl border-2 border-amber-500/40 bg-amber-500/5 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Copy this link now — it will not be shown again
            </div>
            <div className="bg-white rounded-lg border border-amber-500/20 p-3 font-mono text-xs break-all text-charcoal/80 select-all">
              {buildLink(newRawToken, newTokenExhibitionId)}
            </div>
            <Button
              size="sm"
              className="w-full gap-2"
              onClick={() => handleCopy(newRawToken, newTokenExhibitionId, 'new')}
            >
              {copiedId === 'new'
                ? <><CheckCircle2 className="w-4 h-4" /> Copied!</>
                : <><Copy className="w-4 h-4" /> Copy Link</>}
            </Button>
            <button
              onClick={() => setNewRawToken(null)}
              className="w-full text-xs text-amber-700/70 hover:text-amber-700 transition-colors mt-1"
            >
              Dismiss (I have copied the link)
            </button>
          </div>
        )}

        {/* ── Generate form ── */}
        {showForm && (
          <div className="p-4 rounded-xl border border-[#E5E0D8] bg-[#FAF9F6] space-y-4">
            <h4 className="font-semibold text-sm text-charcoal">Generate New Late Submission Link</h4>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#6B655C]">Label (optional — for your reference)</label>
              <Input
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="e.g. Priya Sharma — missed deadline"
                className="h-9 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#6B655C]">Expires in (hours)</label>
                <Input
                  type="number"
                  min={1}
                  value={expiresInHours}
                  onChange={e => setExpiresInHours(e.target.value)}
                  placeholder="48"
                  className="h-9 rounded-lg text-sm"
                />
                <p className="text-[11px] text-muted-foreground">Leave blank for no expiry</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#6B655C]">Max uses</label>
                <Input
                  type="number"
                  min={1}
                  value={maxUses}
                  onChange={e => setMaxUses(e.target.value)}
                  placeholder="Unlimited"
                  className="h-9 rounded-lg text-sm"
                />
                <p className="text-[11px] text-muted-foreground">Blank = unlimited (any number of participants)</p>
              </div>
            </div>

            {exhibition.status === 'archived' && (
              <div className="flex items-start gap-2 text-amber-700 text-xs p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                This exhibition is archived. A late link will still work but the artwork will be associated with a closed exhibition.
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={handleGenerate} disabled={generating} className="gap-2">
                {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                {generating ? 'Generating...' : 'Generate Link'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} disabled={generating}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* ── Token list ── */}
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading...
          </div>
        ) : tokens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 border border-dashed rounded-lg">
            <Link2 className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No late submission links yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs">
              Generate a link to allow a specific participant to submit after the deadline.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map(token => {
              const status = getTokenStatus(token)
              return (
                <div key={token.id} className="p-4 rounded-xl border border-[#E5E0D8] bg-[#FAF9F6] space-y-2">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {statusBadge(status)}
                        {token.label && (
                          <span className="text-xs font-medium text-charcoal truncate max-w-[180px]">
                            {token.label}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground space-x-3">
                        <span><Clock className="inline w-3 h-3 mr-0.5" />Created: {fmtDate(token.created_at)}</span>
                        {token.expires_at && <span>Expires: {fmtDate(token.expires_at)}</span>}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Used: {token.used_count}{token.max_uses !== null ? ` / ${token.max_uses}` : ''}
                      </div>
                    </div>

                    {status === 'active' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                        onClick={() => handleRevoke(token.id)}
                      >
                        <ShieldX className="w-3.5 h-3.5 mr-1" />
                        Revoke
                      </Button>
                    )}
                  </div>

                  {status === 'revoked' && token.revoked_at && (
                    <p className="text-[11px] text-red-600/80">
                      Revoked at {fmtDate(token.revoked_at)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {tokens.length > 0 && (
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <strong>Note:</strong> Raw tokens are shown only once at creation. Revoked or expired links are permanently unusable — you can generate a new one if needed.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
