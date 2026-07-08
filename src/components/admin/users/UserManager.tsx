'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Search, Shield, Calendar, Image as ImageIcon, Users as UsersIcon, Mail, 
  MoreVertical, Check, UserMinus, ShieldAlert, Award, FileText, Activity, 
  MapPin, Globe, Phone, ExternalLink, X, Ban, CheckCircle, RefreshCw, Trash2, 
  Key, LogOut, ArrowRight, Eye, Edit, Star, StarOff, Download, Send, AlertTriangle, PlayCircle
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LuxuryCard } from '@/components/admin/ui/LuxuryCard'
import { PremiumButton } from '@/components/admin/ui/PremiumButton'
import { GlassPanel } from '@/components/admin/ui/GlassPanel'
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription 
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ConfirmationDialog } from '@/components/admin/ui/ConfirmationDialog'
import { 
  getUsers, getUserById, getUserDashboard, updateUserProfile, changeUserRole, 
  suspendUser, reactivateUser, approveUser, deleteUser, sendNotificationToUser, adminDeleteArtwork 
} from '@/actions/admin/users'
import { moderateArtwork } from '@/actions/admin/artworks'
import { cn } from '@/lib/utils'

interface UserManagerProps {
  initialUsers: any[]
  totalCount: number
  locale: string
}

