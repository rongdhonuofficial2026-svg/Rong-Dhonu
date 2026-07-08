'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Save, History, Eye, Loader2, Send, Code, LayoutTemplate, 
  ArrowUp, ArrowDown, EyeOff, Check, AlertCircle, RefreshCw, 
  Calendar, RotateCcw, Monitor, Tablet, Phone, Plus, Trash2, Globe,
  Image as ImageIcon, Folder, Tag, Search, Filter, ShieldAlert, BarChart3,
  Layers, Settings, Share2, AlertTriangle, FileCheck, CheckCircle,
  ArrowUpDown, Upload
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  saveCMSDraft, publishCMSPage, scheduleCMSPublish, getPageVersions, 
  rollbackToVersion, reorderCMSSections, getCMSDashboardStats 
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
    <div className="space-y-8 pb-20 text-[#FFFFFF] bg-[#111111] min-h-screen p-2 sm:p-6 md:p-8 rounded-3xl">
      
      {/* 1. Header Toolbar */}
      <div className="bg-[#181818] border border-white/[0.08] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-6 md:p-8 flex flex-col xl:flex-row justify-between gap-6 items-center">
        
        {/* Left Side: Page Selector and Tab options */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6 w-full xl:w-auto">
          {/* Selector group */}
          <div className="flex flex-col gap-1 w-full lg:w-[220px]">
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/72">Page Area</span>
            <Select value={selectedPageSlug} onValueChange={setSelectedPageSlug}>
              <SelectTrigger className="bg-[#222222] border-white/[0.08] hover:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-white rounded-[14px] h-12 text-sm">
                <SelectValue placeholder="Select Page" />
              </SelectTrigger>
              <SelectContent className="bg-[#181818] border-white/[0.08] text-white rounded-[14px]">
                {pages.map(p => (
                  <SelectItem key={p.id} value={p.slug} className="capitalize text-sm focus:bg-white/5 focus:text-[#C9A227] cursor-pointer">
                    {p.slug === 'global' ? 'Global Settings' : `${p.slug} Page`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Separator line on desktop */}
          <div className="hidden lg:block w-[1px] h-12 bg-white/[0.08]" />

          {/* Editing Tools Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setActiveView('editor')}
              className={cn(
                "h-12 px-5 text-sm font-medium rounded-[14px] transition-all duration-150 flex items-center gap-2 hover:-translate-y-0.5",
                activeView === 'editor' 
                  ? 'bg-[#C9A227] text-black font-semibold shadow-[0_4px_12px_rgba(201,162,39,0.2)]' 
                  : 'bg-white/5 border border-white/[0.08] text-white/92 hover:border-[#C9A227] hover:bg-white/10'
              )}
            >
              <LayoutTemplate className="w-5 h-5 text-white/70" />
              <span>Builder</span>
            </button>
            
            <button 
              onClick={() => setActiveView('media')}
              className={cn(
                "h-12 px-5 text-sm font-medium rounded-[14px] transition-all duration-150 flex items-center gap-2 hover:-translate-y-0.5",
                activeView === 'media' 
                  ? 'bg-[#C9A227] text-black font-semibold shadow-[0_4px_12px_rgba(201,162,39,0.2)]' 
                  : 'bg-white/5 border border-white/[0.08] text-white/92 hover:border-[#C9A227] hover:bg-white/10'
              )}
            >
              <ImageIcon className="w-5 h-5 text-white/70" />
              <span>Media</span>
            </button>
            
            <button 
              onClick={() => setActiveView('seo')}
              className={cn(
                "h-12 px-5 text-sm font-medium rounded-[14px] transition-all duration-150 flex items-center gap-2 hover:-translate-y-0.5",
                activeView === 'seo' 
                  ? 'bg-[#C9A227] text-black font-semibold shadow-[0_4px_12px_rgba(201,162,39,0.2)]' 
                  : 'bg-white/5 border border-white/[0.08] text-white/92 hover:border-[#C9A227] hover:bg-white/10'
              )}
            >
              <Share2 className="w-5 h-5 text-white/70" />
              <span>SEO</span>
            </button>
            
            <button 
              onClick={() => setActiveView('history')}
              className={cn(
                "h-12 px-5 text-sm font-medium rounded-[14px] transition-all duration-150 flex items-center gap-2 hover:-translate-y-0.5",
                activeView === 'history' 
                  ? 'bg-[#C9A227] text-black font-semibold shadow-[0_4px_12px_rgba(201,162,39,0.2)]' 
                  : 'bg-white/5 border border-white/[0.08] text-white/92 hover:border-[#C9A227] hover:bg-white/10'
              )}
            >
              <History className="w-5 h-5 text-white/70" />
              <span>History</span>
            </button>

            <button 
              onClick={() => setActiveView('schedule')}
              className={cn(
                "h-12 px-5 text-sm font-medium rounded-[14px] transition-all duration-150 flex items-center gap-2 hover:-translate-y-0.5",
                activeView === 'schedule' 
                  ? 'bg-[#C9A227] text-black font-semibold shadow-[0_4px_12px_rgba(201,162,39,0.2)]' 
                  : 'bg-white/5 border border-white/[0.08] text-white/92 hover:border-[#C9A227] hover:bg-white/10'
              )}
            >
              <Calendar className="w-5 h-5 text-white/70" />
              <span>Scheduler</span>
            </button>

            <button 
              onClick={() => setActiveView('analytics')}
              className={cn(
                "h-12 px-5 text-sm font-medium rounded-[14px] transition-all duration-150 flex items-center gap-2 hover:-translate-y-0.5",
                activeView === 'analytics' 
                  ? 'bg-[#C9A227] text-black font-semibold shadow-[0_4px_12px_rgba(201,162,39,0.2)]' 
                  : 'bg-white/5 border border-white/[0.08] text-white/92 hover:border-[#C9A227] hover:bg-white/10'
              )}
            >
              <BarChart3 className="w-5 h-5 text-white/70" />
              <span>Analytics</span>
            </button>
          </div>
        </div>

        {/* Right Side: Publishing tools */}
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto justify-end">
          
          <div className="flex items-center gap-3.5">
            <span className={cn(
              "px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] rounded-full border",
              currentPage?.status === 'published' 
                ? 'bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]' 
                : currentPage?.status === 'scheduled'
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  : 'bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]'
            )}>
              {currentPage?.status}
            </span>

            <div className="flex items-center gap-2 text-xs text-white/52 font-light">
              {saveStatus === 'saving' && <Loader2 className="w-4 h-4 animate-spin text-[#C9A227]" />}
              {saveStatus === 'saved' && <Check className="w-4 h-4 text-[#22C55E]" />}
              {saveStatus === 'dirty' && <AlertCircle className="w-4 h-4 text-white/52" />}
              <span className="capitalize">
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Autosaved' : 'Unsaved Draft'}
              </span>
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setIsLivePreviewOpen(!isLivePreviewOpen)}
              className="flex-1 sm:flex-initial h-12 px-5 bg-white/5 border border-white/[0.08] text-white/92 hover:border-[#C9A227] hover:bg-white/10 rounded-[14px] transition-all duration-150 hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm font-semibold"
            >
              <Eye className="w-5 h-5 text-white/70" />
              <span>{isLivePreviewOpen ? 'Hide Preview' : 'Show Preview'}</span>
            </button>
            
            <button 
              disabled={isPublishing || validationReport.errors.length > 0} 
              onClick={handlePublish}
              className="flex-1 sm:flex-initial h-12 px-6 bg-[#C9A227] hover:bg-[#C9A227]/90 text-black font-bold rounded-[14px] transition-all duration-150 hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(201,162,39,0.2)] hover:shadow-[0_6px_20px_rgba(201,162,39,0.35)] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              {isPublishing ? <Loader2 className="w-5 h-5 animate-spin mr-1" /> : <Send className="w-5 h-5 mr-1" />} 
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* 2. Validation Reports Panel */}
      {(validationReport.errors.length > 0 || validationReport.warnings.length > 0) && (
        <div className="bg-[#181818] border border-white/[0.08] rounded-[18px] p-6 text-left space-y-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-2 text-[#F59E0B] text-xs font-bold uppercase tracking-[0.08em]">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B] opacity-90" /> 
            <span>Validation Checks Report</span>
          </div>
          <ul className="text-sm text-white/72 font-light space-y-2 max-w-4xl">
            {validationReport.errors.map((e, idx) => (
              <li key={idx} className="flex items-start gap-2 text-[#EF4444] font-medium bg-[#EF4444]/5 p-2.5 rounded-lg border border-[#EF4444]/10">
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{e}</span>
              </li>
            ))}
            {validationReport.warnings.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2 text-[#F59E0B] bg-[#F59E0B]/5 p-2.5 rounded-lg border border-[#F59E0B]/10">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 3. Splitted Editor & Preview viewports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form area */}
        <div className={cn(
          "space-y-8 transition-all duration-300",
          isLivePreviewOpen && activeView !== 'analytics' ? 'lg:col-span-7' : 'lg:col-span-12'
        )}>
          
          {/* BUILDER SECTION */}
          {activeView === 'editor' && (
            <div className="space-y-8">
              {sections.length === 0 ? (
                /* Elegant Empty State */
                <div className="py-32 text-center bg-[#181818] border border-white/[0.08] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#222222] border border-white/[0.08] flex items-center justify-center text-white/52">
                    <Layers className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-semibold text-white">No layout sections configured</h4>
                  <p className="text-sm text-white/52 font-light max-w-sm">This page doesn't have any configurable content blocks at the moment.</p>
                </div>
              ) : (
                sections.map((sec, secIdx) => (
                  <div 
                    key={sec.id}
                    className="bg-[#171717] border border-white/[0.08] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-8 hover:border-white/[0.12] transition-all duration-200 relative text-left"
                  >
                    
                    {/* Header: Title, Description, controls */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 pb-6 border-b border-white/[0.08]">
                      <div>
                        <h2 className="font-serif text-3xl font-bold text-white tracking-tight leading-tight capitalize">
                          {sec.section_key.replace(/([A-Z])/g, ' $1')}
                        </h2>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/[0.08] text-white/52 text-[10px] uppercase font-mono tracking-wider rounded-full mt-2">
                          {sec.component_type} Section
                        </span>
                      </div>

                      {/* Move & Visibility buttons */}
                      <div className="flex items-center gap-2">
                        <button 
                          disabled={secIdx === 0}
                          onClick={() => handleMoveSection(secIdx, 'up')}
                          className="h-10 w-10 bg-[#222222] hover:border-[#C9A227] text-white/70 hover:text-white rounded-[14px] border border-white/[0.08] transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center"
                        >
                          <ArrowUp className="w-5 h-5" />
                        </button>
                        <button 
                          disabled={secIdx === sections.length - 1}
                          onClick={() => handleMoveSection(secIdx, 'down')}
                          className="h-10 w-10 bg-[#222222] hover:border-[#C9A227] text-white/70 hover:text-white rounded-[14px] border border-white/[0.08] transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center"
                        >
                          <ArrowDown className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleToggleSection(sec.id)}
                          className={cn(
                            "h-10 w-10 rounded-[14px] border transition-all duration-150 flex items-center justify-center",
                            sec.enabled 
                              ? 'bg-white/5 border-white/[0.08] text-[#22C55E] hover:border-[#22C55E]/40' 
                              : 'bg-white/5 border-white/[0.08] text-white/28 hover:border-[#C9A227]'
                          )}
                        >
                          {sec.enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Form Controls wrapper */}
                    <div className={cn(
                      "space-y-6 transition-opacity duration-200",
                      !sec.enabled && 'opacity-30 pointer-events-none'
                    )}>
                      {sec.cms_content?.map((field: any) => {
                        const isText = field.field_type === 'text'
                        const isTextarea = field.field_type === 'textarea'
                        const isRichText = field.field_type === 'rich_text'
                        const isMedia = field.field_type === 'media'
                        const isButton = field.field_type === 'button'
                        const isJson = field.field_type === 'json'

                        return (
                          <div key={field.id} className="space-y-2">
                            <span className="text-xs font-semibold tracking-[0.08em] uppercase text-white/72 block">
                              {field.field_key.replace(/_/g, ' ')} 
                              <span className="text-white/28 font-mono lowercase ml-1.5 font-normal">({field.field_type})</span>
                            </span>

                            {/* TEXT & TEXTAREA inputs */}
                            {(isText || isTextarea || isRichText) && (() => {
                              const isFieldBnOnly = field.field_key.endsWith('_bn')
                              return (
                                <div className={cn(
                                  "grid gap-6",
                                  isFieldBnOnly ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                                )}>
                                  {!isFieldBnOnly && (
                                    <div className="space-y-1.5 text-left">
                                      <span className="text-[10px] text-white/52 uppercase tracking-wide flex items-center gap-1 font-semibold">
                                        <Globe className="w-3.5 h-3.5"/> English
                                      </span>
                                      {isText ? (
                                        <input 
                                          type="text"
                                          value={field.value_en || ''} 
                                          onChange={(e) => handleFieldChange(sec.id, field.field_key, 'value_en', e.target.value)}
                                          className="w-full bg-[#222222] border border-white/[0.08] hover:border-[#C9A227] focus-visible:border-[#C9A227] focus-visible:ring-1 focus-visible:ring-[#C9A227]/40 focus-visible:outline-none text-white rounded-[14px] h-12 px-4 placeholder:text-white/38 text-sm transition-all duration-150"
                                        />
                                      ) : (
                                        <textarea 
                                          rows={5}
                                          value={field.value_en || ''} 
                                          onChange={(e) => handleFieldChange(sec.id, field.field_key, 'value_en', e.target.value)}
                                          className="w-full bg-[#222222] border border-white/[0.08] hover:border-[#C9A227] focus-visible:border-[#C9A227] focus-visible:ring-1 focus-visible:ring-[#C9A227]/40 focus-visible:outline-none text-white rounded-[14px] p-4 placeholder:text-white/38 text-sm min-h-[140px] transition-all duration-150 resize-none"
                                        />
                                      )}
                                    </div>
                                  )}
                                  
                                  <div className="space-y-1.5 text-left">
                                    <span className="text-[10px] text-white/52 uppercase tracking-wide flex items-center gap-1 font-semibold">
                                      <Globe className="w-3.5 h-3.5"/> Bengali
                                    </span>
                                    {isText ? (
                                      <input 
                                        type="text"
                                        value={field.value_bn || ''} 
                                        onChange={(e) => handleFieldChange(sec.id, field.field_key, 'value_bn', e.target.value)}
                                        className="w-full bg-[#222222] border border-white/[0.08] hover:border-[#C9A227] focus-visible:border-[#C9A227] focus-visible:ring-1 focus-visible:ring-[#C9A227]/40 focus-visible:outline-none text-white rounded-[14px] h-12 px-4 placeholder:text-white/38 text-sm transition-all duration-150"
                                      />
                                    ) : (
                                      <textarea 
                                        rows={5}
                                        value={field.value_bn || ''} 
                                        onChange={(e) => handleFieldChange(sec.id, field.field_key, 'value_bn', e.target.value)}
                                        className="w-full bg-[#222222] border border-white/[0.08] hover:border-[#C9A227] focus-visible:border-[#C9A227] focus-visible:ring-1 focus-visible:ring-[#C9A227]/40 focus-visible:outline-none text-white rounded-[14px] p-4 placeholder:text-white/38 text-sm min-h-[140px] transition-all duration-150 resize-none"
                                      />
                                    )}
                                  </div>
                                </div>
                              )
                            })()}

                            {/* MEDIA asset picker */}
                            {isMedia && (
                              <div className="bg-[#222222] border border-white/[0.08] p-5 rounded-[14px] space-y-4">
                                <div className="flex flex-col sm:flex-row gap-5 items-start">
                                  <div className="relative w-28 h-20 rounded-lg bg-black/50 overflow-hidden shrink-0 border border-white/[0.08] flex items-center justify-center">
                                    {field.value_en ? (
                                      <img src={field.value_en} alt="Preview" className="object-cover w-full h-full" />
                                    ) : (
                                      <ImageIcon className="w-8 h-8 text-white/28" />
                                    )}
                                  </div>
                                  <div className="flex-1 space-y-2 w-full">
                                    <span className="text-[10px] text-white/52 uppercase font-semibold">Storage URL Path</span>
                                    <div className="flex gap-3">
                                      <input 
                                        type="text"
                                        value={field.value_en || ''} 
                                        onChange={(e) => {
                                          handleFieldChange(sec.id, field.field_key, 'value_en', e.target.value)
                                          handleFieldChange(sec.id, field.field_key, 'value_bn', e.target.value)
                                        }}
                                        placeholder="Paste asset URL..."
                                        className="w-full bg-[#111111] border border-white/[0.08] hover:border-[#C9A227] focus-visible:border-[#C9A227] focus-visible:ring-1 focus-visible:ring-[#C9A227]/40 focus-visible:outline-none text-white rounded-[14px] h-12 px-4 text-sm"
                                      />
                                      <button 
                                        onClick={() => {
                                          setActiveView('media')
                                          toast.info('Select files inside Media tab')
                                        }}
                                        className="h-12 px-5 bg-white/5 border border-white/[0.08] text-white/92 hover:border-[#C9A227] hover:bg-white/10 rounded-[14px] transition-all duration-150 hover:-translate-y-0.5 text-xs font-semibold whitespace-nowrap"
                                      >
                                        Browse Library
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* BUTTON action configs */}
                            {isButton && (
                              <div className="bg-[#222222] border border-white/[0.08] p-6 rounded-[14px] space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] text-white/52 uppercase font-semibold">English Label</span>
                                    <input 
                                      type="text"
                                      value={field.value_en || ''} 
                                      onChange={(e) => handleFieldChange(sec.id, field.field_key, 'value_en', e.target.value)}
                                      className="w-full bg-[#111111] border border-white/[0.08] hover:border-[#C9A227] focus-visible:border-[#C9A227] focus-visible:ring-1 focus-visible:ring-[#C9A227]/40 focus-visible:outline-none text-white rounded-[14px] h-12 px-4 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] text-white/52 uppercase font-semibold">Bengali Label</span>
                                    <input 
                                      type="text"
                                      value={field.value_bn || ''} 
                                      onChange={(e) => handleFieldChange(sec.id, field.field_key, 'value_bn', e.target.value)}
                                      className="w-full bg-[#111111] border border-white/[0.08] hover:border-[#C9A227] focus-visible:border-[#C9A227] focus-visible:ring-1 focus-visible:ring-[#C9A227]/40 focus-visible:outline-none text-white rounded-[14px] h-12 px-4 text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] text-white/52 uppercase font-semibold">Destination URL</span>
                                    <input 
                                      type="text"
                                      value={field.metadata?.url || ''} 
                                      onChange={(e) => handleButtonMetaChange(sec.id, field.field_key, 'url', e.target.value)}
                                      placeholder="/exhibitions or https://..."
                                      className="w-full bg-[#111111] border border-white/[0.08] hover:border-[#C9A227] focus-visible:border-[#C9A227] focus-visible:ring-1 focus-visible:ring-[#C9A227]/40 focus-visible:outline-none text-white rounded-[14px] h-12 px-4 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] text-white/52 uppercase font-semibold">Style Variant</span>
                                    <Select 
                                      value={field.metadata?.variant || 'primary'} 
                                      onValueChange={(val) => handleButtonMetaChange(sec.id, field.field_key, 'variant', val)}
                                    >
                                      <SelectTrigger className="bg-[#111111] border-white/[0.08] h-12 text-sm text-white rounded-[14px]">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-[#181818] border-white/[0.08] text-white rounded-[14px]">
                                        <SelectItem value="primary" className="text-sm cursor-pointer">Gold Accent</SelectItem>
                                        <SelectItem value="secondary" className="text-sm cursor-pointer">Off White</SelectItem>
                                        <SelectItem value="glass" className="text-sm cursor-pointer">Translucent Glass</SelectItem>
                                        <SelectItem value="ghost" className="text-sm cursor-pointer">Invisible Outline</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] text-white/52 uppercase font-semibold">Tab Behavior</span>
                                    <Select 
                                      value={field.metadata?.open_in_new_tab ? 'true' : 'false'} 
                                      onValueChange={(val) => handleButtonMetaChange(sec.id, field.field_key, 'open_in_new_tab', val === 'true')}
                                    >
                                      <SelectTrigger className="bg-[#111111] border-white/[0.08] h-12 text-sm text-white rounded-[14px]">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-[#181818] border-white/[0.08] text-white rounded-[14px]">
                                        <SelectItem value="false" className="text-sm cursor-pointer">Same Tab</SelectItem>
                                        <SelectItem value="true" className="text-sm cursor-pointer">New Tab</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* JSON Editor list config */}
                            {isJson && (
                              <div className="space-y-1.5">
                                <span className="text-[10px] text-white/52 uppercase font-semibold">JSON Structure Data</span>
                                <textarea 
                                  rows={6}
                                  value={field.value_en || '[]'} 
                                  onChange={(e) => {
                                    handleFieldChange(sec.id, field.field_key, 'value_en', e.target.value)
                                    handleFieldChange(sec.id, field.field_key, 'value_bn', e.target.value)
                                  }}
                                  className="w-full font-mono text-xs bg-zinc-900 border border-white/[0.08] hover:border-[#C9A227] focus-visible:border-[#C9A227] focus-visible:ring-1 focus-visible:ring-[#C9A227]/40 focus-visible:outline-none text-[#C9A227] p-4 rounded-[14px]"
                                />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* VISUAL MEDIA TAB */}
          {activeView === 'media' && (
            <div className="space-y-8 text-left">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight capitalize">
                Asset Library
              </h1>
              <p className="text-[15px] text-white/60 font-light">Browse, filter, and inspect media files inside directories.</p>
              
              <div className="bg-[#171717] border border-white/[0.08] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-8 space-y-6">
                
                {/* Responsive Media Toolbar */}
                <div className="flex flex-col xl:flex-row gap-4 items-center justify-between w-full">
                  
                  {/* Left: Breadcrumb / Folder Selector */}
                  <div className="flex gap-2 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 shrink-0 custom-scrollbar">
                    <button 
                      onClick={() => setMediaFolder('/')}
                      className={cn(
                        "h-12 px-5 text-xs font-semibold rounded-[14px] flex items-center gap-2 transition-all border shrink-0",
                        mediaFolder === '/' 
                          ? 'bg-[#C9A227] text-black border-transparent shadow-[0_0_15px_rgba(201,162,39,0.3)]' 
                          : 'bg-[#222222] border-white/[0.08] text-white hover:border-[#C9A227]'
                      )}
                    >
                      <Folder className="w-4 h-4" /> <span>/Root</span>
                    </button>
                    <button 
                      onClick={() => setMediaFolder('/exhibitions')}
                      className={cn(
                        "h-12 px-5 text-xs font-semibold rounded-[14px] flex items-center gap-2 transition-all border shrink-0",
                        mediaFolder === '/exhibitions' 
                          ? 'bg-[#C9A227] text-black border-transparent shadow-[0_0_15px_rgba(201,162,39,0.3)]' 
                          : 'bg-[#222222] border-white/[0.08] text-white hover:border-[#C9A227]'
                      )}
                    >
                      <Folder className="w-4 h-4" /> <span>/Exhibitions</span>
                    </button>
                    <button 
                      onClick={() => setMediaFolder('/gallery')}
                      className={cn(
                        "h-12 px-5 text-xs font-semibold rounded-[14px] flex items-center gap-2 transition-all border shrink-0",
                        mediaFolder === '/gallery' 
                          ? 'bg-[#C9A227] text-black border-transparent shadow-[0_0_15px_rgba(201,162,39,0.3)]' 
                          : 'bg-[#222222] border-white/[0.08] text-white hover:border-[#C9A227]'
                      )}
                    >
                      <Folder className="w-4 h-4" /> <span>/Gallery</span>
                    </button>
                  </div>
                  
                  {/* Center: Search Field */}
                  <div className="relative flex-grow w-full xl:max-w-2xl">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-white/50" />
                    <input 
                      placeholder="Search assets..." 
                      value={mediaSearch} 
                      onChange={(e) => setMediaSearch(e.target.value)}
                      className="w-full pl-12 pr-4 bg-[#222222] border border-white/[0.08] hover:border-[#C9A227] focus-visible:border-[#C9A227] focus-visible:ring-1 focus-visible:ring-[#C9A227]/40 focus-visible:outline-none text-white rounded-[14px] h-12 text-sm transition-all duration-200 placeholder:text-white/40 shadow-inner"
                    />
                  </div>

                  {/* Right: Actions */}
                  <div className="flex gap-3 w-full xl:w-auto shrink-0 justify-start xl:justify-end">
                    <button className="h-12 px-5 text-xs font-semibold rounded-[14px] flex items-center gap-2 transition-all border bg-[#222222] border-white/[0.08] text-white hover:border-white/20 hover:bg-white/[0.02] shrink-0 hidden sm:flex">
                      <Filter className="w-4 h-4" /> <span>Filter</span>
                    </button>
                    <button className="h-12 px-5 text-xs font-semibold rounded-[14px] flex items-center gap-2 transition-all border bg-[#222222] border-white/[0.08] text-white hover:border-white/20 hover:bg-white/[0.02] shrink-0 hidden sm:flex">
                      <ArrowUpDown className="w-4 h-4" /> <span>Sort</span>
                    </button>
                    <button className="h-12 px-6 text-xs font-semibold rounded-[14px] flex items-center gap-2 transition-all border bg-[#C9A227] border-transparent text-black hover:bg-[#b08d22] shadow-[0_4px_14px_rgba(201,162,39,0.3)] shrink-0 sm:ml-auto xl:ml-0">
                      <Upload className="w-4 h-4" /> <span>Upload</span>
                    </button>
                  </div>
                </div>

                {/* Media gallery grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-[#111111] p-6 border border-white/[0.08] rounded-[18px]">
                  {mediaList
                    .filter(m => m.folder_path === mediaFolder && m.filename.toLowerCase().includes(mediaSearch.toLowerCase()))
                    .map((asset) => (
                      <div 
                        key={asset.id} 
                        onClick={() => setSelectedMediaId(asset.id)}
                        className={cn(
                          "group relative rounded-[14px] overflow-hidden border border-white/[0.08] cursor-pointer hover:border-[#C9A227]/40 bg-[#181818] p-3 space-y-3 transition-all",
                          selectedMediaId === asset.id && 'border-[#C9A227] ring-1 ring-[#C9A227]'
                        )}
                      >
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black/60">
                          <img src={asset.storage_path} alt="Asset" className="object-cover w-full h-full" />
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-white/72 px-1 font-light">
                          <span className="truncate max-w-[120px] font-medium">{asset.filename}</span>
                          <span className="text-white/52 font-mono">{(asset.file_size / 1000000).toFixed(1)} MB</span>
                        </div>
                      </div>
                  ))}
                </div>
              </div>

              {/* Asset Inspectors */}
              {selectedMediaId && (
                <div className="bg-[#171717] border border-white/[0.08] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-8 space-y-6">
                  <h3 className="font-serif text-2xl font-bold text-white leading-tight capitalize">
                    Asset Details & Focal Coordinates
                  </h3>
                  
                  {(() => {
                    const currentAsset = mediaList.find(m => m.id === selectedMediaId)
                    if (!currentAsset) return null

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/[0.08]">
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <span className="text-xs font-semibold tracking-[0.08em] uppercase text-white/72 block">English Alt Text</span>
                            <input 
                              type="text"
                              value={currentAsset.alt_text_en || ''}
                              onChange={(e) => {
                                setMediaList(prev => prev.map(m => m.id === selectedMediaId ? { ...m, alt_text_en: e.target.value } : m))
                              }}
                              className="w-full bg-[#222222] border border-white/[0.08] hover:border-[#C9A227] focus-visible:border-[#C9A227] focus-visible:ring-1 focus-visible:ring-[#C9A227]/40 focus-visible:outline-none text-white rounded-[14px] h-12 px-4 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <span className="text-xs font-semibold tracking-[0.08em] uppercase text-white/72 block">Bengali Alt Text</span>
                            <input 
                              type="text"
                              value={currentAsset.alt_text_bn || ''}
                              onChange={(e) => {
                                setMediaList(prev => prev.map(m => m.id === selectedMediaId ? { ...m, alt_text_bn: e.target.value } : m))
                              }}
                              className="w-full bg-[#222222] border border-white/[0.08] hover:border-[#C9A227] focus-visible:border-[#C9A227] focus-visible:ring-1 focus-visible:ring-[#C9A227]/40 focus-visible:outline-none text-white rounded-[14px] h-12 px-4 text-sm"
                            />
                          </div>
                          <div className="space-y-2 pt-2">
                            <span className="text-xs font-semibold tracking-[0.08em] uppercase text-white/52 block">Image Storage Link</span>
                            <span className="text-xs text-blue-400 font-mono select-all truncate block p-3 bg-black/40 rounded-lg border border-white/[0.04]">{currentAsset.storage_path}</span>
                            <span className="text-[11px] text-white/52 font-light block">Copy this link and paste in the Page Builder media input fields to use.</span>
                          </div>
                        </div>

                        {/* Interactive Focal Point Visual Cropper */}
                        <div className="space-y-3">
                          <span className="text-xs font-semibold tracking-[0.08em] uppercase text-white/72 block">Visual Focal Point</span>
                          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/60 border border-white/[0.08] cursor-crosshair">
                            <img src={currentAsset.storage_path} alt="Crop" className="object-cover w-full h-full" />
                            {/* Focal point indicator crosshair */}
                            <div 
                              className="absolute w-8 h-8 -ml-4 -mt-4 border-2 border-white rounded-full bg-[#C9A227]/40 shadow-xl pointer-events-none" 
                              style={{ left: '50%', top: '50%' }}
                            />
                          </div>
                          <span className="text-[11px] text-white/52 font-light block">Focal point coordinate locked to center layout crop configuration (50%, 50%).</span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          )}

          {/* SEO STUDIO VIEW */}
          {activeView === 'seo' && (
            <div className="space-y-8 text-left">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight capitalize">
                SEO Studio
              </h1>
              <p className="text-[15px] text-white/60 font-light">Define search headers and index configurations for this page.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Edit forms */}
                <div className="bg-[#171717] border border-white/[0.08] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-8 space-y-6">
                  <h3 className="font-serif text-2xl font-bold text-white leading-tight capitalize">
                    Metadata Parameters
                  </h3>
                  
                  <div className="space-y-6 pt-4 border-t border-white/[0.08]">
                    <div className="space-y-2">
                      <span className="text-xs font-semibold tracking-[0.08em] uppercase text-white/72 block">Meta Title Prefix</span>
                      <input 
                        type="text"
                        value={seoConfig.title}
                        onChange={(e) => setSeoConfig({ ...seoConfig, title: e.target.value })}
                        className="w-full bg-[#222222] border border-white/[0.08] hover:border-[#C9A227] focus-visible:border-[#C9A227] focus-visible:ring-1 focus-visible:ring-[#C9A227]/40 focus-visible:outline-none text-white rounded-[14px] h-12 px-4 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs font-semibold tracking-[0.08em] uppercase text-white/72 block">Meta Description Statement</span>
                      <textarea 
                        rows={5}
                        value={seoConfig.description}
                        onChange={(e) => setSeoConfig({ ...seoConfig, description: e.target.value })}
                        className="w-full bg-[#222222] border border-white/[0.08] hover:border-[#C9A227] focus-visible:border-[#C9A227] focus-visible:ring-1 focus-visible:ring-[#C9A227]/40 focus-visible:outline-none text-white rounded-[14px] p-4 text-sm min-h-[140px] resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Simulated SEO Preview Cards */}
                <div className="space-y-8">
                  {/* Google search card preview */}
                  <div className="bg-[#1e1e1e] p-6 border border-zinc-800 rounded-[18px] space-y-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] text-left">
                    <span className="text-[10px] text-white/52 uppercase tracking-[0.08em] block font-bold mb-2">Google Card Simulator</span>
                    <span className="text-[11px] text-white/38 block">https://rongdhono.art/{selectedPageSlug}</span>
                    <h4 className="text-xl text-blue-400 font-serif font-semibold hover:underline cursor-pointer leading-tight truncate">
                      {seoConfig.title} | {selectedPageSlug.toUpperCase()}
                    </h4>
                    <p className="text-xs text-white/62 font-light leading-relaxed max-w-md line-clamp-2">
                      {seoConfig.description}
                    </p>
                  </div>

                  {/* Facebook OG Card preview */}
                  <div className="bg-[#141416] border border-white/[0.06] rounded-[18px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35)] text-left max-w-sm mx-auto">
                    <span className="text-[10px] text-white/52 uppercase tracking-[0.08em] block font-bold px-4 py-2 border-b border-white/[0.04]">Facebook Share Card</span>
                    <div className="relative aspect-video w-full bg-black">
                      <img src={seoConfig.og_image} alt="OG Card" className="object-cover w-full h-full" />
                    </div>
                    <div className="p-5 bg-zinc-950 space-y-1">
                      <span className="text-[10px] uppercase tracking-widest text-[#C8A96A] font-semibold">RONGDHONO.ART</span>
                      <h5 className="font-serif font-bold text-white text-base truncate">{seoConfig.title}</h5>
                      <p className="text-xs text-white/62 font-light line-clamp-2 leading-relaxed">{seoConfig.description}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Snapshot History view */}
          {activeView === 'history' && (
            <div className="space-y-6 text-left">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight capitalize">
                Page Snapshot History
              </h1>
              <p className="text-[15px] text-white/60 font-light">
                Every release generates a system snapshot. Select any prior version to restore active contents instantly.
              </p>

              {versionsLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 bg-[#171717] border border-white/[0.08] rounded-[18px]">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#C9A227]" />
                  <span className="text-sm text-white/52">Retrieving page snapshots...</span>
                </div>
              ) : versions.length === 0 ? (
                /* Empty state */
                <div className="py-20 text-center bg-[#171717] border border-white/[0.08] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#222222] border border-white/[0.08] flex items-center justify-center text-white/52">
                    <History className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-semibold text-white">No version snapshots found</h4>
                  <p className="text-sm text-white/52 font-light max-w-sm">Publish changes to generate snapshot logs.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {versions.map((ver) => (
                    <div 
                      key={ver.id} 
                      className="bg-[#171717] border border-white/[0.08] rounded-[18px] p-6 flex justify-between items-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] hover:border-white/[0.12] transition-colors"
                    >
                      <div className="space-y-1">
                        <h5 className="font-serif font-bold text-white text-lg">Version {ver.version}</h5>
                        <p className="text-sm text-white/72 font-light">{ver.change_summary}</p>
                        <span className="text-[11px] text-white/52 font-light block">
                          Published by {ver.profiles?.full_name_en || 'System Admin'} on {new Date(ver.created_at).toLocaleString()}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleRollback(ver)}
                        className="h-10 px-4 bg-white/5 border border-white/[0.08] text-white/92 hover:border-[#C9A227] hover:bg-white/10 rounded-[12px] transition-all duration-150 hover:-translate-y-0.5 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Restore Snapshot</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Release Scheduler view */}
          {activeView === 'schedule' && (
            <div className="bg-[#171717] border border-white/[0.08] p-8 rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] space-y-6 max-w-xl text-left">
              <div className="space-y-2">
                <h3 className="font-serif text-3xl font-bold text-white leading-tight flex items-center gap-2">
                  <Calendar className="w-8 h-8 text-[#C9A227]" /> Schedule Release Publish
                </h3>
                <p className="text-sm text-white/60 font-light leading-relaxed">
                  Prepare page updates and schedule them for automatic deployment at a future date. The cron runner automatically processes updates and revalidates cache systems.
                </p>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/[0.08]">
                <div className="space-y-2">
                  <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#C9A227]">Scheduled Release Datetime</span>
                  <input 
                    type="datetime-local" 
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-[#222222] border border-white/[0.08] hover:border-[#C9A227] focus-visible:border-[#C9A227] focus-visible:ring-1 focus-visible:ring-[#C9A227]/40 focus-visible:outline-none text-white rounded-[14px] h-12 px-4 text-sm"
                  />
                </div>

                <div className="pt-4 flex gap-3 justify-end">
                  <button 
                    onClick={() => setActiveView('editor')}
                    className="h-12 px-5 bg-white/5 border border-white/[0.08] text-white/92 hover:border-[#C9A227] hover:bg-white/10 rounded-[14px] transition-all duration-150 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={isScheduling || !scheduleTime}
                    onClick={handleScheduleSubmit}
                    className="h-12 px-6 bg-[#C9A227] hover:bg-[#C9A227]/90 text-black font-bold rounded-[14px] transition-all duration-150 hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(201,162,39,0.2)] hover:shadow-[0_6px_20px_rgba(201,162,39,0.35)] disabled:opacity-30 flex items-center justify-center gap-1.5 text-sm"
                  >
                    {isScheduling ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    <span>Confirm Schedule</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PERFORMANCE & ANALYTICS VIEW */}
          {activeView === 'analytics' && (
            <div className="space-y-8 text-left">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight capitalize">
                Studio Analytics
              </h1>
              <p className="text-[15px] text-white/60 font-light">Performance overview, storage limits, and visitor audit trails.</p>

              {/* KPI cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="bg-[#171717] border border-white/[0.08] p-6 rounded-[18px] text-left space-y-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                  <span className="text-[10px] uppercase tracking-[0.08em] text-[#C9A227] font-semibold">Pages Managed</span>
                  <h4 className="text-4xl font-bold font-serif text-white leading-none">{dashboardStats.totalPages}</h4>
                </div>
                <div className="bg-[#171717] border border-white/[0.08] p-6 rounded-[18px] text-left space-y-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                  <span className="text-[10px] uppercase tracking-[0.08em] text-[#C9A227] font-semibold">Active Sections</span>
                  <h4 className="text-4xl font-bold font-serif text-white leading-none">{dashboardStats.activeSections}</h4>
                </div>
                <div className="bg-[#171717] border border-white/[0.08] p-6 rounded-[18px] text-left space-y-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                  <span className="text-[10px] uppercase tracking-[0.08em] text-[#C9A227] font-semibold">Subscribers</span>
                  <h4 className="text-4xl font-bold font-serif text-white leading-none">{dashboardStats.subscriberCount}</h4>
                </div>
                <div className="bg-[#171717] border border-white/[0.08] p-6 rounded-[18px] text-left space-y-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                  <span className="text-[10px] uppercase tracking-[0.08em] text-[#C9A227] font-semibold">Media Files</span>
                  <h4 className="text-4xl font-bold font-serif text-white leading-none">{dashboardStats.mediaCount}</h4>
                </div>
              </div>

              {/* Recent activity timeline log feed */}
              <div className="bg-[#171717] border border-white/[0.08] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-8">
                <h3 className="font-serif text-2xl font-bold text-white mb-2 leading-tight">
                  CMS Activity Timeline
                </h3>
                <p className="text-sm text-white/52 font-light mb-6 border-b border-white/[0.08] pb-4">Audit trails generated by admin editors.</p>
                <div className="space-y-4">
                  {dashboardStats.recentActivity && dashboardStats.recentActivity.length > 0 ? (
                    dashboardStats.recentActivity.map((log: any) => (
                      <div key={log.id} className="py-4 border-b border-white/[0.04] flex justify-between items-center text-sm text-left">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-white block capitalize">{log.action.replace(/_/g, ' ')}</span>
                          <span className="text-[11px] text-white/52 font-light block">
                            Entity ID: {log.entity_id} | {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[11px] bg-white/5 border border-white/[0.08] text-white/72 px-3 py-1 rounded-lg font-mono">
                          {log.actor_id.substring(0, 8)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-white/52 text-sm font-light">No activity logs recorded yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* 4. Right Side: Simulated Live Preview Panel */}
        {isLivePreviewOpen && activeView !== 'analytics' && (
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8 z-10">
            
            {/* Device Switcher Header */}
            <div className="bg-[#181818] border border-white/[0.08] p-4 rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-[#111111] p-1.5 rounded-xl border border-white/[0.08]">
                <button 
                  onClick={() => setPreviewDevice('desktop')}
                  className={cn("h-9 w-9 rounded-lg flex items-center justify-center transition-all", previewDevice === 'desktop' ? 'bg-[#222222] text-[#C9A227]' : 'text-white/52 hover:text-white')}
                >
                  <Monitor className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setPreviewDevice('tablet')}
                  className={cn("h-9 w-9 rounded-lg flex items-center justify-center transition-all", previewDevice === 'tablet' ? 'bg-[#222222] text-[#C9A227]' : 'text-white/52 hover:text-white')}
                >
                  <Tablet className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setPreviewDevice('mobile')}
                  className={cn("h-9 w-9 rounded-lg flex items-center justify-center transition-all", previewDevice === 'mobile' ? 'bg-[#222222] text-[#C9A227]' : 'text-white/52 hover:text-white')}
                >
                  <Phone className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/52 uppercase tracking-[0.08em] font-semibold">Locale</span>
                <Select value={previewLocale} onValueChange={setPreviewLocale}>
                  <SelectTrigger className="bg-[#222222] border-white/[0.08] hover:border-[#C9A227] h-9 text-xs w-[90px] text-white rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#181818] border-white/[0.08] text-white rounded-lg">
                    <SelectItem value="en" className="text-xs cursor-pointer">English</SelectItem>
                    <SelectItem value="bn" className="text-xs cursor-pointer">বাংলা</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Viewport simulated Chassis Device Frame */}
            <div className="border border-white/[0.08] rounded-[24px] overflow-hidden bg-[#0c0c0e] shadow-[0_30px_70px_rgba(0,0,0,0.55)] relative">
              
              {/* Chrome Mock Browser Bar */}
              <div className="bg-[#181818] px-4 py-2.5 text-[10px] text-white/52 font-light border-b border-white/[0.08] flex items-center gap-3">
                {/* Dots window controls */}
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]/80" />
                </div>
                {/* Simulated URL bar */}
                <div className="flex-1 bg-black/40 rounded-md py-1 px-3 border border-white/[0.04] text-left truncate max-w-[280px]">
                  <span className="text-white/28 font-mono">https://</span>
                  <span className="text-white/52 font-mono">rongdhono.art/</span>
                  <span className="text-[#C9A227] font-mono">{selectedPageSlug}</span>
                </div>
                <span className="text-[10px] font-mono uppercase text-white/28">{previewDevice}</span>
              </div>
              
              {/* Inner viewport container */}
              <div className={cn(
                "mx-auto overflow-y-auto scrollbar-hide bg-[#111111] p-4 transition-all duration-300 min-h-[480px] max-h-[640px]",
                previewDevice === 'mobile' ? 'max-w-[340px] border-x-4 border-zinc-800' : previewDevice === 'tablet' ? 'max-w-[560px] border-x-2 border-zinc-850' : 'w-full'
              )}>
                {/* Simulated rendering output */}
                <div className="space-y-8">
                  {sections.filter(s => s.enabled !== false).map((sec: any) => {
                    const findVal = (key: string) => {
                      const f = sec.cms_content?.find((c: any) => c.field_key === key)
                      if (!f) return ''
                      return previewLocale === 'bn' ? (f.value_bn || f.value_en) : f.value_en
                    }

                    if (sec.component_type === 'Hero') {
                      return (
                        <div key={sec.id} className="relative rounded-2xl overflow-hidden min-h-[240px] p-6 flex flex-col justify-end border border-white/[0.08] bg-black">
                          <div className="absolute inset-0 z-0">
                            {findVal('imageUrl') ? (
                              <img src={findVal('imageUrl')} alt="Hero" className="object-cover w-full h-full opacity-60" />
                            ) : null}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                          </div>
                          <div className="relative z-10 text-left space-y-1.5">
                            <span className="text-[10px] uppercase tracking-wider text-[#C9A227] block font-semibold">{findVal('badge')}</span>
                            <h2 className="font-serif text-2xl font-bold text-white leading-tight">{findVal('title')}</h2>
                            <p className="text-xs text-white/72 font-light leading-relaxed">{findVal('subtitle')}</p>
                            <div className="flex gap-2 pt-2">
                              <span className="px-4 py-1.5 bg-[#C9A227] text-black text-[10px] font-bold rounded-lg uppercase tracking-wider">{findVal('ctaPrimary_en')}</span>
                            </div>
                          </div>
                        </div>
                      )
                    }

                    if (sec.component_type === 'About') {
                      return (
                        <div key={sec.id} className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-4 text-left">
                          <h3 className="font-serif font-bold text-xl text-white border-b border-white/[0.08] pb-3">{findVal('title')}</h3>
                          <div className="space-y-3">
                            <div>
                              <span className="text-[9px] uppercase tracking-widest text-[#C9A227] block font-bold mb-1">Our Mission</span>
                              <p className="text-xs text-white/72 font-light leading-relaxed">{findVal('mission')}</p>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase tracking-widest text-[#C9A227] block font-bold mb-1">Our Vision</span>
                              <p className="text-xs text-white/72 font-light leading-relaxed">{findVal('vision')}</p>
                            </div>
                          </div>
                        </div>
                      )
                    }

                    // Render fallback card view for other sections
                    return (
                      <div key={sec.id} className="p-5 bg-white/[0.01] border border-dashed border-white/[0.08] rounded-xl text-center space-y-1.5">
                        <span className="text-xs uppercase font-bold tracking-widest text-[#C9A227] block">{sec.section_key} Section</span>
                        <p className="text-[10px] text-white/52 font-light font-mono">Bilingual Component: {sec.component_type} Active</p>
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
