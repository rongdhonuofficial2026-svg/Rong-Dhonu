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
      <section className="relative rounded-3xl overflow-hidden min-h-[300px] flex flex-col justify-end p-8 md:p-12 museum-shadow">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/users_hero.png" 
            alt="Users and Artists" 
            fill 
            className="object-cover object-center image-reveal scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="max-w-3xl text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-white/20 mb-6">
              <UsersIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium tracking-widest uppercase">Network & Personnel</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight text-shadow-elegant">
              User <span className="text-gradient-gold">Directory</span>
            </h1>
            <p className="text-white/80 text-lg font-light">
              Oversee the creative network. Manage access, review submissions, and moderate credentials for artists, committee members, and system administrators.
            </p>
          </div>
        </div>
      </section>

      {/* Directory Section */}
      <section className="space-y-8">
        <GlassPanel intensity="medium" className="p-6 rounded-2xl flex flex-col xl:flex-row justify-between gap-6 items-center">
          <div className="relative w-full xl:flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search directory by name, email, or username..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-11 bg-black/25 border-white/10 focus-visible:ring-accent rounded-xl h-12 text-foreground placeholder:text-muted-foreground/70"
            />
          </div>
          
          <div className="flex flex-wrap gap-4 w-full xl:w-auto items-center">
            {/* Role filter */}
            <div className="flex flex-col gap-1 w-full sm:w-[150px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Access Role</span>
              <Select value={role} onValueChange={(val) => { setRole(val); setPage(1); }}>
                <SelectTrigger className="bg-black/25 border-white/10 h-10">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10 text-white">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="committee">Committee</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status filter */}
            <div className="flex flex-col gap-1 w-full sm:w-[150px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Status</span>
              <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
                <SelectTrigger className="bg-black/25 border-white/10 h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10 text-white">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sorting */}
            <div className="flex flex-col gap-1 w-full sm:w-[180px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Sorting</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-black/25 border-white/10 h-10">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10 text-white">
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] z-20 rounded-2xl flex items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-accent" />
            </div>
          )}

          {!users || users.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 rounded-full border border-white/10 glass flex items-center justify-center mb-6 mx-auto">
                <UsersIcon className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="font-serif text-2xl mb-2 text-white">No members found</h3>
              <p className="text-muted-foreground">Adjust filters or search parameters to refine directory lookup.</p>
            </div>
          ) : (
            users.map((user: any) => {
              const artworksCount = user.artworksCount ?? (user.artworks?.length || 0)
              const exhibitionsCount = user.exhibitionsCount ?? (user.exhibition_participants?.length || 0)
              const isSuspended = user.status === 'suspended'
              const isPending = user.status === 'pending'

              return (
                <LuxuryCard key={user.id} padding="none" className="overflow-hidden group bg-[#111] hover:border-accent/40 transition-all duration-300">
                  <div className="p-6 relative z-10">
                    
                    {/* Status & Role Badges */}
                    <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                      <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full border backdrop-blur-md text-white ${
                        user.role === 'admin' || user.role === 'owner' 
                          ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' 
                          : user.role === 'committee' 
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                            : 'bg-white/5 border-white/10 text-white/70'
                      }`}>
                        {user.role}
                      </span>
                      
                      {isSuspended && (
                        <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-md border bg-red-500/20 border-red-500/40 text-red-300 flex items-center gap-1">
                          <Ban className="w-2.5 h-2.5" /> Suspended
                        </span>
                      )}
                      
                      {isPending && (
                        <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-md border bg-amber-500/20 border-amber-500/40 text-amber-300 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" /> Pending
                        </span>
                      )}
                    </div>

                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border border-white/15 bg-black/60 group-hover:border-accent/60 transition-colors duration-500">
                        {user.avatar_url ? (
                          <Image src={user.avatar_url} alt="Avatar" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground/60 font-serif text-xl bg-gradient-to-br from-black to-white/5">
                            {user.full_name_en?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-serif font-bold text-lg text-white truncate flex items-center gap-2 group-hover:text-gradient-gold transition-all duration-500">
                          {user.full_name_en || 'Unnamed User'}
                          {(user.role === 'admin' || user.role === 'owner') && <Shield className="w-3.5 h-3.5 text-indigo-400" />}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 mt-1 truncate">
                          <Mail className="w-3.5 h-3.5 shrink-0 text-white/40" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.is_verified && (
                          <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-accent/15 text-accent text-[9px] font-bold uppercase tracking-wider rounded">
                            <Check className="w-2.5 h-2.5" /> Verified Artist
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-3 gap-2 text-center">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-0.5 flex items-center gap-1 justify-center"><ImageIcon className="w-2.5 h-2.5"/> Artworks</span>
                        <span className="font-medium text-white">{artworksCount}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-0.5 flex items-center gap-1 justify-center"><Calendar className="w-2.5 h-2.5"/> Exhibitions</span>
                        <span className="font-medium text-white">{exhibitionsCount}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-0.5 flex items-center gap-1 justify-center"><Activity className="w-2.5 h-2.5"/> Uploads</span>
                        <span className="font-medium text-white">{user.galleryCount ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="bg-black/30 border-t border-white/5 p-4 flex gap-2">
                    <PremiumButton variant="glass" className="flex-1 h-9 text-xs" onClick={() => openUserDrawer(user)}>
                      Manage Profile
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
            >
              Previous
            </PremiumButton>
            <span className="text-sm text-muted-foreground font-light">
              Page <span className="text-white font-medium">{page}</span> of {totalPages}
            </span>
            <PremiumButton 
              variant="glass" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
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
              
              {/* Profile Cover / Header section */}
              <div className="relative h-[200px] bg-gradient-to-br from-indigo-950 via-zinc-900 to-black p-8 flex flex-col justify-end border-b border-white/5">
                <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                  <PremiumButton variant="glass" className="h-9 px-3 text-xs bg-black/60" onClick={() => exportMemberData(selectedUser)}>
                    <Download className="w-3.5 h-3.5 mr-1" /> Export Data
                  </PremiumButton>
                  <Button variant="ghost" size="icon" className="text-white/60 hover:text-white rounded-full bg-black/50" onClick={() => setIsDrawerOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex gap-6 items-end relative z-10">
                  <div className="relative w-20 h-20 rounded-full border-2 border-white/20 bg-zinc-950 overflow-hidden shadow-2xl shrink-0">
                    {selectedUser.avatar_url ? (
                      <Image src={selectedUser.avatar_url} alt="Avatar" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground/60 font-serif text-3xl">
                        {selectedUser.full_name_en?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-3xl tracking-tight text-white mb-1.5 flex items-center gap-2">
                      {selectedUser.full_name_en}
                      {selectedUser.is_verified && <CheckCircle className="w-5 h-5 text-accent" />}
                    </h2>
                    <p className="text-white/70 text-sm font-light tracking-wide flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-white/40" /> {selectedUser.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar Settings & Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
                
                {/* Info Sidebar panel */}
                <div className="lg:col-span-4 bg-black/25 border-r border-white/5 p-6 space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Member Metadata</h4>
                    <div className="space-y-3 text-xs font-light text-muted-foreground">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>Status</span>
                        <span className={cn(
                          "font-bold uppercase tracking-wider",
                          selectedUser.status === 'suspended' ? 'text-red-400' : selectedUser.status === 'pending' ? 'text-amber-400' : 'text-emerald-400'
                        )}>{selectedUser.status}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>Role</span>
                        <span className="font-bold text-white capitalize">{selectedUser.role}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>Joined</span>
                        <span className="text-white">{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span>Last Login</span>
                        <span className="text-white">{selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString() : 'Never'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Administrative Fast Actions */}
                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Admin Actions</h4>
                    
                    {/* Role changer */}
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Modify Role Access</span>
                      <Select 
                        value={selectedUser.role} 
                        onValueChange={(val) => handleRoleChange(selectedUser.id, val)}
                      >
                        <SelectTrigger className="bg-zinc-900 border-white/10 h-9 text-xs">
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

                    {/* Quick status updates */}
                    <div className="flex flex-col gap-2 pt-2">
                      {selectedUser.status === 'pending' && (
                        <PremiumButton variant="primary" className="w-full h-9 text-xs" onClick={() => handleApprove(selectedUser.id)}>
                          Approve Account
                        </PremiumButton>
                      )}
                      
                      {selectedUser.status === 'suspended' ? (
                        <PremiumButton variant="glass" className="w-full h-9 text-xs border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10" onClick={() => handleReactivate(selectedUser.id)}>
                          Reactivate Account
                        </PremiumButton>
                      ) : (
                        <PremiumButton variant="glass" className="w-full h-9 text-xs border-red-500/20 text-red-400 hover:bg-red-500/10" onClick={() => handleSuspend(selectedUser.id)}>
                          Suspend Account
                        </PremiumButton>
                      )}

                      <PremiumButton variant="glass" className="w-full h-9 text-xs border-white/15 text-white/80 hover:bg-white/5" onClick={() => handleDeleteUser(selectedUser.id)}>
                        Delete Profile
                      </PremiumButton>
                    </div>
                  </div>
                </div>

                {/* Main Tabs Area */}
                <div className="lg:col-span-8 p-6">
                  {drawerLoading ? (
                    <div className="flex flex-col items-center justify-center h-[350px] gap-3">
                      <RefreshCw className="w-8 h-8 animate-spin text-accent" />
                      <span className="text-xs text-muted-foreground">Retrieving member statistics...</span>
                    </div>
                  ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                      <TabsList className="bg-black/35 border border-white/5 w-full justify-start overflow-x-auto flex scrollbar-hide">
                        <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                        <TabsTrigger value="artworks" className="text-xs">Artworks</TabsTrigger>
                        <TabsTrigger value="gallery" className="text-xs">Gallery</TabsTrigger>
                        <TabsTrigger value="exhibitions" className="text-xs">Exhibitions</TabsTrigger>
                        <TabsTrigger value="communications" className="text-xs">Messaging</TabsTrigger>
                        <TabsTrigger value="logs" className="text-xs">Logs</TabsTrigger>
                      </TabsList>

                      {/* Overview Panel */}
                      <TabsContent value="overview" className="space-y-6">
                        {dashboardData && (
                          <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              <div className="bg-[#111] p-4 rounded-xl border border-white/5">
                                <span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60">Submitted Art</span>
                                <span className="text-2xl font-serif font-bold text-white mt-1 block">{dashboardData.stats.artworksSubmitted}</span>
                              </div>
                              <div className="bg-[#111] p-4 rounded-xl border border-white/5">
                                <span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60">Approved Art</span>
                                <span className="text-2xl font-serif font-bold text-emerald-400 mt-1 block">{dashboardData.stats.artworksApproved}</span>
                              </div>
                              <div className="bg-[#111] p-4 rounded-xl border border-white/5">
                                <span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60">Pending Review</span>
                                <span className="text-2xl font-serif font-bold text-amber-400 mt-1 block">{dashboardData.stats.artworksPending}</span>
                              </div>
                              <div className="bg-[#111] p-4 rounded-xl border border-white/5">
                                <span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60">Gallery Uploads</span>
                                <span className="text-2xl font-serif font-bold text-white mt-1 block">{dashboardData.stats.galleryUploads}</span>
                              </div>
                              <div className="bg-[#111] p-4 rounded-xl border border-white/5">
                                <span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60">Exhibitions Joined</span>
                                <span className="text-2xl font-serif font-bold text-accent mt-1 block">{dashboardData.stats.exhibitionsParticipated}</span>
                              </div>
                              <div className="bg-[#111] p-4 rounded-xl border border-white/5">
                                <span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60">Catalogs Pubbed</span>
                                <span className="text-2xl font-serif font-bold text-white mt-1 block">{dashboardData.stats.catalogContributions}</span>
                              </div>
                            </div>

                            {/* Bio / Details info */}
                            <div className="space-y-4">
                              <h4 className="font-serif font-bold text-lg text-white border-b border-white/5 pb-2">Biography & Links</h4>
                              
                              {selectedUser.bio_en ? (
                                <p className="text-sm font-light text-muted-foreground leading-relaxed">{selectedUser.bio_en}</p>
                              ) : (
                                <p className="text-sm italic font-light text-muted-foreground/50">No biography details provided by member.</p>
                              )}

                              <div className="grid grid-cols-2 gap-4 text-xs font-light text-muted-foreground pt-2">
                                {selectedUser.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-accent" />
                                    <span>{selectedUser.phone}</span>
                                  </div>
                                )}
                                {selectedUser.website_url && (
                                  <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-accent" />
                                    <a href={selectedUser.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline flex items-center gap-0.5">
                                      Website <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </TabsContent>

                      {/* Artworks List Tab */}
                      <TabsContent value="artworks" className="space-y-4">
                        {dashboardData?.artworks && dashboardData.artworks.length === 0 ? (
                          <div className="py-12 text-center text-muted-foreground font-light text-sm">
                            No artworks submitted by this artist.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {dashboardData?.artworks.map((artwork: any) => (
                              <div key={artwork.id} className="flex gap-4 p-4 bg-[#111] rounded-xl border border-white/5 justify-between items-center">
                                <div className="flex gap-4 items-center">
                                  <div className="relative w-16 h-12 rounded bg-zinc-950 overflow-hidden shrink-0 border border-white/5">
                                    {artwork.main_image_url ? (
                                      <Image src={artwork.main_image_url} alt="artwork" fill className="object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-white/20"><ImageIcon className="w-5 h-5"/></div>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-serif font-bold text-white text-sm">{artwork.title_en}</h4>
                                    <div className="flex gap-2 items-center mt-1">
                                      <span className="text-[10px] text-muted-foreground">{artwork.category || 'Artwork'} • {artwork.medium_en}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${
                                    artwork.status === 'approved' 
                                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                                      : artwork.status === 'rejected' 
                                        ? 'bg-red-500/10 border-red-500/25 text-red-400' 
                                        : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                                  }`}>
                                    {artwork.status}
                                  </span>

                                  <div className="flex gap-1.5">
                                    {artwork.status === 'pending' && (
                                      <>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400 hover:text-white hover:bg-emerald-500/20" onClick={() => handleArtworkModeration(artwork.id, 'approved')}>
                                          <Check className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-white hover:bg-red-500/20" onClick={() => handleArtworkModeration(artwork.id, 'rejected')}>
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </>
                                    )}
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10" onClick={() => handleArtworkDeletion(artwork.id)}>
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
                      <TabsContent value="gallery" className="space-y-4">
                        {dashboardData?.gallery && dashboardData.gallery.length === 0 ? (
                          <div className="py-12 text-center text-muted-foreground font-light text-sm">
                            No gallery media uploaded by this member.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {dashboardData?.gallery.map((media: any) => (
                              <div key={media.id} className="bg-[#111] p-3 rounded-xl border border-white/5 relative overflow-hidden group">
                                <div className="relative aspect-[16/10] bg-zinc-950 rounded-lg overflow-hidden border border-white/5 mb-3">
                                  {media.media_type === 'image' ? (
                                    <Image src={media.url} alt="gallery" fill className="object-cover" />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                                      <PlayCircle className="w-12 h-12 text-white/50" />
                                    </div>
                                  )}
                                </div>
                                <h5 className="font-serif font-bold text-sm text-white truncate">{media.title_en || 'Untitled Media'}</h5>
                                <div className="flex justify-between items-center mt-2 text-[10px] text-muted-foreground">
                                  <span>Album: {media.gallery_albums?.title_en || 'Archive'}</span>
                                  <span className="uppercase font-bold text-accent">{media.media_type}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      {/* Exhibitions History Tab */}
                      <TabsContent value="exhibitions" className="space-y-4">
                        {dashboardData?.exhibitions && dashboardData.exhibitions.length === 0 ? (
                          <div className="py-12 text-center text-muted-foreground font-light text-sm">
                            No exhibition participations recorded for this member.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {dashboardData?.exhibitions.map((part: any) => {
                              const exh = part.exhibitions
                              if (!exh) return null
                              return (
                                <div key={part.id} className="flex justify-between items-center p-4 bg-[#111] rounded-xl border border-white/5">
                                  <div>
                                    <h4 className="font-serif font-bold text-white text-sm">
                                      {locale === 'bn' && exh.theme_bn ? exh.theme_bn : exh.theme_en}
                                    </h4>
                                    <span className="text-[10px] text-muted-foreground mt-0.5 block">Year: {exh.year} • Registered Role: {part.role || 'Artist'}</span>
                                  </div>
                                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${
                                    part.status === 'approved' 
                                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                                      : part.status === 'rejected' 
                                        ? 'bg-red-500/10 border-red-500/25 text-red-400' 
                                        : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                                  }`}>
                                    {part.status}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </TabsContent>

                      {/* Communications / Messaging Tab */}
                      <TabsContent value="communications" className="space-y-6">
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
                              <span className="text-xs font-light text-muted-foreground">Bilingual English Message</span>
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
                      <TabsContent value="logs" className="space-y-4">
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