export function UserManager({ initialUsers, totalCount: initialTotalCount, locale }: UserManagerProps) {
  const router = useRouter()
  
  // State for Users List
  const [users, setUsers] = useState<any[]>(initialUsers)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [isLoading, setIsLoading] = useState(false)
  
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)
  const limit = 12

  // Selected User for Detail Drawer
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerLoading, setDrawerLoading] = useState(false)
  
  // User dashboard details (tabs content)
  const [dashboardData, setDashboardData] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Notification form state
  const [notifMessage, setNotifMessage] = useState('')
  const [notifType, setNotifType] = useState('deadline_reminder')
  const [isSendingNotif, setIsSendingNotif] = useState(false)

  // Dialog management states
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean
    title: string
    description: string
    action: () => Promise<void>
  }>({
    isOpen: false,
    title: '',
    description: '',
    action: async () => {}
  })

  // Moderate Artwork state
  const [feedbackRequired, setFeedbackRequired] = useState(false)
  const [artworkFeedback, setArtworkFeedback] = useState('')
  const [moderateTarget, setModerateTarget] = useState<{ id: string, status: 'approved' | 'rejected' | 'changes_requested' } | null>(null)

  // Fetch users with filters
  const fetchUsers = async () => {
    setIsLoading(true)
    const res = await getUsers({
      search,
      role,
      status,
      sort: sortBy,
      page,
      limit
    })
    
    if (res.success && res.users) {
      setUsers(res.users)
      setPage(res.page || 1)
      setTotalCount(res.totalCount || 0)
    } else {
      toast.error(res.error || 'Failed to fetch directory')
    }
    setIsLoading(false)
  }

  // Trigger search / filters fetch
  useEffect(() => {
    fetchUsers()
  }, [search, role, status, sortBy, page])

  // Fetch user dashboard details when drawer opens
  const openUserDrawer = async (user: any) => {
    setSelectedUser(user)
    setIsDrawerOpen(true)
    setDrawerLoading(true)
    setDashboardData(null)
    setActiveTab('overview')
    
    const res = await getUserDashboard(user.id)
    if (res.success) {
      setDashboardData(res)
    } else {
      toast.error(res.error || 'Failed to load member activity')
    }
    setDrawerLoading(false)
  }

  // Action helpers
  const handleRoleChange = async (userId: string, newRole: any) => {
    toast.promise(changeUserRole(userId, newRole), {
      loading: 'Updating member access...',
      success: (res: any) => {
        if (!res.success) throw new Error(res.error)
        fetchUsers()
        if (selectedUser?.id === userId) {
          setSelectedUser({ ...selectedUser, role: newRole })
        }
        return 'Member permissions updated successfully'
      },
      error: (err: any) => err.message || 'Failed to update role'
    })
  }

  const handleApprove = async (userId: string) => {
    toast.promise(approveUser(userId), {
      loading: 'Approving membership...',
      success: (res: any) => {
        if (!res.success) throw new Error(res.error)
        fetchUsers()
        if (selectedUser?.id === userId) {
          setSelectedUser({ ...selectedUser, status: 'active', is_verified: true })
        }
        return 'Membership registration approved'
      },
      error: (err: any) => err.message || 'Approval failed'
    })
  }

  const handleSuspend = (userId: string) => {
    setDialogConfig({
      isOpen: true,
      title: 'Suspend Account',
      description: 'Are you sure you want to suspend this member? They will lose access to all dashboard functions immediately.',
      action: async () => {
        const res = await suspendUser(userId)
        if (res.success) {
          toast.success('Account suspended successfully')
          fetchUsers()
          if (selectedUser?.id === userId) {
            setSelectedUser({ ...selectedUser, status: 'suspended' })
          }
        } else {
          toast.error(res.error || 'Suspension failed')
        }
      }
    })
  }

  const handleReactivate = async (userId: string) => {
    toast.promise(reactivateUser(userId), {
      loading: 'Reactivating account...',
      success: (res: any) => {
        if (!res.success) throw new Error(res.error)
        fetchUsers()
        if (selectedUser?.id === userId) {
          setSelectedUser({ ...selectedUser, status: 'active' })
        }
        return 'Account reactivated successfully'
      },
      error: (err: any) => err.message || 'Failed to reactivate'
    })
  }

  const handleDeleteUser = (userId: string) => {
    setDialogConfig({
      isOpen: true,
      title: 'Delete Account Permanently',
      description: 'WARNING: This will permanently delete this user account and all their records from the database. This action is irreversible.',
      action: async () => {
        const res = await deleteUser(userId)
        if (res.success) {
          toast.success('Member account deleted permanently')
          setIsDrawerOpen(false)
          fetchUsers()
        } else {
          toast.error(res.error || 'Deletion failed')
        }
      }
    })
  }

  const handleSendNotification = async () => {
    if (!notifMessage.trim()) return
    setIsSendingNotif(true)
    const res = await sendNotificationToUser(selectedUser.id, {
      message_en: notifMessage,
      type: notifType
    })
    if (res.success) {
      toast.success('Notification delivered successfully')
      setNotifMessage('')
      // refresh dashboard notifications tab
      const dbRes = await getUserDashboard(selectedUser.id)
      if (dbRes.success) setDashboardData(dbRes)
    } else {
      toast.error(res.error || 'Failed to deliver notification')
    }
    setIsSendingNotif(false)
  }

  const handleArtworkModeration = async (artworkId: string, status: 'approved' | 'rejected' | 'changes_requested') => {
    if (status !== 'approved') {
      setModerateTarget({ id: artworkId, status })
      setFeedbackRequired(true)
      return
    }

    toast.promise(moderateArtwork(artworkId, 'approved'), {
      loading: 'Approving artwork...',
      success: async (res: any) => {
        if (res.error) throw new Error(res.error)
        // Refresh dashboard data
        const dbRes = await getUserDashboard(selectedUser.id)
        if (dbRes.success) setDashboardData(dbRes)
        return 'Artwork approved successfully'
      },
      error: (err: any) => err.message || 'Approval failed'
    })
  }

  const submitArtworkModerationWithFeedback = async () => {
    if (!artworkFeedback.trim() || !moderateTarget) return
    
    toast.promise(moderateArtwork(moderateTarget.id, moderateTarget.status, artworkFeedback), {
      loading: 'Submitting moderation status...',
      success: async (res: any) => {
        if (res.error) throw new Error(res.error)
        setFeedbackRequired(false)
        setArtworkFeedback('')
        setModerateTarget(null)
        // Refresh dashboard data
        const dbRes = await getUserDashboard(selectedUser.id)
        if (dbRes.success) setDashboardData(dbRes)
        return 'Artwork moderation submitted'
      },
      error: (err: any) => err.message || 'Moderation failed'
    })
  }

  const handleArtworkDeletion = (artworkId: string) => {
    setDialogConfig({
      isOpen: true,
      title: 'Delete Artwork',
      description: 'Are you sure you want to permanently delete this artwork? This will remove all image files and database entries.',
      action: async () => {
        const res = await adminDeleteArtwork(artworkId)
        if (res.success) {
          toast.success('Artwork deleted successfully')
          // Refresh dashboard data
          const dbRes = await getUserDashboard(selectedUser.id)
          if (dbRes.success) setDashboardData(dbRes)
        } else {
          toast.error(res.error || 'Deletion failed')
        }
      }
    })
  }

  const exportMemberData = (user: any) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `member_${user.slug || user.id}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    toast.success('Member database profile exported')
  }

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-12 pb-20">
      {/* Immersive Hero Section */}
      <section className="relative rounded-3xl overflow-hidden min-h-[320px] flex flex-col justify-end p-8 md:p-12 border border-white/[0.06] bg-[#0c0c0e]">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/users_hero.png" 
            alt="Users and Artists" 
            fill 
            className="object-cover object-center image-reveal scale-100 opacity-90 transition-transform duration-[1500ms]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/70 to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-5">
              <UsersIcon className="w-3.5 h-3.5 text-accent" />
              <span className="text-[9px] font-bold tracking-widest uppercase text-white/90">Network & Personnel</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 tracking-tight leading-tight text-white">
              User <span className="text-gradient-gold">Directory</span>
            </h1>
            <p className="text-white/70 text-base md:text-lg font-light leading-relaxed">
              Oversee the creative network. Manage credentials, evaluate catalog roles, and moderate artist permissions across the Rongdhono administrative layer.
            </p>
          </div>
        </div>
      </section>

      {/* Directory Section */}
      <section className="space-y-8">
        <GlassPanel intensity="light" className="p-5 rounded-2xl flex flex-col xl:flex-row justify-between gap-5 items-center border border-white/[0.06] bg-[#0e0e10]/80">
          <div className="relative w-full xl:flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <Input 
              placeholder="Search directory by name, email, or username..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-11 bg-white/[0.02] border-white/[0.08] focus-visible:ring-accent rounded-xl h-11 text-foreground placeholder:text-muted-foreground/50 transition-all font-light text-sm"
            />
          </div>
          
          <div className="flex flex-wrap gap-4 w-full xl:w-auto items-center justify-end">
            {/* Role filter */}
            <div className="flex flex-col gap-1 w-full sm:w-[140px]">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/55">Access Role</span>
              <Select value={role} onValueChange={(val) => { setRole(val); setPage(1); }}>
                <SelectTrigger className="bg-white/[0.02] border-white/[0.08] h-10 text-xs">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/[0.08] text-white">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="committee">Committee</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status filter */}
            <div className="flex flex-col gap-1 w-full sm:w-[140px]">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/55">Status</span>
              <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
                <SelectTrigger className="bg-white/[0.02] border-white/[0.08] h-10 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/[0.08] text-white">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sorting */}
            <div className="flex flex-col gap-1 w-full sm:w-[170px]">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/55">Sorting</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-white/[0.02] border-white/[0.08] h-10 text-xs">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/[0.08] text-white">
                  <SelectItem value="newest">Newest Members</SelectItem>
                  <SelectItem value="oldest">Oldest Members</SelectItem>
                  <SelectItem value="name">Alphabetical</SelectItem>
                  <SelectItem value="last_login">Recent Logins</SelectItem>
                  <SelectItem value="most_artworks">Most Artworks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassPanel>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-20 rounded-3xl flex items-center justify-center">
              <RefreshCw className="w-7 h-7 animate-spin text-accent" />
            </div>
          )}

          {!users || users.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-white/[0.01] border border-dashed border-white/[0.08] rounded-3xl">
              <div className="w-16 h-16 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center mb-5 mx-auto">
                <UsersIcon className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <h3 className="font-serif text-xl mb-1.5 text-white">No members matched</h3>
              <p className="text-xs text-muted-foreground/60 font-light max-w-sm mx-auto leading-relaxed">
                Adjust role filters, search queries, or membership status to locate specific database entries.
              </p>
            </div>
          ) : (
            users.map((user: any) => {
              const artworksCount = user.artworksCount ?? (user.artworks?.length || 0)
              const exhibitionsCount = user.exhibitionsCount ?? (user.exhibition_participants?.length || 0)
              const isSuspended = user.status === 'suspended'
              const isPending = user.status === 'pending'

              return (
                <LuxuryCard 
                  key={user.id} 
                  padding="none" 
                  className="relative overflow-hidden group bg-[#0e0e10]/95 hover:bg-[#121214]/90 border border-white/[0.06] hover:border-accent/40 transition-all duration-500 rounded-2xl flex flex-col justify-between h-full shadow-lg"
                >
                  <div className="p-6 flex flex-col flex-1">
                    {/* Top line Profile Summary */}
                    <div className="flex items-start justify-between gap-4">
                      {/* Circular Avatar */}
                      <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border border-white/[0.1] bg-black/60 group-hover:border-accent/50 transition-colors duration-500">
                        {user.avatar_url ? (
                          <Image src={user.avatar_url} alt="Avatar" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground/60 font-serif text-lg bg-gradient-to-br from-[#1b1b1e] to-black">
                            {user.full_name_en?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>

                      {/* Status & Role Pill Badges */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={cn(
                          "px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest rounded-full border backdrop-blur-md",
                          user.role === 'admin' || user.role === 'owner' 
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' 
                            : user.role === 'committee' 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                              : 'bg-white/5 border-white/10 text-white/70'
                        )}>
                          {user.role}
                        </span>
                        
                        {isSuspended && (
                          <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded border bg-red-500/10 border-red-500/30 text-red-300 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse" /> Suspended
                          </span>
                        )}
                        
                        {isPending && (
                          <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded border bg-amber-500/10 border-amber-500/30 text-amber-300 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" /> Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Name, Email, Meta */}
                    <div className="mt-4 space-y-1">
                      <h3 className="font-serif font-bold text-lg text-white group-hover:text-shadow-elegant transition-all duration-500 flex items-center gap-2 truncate">
                        {user.full_name_en || 'Unnamed User'}
                        {user.is_verified && <CheckCircle className="w-4 h-4 text-accent shrink-0" />}
                      </h3>
                      
                      <p className="text-xs text-muted-foreground/60 font-light truncate max-w-full">
                        {user.email}
                      </p>

                      <div className="text-[10px] text-muted-foreground/45 font-light pt-1 flex items-center gap-1.5">
                        <span>ID: {user.slug || user.id.slice(0, 8)}</span>
                        <span>•</span>
                        <span>Joined {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'N/A'}</span>
                      </div>
                    </div>

                    {/* Quick Stats Blocks */}
                    <div className="mt-6 pt-5 border-t border-white/[0.04] grid grid-cols-3 gap-4">
                      <div className="text-left">
                        <span className="block text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/40 mb-1">Artworks</span>
                        <span className="text-base font-serif font-semibold text-white/90">{artworksCount}</span>
                      </div>
                      <div className="text-left">
                        <span className="block text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/40 mb-1">Exhibitions</span>
                        <span className="text-base font-serif font-semibold text-white/90">{exhibitionsCount}</span>
                      </div>
                      <div className="text-left">
                        <span className="block text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/40 mb-1">Uploads</span>
                        <span className="text-base font-serif font-semibold text-white/90">{user.galleryCount ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Refined primary trigger button */}
                  <div className="px-6 pb-6 pt-2">
                    <PremiumButton 
                      variant="glass" 
                      className="w-full h-10 text-xs font-semibold tracking-wider uppercase bg-white/[0.01] border-white/[0.08] hover:bg-white/[0.05] hover:border-accent/40 rounded-xl transition-all duration-300"
                      onClick={() => openUserDrawer(user)}
                    >
                      Open Profile
                    </PremiumButton>
                  </div>
                </LuxuryCard>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-8">
            <PremiumButton 
              variant="glass" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-10 text-xs tracking-wider uppercase border-white/[0.06] hover:bg-white/[0.02]"
            >
              Previous
            </PremiumButton>
            <span className="text-xs text-muted-foreground/70 font-light tracking-widest uppercase">
              Page <span className="text-white font-medium">{page}</span> of {totalPages}
            </span>
            <PremiumButton 
              variant="glass" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-10 text-xs tracking-wider uppercase border-white/[0.06] hover:bg-white/[0.02]"
            >
              Next
            </PremiumButton>
          </div>
        )}
      </section>

      {/* Member Details Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="max-w-screen-md w-full md:w-[700px] lg:w-[850px] p-0 border-l border-white/10 bg-zinc-950 text-white overflow-y-auto scrollbar-hide">
          {selectedUser && (
            <div className="flex flex-col h-full">
              
              {/* Premium Profile Cover/Header */}
              <div className="relative overflow-hidden bg-gradient-to-b from-[#16161a] to-zinc-950 px-8 pt-12 pb-8 border-b border-white/[0.06]">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accent/5 rounded-full filter blur-[80px] pointer-events-none" />
                <div className="absolute top-4 right-4 flex items-center gap-2.5 z-10">
                  <PremiumButton variant="glass" className="h-9 px-3 text-xs bg-black/60 border-white/[0.08]" onClick={() => exportMemberData(selectedUser)}>
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Export Profile
                  </PremiumButton>
                  <Button variant="ghost" size="icon" className="text-white/60 hover:text-white rounded-full bg-black/40 border border-white/[0.06] w-9 h-9 flex items-center justify-center transition-colors" onClick={() => setIsDrawerOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 sm:items-center relative z-10">
                  <div className="relative w-24 h-24 rounded-full border border-white/[0.15] bg-zinc-900 overflow-hidden shadow-2xl shrink-0">
                    {selectedUser.avatar_url ? (
                      <Image src={selectedUser.avatar_url} alt="Avatar" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground/60 font-serif text-4xl bg-gradient-to-br from-[#1b1b1e] to-black">
                        {selectedUser.full_name_en?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="font-serif font-bold text-3xl tracking-tight text-white">
                        {selectedUser.full_name_en}
                      </h2>
                      {selectedUser.is_verified && (
                        <Badge className="bg-accent/10 border-accent/30 text-accent font-semibold tracking-wider text-[9px] uppercase px-2 py-0.5 rounded-full">
                          Verified Artist
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-white/60 text-xs font-light tracking-wide flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-white/40" /> {selectedUser.email}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-muted-foreground/60 font-light">
                      <span>Joined {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                      <span>•</span>
                      <span>Access Role: <strong className="text-white font-medium capitalize">{selectedUser.role}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Settings & Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
                
                {/* Minimal Info Sidebar panel */}
                <div className="lg:col-span-4 bg-black/[0.15] border-r border-white/[0.06] p-6 space-y-6">
                  <div>
                    <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">Member Status</h4>
                    <div className="space-y-3 text-xs font-light text-muted-foreground">
                      <div className="flex justify-between border-b border-white/[0.04] pb-2">
                        <span>Account Status</span>
                        <span className={cn(
                          "font-bold uppercase tracking-wider text-[10px]",
                          selectedUser.status === 'suspended' ? 'text-red-400' : selectedUser.status === 'pending' ? 'text-amber-400' : 'text-emerald-400'
                        )}>{selectedUser.status}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.04] pb-2">
                        <span>Verification</span>
                        <span className="font-medium text-white">{selectedUser.is_verified ? 'Verified Artist' : 'Not Verified'}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.04] pb-2">
                        <span>System Role</span>
                        <span className="font-semibold text-white capitalize">{selectedUser.role}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">Login Activity</h4>
                    <div className="space-y-3 text-xs font-light text-muted-foreground">
                      <div className="flex justify-between border-b border-white/[0.04] pb-2">
                        <span>Last Login</span>
                        <span className="text-white/80">{selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString() : 'Never'}</span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span>Total Sessions</span>
                        <span className="text-white/80">{dashboardData?.stats?.loginCount ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Profile completeness metadata */}
                  {selectedUser.bio_en && (
                    <div className="pt-2">
                      <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-2">Profile Integrity</h4>
                      <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-accent h-full rounded-full" style={{ width: '85%' }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 mt-1 block">85% complete</span>
                    </div>
                  )}
                </div>

                {/* Main Tabs Area */}
                <div className="lg:col-span-8 p-6">
                  {drawerLoading ? (
                    <div className="flex flex-col items-center justify-center h-[350px] gap-3">
                      <RefreshCw className="w-7 h-7 animate-spin text-accent" />
                      <span className="text-xs text-muted-foreground/65 font-light">Retrieving member statistics...</span>
                    </div>
                  ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                      <TabsList className="bg-black/35 border border-white/[0.06] p-1 w-full justify-start overflow-x-auto flex scrollbar-hide rounded-xl">
                        <TabsTrigger value="overview" className="text-xs rounded-lg py-1.5 px-3">Overview</TabsTrigger>
                        <TabsTrigger value="artworks" className="text-xs rounded-lg py-1.5 px-3">Artworks</TabsTrigger>
                        <TabsTrigger value="gallery" className="text-xs rounded-lg py-1.5 px-3">Gallery</TabsTrigger>
                        <TabsTrigger value="exhibitions" className="text-xs rounded-lg py-1.5 px-3">Exhibitions</TabsTrigger>
                        <TabsTrigger value="permissions" className="text-xs rounded-lg py-1.5 px-3">Permissions</TabsTrigger>
                        <TabsTrigger value="communications" className="text-xs rounded-lg py-1.5 px-3">Messaging</TabsTrigger>
                        <TabsTrigger value="logs" className="text-xs rounded-lg py-1.5 px-3">Logs</TabsTrigger>
                      </TabsList>

                      {/* Overview Panel */}
                      <TabsContent value="overview" className="space-y-6 outline-none">
                        {dashboardData && (
                          <div className="space-y-8">
                            {/* Premium Metric Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              <div className="bg-white/[0.02] border border-white/[0.06] p-5 rounded-2xl">
                                <span className="block text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1.5">Artworks</span>
                                <span className="text-3xl font-serif font-bold text-white leading-none">{dashboardData.stats.artworksSubmitted}</span>
                                <span className="text-[10px] text-emerald-400 mt-1.5 block font-light">{dashboardData.stats.artworksApproved} approved</span>
                              </div>
                              <div className="bg-white/[0.02] border border-white/[0.06] p-5 rounded-2xl">
                                <span className="block text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1.5">Exhibitions</span>
                                <span className="text-3xl font-serif font-bold text-accent leading-none">{dashboardData.stats.exhibitionsParticipated}</span>
                                <span className="text-[10px] text-muted-foreground/60 mt-1.5 block font-light">Active records</span>
                              </div>
                              <div className="bg-white/[0.02] border border-white/[0.06] p-5 rounded-2xl">
                                <span className="block text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1.5">Uploads</span>
                                <span className="text-3xl font-serif font-bold text-white leading-none">{dashboardData.stats.galleryUploads}</span>
                                <span className="text-[10px] text-muted-foreground/60 mt-1.5 block font-light">Gallery media</span>
                              </div>
                              <div className="bg-white/[0.02] border border-white/[0.06] p-5 rounded-2xl">
                                <span className="block text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1.5">Downloads</span>
                                <span className="text-3xl font-serif font-bold text-white leading-none">{dashboardData.stats.totalDownloads}</span>
                                <span className="text-[10px] text-muted-foreground/60 mt-1.5 block font-light">Catalog gets</span>
                              </div>
                            </div>

                            {/* Biography / Description */}
                            <div className="space-y-3 bg-white/[0.02] border border-white/[0.04] p-6 rounded-2xl">
                              <h4 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                                <FileText className="w-4.5 h-4.5 text-accent" /> Professional Statement
                              </h4>
                              {selectedUser.bio_en ? (
                                <p className="text-sm font-light text-muted-foreground/80 leading-relaxed font-sans">{selectedUser.bio_en}</p>
                              ) : (
                                <p className="text-sm italic font-light text-muted-foreground/45">No biography details provided by member.</p>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light text-muted-foreground/75 pt-4 border-t border-white/[0.04] mt-4">
                                {selectedUser.phone && (
                                  <div className="flex items-center gap-2.5">
                                    <Phone className="w-4 h-4 text-muted-foreground/40" />
                                    <span>{selectedUser.phone}</span>
                                  </div>
                                )}
                                {selectedUser.website_url && (
                                  <div className="flex items-center gap-2.5">
                                    <Globe className="w-4 h-4 text-muted-foreground/40" />
                                    <a href={selectedUser.website_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white hover:underline flex items-center gap-1 transition-colors">
                                      {selectedUser.website_url.replace(/https?:\/\//, '')} <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                )}
                                {selectedUser.instagram_url && (
                                  <div className="flex items-center gap-2.5">
                                    <ExternalLink className="w-4 h-4 text-muted-foreground/40" />
                                    <a href={selectedUser.instagram_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white hover:underline flex items-center gap-1 transition-colors">
                                      Instagram profile <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Recent Activity Timeline Preview */}
                            <div className="space-y-4">
                              <h4 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                                <Activity className="w-4.5 h-4.5 text-accent" /> Recent Timeline
                              </h4>
                              {dashboardData.auditLogs.length === 0 ? (
                                <div className="p-8 text-center bg-white/[0.01] border border-dashed border-white/[0.08] rounded-2xl text-xs text-muted-foreground/50 font-light">
                                  No administrative logs found.
                                </div>
                              ) : (
                                <div className="relative border-l border-white/[0.08] pl-5 ml-2.5 space-y-5 py-2">
                                  {dashboardData.auditLogs.slice(0, 3).map((log: any) => (
                                    <div key={log.id} className="relative group">
                                      <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-zinc-950 border border-accent flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                      </div>
                                      <div className="flex justify-between items-start gap-4">
                                        <div>
                                          <p className="text-xs font-semibold text-white/90 uppercase tracking-wider">{log.action.replace(/_/g, ' ')}</p>
                                          <p className="text-[11px] text-muted-foreground/60 mt-0.5 font-light">Entity: {log.entity_type} ({log.entity_id.slice(0, 8)})</p>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground/40 font-light">{new Date(log.created_at).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      {/* Artworks List Tab */}
                      <TabsContent value="artworks" className="space-y-4 outline-none">
                        {dashboardData?.artworks && dashboardData.artworks.length === 0 ? (
                          <div className="py-12 text-center bg-white/[0.01] border border-dashed border-white/[0.08] rounded-2xl">
                            <ImageIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                            <h5 className="text-sm font-semibold text-white mb-1">No Artworks Submitted</h5>
                            <p className="text-xs text-muted-foreground/60 font-light">This member has not submitted any artwork to current exhibitions yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {dashboardData?.artworks.map((artwork: any) => (
                              <div key={artwork.id} className="flex gap-4 p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 rounded-2xl border border-white/[0.06] justify-between items-center">
                                <div className="flex gap-4 items-center">
                                  <div className="relative w-16 h-16 rounded-xl bg-zinc-950 overflow-hidden shrink-0 border border-white/[0.08]">
                                    {artwork.main_image_url ? (
                                      <Image src={artwork.main_image_url} alt="artwork" fill className="object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-white/20"><ImageIcon className="w-5 h-5"/></div>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-serif font-bold text-white text-sm">{artwork.title_en}</h4>
                                    <p className="text-[10px] text-muted-foreground/60 mt-1 font-light">
                                      {artwork.category || 'Artwork'} • {artwork.medium_en}
                                    </p>
                                    <p className="text-[9px] text-muted-foreground/40 font-light mt-0.5">
                                      Submitted {artwork.created_at ? new Date(artwork.created_at).toLocaleDateString() : 'N/A'}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                  <span className={cn(
                                    "px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border",
                                    artwork.status === 'approved' 
                                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                      : artwork.status === 'rejected' 
                                        ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                  )}>
                                    {artwork.status}
                                  </span>

                                  <div className="flex gap-1.5">
                                    {artwork.status === 'pending' && (
                                      <>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-8 w-8 text-emerald-400 hover:text-white hover:bg-emerald-500/20 rounded-full border border-white/[0.06] transition-colors" 
                                          onClick={() => handleArtworkModeration(artwork.id, 'approved')}
                                          aria-label="Approve Artwork"
                                        >
                                          <Check className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-8 w-8 text-red-400 hover:text-white hover:bg-red-500/20 rounded-full border border-white/[0.06] transition-colors" 
                                          onClick={() => handleArtworkModeration(artwork.id, 'rejected')}
                                          aria-label="Reject Artwork"
                                        >
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </>
                                    )}
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-white/50 hover:text-white hover:bg-red-950/20 rounded-full border border-white/[0.06] transition-colors" 
                                      onClick={() => handleArtworkDeletion(artwork.id)}
                                      aria-label="Delete Artwork"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      {/* Gallery Media Tab */}
                      <TabsContent value="gallery" className="space-y-4 outline-none">
                        {dashboardData?.gallery && dashboardData.gallery.length === 0 ? (
                          <div className="py-12 text-center bg-white/[0.01] border border-dashed border-white/[0.08] rounded-2xl">
                            <ImageIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                            <h5 className="text-sm font-semibold text-white mb-1">No Gallery Uploads</h5>
                            <p className="text-xs text-muted-foreground/60 font-light">This member has not uploaded any gallery content yet.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {dashboardData?.gallery.map((media: any) => (
                              <div key={media.id} className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl relative overflow-hidden group hover:bg-white/[0.04] transition-all duration-300">
                                <div className="relative aspect-[16/10] bg-zinc-950 rounded-xl overflow-hidden border border-white/[0.06] mb-3">
                                  {media.media_type === 'image' ? (
                                    <Image src={media.url} alt="gallery" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                                      <PlayCircle className="w-12 h-12 text-white/50" />
                                    </div>
                                  )}
                                </div>
                                <h5 className="font-serif font-bold text-sm text-white truncate">{media.title_en || 'Untitled Media'}</h5>
                                <div className="flex justify-between items-center mt-2 text-[10px] text-muted-foreground/60 font-light">
                                  <span>Album: {media.gallery_albums?.title_en || 'Archive'}</span>
                                  <span className="uppercase font-bold tracking-wider text-accent">{media.media_type}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      {/* Exhibitions History Tab */}
                      <TabsContent value="exhibitions" className="space-y-4 outline-none">
                        {dashboardData?.exhibitions && dashboardData.exhibitions.length === 0 ? (
                          <div className="py-12 text-center bg-white/[0.01] border border-dashed border-white/[0.08] rounded-2xl">
                            <Award className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                            <h5 className="text-sm font-semibold text-white mb-1">No Exhibitions Recorded</h5>
                            <p className="text-xs text-muted-foreground/60 font-light">This member has not participated in any exhibitions yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {dashboardData?.exhibitions.map((part: any) => {
                              const exh = part.exhibitions
                              if (!exh) return null
                              return (
                                <div key={part.id} className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:bg-white/[0.04] transition-all duration-300">
                                  <div>
                                    <h4 className="font-serif font-bold text-white text-sm">
                                      {locale === 'bn' && exh.theme_bn ? exh.theme_bn : exh.theme_en}
                                    </h4>
                                    <span className="text-[10px] text-muted-foreground/60 mt-1 block font-light">
                                      Year: {exh.year} • Registered Role: {part.role || 'Artist'}
                                    </span>
                                  </div>
                                  <span className={cn(
                                    "px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border",
                                    part.status === 'approved' 
                                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                                      : part.status === 'rejected' 
                                        ? 'bg-red-500/10 border-red-500/25 text-red-400' 
                                        : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                                  )}>
                                    {part.status}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </TabsContent>

                      {/* Permissions & Danger zone Settings tab */}
                      <TabsContent value="permissions" className="space-y-6 outline-none">
                        <div className="space-y-6">
                          <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-2xl space-y-4">
                            <h4 className="font-serif font-bold text-lg text-white">Access Credentials</h4>
                            
                            <div className="space-y-2 max-w-sm">
                              <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold block">System Access Role</label>
                              <Select 
                                value={selectedUser.role} 
                                onValueChange={(val) => handleRoleChange(selectedUser.id, val)}
                              >
                                <SelectTrigger className="bg-zinc-900 border-white/10 h-10 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                  <SelectItem value="owner">Owner</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="committee">Committee</SelectItem>
                                  <SelectItem value="member">Member</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-2xl space-y-4">
                            <h4 className="font-serif font-bold text-lg text-white">Account Status Controls</h4>
                            <p className="text-xs text-muted-foreground/60 font-light leading-relaxed">
                              Temporarily suspend membership actions, block platform sign-ins, or manually approve user registrations.
                            </p>
                            
                            <div className="flex flex-wrap gap-3 pt-2">
                              {selectedUser.status === 'pending' && (
                                <PremiumButton variant="primary" className="h-10 px-4 text-xs font-semibold uppercase tracking-wider" onClick={() => handleApprove(selectedUser.id)}>
                                  Approve Membership
                                </PremiumButton>
                              )}
                              
                              {selectedUser.status === 'suspended' ? (
                                <PremiumButton variant="glass" className="h-10 px-4 text-xs font-semibold uppercase tracking-wider border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10" onClick={() => handleReactivate(selectedUser.id)}>
                                  Reactivate Member
                                </PremiumButton>
                              ) : (
                                <PremiumButton variant="glass" className="h-10 px-4 text-xs font-semibold uppercase tracking-wider border-red-500/20 text-red-400 hover:bg-red-500/10" onClick={() => handleSuspend(selectedUser.id)}>
                                  Suspend Member
                                </PremiumButton>
                              )}
                            </div>
                          </div>

                          <div className="bg-red-500/[0.02] border border-red-500/[0.15] p-6 rounded-2xl space-y-4">
                            <h4 className="font-serif font-bold text-lg text-red-400 flex items-center gap-2">
                              <ShieldAlert className="w-5 h-5 shrink-0" /> Extreme Danger Zone
                            </h4>
                            <p className="text-xs text-muted-foreground/60 font-light leading-relaxed">
                              Permanently remove this member profile and all their linked artworks, comments, catalogs, and logs. This action is irreversible and permanent.
                            </p>
                            
                            <div className="pt-2">
                              <Button 
                                variant="destructive" 
                                className="h-10 px-4 text-xs font-semibold uppercase tracking-wider bg-red-600/80 hover:bg-red-600 text-white rounded-xl transition-all"
                                onClick={() => handleDeleteUser(selectedUser.id)}
                              >
                                Delete Account Permanently
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Communications / Messaging Tab */}
                      <TabsContent value="communications" className="space-y-6 outline-none">
                        <div className="space-y-4">
                          <h4 className="font-serif font-bold text-lg text-white border-b border-white/5 pb-2">Send Admin Message</h4>
                          
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <span className="text-xs font-light text-muted-foreground">Notification Classification</span>
                              <Select value={notifType} onValueChange={setNotifType}>
                                <SelectTrigger className="bg-zinc-900 border-white/10 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                  <SelectItem value="deadline_reminder">Deadline Reminder</SelectItem>
                                  <SelectItem value="submission_approved">Submission Approved</SelectItem>
                                  <SelectItem value="submission_rejected">Submission Rejected</SelectItem>
                                  <SelectItem value="new_exhibition">New Exhibition Invite</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1">
                              <span className="text-xs font-light text-muted-foreground">Message Body</span>
                              <textarea
                                value={notifMessage}
                                onChange={(e) => setNotifMessage(e.target.value)}
                                placeholder="Write message to send directly to this user's dashboard..."
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-accent min-h-[100px] text-white"
                              />
                            </div>

                            <PremiumButton 
                              variant="primary" 
                              onClick={handleSendNotification}
                              disabled={isSendingNotif || !notifMessage.trim()}
                              className="w-full flex items-center justify-center gap-2 text-xs"
                            >
                              <Send className="w-3.5 h-3.5" /> Deliver Direct Message
                            </PremiumButton>
                          </div>
                        </div>

                        {/* Sent notifications history */}
                        {dashboardData?.notifications && (
                          <div className="space-y-4 pt-6 border-t border-white/5">
                            <h4 className="font-serif font-bold text-lg text-white">Message Log</h4>
                            {dashboardData.notifications.length === 0 ? (
                              <p className="text-xs font-light text-muted-foreground/50 italic">No message logs exist.</p>
                            ) : (
                              <div className="space-y-3">
                                {dashboardData.notifications.map((notif: any) => (
                                  <div key={notif.id} className="p-3 bg-zinc-900/50 rounded-lg border border-white/5 text-xs">
                                    <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-1.5">
                                      <span className="uppercase font-bold text-accent">{notif.type.replace('_', ' ')}</span>
                                      <span>{new Date(notif.created_at).toLocaleString()}</span>
                                    </div>
                                    <p className="font-light text-white/90">{notif.message_en}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </TabsContent>

                      {/* User Logs Tab */}
                      <TabsContent value="logs" className="space-y-4 outline-none">
                        {dashboardData?.auditLogs && dashboardData.auditLogs.length === 0 ? (
                          <div className="py-12 text-center text-muted-foreground font-light text-sm">
                            No log events found.
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin">
                            {dashboardData?.auditLogs.map((log: any) => (
                              <div key={log.id} className="p-3 bg-[#111] rounded-lg border border-white/5 text-xs">
                                <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-1">
                                  <span className="uppercase font-bold text-accent">{log.action.replace(/_/g, ' ')}</span>
                                  <span>{new Date(log.created_at).toLocaleString()}</span>
                                </div>
                                <span className="text-white font-light">Entity: {log.entity_type} ({log.entity_id})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog */}
      <ConfirmationDialog 
        isOpen={dialogConfig.isOpen}
        onClose={() => setDialogConfig(prev => ({ ...prev, isOpen: false }))}
        title={dialogConfig.title}
        description={dialogConfig.description}
        onConfirm={async () => {
          await dialogConfig.action()
          setDialogConfig(prev => ({ ...prev, isOpen: false }))
        }}
      />

      {/* Artwork Reject Feedback Dialog */}
      <Sheet open={feedbackRequired} onOpenChange={setFeedbackRequired}>
        <SheetContent className="bg-zinc-950 border-l border-white/10 text-white max-w-md w-full">
          <SheetHeader className="mb-6">
            <SheetTitle>Artwork Feedback Required</SheetTitle>
            <SheetDescription>Provide constructive feedback or changes requested details to notify the artist.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <textarea
              value={artworkFeedback}
              onChange={(e) => setArtworkFeedback(e.target.value)}
              placeholder="Write clear instructions or reasons for rejection..."
              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-accent min-h-[150px] text-white"
            />
            <div className="flex gap-3 justify-end pt-4">
              <PremiumButton variant="glass" className="h-10 text-xs" onClick={() => { setFeedbackRequired(false); setArtworkFeedback(''); }}>
                Cancel
              </PremiumButton>
              <PremiumButton variant="primary" className="h-10 text-xs" onClick={submitArtworkModerationWithFeedback} disabled={!artworkFeedback.trim()}>
                Submit Moderation
              </PremiumButton>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
