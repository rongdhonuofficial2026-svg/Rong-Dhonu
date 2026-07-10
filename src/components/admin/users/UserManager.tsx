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

const SkeletonCard = () => (
  <div className="relative overflow-hidden bg-[#141416] border border-white/[0.04] rounded-2xl p-8 flex flex-col justify-between h-[380px] animate-pulse">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-20 h-20 rounded-full bg-white/[0.04]" />
      <div className="h-5 w-32 bg-white/[0.04] rounded" />
      <div className="h-4 w-40 bg-white/[0.04] rounded" />
    </div>
    <div className="w-full h-px bg-white/[0.04] my-4" />
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2"><div className="h-6 w-12 bg-white/[0.04] rounded mx-auto" /><div className="h-3 w-16 bg-white/[0.04] rounded mx-auto" /></div>
      <div className="space-y-2"><div className="h-6 w-12 bg-white/[0.04] rounded mx-auto" /><div className="h-3 w-16 bg-white/[0.04] rounded mx-auto" /></div>
      <div className="space-y-2"><div className="h-6 w-12 bg-white/[0.04] rounded mx-auto" /><div className="h-3 w-16 bg-white/[0.04] rounded mx-auto" /></div>
    </div>
    <div className="h-10 w-full bg-white/[0.04] rounded-xl mt-6" />
  </div>
)

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
      description: 'Are you sure you want to suspend this member? They will lose access to all platform actions immediately.',
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
    <div className="space-y-8 md:space-y-10 pb-16 md:pb-20">
      {/* Immersive Hero Section */}
      <section className="relative rounded-3xl overflow-hidden min-h-[220px] md:min-h-[300px] flex flex-col justify-end p-6 md:p-8 lg:p-12 border border-white/[0.06] bg-[#0c0c0e] shadow-2xl">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/users_hero.png" 
            alt="Users and Artists" 
            fill 
            className="object-cover object-center image-reveal scale-100 opacity-90 transition-transform duration-[1500ms]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-5">
              <UsersIcon className="w-3.5 h-3.5 text-[#C8A96A]" />
              <span className="text-[9px] font-bold tracking-widest uppercase text-white/95">Network & Personnel</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight leading-tight text-white">
              User <span className="text-gradient-gold">Directory</span>
            </h1>
            <p className="text-zinc-300 text-sm md:text-base font-light leading-relaxed">
              Oversee the creative network. Manage credentials, evaluate catalog roles, and moderate artist permissions across the Rongdhono administrative layer.
            </p>
          </div>
        </div>
      </section>

      {/* Directory Section */}
      <section className="space-y-8">
        <GlassPanel intensity="light" className="p-4 md:p-5 rounded-2xl flex flex-col xl:flex-row justify-between gap-4 md:gap-5 items-stretch xl:items-center border border-white/[0.06] bg-[#0e0e10]/85">
          <div className="relative w-full xl:flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              placeholder="Search directory by name, email, or username..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-11 w-full bg-white/[0.02] border-white/[0.08] focus-visible:ring-[#C8A96A] rounded-xl h-11 min-h-11 text-white placeholder:text-zinc-500 transition-all font-light text-sm"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full xl:w-auto items-stretch sm:items-center justify-between sm:justify-end">
            <div className="text-xs text-zinc-500 font-light uppercase tracking-wider shrink-0">
              Found <span className="text-white font-medium">{totalCount}</span> members
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto items-center">
              {/* Role filter */}
              <div className="flex flex-col gap-1 w-full sm:w-[120px]">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-550">Access Role</span>
                <Select value={role} onValueChange={(val) => { setRole(val); setPage(1); }}>
                  <SelectTrigger className="bg-white/[0.02] border-white/[0.08] h-9 text-xs text-white">
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
              <div className="flex flex-col gap-1 w-full sm:w-[120px]">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-550">Status</span>
                <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
                  <SelectTrigger className="bg-white/[0.02] border-white/[0.08] h-9 text-xs text-white">
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
              <div className="flex flex-col gap-1 w-full sm:w-[140px]">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-550">Sorting</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-white/[0.02] border-white/[0.08] h-9 text-xs text-white">
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
          </div>
        </GlassPanel>

        {/* Directory Grid */}
        <div className="admin-user-grid grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative">
          {isLoading ? (
            // Layout-shift-prevention skeleton loaders
            Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} />)
          ) : !users || users.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-white/[0.01] border border-dashed border-white/[0.08] rounded-3xl">
              <div className="w-16 h-16 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center mb-5 mx-auto">
                <UsersIcon className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="font-serif text-xl mb-1.5 text-white">No members matched</h3>
              <p className="text-xs text-zinc-500 font-light max-w-sm mx-auto leading-relaxed">
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
                <div 
                  key={user.id} 
                  className="relative overflow-hidden group bg-[#141416] hover:bg-[#18181b] border border-white/[0.06] hover:border-[#C8A96A]/45 rounded-2xl p-8 flex flex-col justify-between h-full shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                >
                  <div className="absolute inset-0 bg-radial-gradient from-[#C8A96A]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  {/* Section 1: Profile */}
                  <div className="flex flex-col items-center text-center space-y-3.5">
                    {/* Large circular avatar */}
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border border-white/[0.08] bg-black/60 group-hover:border-[#C8A96A]/50 transition-colors duration-500 shadow-xl shrink-0">
                      {user.avatar_url ? (
                        <Image src={user.avatar_url} alt="Avatar" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-zinc-400 font-serif text-2xl bg-gradient-to-br from-[#252529] to-[#0c0c0e]">
                          {user.full_name_en?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>

                    {/* Name & Role badge */}
                    <div className="space-y-1 w-full">
                      <h3 className="font-serif font-bold text-xl text-white group-hover:text-shadow-elegant transition-all duration-500 flex items-center justify-center gap-1.5 truncate max-w-full px-2">
                        {user.full_name_en || 'Unnamed User'}
                        {user.is_verified && <CheckCircle className="w-4 h-4 text-[#C8A96A] shrink-0" />}
                      </h3>
                      
                      <div className="flex items-center justify-center gap-1.5 pt-0.5">
                        <span className={cn(
                          "px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest rounded-full border backdrop-blur-md",
                          user.role === 'admin' || user.role === 'owner' 
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' 
                            : user.role === 'committee' 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                              : 'bg-white/5 border-white/10 text-white/60'
                        )}>
                          {user.role}
                        </span>

                        {isSuspended && (
                          <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded border bg-red-500/10 border-red-500/30 text-red-300 shrink-0">
                            Suspended
                          </span>
                        )}
                        {isPending && (
                          <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded border bg-amber-500/10 border-amber-500/30 text-amber-300 shrink-0">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <p className="admin-truncate-email text-xs text-zinc-400 font-light max-w-full px-2">
                      {user.email}
                    </p>

                    {/* Secondary metadata */}
                    <div className="text-[10px] text-zinc-550 font-light flex items-center gap-1.5">
                      <span>ID: {user.slug || user.id.slice(0, 8)}</span>
                      <span>•</span>
                      <span>Joined {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-white/[0.04] my-6" />

                  {/* Section 2: Quick Statistics */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <span className="block text-[28px] font-serif font-bold text-white leading-none">{artworksCount}</span>
                      <span className="block text-[9px] font-semibold uppercase tracking-widest text-zinc-500 mt-1.5">Artworks</span>
                    </div>
                    <div>
                      <span className="block text-[28px] font-serif font-bold text-white leading-none">{exhibitionsCount}</span>
                      <span className="block text-[9px] font-semibold uppercase tracking-widest text-zinc-500 mt-1.5">Exhibitions</span>
                    </div>
                    <div>
                      <span className="block text-[28px] font-serif font-bold text-white leading-none">{user.galleryCount ?? 0}</span>
                      <span className="block text-[9px] font-semibold uppercase tracking-widest text-zinc-500 mt-1.5">Uploads</span>
                    </div>
                  </div>

                  {/* Section 4: Primary Action */}
                  <div className="mt-8">
                    <button 
                      onClick={() => openUserDrawer(user)}
                      className="w-full h-11 text-[13px] font-semibold tracking-widest uppercase bg-transparent hover:bg-[#C8A96A] text-[#C8A96A] hover:text-black border border-[#C8A96A]/30 hover:border-[#C8A96A] rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 group/btn cursor-pointer"
                    >
                      Open Profile <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
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
            <span className="text-xs text-zinc-500 font-light tracking-widest uppercase">
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

      {/* Member Details Drawer - Set to full screen on mobile, 640px wide on desktop */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="max-w-none w-full sm:max-w-[640px] p-0 border-l border-white/10 bg-zinc-950 text-white overflow-y-auto scrollbar-hide">
          {selectedUser && (
            <div className="flex flex-col h-full">
              
              {/* Premium Profile Header with Cover background */}
              <div className="relative overflow-hidden bg-zinc-950 pb-8 border-b border-white/[0.06]">
                {/* Cover Banner */}
                <div className="relative h-32 bg-gradient-to-r from-zinc-900 to-black overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:14px_24px]" />
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#C8A96A]/10 rounded-full filter blur-2xl animate-pulse-glow" />
                  <div className="absolute top-4 right-4 flex items-center gap-2.5 z-20">
                    <PremiumButton variant="glass" className="h-8 px-3 text-[11px] bg-black/60 border-white/[0.08]" onClick={() => exportMemberData(selectedUser)}>
                      <Download className="w-3.5 h-3.5 mr-1.5" /> Export Profile
                    </PremiumButton>
                    <Button variant="ghost" size="icon" className="text-white/60 hover:text-white rounded-full bg-black/40 border border-white/[0.06] w-8 h-8 flex items-center justify-center transition-colors" onClick={() => setIsDrawerOpen(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Profile Details Container */}
                <div className="px-8 -mt-10 relative z-10 flex flex-col space-y-4">
                  {/* Large Profile Image */}
                  <div className="relative w-24 h-24 rounded-full border-4 border-zinc-950 bg-zinc-900 overflow-hidden shadow-2xl shrink-0">
                    {selectedUser.avatar_url ? (
                      <Image src={selectedUser.avatar_url} alt="Avatar" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-zinc-400 font-serif text-3xl bg-gradient-to-br from-[#252529] to-black">
                        {selectedUser.full_name_en?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif font-bold text-2xl tracking-tight text-white">
                        {selectedUser.full_name_en}
                      </h2>
                      {selectedUser.is_verified && (
                        <span className="bg-[#C8A96A]/10 border border-[#C8A96A]/30 text-[#C8A96A] font-semibold tracking-wider text-[9px] uppercase px-2.5 py-0.5 rounded-full">
                          Verified Artist
                        </span>
                      )}
                    </div>
                    
                    <p className="text-zinc-400 text-xs font-light tracking-wide flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" /> {selectedUser.email}
                    </p>
                    
                    <div className="flex items-center gap-2 text-[10px] text-zinc-550 font-light pt-1">
                      <span>Joined {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                      <span>•</span>
                      <span>Access Role: <strong className="text-white font-medium capitalize">{selectedUser.role}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Navigation & Scrollable Content */}
              <div className="flex flex-col flex-1">
                
                {/* Segmented navigation tabs bar */}
                <div className="px-8 pt-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-[#141416]/50 border border-white/[0.06] p-1 w-full justify-start overflow-x-auto flex scrollbar-hide rounded-xl">
                      <TabsTrigger value="overview" className="text-xs rounded-lg py-1.5 px-3 flex-1 sm:flex-initial">Overview</TabsTrigger>
                      <TabsTrigger value="artworks" className="text-xs rounded-lg py-1.5 px-3 flex-1 sm:flex-initial">Artworks</TabsTrigger>
                      <TabsTrigger value="gallery" className="text-xs rounded-lg py-1.5 px-3 flex-1 sm:flex-initial">Gallery</TabsTrigger>
                      <TabsTrigger value="exhibitions" className="text-xs rounded-lg py-1.5 px-3 flex-1 sm:flex-initial">Exhibitions</TabsTrigger>
                      <TabsTrigger value="permissions" className="text-xs rounded-lg py-1.5 px-3 flex-1 sm:flex-initial">Permissions</TabsTrigger>
                      <TabsTrigger value="communications" className="text-xs rounded-lg py-1.5 px-3 flex-1 sm:flex-initial">Messaging</TabsTrigger>
                      <TabsTrigger value="logs" className="text-xs rounded-lg py-1.5 px-3 flex-1 sm:flex-initial">Logs</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Main Scrollable Content */}
                <div className="p-8 flex-1 min-h-[400px]">
                  {drawerLoading ? (
                    <div className="flex flex-col items-center justify-center h-[350px] gap-3">
                      <RefreshCw className="w-7 h-7 animate-spin text-[#C8A96A]" />
                      <span className="text-xs text-zinc-550 font-light">Retrieving member statistics...</span>
                    </div>
                  ) : (
                    <Tabs value={activeTab} className="w-full">
                      {/* Overview Panel */}
                      <TabsContent value="overview" className="space-y-6 outline-none">
                        {dashboardData && (
                          <div className="space-y-6">
                            {/* Dashboard stats cards */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-[#1c1c1e] border border-white/[0.04] p-5 rounded-2xl space-y-1">
                                <span className="block text-[9px] font-semibold uppercase tracking-widest text-zinc-500">Account Status</span>
                                <span className={cn(
                                  "text-lg font-bold uppercase tracking-wider block",
                                  selectedUser.status === 'suspended' ? 'text-red-400' : selectedUser.status === 'pending' ? 'text-amber-400' : 'text-emerald-400'
                                )}>
                                  {selectedUser.status}
                                </span>
                              </div>

                              <div className="bg-[#1c1c1e] border border-white/[0.04] p-5 rounded-2xl space-y-1">
                                <span className="block text-[9px] font-semibold uppercase tracking-widest text-zinc-500">Verification</span>
                                <span className="text-lg font-serif font-bold text-white block">
                                  {selectedUser.is_verified ? 'Verified Artist' : 'Standard Member'}
                                </span>
                              </div>

                              <div className="bg-[#1c1c1e] border border-white/[0.04] p-5 rounded-2xl space-y-1">
                                <span className="block text-[9px] font-semibold uppercase tracking-widest text-zinc-500">Last Login Session</span>
                                <span className="text-sm font-light text-zinc-300 block truncate">
                                  {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'No logins recorded'}
                                </span>
                              </div>

                              <div className="bg-[#1c1c1e] border border-white/[0.04] p-5 rounded-2xl space-y-1">
                                <span className="block text-[9px] font-semibold uppercase tracking-widest text-zinc-500">Total System Sessions</span>
                                <span className="text-xl font-bold text-white block">
                                  {dashboardData.stats.loginCount}
                                </span>
                              </div>
                            </div>

                            {/* Main Statistics Group */}
                            <div className="bg-[#1c1c1e] border border-white/[0.04] p-6 rounded-2xl space-y-4">
                              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Activity Metrics</h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                  <span className="block text-[10px] uppercase tracking-wider text-zinc-500">Artworks Submitted</span>
                                  <span className="text-3xl font-serif font-bold text-white block leading-none">{dashboardData.stats.artworksSubmitted}</span>
                                  <span className="text-[10px] text-emerald-500 block font-light">{dashboardData.stats.artworksApproved} Approved</span>
                                </div>
                                <div className="space-y-1">
                                  <span className="block text-[10px] uppercase tracking-wider text-zinc-500">Gallery Uploads</span>
                                  <span className="text-3xl font-serif font-bold text-white block leading-none">{dashboardData.stats.galleryUploads}</span>
                                  <span className="text-[10px] text-zinc-500 block font-light">Public assets</span>
                                </div>
                                <div className="space-y-1">
                                  <span className="block text-[10px] uppercase tracking-wider text-zinc-500">Exhibitions Joined</span>
                                  <span className="text-3xl font-serif font-bold text-[#C8A96A] block leading-none">{dashboardData.stats.exhibitionsParticipated}</span>
                                  <span className="text-[10px] text-zinc-500 block font-light">Approved status</span>
                                </div>
                              </div>
                            </div>

                            {/* Biography / Statement */}
                            <div className="bg-[#1c1c1e] border border-white/[0.04] p-6 rounded-2xl space-y-3.5">
                              <h4 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#C8A96A]" /> Artist Statement
                              </h4>
                              {selectedUser.bio_en ? (
                                <p className="text-sm font-light text-zinc-300 leading-relaxed font-sans">{selectedUser.bio_en}</p>
                              ) : (
                                <p className="text-sm italic font-light text-zinc-500">No biography details provided by member.</p>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light text-zinc-400 pt-4 border-t border-white/[0.04] mt-4">
                                {selectedUser.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                                    <span>{selectedUser.phone}</span>
                                  </div>
                                )}
                                {selectedUser.website_url && (
                                  <div className="flex items-center gap-2">
                                    <Globe className="w-3.5 h-3.5 text-zinc-500" />
                                    <a href={selectedUser.website_url} target="_blank" rel="noopener noreferrer" className="text-[#C8A96A] hover:underline flex items-center gap-1 transition-colors">
                                      Website <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      {/* Artworks List Tab */}
                      <TabsContent value="artworks" className="space-y-4 outline-none">
                        {dashboardData?.artworks && dashboardData.artworks.length === 0 ? (
                          <div className="py-16 text-center bg-white/[0.01] border border-dashed border-white/[0.08] rounded-2xl">
                            <ImageIcon className="w-10 h-10 text-zinc-650 mx-auto mb-3" />
                            <h5 className="text-sm font-semibold text-white mb-1">No Artworks Submitted</h5>
                            <p className="text-xs text-zinc-500 font-light max-w-xs mx-auto">This member has not submitted any artworks to current exhibitions yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-5">
                            {dashboardData?.artworks.map((artwork: any) => (
                              <div key={artwork.id} className="bg-[#1c1c1e] border border-white/[0.04] p-5 rounded-2xl flex flex-col sm:flex-row gap-5 justify-between sm:items-center hover:border-white/[0.08] transition-colors duration-300">
                                <div className="flex gap-4 items-center">
                                  <div className="relative w-20 h-20 rounded-xl bg-zinc-950 overflow-hidden shrink-0 border border-white/[0.08] shadow-inner">
                                    {artwork.main_image_url ? (
                                      <Image src={artwork.main_image_url} alt="artwork" fill className="object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-white/20"><ImageIcon className="w-6 h-6"/></div>
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    <h4 className="font-serif font-bold text-white text-base leading-tight">{artwork.title_en}</h4>
                                    <p className="text-xs text-zinc-400 font-light">
                                      {artwork.category || 'Artwork'} • {artwork.medium_en}
                                    </p>
                                    <p className="text-[10px] text-zinc-550 font-light">
                                      Submitted {artwork.created_at ? new Date(artwork.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
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

                                  <div className="flex gap-2">
                                    {artwork.status === 'pending' && (
                                      <>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-9 w-9 text-emerald-400 hover:text-white hover:bg-emerald-500/20 rounded-full border border-white/[0.06] transition-colors" 
                                          onClick={() => handleArtworkModeration(artwork.id, 'approved')}
                                          aria-label="Approve Artwork"
                                        >
                                          <Check className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-9 w-9 text-red-400 hover:text-white hover:bg-red-500/20 rounded-full border border-white/[0.06] transition-colors" 
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
                                      className="h-9 w-9 text-white/50 hover:text-red-400 hover:bg-red-950/20 rounded-full border border-white/[0.06] transition-colors" 
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
                          <div className="py-16 text-center bg-white/[0.01] border border-dashed border-white/[0.08] rounded-2xl">
                            <ImageIcon className="w-10 h-10 text-zinc-650 mx-auto mb-3" />
                            <h5 className="text-sm font-semibold text-white mb-1">No Gallery Uploads</h5>
                            <p className="text-xs text-zinc-550 font-light max-w-xs mx-auto">This member has not uploaded any gallery media yet.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {dashboardData?.gallery.map((media: any) => (
                              <div key={media.id} className="bg-[#1c1c1e] border border-white/[0.04] p-4 rounded-2xl relative overflow-hidden group hover:border-white/[0.08] transition-all duration-300">
                                <div className="relative aspect-[16/10] bg-zinc-950 rounded-xl overflow-hidden border border-white/[0.06] mb-3">
                                  {media.media_type === 'image' ? (
                                    <Image src={media.url} alt="gallery" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                                      <PlayCircle className="w-12 h-12 text-[#C8A96A]" />
                                    </div>
                                  )}
                                </div>
                                <h5 className="font-serif font-bold text-sm text-white truncate">{media.title_en || 'Untitled Media'}</h5>
                                <div className="flex justify-between items-center mt-2.5 text-[10px] text-zinc-500 font-light">
                                  <span>Album: {media.gallery_albums?.title_en || 'Archive'}</span>
                                  <span className="uppercase font-semibold tracking-widest text-[#C8A96A]">{media.media_type}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      {/* Exhibitions History Tab */}
                      <TabsContent value="exhibitions" className="space-y-4 outline-none">
                        {dashboardData?.exhibitions && dashboardData.exhibitions.length === 0 ? (
                          <div className="py-16 text-center bg-white/[0.01] border border-dashed border-white/[0.08] rounded-2xl">
                            <Award className="w-10 h-10 text-zinc-650 mx-auto mb-3" />
                            <h5 className="text-sm font-semibold text-white mb-1">No Exhibitions Recorded</h5>
                            <p className="text-xs text-zinc-550 font-light max-w-xs mx-auto">This member has not participated in any exhibitions yet.</p>
                          </div>
                        ) : (
                          <div className="relative border-l border-white/[0.06] pl-6 ml-4 space-y-6 py-2">
                            {dashboardData?.exhibitions.map((part: any) => {
                              const exh = part.exhibitions
                              if (!exh) return null
                              return (
                                <div key={part.id} className="relative space-y-1">
                                  {/* Timeline marker */}
                                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-zinc-950 border border-[#C8A96A] flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#C8A96A]" />
                                  </div>
                                  <div className="flex justify-between items-start gap-4">
                                    <div>
                                      <h4 className="font-serif font-bold text-white text-base leading-tight">
                                        {locale === 'bn' && exh.theme_bn ? exh.theme_bn : exh.theme_en}
                                      </h4>
                                      <p className="text-xs text-zinc-400 font-light pt-0.5">
                                        Year: {exh.year} • Registered Role: {part.role || 'Artist'}
                                      </p>
                                    </div>
                                    <span className={cn(
                                      "px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border shrink-0",
                                      part.status === 'approved' 
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                        : part.status === 'rejected' 
                                          ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    )}>
                                      {part.status}
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </TabsContent>

                      {/* Permissions Tab */}
                      <TabsContent value="permissions" className="space-y-6 outline-none">
                        <div className="space-y-6">
                          <div className="bg-[#1c1c1e] border border-white/[0.04] p-6 rounded-2xl space-y-4">
                            <h4 className="font-serif font-bold text-lg text-white">Access Credentials</h4>
                            
                            <div className="space-y-2 max-w-sm">
                              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold block">System Access Role</label>
                              <Select 
                                value={selectedUser.role} 
                                onValueChange={(val) => handleRoleChange(selectedUser.id, val)}
                              >
                                <SelectTrigger className="bg-zinc-900 border-white/10 h-10 text-xs text-white">
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

                          <div className="bg-[#1c1c1e] border border-white/[0.04] p-6 rounded-2xl space-y-4">
                            <h4 className="font-serif font-bold text-lg text-white">Account Status Controls</h4>
                            <p className="text-xs text-zinc-400 font-light leading-relaxed">
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
                            <h4 className="font-serif font-bold text-lg text-red-450 flex items-center gap-2">
                              <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" /> Extreme Danger Zone
                            </h4>
                            <p className="text-xs text-zinc-400 font-light leading-relaxed">
                              Permanently remove this member profile and all their linked artworks, comments, catalogs, and logs. This action is irreversible and permanent.
                            </p>
                            
                            <div className="pt-2">
                              <Button 
                                variant="destructive" 
                                className="h-10 px-4 text-xs font-semibold uppercase tracking-wider bg-red-650/80 hover:bg-red-655 text-white rounded-xl transition-all cursor-pointer"
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
                              <span className="text-xs font-light text-zinc-400">Notification Classification</span>
                              <Select value={notifType} onValueChange={setNotifType}>
                                <SelectTrigger className="bg-zinc-900 border-white/10 text-xs text-white">
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
                              <span className="text-xs font-light text-zinc-400">Message Body</span>
                              <textarea
                                value={notifMessage}
                                onChange={(e) => setNotifMessage(e.target.value)}
                                placeholder="Write message to send directly to this user's dashboard..."
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-[#C8A96A] min-h-[100px] text-white placeholder:text-zinc-550"
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
                              <p className="text-xs font-light text-zinc-500 italic">No message logs exist.</p>
                            ) : (
                              <div className="space-y-3">
                                {dashboardData.notifications.map((notif: any) => (
                                  <div key={notif.id} className="p-4 bg-[#1c1c1e] rounded-xl border border-white/5 text-xs">
                                    <div className="flex justify-between items-center text-[10px] text-zinc-500 mb-1.5">
                                      <span className="uppercase font-semibold text-[#C8A96A] tracking-wider">{notif.type.replace('_', ' ')}</span>
                                      <span>{new Date(notif.created_at).toLocaleString()}</span>
                                    </div>
                                    <p className="font-light text-zinc-300">{notif.message_en}</p>
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
                          <div className="py-16 text-center bg-white/[0.01] border border-dashed border-white/[0.08] rounded-2xl">
                            <Activity className="w-10 h-10 text-zinc-650 mx-auto mb-3" />
                            <h5 className="text-sm font-semibold text-white mb-1">No Activity Logs</h5>
                            <p className="text-xs text-zinc-500 font-light max-w-xs mx-auto">No administrative or session log entries found for this member.</p>
                          </div>
                        ) : (
                          <div className="relative border-l border-white/[0.06] pl-6 ml-4 space-y-6 py-2 max-h-[480px] overflow-y-auto pr-2 scrollbar-thin">
                            {dashboardData?.auditLogs.map((log: any) => (
                              <div key={log.id} className="relative space-y-1 group">
                                {/* Timeline marker */}
                                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-zinc-950 border border-zinc-700 group-hover:border-[#C8A96A] flex items-center justify-center transition-colors">
                                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-[#C8A96A] transition-colors" />
                                </div>
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <p className="text-xs font-semibold text-white/95 uppercase tracking-wider">{log.action.replace(/_/g, ' ')}</p>
                                    <p className="text-[11px] text-[#C8A96A] font-light mt-0.5">
                                      Entity: <span className="font-mono text-zinc-400">{log.entity_type}</span> ({log.entity_id.slice(0, 8)})
                                    </p>
                                  </div>
                                  <span className="text-[10px] text-zinc-500 font-light shrink-0">
                                    {new Date(log.created_at).toLocaleDateString()} at {new Date(log.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
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
              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-[#C8A96A] min-h-[150px] text-white"
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
