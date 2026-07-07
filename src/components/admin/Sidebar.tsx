'use client';

import * as React from "react"
import { Link, usePathname } from "@/lib/i18n/routing"
import { motion } from "framer-motion"
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Users, 
  Settings,
  Menu,
  FileText,
  Paintbrush,
  ImagePlus,
  BookOpen,
  LogOut,
  ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { GlassPanel } from "./ui/GlassPanel"
import { PremiumButton } from "./ui/PremiumButton"

export function AdminSidebar({ locale }: { locale: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = React.useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
  }

  const links = [
    { href: "/admin", label: locale === 'bn' ? "ড্যাশবোর্ড" : "Overview", icon: LayoutDashboard },
    { href: "/admin/exhibitions", label: locale === 'bn' ? "প্রদর্শনী" : "Exhibitions", icon: Paintbrush },
    { href: "/admin/artworks", label: locale === 'bn' ? "শিল্পকর্ম মডারেশন" : "Moderation", icon: ImageIcon },
    { href: "/admin/cms", label: locale === 'bn' ? "সিএমএস" : "CMS Engine", icon: FileText },
    { href: "/admin/gallery", label: locale === 'bn' ? "গ্যালারি" : "Gallery Media", icon: ImagePlus },
    { href: "/admin/catalogs", label: locale === 'bn' ? "ক্যাটালগ" : "Catalogs", icon: BookOpen },
    { href: "/admin/users", label: locale === 'bn' ? "ব্যবহারকারী" : "Users", icon: Users },
  ]

  const sidebarContent = (
    <GlassPanel intensity="medium" className="flex flex-col h-full m-6 border-white/20 dark:border-white/10 rounded-3xl">
      <div className="p-8 pb-4">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#CC5500] flex items-center justify-center shadow-lg">
            <span className="text-white font-serif italic font-bold">R</span>
          </div>
          Rongdhono
        </h2>
        <p className="text-[10px] text-muted-foreground/80 mt-2 uppercase tracking-[0.2em] font-medium ml-11">Operating System</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto pb-6 relative">
        {links.map((link) => {
          // Moderation routes (/admin/exhibitions/*/moderation and /admin/artworks)
          // must highlight "Moderation", not "Exhibitions"
          const isModerationRoute = pathname.includes('/moderation') || pathname.startsWith('/admin/artworks')
          const isExhibitionsLink = link.href === '/admin/exhibitions'
          const isModerationLink = link.href === '/admin/artworks'

          let isActive: boolean
          if (isModerationLink) {
            // Highlight Moderation for /admin/artworks AND any .../moderation sub-route
            isActive = pathname.startsWith('/admin/artworks') || pathname.includes('/moderation')
          } else if (isExhibitionsLink) {
            // Highlight Exhibitions ONLY for exhibition routes that are NOT moderation
            isActive = pathname.startsWith('/admin/exhibitions') && !pathname.includes('/moderation')
          } else if (link.href === '/admin') {
            isActive = pathname === '/admin'
          } else {
            isActive = pathname.startsWith(link.href)
          }
          const Icon = link.icon
          return (
            <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="block relative">
              {isActive && (
                <motion.div
                  layoutId="active-sidebar-indicator"
                  className="absolute inset-0 bg-accent/15 dark:bg-accent/20 rounded-2xl border border-accent/20"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-medium text-sm z-10
                ${isActive 
                  ? 'text-accent-foreground dark:text-accent font-semibold' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
                {link.label}
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-border/40 dark:border-white/10 bg-black/5 dark:bg-white/5">
        <PremiumButton 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-foreground" 
          onClick={handleLogout}
          leftIcon={<LogOut className="w-5 h-5 stroke-[1.5]" />}
        >
          {locale === 'bn' ? "লগ আউট" : "Logout"}
        </PremiumButton>
        <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between px-2">
          <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">v3.0 Luxury OS</p>
          <Link href="/dashboard" className="text-xs text-accent font-medium hover:underline">Exit OS</Link>
        </div>
      </div>
    </GlassPanel>
  )

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden p-4 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-50">
        <h2 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#D4AF37] to-[#CC5500] flex items-center justify-center">
            <span className="text-white font-serif italic text-xs">R</span>
          </div>
          Rongdhono OS
        </h2>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <PremiumButton variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </PremiumButton>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80 bg-transparent border-none shadow-none">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Floating Sidebar */}
      <div className="hidden md:block w-[320px] h-screen sticky top-0 bg-transparent z-40">
        {sidebarContent}
      </div>
    </>
  )
}
