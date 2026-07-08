'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Save, History, Eye, Loader2, Send, Code, LayoutTemplate, 
  ArrowUp, ArrowDown, EyeOff, Check, AlertCircle, RefreshCw, 
  Calendar, RotateCcw, Monitor, Tablet, Phone, Plus, Trash2, Globe,
  Image as ImageIcon, Folder, Tag, Search, Filter, ShieldAlert, BarChart3,
  Layers, Settings, Share2, AlertTriangle, FileCheck, CheckCircle
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { LuxuryCard } from '@/components/admin/ui/LuxuryCard'
import { PremiumButton } from '@/components/admin/ui/PremiumButton'
import { GlassPanel } from '@/components/admin/ui/GlassPanel'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  saveCMSDraft, publishCMSPage, scheduleCMSPublish, getPageVersions, 
  rollbackToVersion, reorderCMSSections, getCMSDashboardStats, deleteCMSAsset 
} from '@/actions/admin/cms'
import { cn } from '@/lib/utils'

interface CMSEngineManagerProps {
  initialPages: any[]
  locale: string
}

export function CMSEngineManager({ initialPages, locale }: CMSEngineManagerProps) {
  const router = useRouter()
  const [pages, setPages] = useState<any[]>(initialPages)
  const [selectedPageSlug, setSelectedPageSlug] = useState('home')
  
  // Current active editing page state
  const currentPage = pages.find(p => p.slug === selectedPageSlug) || pages[0]
  const [sections, setSections] = useState<any[]>(currentPage?.cms_sections || [])
  
  const [activeView, setActiveView] = useState<'editor' | 'history' | 'schedule' | 'media' | 'seo' | 'analytics'>('editor')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [previewLocale, setPreviewLocale] = useState(locale)
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(true)

  // Saving / Version States
  const [isAutosaving, setIsAutosaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved')
  const [isPublishing, setIsPublishing] = useState(false)
  const [changeSummary, setChangeSummary] = useState('')
  const [versions, setVersions] = useState<any[]>([])
  const [versionsLoading, setVersionsLoading] = useState(false)

  // Scheduling State
  const [scheduleTime, setScheduleTime] = useState('')
  const [isScheduling, setIsScheduling] = useState(false)

  // Media Library state
  const [mediaFolder, setMediaFolder] = useState('/')
  const [mediaSearch, setMediaSearch] = useState('')
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null)
  const [mediaList, setMediaList] = useState<any[]>([
    { id: '1', filename: 'hero.png', storage_path: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800', file_size: 1450000, mime_type: 'image/png', folder_path: '/', alt_text_en: 'Exhibition Hallway', alt_text_bn: 'প্রদর্শনী হলওয়ে' },
    { id: '2', filename: 'catalogs_hero.png', storage_path: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800', file_size: 1980000, mime_type: 'image/png', folder_path: '/exhibitions', alt_text_en: 'Abstract Paintings Grid', alt_text_bn: 'বিমূর্ত চিত্রকর্ম গ্রিড' },
    { id: '3', filename: 'art_museum.jpg', storage_path: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800', file_size: 2450000, mime_type: 'image/jpeg', folder_path: '/gallery', alt_text_en: 'Creative Art Museum View', alt_text_bn: 'সৃজনশীল শিল্প জাদুঘর ভিউ' }
  ])

  // Analytics states
  const [dashboardStats, setDashboardStats] = useState<any>({
    totalPages: 7,
    publishedPages: 7,
    totalSections: 12,
    activeSections: 12,
    subscriberCount: 240,
    mediaCount: 3,
    recentActivity: []
  })
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // SEO states
  const [seoConfig, setSeoConfig] = useState<Record<string, any>>({
    title: 'Rongdhono Artists\' Collective',
    description: 'The official digital museum and gallery of Rongdhono Artists\' Collective. Discover curated catalogs, visual exhibitions, and talented local fine artists.',
    keywords: 'fine arts, exhibitions, digital museum, artists collective, West Bengal',
    canonical: 'https://rongdhono.art',
    og_image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200'
  })

  // Validation warnings state
  const [validationReport, setValidationReport] = useState<{ errors: string[]; warnings: string[] }>({ errors: [], warnings: [] })

  // Sync state when page slug changes
  useEffect(() => {
    const page = pages.find(p => p.slug === selectedPageSlug)
    if (page) {
      setSections(page.cms_sections || [])
      setSaveStatus('saved')
    }
  }, [selectedPageSlug, pages])

  // Load analytics statistics
  const fetchStats = async () => {
    setAnalyticsLoading(true)
    const res = await getCMSDashboardStats()
    if (res.success && res.stats) {
      setDashboardStats(res.stats)
    }
    setAnalyticsLoading(false)
  }

  useEffect(() => {
    if (activeView === 'analytics') {
      fetchStats()
    }
  }, [activeView])

  // Run validation checks on sections contents
  useEffect(() => {
    const errors: string[] = []
    const warnings: string[] = []

    sections.forEach((sec: any) => {
      sec.cms_content?.forEach((field: any) => {
        // 1. Missing bilingual translation warning
        if (field.value_en && !field.value_bn) {
          warnings.push(`Section "${sec.section_key}": Field "${field.field_key}" lacks Bengali translation.`)
        }
        // 2. Empty values warning
        if (!field.value_en && !field.value_bn) {
          warnings.push(`Section "${sec.section_key}": Field "${field.field_key}" is empty.`)
        }
        // 3. Broken link validation
        if (field.field_type === 'button') {
          const btnUrl = field.metadata?.url || ''
          if (btnUrl && !btnUrl.startsWith('/') && !btnUrl.startsWith('http://') && !btnUrl.startsWith('https://')) {
            errors.push(`Section "${sec.section_key}": Button link "${btnUrl}" is invalid. URL must be absolute or start with "/".`)
          }
        }
      })
    })

    setValidationReport({ errors, warnings })
  }, [sections])

  // Debounced Autosave Engine
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const triggerAutosave = (updatedSections: any[]) => {
    setSaveStatus('dirty')
    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current)
    
    autosaveTimeoutRef.current = setTimeout(async () => {
      setIsAutosaving(true)
      setSaveStatus('saving')
      const res = await saveCMSDraft(selectedPageSlug, updatedSections)
      if (res.success) {
        setSaveStatus('saved')
        setPages(prev => prev.map(p => p.slug === selectedPageSlug ? { ...p, cms_sections: updatedSections, status: 'draft' } : p))
      } else {
        setSaveStatus('dirty')
        toast.error('Autosave failed', { description: res.error })
      }
      setIsAutosaving(false)
    }, 3000)
  }

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current)
    }
  }, [])

  // Content field change handler
  const handleFieldChange = (sectionId: string, fieldKey: string, fieldName: 'value_en' | 'value_bn', value: string) => {
    const updated = sections.map((sec: any) => {
      if (sec.id === sectionId) {
        const updatedContent = sec.cms_content.map((content: any) => {
          if (content.field_key === fieldKey) {
            return { ...content, [fieldName]: value }
          }
          return content
        })
        return { ...sec, cms_content: updatedContent }
      }
      return sec
    })
    setSections(updated)
    triggerAutosave(updated)
  }

  // Button field metadata change handler
  const handleButtonMetaChange = (sectionId: string, fieldKey: string, metaKey: string, value: any) => {
    const updated = sections.map((sec: any) => {
      if (sec.id === sectionId) {
        const updatedContent = sec.cms_content.map((content: any) => {
          if (content.field_key === fieldKey) {
            return { 
              ...content, 
              metadata: { ...content.metadata, [metaKey]: value } 
            }
          }
          return content
        })
        return { ...sec, cms_content: updatedContent }
      }
      return sec
    })
    setSections(updated)
    triggerAutosave(updated)
  }

  // Section position sorting Up / Down
  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= sections.length) return
    
    const reordered = [...sections]
    const temp = reordered[index]
    reordered[index] = reordered[targetIdx]
    reordered[targetIdx] = temp

    const finalOrder = reordered.map((sec, idx) => ({ ...sec, display_order: idx }))
    setSections(finalOrder)
    
    setIsAutosaving(true)
    const res = await reorderCMSSections(selectedPageSlug, finalOrder.map(s => s.id))
    if (res.success) {
      setSaveStatus('saved')
      toast.success('Section order updated')
    } else {
      toast.error('Failed to reorder sections')
    }
    setIsAutosaving(false)
  }

  // Section enabled toggle visibility
  const handleToggleSection = (sectionId: string) => {
    const updated = sections.map((sec: any) => {
      if (sec.id === sectionId) {
        return { ...sec, enabled: !sec.enabled }
      }
      return sec
    })
    setSections(updated)
    triggerAutosave(updated)
  }

  // Fetch Page Version History Snapshots
  const loadVersions = async () => {
    setVersionsLoading(true)
    const res = await getPageVersions(selectedPageSlug)
    if (res.success && res.versions) {
      setVersions(res.versions)
    }
    setVersionsLoading(false)
  }

  useEffect(() => {
    if (activeView === 'history') {
      loadVersions()
    }
  }, [activeView, selectedPageSlug])

  // Rollback to specific version snapshot
  const handleRollback = async (version: any) => {
    toast.promise(rollbackToVersion(selectedPageSlug, version.snapshot, `Rollback to Version ${version.version}`), {
      loading: `Restoring snapshot version ${version.version}...`,
      success: () => {
        router.refresh()
        window.location.reload()
        return `Version ${version.version} restored successfully`
      },
      error: (err) => err.message || 'Rollback failed'
    })
  }

  // Publish Draft changes live
  const handlePublish = async () => {
    if (validationReport.errors.length > 0) {
      toast.error('Publish blocked', { description: 'Critical validation errors must be resolved before publishing.' })
      return
    }

    setIsPublishing(true)
    const res = await publishCMSPage(selectedPageSlug, changeSummary)
    if (res.success) {
      setChangeSummary('')
      toast.success('Page published live', { description: `Release snapshot created as version ${res.version}.` })
      setPages(prev => prev.map(p => p.slug === selectedPageSlug ? { ...p, status: 'published' } : p))
    } else {
      toast.error('Failed to publish', { description: res.error })
    }
    setIsPublishing(false)
  }

  // Schedule Publish Release
  const handleScheduleSubmit = async () => {
    if (!scheduleTime) return
    setIsScheduling(true)
    
    const snapshot = { sections }
    const res = await scheduleCMSPublish(selectedPageSlug, scheduleTime, snapshot)
    
    if (res.success) {
      toast.success('Publish scheduled successfully', { description: `Release set for ${new Date(scheduleTime).toLocaleString()}` })
      setScheduleTime('')
      setActiveView('editor')
      setPages(prev => prev.map(p => p.slug === selectedPageSlug ? { ...p, status: 'scheduled' } : p))
    } else {
      toast.error('Scheduling failed', { description: res.error })
    }
    setIsScheduling(false)
  }

  // Trigger unload prompt warning if draft is dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'dirty') {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes in your layout draft. Are you sure you want to exit?'
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [saveStatus])

  return (
    <div className="space-y-8 pb-20">
      
      {/* Content Studio Header Bar */}
      <GlassPanel intensity="light" className="p-4 rounded-2xl flex flex-col lg:flex-row justify-between gap-5 items-center border border-white/[0.06] bg-[#0e0e10]/85">
        
        {/* Page selector & tabs trigger */}
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="flex flex-col gap-1 w-full sm:w-[180px]">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Edit Website Area</span>
            <Select value={selectedPageSlug} onValueChange={setSelectedPageSlug}>
              <SelectTrigger className="bg-white/[0.02] border-white/[0.08] h-10 text-xs text-white">
                <SelectValue placeholder="Select Page" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/[0.08] text-white">
                {pages.map(p => (
                  <SelectItem key={p.id} value={p.slug} className="capitalize">{p.slug === 'global' ? 'Global Settings' : `${p.slug} Page`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-3 sm:pt-0">
            <PremiumButton 
              variant={activeView === 'editor' ? 'primary' : 'ghost'} 
              className="h-9 px-3 text-xs" 
              onClick={() => setActiveView('editor')}
            >
              <LayoutTemplate className="w-3.5 h-3.5 mr-1" /> Page Builder
            </PremiumButton>
            <PremiumButton 
              variant={activeView === 'media' ? 'primary' : 'ghost'} 
              className="h-9 px-3 text-xs" 
              onClick={() => setActiveView('media')}
            >
              <ImageIcon className="w-3.5 h-3.5 mr-1" /> Media Library
            </PremiumButton>
            <PremiumButton 
              variant={activeView === 'seo' ? 'primary' : 'ghost'} 
              className="h-9 px-3 text-xs" 
              onClick={() => setActiveView('seo')}
            >
              <Share2 className="w-3.5 h-3.5 mr-1" /> SEO Studio
            </PremiumButton>
            <PremiumButton 
              variant={activeView === 'history' ? 'primary' : 'ghost'} 
              className="h-9 px-3 text-xs"
              onClick={() => setActiveView('history')}
            >
              <History className="w-3.5 h-3.5 mr-1" /> Snapshots
            </PremiumButton>
            <PremiumButton 
              variant={activeView === 'schedule' ? 'primary' : 'ghost'} 
              className="h-9 px-3 text-xs"
              onClick={() => setActiveView('schedule')}
            >
              <Calendar className="w-3.5 h-3.5 mr-1" /> Scheduler
            </PremiumButton>
            <PremiumButton 
              variant={activeView === 'analytics' ? 'primary' : 'ghost'} 
              className="h-9 px-3 text-xs"
              onClick={() => setActiveView('analytics')}
            >
              <BarChart3 className="w-3.5 h-3.5 mr-1" /> Analytics
            </PremiumButton>
          </div>
        </div>

        {/* Action States & Saving Indicators */}
        <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full border",
              currentPage?.status === 'published' 
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                : currentPage?.status === 'scheduled'
                  ? 'bg-blue-500/10 border-blue-500/25 text-blue-400'
                  : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
            )}>
              {currentPage?.status}
            </span>

            <div className="flex items-center gap-1.5 text-[10px] text-zinc-550 font-light">
              {saveStatus === 'saving' && <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />}
              {saveStatus === 'saved' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              {saveStatus === 'dirty' && <AlertCircle className="w-3.5 h-3.5 text-zinc-500" />}
              <span className="capitalize">
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Autosaved' : 'Dirty Draft'}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <PremiumButton variant="glass" className="h-10 text-xs uppercase" onClick={() => setIsLivePreviewOpen(!isLivePreviewOpen)}>
              <Eye className="w-3.5 h-3.5 mr-1" /> {isLivePreviewOpen ? 'Hide Preview' : 'Preview'}
            </PremiumButton>
            <PremiumButton 
              variant="primary" 
              className="h-10 text-xs uppercase font-semibold tracking-wider" 
              disabled={isPublishing || validationReport.errors.length > 0} 
              onClick={handlePublish}
            >
              {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Send className="w-3.5 h-3.5 mr-1" />} 
              Publish
            </PremiumButton>
          </div>
        </div>
      </GlassPanel>

      {/* Validation Warnings Drawer */}
      {(validationReport.errors.length > 0 || validationReport.warnings.length > 0) && (
        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-2 text-left">
          <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" /> Content Validation Report
          </div>
          <ul className="text-[11px] text-zinc-400 font-light list-disc list-inside space-y-1">
            {validationReport.errors.map((e, idx) => (
              <li key={idx} className="text-red-400 font-semibold">{e}</li>
            ))}
            {validationReport.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Workspace Panel Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Workspace views content */}
        <div className={cn(
          "space-y-6 transition-all duration-300",
          isLivePreviewOpen && activeView !== 'analytics' ? 'lg:col-span-7' : 'lg:col-span-12'
        )}>
          
          {/* EDITOR / LAYOUT BUILDER VIEW */}
          {activeView === 'editor' && (
            <div className="space-y-8">
              {sections.length === 0 ? (
                <div className="py-24 text-center bg-white/[0.01] border border-dashed border-white/[0.08] rounded-3xl">
                  <LayoutTemplate className="w-10 h-10 text-zinc-650 mx-auto mb-3" />
                  <h4 className="text-sm font-semibold text-white mb-1">No layout sections configured</h4>
                  <p className="text-xs text-zinc-500 font-light">Seeding error or missing section rows for this page.</p>
                </div>
              ) : (
                sections.map((sec, secIdx) => (
                  <LuxuryCard 
                    key={sec.id} 
                    title={sec.section_key.replace(/([A-Z])/g, ' $1')} 
                    description={`Bilingual Page Component: ${sec.component_type}`}
                    padding="lg"
                    className="relative border border-white/[0.06] bg-[#0e0e10]/95 hover:border-white/[0.1] transition-colors"
                  >
                    
                    {/* Position and enabled controllers inside card header */}
                    <div className="absolute top-6 right-6 flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-zinc-550 hover:text-white rounded-full border border-white/[0.06] disabled:opacity-30" 
                        disabled={secIdx === 0}
                        onClick={() => handleMoveSection(secIdx, 'up')}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-zinc-550 hover:text-white rounded-full border border-white/[0.06] disabled:opacity-30" 
                        disabled={secIdx === sections.length - 1}
                        onClick={() => handleMoveSection(secIdx, 'down')}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          "h-8 w-8 rounded-full border border-white/[0.06]",
                          sec.enabled ? 'text-emerald-400 hover:bg-emerald-950/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'
                        )}
                        onClick={() => handleToggleSection(sec.id)}
                      >
                        {sec.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </Button>
                    </div>

                    {/* Section Fields Form Grid */}
                    <div className={cn(
                      "mt-8 space-y-6 pt-6 border-t border-white/[0.04]",
                      !sec.enabled && 'opacity-40 pointer-events-none'
                    )}>
                      {sec.cms_content?.map((field: any) => {
                        const isText = field.field_type === 'text'
                        const isTextarea = field.field_type === 'textarea'
                        const isRichText = field.field_type === 'rich_text'
                        const isMedia = field.field_type === 'media'
                        const isButton = field.field_type === 'button'
                        const isJson = field.field_type === 'json'

                        return (
                          <div key={field.id} className="space-y-3.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96A] block">
                              {field.field_key.replace(/_/g, ' ')} <span className="text-zinc-550 text-[9px] lowercase">({field.field_type})</span>
                            </label>

                            {/* TEXT & TEXTAREA inputs */}
                            {(isText || isTextarea || isRichText) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <span className="text-[9px] text-zinc-500 uppercase flex items-center gap-1 font-semibold"><Globe className="w-3 h-3"/> English Value</span>
                                  {isText ? (
                                    <Input 
                                      value={field.value_en || ''} 
                                      onChange={(e) => handleFieldChange(sec.id, field.field_key, 'value_en', e.target.value)}
                                      className="bg-white/[0.02] border-white/[0.08] text-white focus-visible:ring-[#C8A96A] h-10 text-xs rounded-xl"
                                    />
                                  ) : (
                                    <Textarea 
                                      rows={4}
                                      value={field.value_en || ''} 
                                      onChange={(e) => handleFieldChange(sec.id, field.field_key, 'value_en', e.target.value)}
                                      className="bg-white/[0.02] border-white/[0.08] text-white focus-visible:ring-[#C8A96A] text-xs p-3 rounded-xl resize-none"
                                    />
                                  )}
                                </div>
                                <div className="space-y-1.5">
                                  <span className="text-[9px] text-zinc-500 uppercase flex items-center gap-1 font-semibold"><Globe className="w-3 h-3"/> Bengali Value</span>
                                  {isText ? (
                                    <Input 
                                      value={field.value_bn || ''} 
                                      onChange={(e) => handleFieldChange(sec.id, field.field_key, 'value_bn', e.target.value)}
                                      className="bg-white/[0.02] border-white/[0.08] text-white focus-visible:ring-[#C8A96A] h-10 text-xs rounded-xl"
                                    />
                                  ) : (
                                    <Textarea 
                                      rows={4}
                                      value={field.value_bn || ''} 
                                      onChange={(e) => handleFieldChange(sec.id, field.field_key, 'value_bn', e.target.value)}
                                      className="bg-white/[0.02] border-white/[0.08] text-white focus-visible:ring-[#C8A96A] text-xs p-3 rounded-xl resize-none"
                                    />
                                  )}
                                </div>
                              </div>
                            )}

                            {/* MEDIA picker field */}
                            {isMedia && (
                              <div className="space-y-3.5 bg-white/[0.01] border border-white/[0.04] p-4 rounded-xl">
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                  <div className="relative w-20 h-16 rounded-lg bg-zinc-950 overflow-hidden shrink-0 border border-white/[0.08]">
                                    {field.value_en ? (
                                      <img src={field.value_en} alt="Preview" className="object-cover w-full h-full" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-zinc-650"><ImageIcon className="w-5 h-5"/></div>
                                    )}
                                  </div>
                                  <div className="flex-1 space-y-1 w-full">
                                    <span className="text-[9px] text-zinc-500 uppercase font-semibold">Asset Reference Link (Storage Path)</span>
                                    <div className="flex gap-2">
                                      <Input 
                                        value={field.value_en || ''} 
                                        onChange={(e) => {
                                          handleFieldChange(sec.id, field.field_key, 'value_en', e.target.value)
                                          handleFieldChange(sec.id, field.field_key, 'value_bn', e.target.value)
                                        }}
                                        placeholder="https://images.unsplash.com/... or storage folder link"
                                        className="bg-white/[0.02] border-white/[0.08] text-white focus-visible:ring-[#C8A96A] h-9 text-xs rounded-lg"
                                      />
                                      <Button 
                                        variant="outline" 
                                        className="h-9 border-white/[0.08] bg-white/5 hover:bg-white/10 text-xs px-3 text-white"
                                        onClick={() => {
                                          setActiveView('media')
                                          toast.info('Browse media library files to select paths')
                                        }}
                                      >
                                        Browse
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* BUTTON action configs */}
                            {isButton && (
                              <div className="space-y-4 bg-white/[0.01] border border-white/[0.04] p-4 rounded-xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <span className="text-[9px] text-zinc-500 uppercase font-semibold">English Label</span>
                                    <Input 
                                      value={field.value_en || ''} 
                                      onChange={(e) => handleFieldChange(sec.id, field.field_key, 'value_en', e.target.value)}
                                      className="bg-white/[0.02] border-white/[0.08] text-white h-9 text-xs"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[9px] text-zinc-500 uppercase font-semibold">Bengali Label</span>
                                    <Input 
                                      value={field.value_bn || ''} 
                                      onChange={(e) => handleFieldChange(sec.id, field.field_key, 'value_bn', e.target.value)}
                                      className="bg-white/[0.02] border-white/[0.08] text-white h-9 text-xs"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                  <div className="space-y-1">
                                    <span className="text-[9px] text-zinc-500 uppercase font-semibold">Link Destination (URL)</span>
                                    <Input 
                                      value={field.metadata?.url || ''} 
                                      onChange={(e) => handleButtonMetaChange(sec.id, field.field_key, 'url', e.target.value)}
                                      placeholder="/exhibitions or https://..."
                                      className="bg-white/[0.02] border-white/[0.08] text-white h-9 text-xs"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[9px] text-zinc-500 uppercase font-semibold">Visual Style Variant</span>
                                    <Select 
                                      value={field.metadata?.variant || 'primary'} 
                                      onValueChange={(val) => handleButtonMetaChange(sec.id, field.field_key, 'variant', val)}
                                    >
                                      <SelectTrigger className="bg-[#141416] border-white/[0.08] h-9 text-xs text-white">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-zinc-950 border-white/[0.08] text-white">
                                        <SelectItem value="primary">Gold Accent</SelectItem>
                                        <SelectItem value="secondary">Off White</SelectItem>
                                        <SelectItem value="glass">Translucent Glass</SelectItem>
                                        <SelectItem value="ghost">Invisible Outline</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[9px] text-zinc-500 uppercase font-semibold">Behavior</span>
                                    <Select 
                                      value={field.metadata?.open_in_new_tab ? 'true' : 'false'} 
                                      onValueChange={(val) => handleButtonMetaChange(sec.id, field.field_key, 'open_in_new_tab', val === 'true')}
                                    >
                                      <SelectTrigger className="bg-[#141416] border-white/[0.08] h-9 text-xs text-white">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-zinc-950 border-white/[0.08] text-white">
                                        <SelectItem value="false">Open in Same Tab</SelectItem>
                                        <SelectItem value="true">Open in New Tab</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* JSON Editor (for logo maps/testimonial items/lists) */}
                            {isJson && (
                              <div className="space-y-1.5">
                                <span className="text-[9px] text-zinc-550 uppercase font-semibold">Bilingual JSON List Data (Advanced Schema)</span>
                                <Textarea 
                                  rows={6}
                                  value={field.value_en || '[]'} 
                                  onChange={(e) => {
                                    handleFieldChange(sec.id, field.field_key, 'value_en', e.target.value)
                                    handleFieldChange(sec.id, field.field_key, 'value_bn', e.target.value)
                                  }}
                                  className="font-mono text-[11px] bg-zinc-900 border-white/[0.08] text-blue-400 p-4 rounded-xl"
                                />
                              </div>
                            )}

                          </div>
                        )
                      })}
                    </div>
                  </LuxuryCard>
                ))
              )}
            </div>
          )}

          {/* VISUAL MEDIA LIBRARY VIEW */}
          {activeView === 'media' && (
            <div className="space-y-6 text-left">
              <h3 className="font-serif text-2xl text-white">Advanced Asset Manager</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                {/* Folder lists */}
                <div className="flex gap-2">
                  <Button variant={mediaFolder === '/' ? 'secondary' : 'outline'} className="h-9 text-xs text-white" onClick={() => setMediaFolder('/')}><Folder className="w-3.5 h-3.5 mr-1" /> /Root</Button>
                  <Button variant={mediaFolder === '/exhibitions' ? 'secondary' : 'outline'} className="h-9 text-xs text-white" onClick={() => setMediaFolder('/exhibitions')}><Folder className="w-3.5 h-3.5 mr-1" /> Exh</Button>
                  <Button variant={mediaFolder === '/gallery' ? 'secondary' : 'outline'} className="h-9 text-xs text-white" onClick={() => setMediaFolder('/gallery')}><Folder className="w-3.5 h-3.5 mr-1" /> Gal</Button>
                </div>
                
                {/* Search query input */}
                <div className="relative sm:col-span-3">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-550" />
                  <Input 
                    placeholder="Search media files..." 
                    value={mediaSearch} 
                    onChange={(e) => setMediaSearch(e.target.value)}
                    className="pl-9 bg-white/[0.02] border-white/[0.08] h-9 text-xs text-white"
                  />
                </div>
              </div>

              {/* Media gallery grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-[#0e0e10]/80 p-6 border border-white/[0.06] rounded-3xl">
                {mediaList
                  .filter(m => m.folder_path === mediaFolder && m.filename.toLowerCase().includes(mediaSearch.toLowerCase()))
                  .map((asset) => (
                    <div 
                      key={asset.id} 
                      className={cn(
                        "group relative rounded-2xl overflow-hidden border border-white/[0.06] cursor-pointer hover:border-accent/40 bg-zinc-950 p-2.5 space-y-2",
                        selectedMediaId === asset.id && 'border-accent ring-1 ring-accent'
                      )}
                      onClick={() => setSelectedMediaId(asset.id)}
                    >
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black">
                        <img src={asset.storage_path} alt="Asset" className="object-cover w-full h-full" />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-zinc-400 px-1 font-light">
                        <span className="truncate max-w-[120px]">{asset.filename}</span>
                        <span>{(asset.file_size / 1000000).toFixed(1)} MB</span>
                      </div>
                    </div>
                ))}
              </div>

              {/* Visual Focal point selector details pane */}
              {selectedMediaId && (
                <LuxuryCard title="Asset Details & Focal Coordinates" description="Specify English/Bengali image descriptions and crop points." padding="lg">
                  {(() => {
                    const currentAsset = mediaList.find(m => m.id === selectedMediaId)
                    if (!currentAsset) return null

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] font-bold text-[#C8A96A] uppercase tracking-widest block mb-2">English Alt Text</span>
                            <Input 
                              value={currentAsset.alt_text_en || ''}
                              onChange={(e) => {
                                setMediaList(prev => prev.map(m => m.id === selectedMediaId ? { ...m, alt_text_en: e.target.value } : m))
                              }}
                              className="bg-white/[0.02] border-white/[0.08] text-white h-9 text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-[#C8A96A] uppercase tracking-widest block mb-2">Bengali Alt Text</span>
                            <Input 
                              value={currentAsset.alt_text_bn || ''}
                              onChange={(e) => {
                                setMediaList(prev => prev.map(m => m.id === selectedMediaId ? { ...m, alt_text_bn: e.target.value } : m))
                              }}
                              className="bg-white/[0.02] border-white/[0.08] text-white h-9 text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest block mb-1">Image Storage Path</span>
                            <span className="text-xs text-blue-400 font-mono select-all truncate block">{currentAsset.storage_path}</span>
                            <span className="text-[9px] text-zinc-500 font-light block mt-1">Copy this link and paste in the Page Builder media input fields to use.</span>
                          </div>
                        </div>

                        {/* Interactive Focal Point Visual Cropper */}
                        <div className="space-y-4">
                          <span className="text-[10px] font-bold text-[#C8A96A] uppercase tracking-widest block mb-2">Visual Focal Point</span>
                          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/[0.08] cursor-crosshair">
                            <img src={currentAsset.storage_path} alt="Crop" className="object-cover w-full h-full" />
                            {/* Focal point indicator crosshair */}
                            <div 
                              className="absolute w-6 h-6 -ml-3 -mt-3 border-2 border-white rounded-full bg-accent/40 shadow-md pointer-events-none" 
                              style={{ left: '50%', top: '50%' }}
                            />
                          </div>
                          <span className="text-[9px] text-zinc-500 font-light block">Focal point coordinate locked to center layout crop configuration (50%, 50%).</span>
                        </div>
                      </div>
                    )
                  })()}
                </LuxuryCard>
              )}
            </div>
          )}

          {/* COMPLETE SEO STUDIO VIEW */}
          {activeView === 'seo' && (
            <div className="space-y-6 text-left">
              <h3 className="font-serif text-2xl text-white">Bilingual SEO Configurations</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Inputs card */}
                <LuxuryCard title="SEO Parameters" description="Define browser title headers and card snippets." padding="lg">
                  <div className="space-y-4 mt-6">
                    <div>
                      <span className="text-[10px] font-bold text-[#C8A96A] uppercase tracking-widest block mb-2">Meta Title Prefix</span>
                      <Input 
                        value={seoConfig.title}
                        onChange={(e) => setSeoConfig({ ...seoConfig, title: e.target.value })}
                        className="bg-white/[0.02] border-white/[0.08] text-white h-9 text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#C8A96A] uppercase tracking-widest block mb-2">Meta Description Statement</span>
                      <Textarea 
                        rows={4}
                        value={seoConfig.description}
                        onChange={(e) => setSeoConfig({ ...seoConfig, description: e.target.value })}
                        className="bg-white/[0.02] border-white/[0.08] text-white p-3 text-xs resize-none"
                      />
                    </div>
                  </div>
                </LuxuryCard>

                {/* Previews card */}
                <div className="space-y-6">
                  {/* Google search card preview */}
                  <div className="bg-[#1e1e1e] p-6 border border-zinc-800 rounded-3xl space-y-1.5 shadow-xl text-left">
                    <span className="text-[10px] text-zinc-550 uppercase tracking-wider block font-bold mb-2">Google Search Card Simulator</span>
                    <span className="text-[11px] text-zinc-400 block">https://rongdhono.art/{selectedPageSlug}</span>
                    <h4 className="text-lg text-blue-400 font-serif font-semibold hover:underline cursor-pointer leading-tight truncate">
                      {seoConfig.title} | {selectedPageSlug.toUpperCase()}
                    </h4>
                    <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-md line-clamp-2">
                      {seoConfig.description}
                    </p>
                  </div>

                  {/* Facebook OG Card preview */}
                  <div className="bg-[#141416] border border-white/[0.06] rounded-3xl overflow-hidden shadow-xl text-left max-w-sm mx-auto">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold px-4 py-2 border-b border-white/[0.04]">Facebook Share Card</span>
                    <div className="relative aspect-video w-full bg-black">
                      <img src={seoConfig.og_image} alt="OG Card" className="object-cover w-full h-full" />
                    </div>
                    <div className="p-4 bg-zinc-950 space-y-1">
                      <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">RONGDHONO.ART</span>
                      <h5 className="font-serif font-bold text-white text-sm truncate">{seoConfig.title}</h5>
                      <p className="text-[11px] text-zinc-400 font-light line-clamp-2">{seoConfig.description}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Snapshot History view */}
          {activeView === 'history' && (
            <div className="space-y-4 text-left">
              <h3 className="font-serif text-2xl text-white">Page Snapshot History</h3>
              <p className="text-xs text-zinc-400 font-light">
                Every release generates a system snapshot. Select any prior version to restore active contents instantly.
              </p>

              {versionsLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-accent" />
                  <span className="text-xs text-zinc-500">Retrieving page snapshots...</span>
                </div>
              ) : versions.length === 0 ? (
                <div className="py-16 text-center bg-white/[0.01] border border-dashed border-white/[0.08] rounded-2xl text-xs text-zinc-500">
                  No page version history recorded. Publish changes to capture snapshots.
                </div>
              ) : (
                <div className="space-y-4">
                  {versions.map((ver) => (
                    <div key={ver.id} className="p-5 bg-[#141416] border border-white/[0.06] rounded-2xl flex justify-between items-center hover:bg-[#18181b] transition-colors">
                      <div className="space-y-1">
                        <h5 className="font-serif font-bold text-white text-base">Version {ver.version}</h5>
                        <p className="text-xs text-zinc-400 font-light">{ver.change_summary}</p>
                        <span className="text-[10px] text-zinc-550 font-light block">
                          Published by {ver.profiles?.full_name_en || 'System Admin'} on {new Date(ver.created_at).toLocaleString()}
                        </span>
                      </div>
                      <PremiumButton 
                        variant="glass" 
                        leftIcon={<RotateCcw className="w-3.5 h-3.5" />} 
                        className="text-xs h-9 border-white/[0.08] hover:border-accent/40"
                        onClick={() => handleRollback(ver)}
                      >
                        Restore Snapshot
                      </PremiumButton>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Release Scheduler view */}
          {activeView === 'schedule' && (
            <div className="bg-[#141416] border border-white/[0.06] p-8 rounded-3xl space-y-6 max-w-xl text-left">
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-[#C8A96A]" /> Schedule Release Publish
                </h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  Prepare page updates and schedule them for automatic deployment at a future date. The cron runner automatically processes updates and revalidates cache systems.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/[0.04]">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96A]">Scheduled Release Datetime</span>
                  <Input 
                    type="datetime-local" 
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="bg-white/[0.02] border-white/[0.08] text-white focus-visible:ring-[#C8A96A] h-11 text-xs rounded-xl"
                  />
                </div>

                <div className="pt-4 flex gap-3 justify-end">
                  <PremiumButton variant="glass" className="h-10 text-xs" onClick={() => setActiveView('editor')}>
                    Cancel
                  </PremiumButton>
                  <PremiumButton 
                    variant="primary" 
                    className="h-10 text-xs font-semibold tracking-wider" 
                    disabled={isScheduling || !scheduleTime}
                    onClick={handleScheduleSubmit}
                  >
                    {isScheduling ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                    Confirm Schedule
                  </PremiumButton>
                </div>
              </div>
            </div>
          )}

          {/* PERFORMANCE & ANALYTICS VIEW */}
          {activeView === 'analytics' && (
            <div className="space-y-8 text-left">
              <h3 className="font-serif text-2xl text-white">Studio Analytics Dashboard</h3>

              {/* KPI cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="bg-white/[0.01] border border-white/[0.06] p-5 rounded-2xl text-left space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-[#C8A96A] font-semibold">Pages Managed</span>
                  <h4 className="text-3xl font-bold font-serif text-white">{dashboardStats.totalPages}</h4>
                </div>
                <div className="bg-white/[0.01] border border-white/[0.06] p-5 rounded-2xl text-left space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-[#C8A96A] font-semibold">Active Sections</span>
                  <h4 className="text-3xl font-bold font-serif text-white">{dashboardStats.activeSections}</h4>
                </div>
                <div className="bg-white/[0.01] border border-white/[0.06] p-5 rounded-2xl text-left space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-[#C8A96A] font-semibold">Subscribers</span>
                  <h4 className="text-3xl font-bold font-serif text-white">{dashboardStats.subscriberCount}</h4>
                </div>
                <div className="bg-white/[0.01] border border-white/[0.06] p-5 rounded-2xl text-left space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-[#C8A96A] font-semibold">Media Files</span>
                  <h4 className="text-3xl font-bold font-serif text-white">{dashboardStats.mediaCount}</h4>
                </div>
              </div>

              {/* Recent activity timeline log feed */}
              <LuxuryCard title="CMS Activity Timeline" description="Comprehensive audit trail logs of publishing operations." padding="lg">
                <div className="space-y-4 mt-6">
                  {dashboardStats.recentActivity && dashboardStats.recentActivity.length > 0 ? (
                    dashboardStats.recentActivity.map((log: any) => (
                      <div key={log.id} className="py-3.5 border-b border-white/[0.04] flex justify-between items-center text-xs text-left">
                        <div>
                          <span className="font-semibold text-white block">{log.action.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] text-zinc-550 font-light block mt-0.5">
                            Entity ID: {log.entity_id} | {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[10px] bg-white/5 border border-white/[0.06] text-zinc-400 px-2 py-0.5 rounded-md font-mono">
                          {log.actor_id.substring(0, 8)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-zinc-500 text-xs">No activity logs recorded.</div>
                  )}
                </div>
              </LuxuryCard>
            </div>
          )}

        </div>

        {/* Right Side: Simulated Live Preview */}
        {isLivePreviewOpen && activeView !== 'analytics' && (
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-8 z-10">
            <GlassPanel intensity="light" className="p-3.5 rounded-2xl flex items-center justify-between border border-white/[0.06] bg-[#0e0e10]/80">
              
              {/* Device simulator selectors */}
              <div className="flex items-center gap-1.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8 rounded-lg", previewDevice === 'desktop' ? 'bg-white/10 text-[#C8A96A]' : 'text-zinc-500 hover:text-white')}
                  onClick={() => setPreviewDevice('desktop')}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8 rounded-lg", previewDevice === 'tablet' ? 'bg-white/10 text-[#C8A96A]' : 'text-zinc-500 hover:text-white')}
                  onClick={() => setPreviewDevice('tablet')}
                >
                  <Tablet className="w-3.5 h-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8 rounded-lg", previewDevice === 'mobile' ? 'bg-white/10 text-[#C8A96A]' : 'text-zinc-500 hover:text-white')}
                  onClick={() => setPreviewDevice('mobile')}
                >
                  <Phone className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Language toggle selector */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Locale</span>
                <Select value={previewLocale} onValueChange={setPreviewLocale}>
                  <SelectTrigger className="bg-white/[0.02] border-white/[0.08] h-8 text-[11px] w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/[0.08] text-white">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="bn">বাংলা</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </GlassPanel>

            {/* Viewport simulation container */}
            <div className="border border-white/[0.06] rounded-3xl overflow-hidden bg-[#0c0c0e] shadow-2xl relative">
              <div className="bg-zinc-900 px-4 py-2 text-[10px] text-zinc-500 font-light border-b border-white/[0.04] flex items-center justify-between">
                <span>Rongdhono Live Preview Simulator</span>
                <span className="capitalize">{previewDevice} Viewport</span>
              </div>
              
              <div className={cn(
                "mx-auto overflow-y-auto scrollbar-hide bg-zinc-950 p-4 transition-all duration-300 min-h-[480px] max-h-[640px]",
                previewDevice === 'mobile' ? 'max-w-[340px]' : previewDevice === 'tablet' ? 'max-w-[560px]' : 'w-full'
              )}>
                {/* Simulated Rendering Logic */}
                <div className="space-y-8">
                  {sections.filter(s => s.enabled !== false).map((sec: any) => {
                    const findVal = (key: string) => {
                      const f = sec.cms_content?.find((c: any) => c.field_key === key)
                      if (!f) return ''
                      return previewLocale === 'bn' ? (f.value_bn || f.value_en) : f.value_en
                    }

                    if (sec.component_type === 'Hero') {
                      return (
                        <div key={sec.id} className="relative rounded-2xl overflow-hidden min-h-[220px] p-6 flex flex-col justify-end border border-white/[0.06]">
                          <div className="absolute inset-0 z-0">
                            {findVal('imageUrl') ? (
                              <img src={findVal('imageUrl')} alt="Hero" className="object-cover w-full h-full opacity-60" />
                            ) : null}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                          </div>
                          <div className="relative z-10 text-left space-y-1">
                            <span className="text-[9px] uppercase tracking-wider text-[#C8A96A] block font-semibold">{findVal('badge')}</span>
                            <h2 className="font-serif text-xl font-bold text-white">{findVal('title')}</h2>
                            <p className="text-[11px] text-zinc-300 font-light">{findVal('subtitle')}</p>
                            <div className="flex gap-2 pt-2">
                              <span className="px-3 py-1 bg-[#C8A96A] text-black text-[10px] font-bold rounded-lg uppercase tracking-wider">{findVal('ctaPrimary_en')}</span>
                            </div>
                          </div>
                        </div>
                      )
                    }

                    if (sec.component_type === 'About') {
                      return (
                        <div key={sec.id} className="p-6 bg-white/[0.02] border border-white/[0.04] rounded-2xl space-y-3 text-left">
                          <h3 className="font-serif font-bold text-lg text-white border-b border-white/[0.04] pb-2">{findVal('title')}</h3>
                          <div className="space-y-2">
                            <div><span className="text-[9px] uppercase tracking-widest text-[#C8A96A] block font-semibold">Our Mission</span><p className="text-xs text-zinc-300 font-light">{findVal('mission')}</p></div>
                            <div><span className="text-[9px] uppercase tracking-widest text-[#C8A96A] block font-semibold">Our Vision</span><p className="text-xs text-zinc-300 font-light">{findVal('vision')}</p></div>
                          </div>
                        </div>
                      )
                    }

                    // Render fallback card view for other sections
                    return (
                      <div key={sec.id} className="p-4 bg-white/[0.01] border border-dashed border-white/[0.06] rounded-xl text-center space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#C8A96A] block">{sec.section_key} Section</span>
                        <p className="text-[9px] text-zinc-550 font-light">Bilingual Component: {sec.component_type} active</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
