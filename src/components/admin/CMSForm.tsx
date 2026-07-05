'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, History, Eye, Loader2, Send } from "lucide-react"
import { saveCMSContent } from "@/actions/admin/cms"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

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
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList>
            <TabsTrigger value="visual">Visual Editor</TabsTrigger>
            <TabsTrigger value="json">JSON Schema</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Button variant="outline" className="hidden sm:flex">
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
          <Button variant="outline" className="hidden sm:flex">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="secondary" onClick={() => handleSave('draft')} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Draft
          </Button>
          <Button onClick={() => handleSave('published')} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Publish
          </Button>
        </div>
      </div>

      <div className={activeTab === 'visual' ? 'block' : 'hidden'}>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hero Title</label>
                <Input 
                  value={data?.hero?.title || ''} 
                  onChange={(e) => handleUpdate('hero', 'title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hero Subtitle</label>
                <Input 
                  value={data?.hero?.subtitle || ''} 
                  onChange={(e) => handleUpdate('hero', 'subtitle', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>About Section</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Section Title</label>
                <Input 
                  value={data?.about?.title || ''} 
                  onChange={(e) => handleUpdate('about', 'title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content Paragraph</label>
                <Textarea 
                  rows={5}
                  value={data?.about?.content || ''} 
                  onChange={(e) => handleUpdate('about', 'content', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className={activeTab === 'json' ? 'block' : 'hidden'}>
        <Card>
          <CardHeader><CardTitle>Raw JSON Edit (Advanced)</CardTitle></CardHeader>
          <CardContent>
            <Textarea 
              className="font-mono text-sm min-h-[400px] bg-slate-950 text-emerald-400"
              defaultValue={JSON.stringify(data, null, 2)}
              onChange={handleJsonUpdate}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Warning: Modifying raw JSON can break page structure if keys are altered incorrectly. The schema will be validated before save.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
