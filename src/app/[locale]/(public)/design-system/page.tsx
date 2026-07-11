import { SectionHeading } from "@/components/museum/section-heading"
import { ArtworkCard } from "@/components/museum/artwork-card"
import { ArtistCard } from "@/components/museum/artist-card"
import { ExhibitionCard } from "@/components/museum/exhibition-card"
import { GalleryGrid } from "@/components/museum/gallery-grid"
import { EmptyState, ErrorState, LoadingState } from "@/components/museum/states"
import { StatisticsCard } from "@/components/museum/statistics-card"
import { Timeline } from "@/components/museum/timeline"
import { HeroBanner } from "@/components/museum/hero-banner"
import { FileUpload, ImagePreview } from "@/components/museum/file-upload"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brush, Palette, Users } from "lucide-react"

export default function DesignSystemPage() {
  return (
    <div className="container mx-auto py-12 px-4 space-y-24">
      <div className="text-center">
        <h1 className="font-serif text-5xl font-bold mb-4 text-accent">Rongdhonu Design System</h1>
        <p className="text-muted-foreground text-lg">Premium Museum Aesthetic UI Component Library</p>
      </div>

      <section>
        <SectionHeading title="Colors & Typography" subtitle="The core visual tokens of the platform." alignment="left" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="h-24 rounded-lg bg-background border flex items-center justify-center shadow-sm">Background</div>
          <div className="h-24 rounded-lg bg-foreground text-background flex items-center justify-center">Foreground</div>
          <div className="h-24 rounded-lg bg-accent text-accent-foreground flex items-center justify-center font-bold">Accent (Gold)</div>
          <div className="h-24 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">Muted</div>
        </div>
        <div className="space-y-4">
          <h1 className="font-serif text-5xl">Heading 1 (Playfair Display)</h1>
          <h2 className="font-serif text-4xl">Heading 2 (Playfair Display)</h2>
          <p className="font-sans text-base">Body Text (Inter). This is the default sans-serif font used for legibility in paragraphs, UI elements, and forms.</p>
        </div>
      </section>

      <section>
        <SectionHeading title="Primitive UI" subtitle="Buttons, Inputs, and basic building blocks." alignment="left" />
        <div className="flex flex-wrap gap-4 mb-8">
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
        <div className="grid max-w-sm gap-2">
          <Label>Email Address</Label>
          <Input placeholder="Enter your email..." />
        </div>
      </section>

      <section>
        <SectionHeading title="Museum Components" subtitle="Custom cards and layouts for the art exhibition." alignment="left" />
        
        <Tabs defaultValue="artwork" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="artwork">Artwork Card</TabsTrigger>
            <TabsTrigger value="artist">Artist Card</TabsTrigger>
            <TabsTrigger value="exhibition">Exhibition Card</TabsTrigger>
          </TabsList>
          
          <TabsContent value="artwork">
            <div className="max-w-sm">
              <ArtworkCard 
                title="The Silent Symphony"
                artistName="Rabindranath Tagore"
                medium="Oil on Canvas"
                imageUrl="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800"
                status="available"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="artist">
            <div className="max-w-sm">
              <ArtistCard 
                name="Satyajit Ray"
                role="Featured Artist"
                bioSnippet="A prominent figure in Indian cinema and art, known for his masterful storytelling and sketching."
                avatarUrl="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="exhibition">
            <div className="max-w-md">
              <ExhibitionCard 
                id="1"
                title="Annual Summer Collection 2026"
                status="upcoming"
                venue="Silva Tirtha Art Gallery, Berhampore"
                startDate={new Date('2026-08-01')}
                endDate={new Date('2026-08-15')}
                coverImageUrl="https://images.unsplash.com/photo-1518998053401-878c735c908c?auto=format&fit=crop&q=80&w=1000"
              />
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <section>
        <SectionHeading title="Data & States" subtitle="Statistics, empty states, and feedback." alignment="left" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatisticsCard title="Total Artworks" value="1,248" icon={<Palette />} trend={{ value: 12, label: "from last year" }} />
          <StatisticsCard title="Active Artists" value="342" icon={<Users />} trend={{ value: 5, label: "new this month" }} />
          <StatisticsCard title="Exhibitions" value="14" icon={<Brush />} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EmptyState />
          <LoadingState />
          <ErrorState />
        </div>
      </section>
      
      <section>
        <SectionHeading title="Timeline & Uploads" alignment="left" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="font-serif text-2xl mb-6">Vertical Timeline</h3>
            <Timeline items={[
              { id: '1', title: 'Registration Opens', status: 'completed', date: 'Jan 15' },
              { id: '2', title: 'Artwork Submissions', status: 'current', date: 'Feb 1 - Feb 28', description: 'Artists can submit up to 3 artworks.' },
              { id: '3', title: 'Exhibition Starts', status: 'upcoming', date: 'April 10' },
            ]} />
          </div>
          <div>
            <h3 className="font-serif text-2xl mb-6">File Upload</h3>
            <FileUpload onFilesSelected={() => {}} maxFiles={3} />
          </div>
        </div>
      </section>
    </div>
  )
}
