'use client'

import * as React from "react"
import { usePathname } from "next/navigation"
import { Link } from "@/lib/i18n/routing"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Image as ImageIcon, User, Bell, LogOut, Upload, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"

interface SidebarProps {
  locale: string
  className?: string
}

export function DashboardSidebar({ locale, className }: SidebarProps) {
  const pathname = usePathname()
  const supabase = createClient()
  const [unreadCount, setUnreadCount] = React.useState(0)

  React.useEffect(() => {
    async function fetchUnread() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read_status', false)
        
        if (count) setUnreadCount(count)
      }
    }
    fetchUnread()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = `/${locale}/login`
  }

  const navItems = [
    { name: locale === 'bn' ? "ড্যাশবোর্ড" : "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: locale === 'bn' ? "আমার শিল্পকর্ম" : "My Artworks", href: "/dashboard/artworks", icon: ImageIcon },
    { name: locale === 'bn' ? "শিল্পকর্ম জমা দিন" : "Submit Artwork", href: "/dashboard/artworks/new", icon: Upload },
    { name: locale === 'bn' ? "প্রোফাইল" : "Profile", href: "/dashboard/profile", icon: User },
    { name: locale === 'bn' ? "বিজ্ঞপ্তি" : "Notifications", href: "/dashboard/notifications", icon: Bell, badge: unreadCount },
  ]

  const SidebarContent = (
    <div className="flex flex-col h-full bg-[#FAF9F6] border-r border-[#E5E0D8]">
      <div className="p-8 pb-4">
        <Link href="/" className="font-serif text-3xl font-bold tracking-tight text-accent-gold">
          Rongdhono
        </Link>
        <p className="text-sm text-[#6B655C] mt-2 font-medium tracking-wide uppercase">Artist Portal</p>
      </div>
      
      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          // Check if active. We need to handle /en/dashboard vs /en/dashboard/artworks
          const isActive = pathname === `/${locale}${item.href}` || (item.href !== '/dashboard' && pathname.startsWith(`/${locale}${item.href}`))
          const Icon = item.icon
          
          return (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 min-h-[44px] sm:h-12 text-[15px] sm:text-base relative transition-all duration-300 rounded-xl font-medium",
                isActive 
                  ? "bg-charcoal text-white shadow-md hover:bg-[#2A2A2A] hover:text-white" 
                  : "text-[#6B655C] hover:text-charcoal hover:bg-white/60"
              )}
            >
              <Link href={item.href as any}>
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge ? (
                  <span className="absolute right-4 px-2 py-0.5 rounded-full bg-accent-gold text-white text-xs font-bold shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                ) : null}
              </Link>
            </Button>
          )
        })}
      </div>
      
      <div className="p-4 border-t border-[#E5E0D8] bg-[#F5F2EB]/50">
        <Button variant="ghost" className="w-full justify-start gap-3 text-[#6B655C] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors" onClick={handleLogout}>
          <LogOut className="w-5 h-5" />
          {locale === 'bn' ? "লগ আউট" : "Log out"}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn("hidden lg:flex w-72 flex-col fixed inset-y-0 z-50", className)}>
        {SidebarContent}
      </aside>

      {/* Mobile Topbar & Sheet */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-md border-b border-[#E5E0D8]/60 z-50 flex items-center justify-between px-4 shadow-sm">
        <Link href="/" className="font-serif text-2xl font-bold text-accent-gold tracking-tight">
          Rongdhono
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="w-11 h-11 rounded-full hover:bg-[#F5F2EB] text-charcoal">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px] border-r-0 shadow-2xl">
            {SidebarContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

