'use client'

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Save, History, Eye, Loader2, Send, Code, LayoutTemplate } from "lucide-react"
import { saveCMSContent } from "@/actions/admin/cms"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { LuxuryCard } from "@/components/admin/ui/LuxuryCard"
import { PremiumButton } from "@/components/admin/ui/PremiumButton"
import { GlassPanel } from "@/components/admin/ui/GlassPanel"

export function CMSForm({ initialData, locale }: { initialData: any, locale: string }) {
  const [data, setData] = React.useState(initialData)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('visual')
  const router = useRouter()

  const handleUpdate = (section: string, field: string, value: string) => {
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleJsonUpdate = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const parsed = JSON.parse(e.target.value)
      setData(parsed)
    } catch (err) {
      // Don't update state if invalid JSON while typing
    }
  }

  const handleSave = async (mode: 'draft' | 'published') => {
    setIsSubmitting(true)
    const res = await saveCMSContent('homepage', locale, data, mode)
    if (res.error) {
      toast.error("Error", { description: res.error })
    } else {
      toast.success("Success", { description: `Content ${mode === 'published' ? 'Published' : 'Saved as Draft'}` })
      router.refresh()
    }
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <GlassPanel intensity="medium" className="p-4 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="bg-black/20 border border-white/10 p-1 rounded-xl h-auto">
            <TabsTrigger value="visual" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-accent text-muted-foreground py-2 px-4 flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4" /> Visual Editor
            </TabsTrigger>
            <TabsTrigger value="json" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-blue-400 text-muted-foreground py-2 px-4 flex items-center gap-2">
              <Code className="w-4 h-4" /> JSON Schema
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto">
          <PremiumButton variant="ghost" className="hidden sm:flex" leftIcon={<History className="w-4 h-4" />}>
            History
          </PremiumButton>
          <PremiumButton variant="ghost" className="hidden sm:flex" leftIcon={<Eye className="w-4 h-4" />}>
            Preview
          </PremiumButton>
          <PremiumButton variant="glass" onClick={() => handleSave('draft')} disabled={isSubmitting} leftIcon={isSubmitting ? undefined : <Save className="w-4 h-4" />}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Draft
          </PremiumButton>
          <PremiumButton variant="primary" onClick={() => handleSave('published')} disabled={isSubmitting} leftIcon={isSubmitting ? undefined : <Send className="w-4 h-4" />}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Publish Live
          </PremiumButton>
        </div>
      </GlassPanel>

      {/* Visual Editor */}
      <div className={activeTab === 'visual' ? 'block space-y-8' : 'hidden'}>
        <LuxuryCard title="Hero Section" description="The primary landing view of the exhibition." padding="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Main Title</label>
              <Input 
                value={data?.hero?.title || ''} 
                onChange={(e) => handleUpdate('hero', 'title', e.target.value)}
                className="bg-black/20 border-white/10 focus-visible:ring-accent rounded-xl h-14 text-lg font-serif"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Subtitle</label>
              <Input 
                value={data?.hero?.subtitle || ''} 
                onChange={(e) => handleUpdate('hero', 'subtitle', e.target.value)}
                className="bg-black/20 border-white/10 focus-visible:ring-accent rounded-xl h-14"
              />
            </div>
          </div>
        </LuxuryCard>

        <LuxuryCard title="About Section" description="Information regarding the exhibition's legacy." padding="lg">
          <div className="space-y-8 mt-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Section Heading</label>
              <Input 
                value={data?.about?.title || ''} 
                onChange={(e) => handleUpdate('about', 'title', e.target.value)}
                className="bg-black/20 border-white/10 focus-visible:ring-accent rounded-xl h-14 font-serif text-lg max-w-md"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Narrative Content</label>
              <Textarea 
                rows={8}
                value={data?.about?.content || ''} 
                onChange={(e) => handleUpdate('about', 'content', e.target.value)}
                className="bg-black/20 border-white/10 focus-visible:ring-accent rounded-xl resize-none text-base leading-relaxed p-6"
              />
            </div>
          </div>
        </LuxuryCard>
      </div>

      {/* JSON Editor */}
      <div className={activeTab === 'json' ? 'block' : 'hidden'}>
        <LuxuryCard title="Raw Structure (Advanced)" description="Directly modify the JSON data tree." padding="lg">
          <div className="mt-6 relative">
            <div className="absolute top-4 right-4 text-xs text-muted-foreground bg-black/40 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
              application/json
            </div>
            <Textarea 
              className="font-mono text-sm min-h-[500px] bg-[#0A0A0A] text-blue-400 border-white/10 p-6 rounded-xl focus-visible:ring-blue-500/50"
              defaultValue={JSON.stringify(data, null, 2)}
              onChange={handleJsonUpdate}
            />
          </div>
          <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500/80 text-sm">
            <strong className="text-amber-500 block mb-1">Warning</strong>
            Modifying raw JSON can break page layout if the expected schema is altered incorrectly. Changes apply immediately to the preview but must be published to go live.
          </div>
        </LuxuryCard>
      </div>
    </div>
  )
}
