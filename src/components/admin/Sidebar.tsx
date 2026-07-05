'use client'

import * as React from "react"
import { Link, usePathname } from "@/lib/i18n/routing"
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
    { href: "/admin/committee", label: locale === 'bn' ? "কমিটি" : "Committee", icon: ShieldAlert },
    { href: "/admin/cms", label: locale === 'bn' ? "সিএমএস" : "CMS Engine", icon: FileText },
    { href: "/admin/gallery", label: locale === 'bn' ? "গ্যালারি" : "Gallery Media", icon: ImagePlus },
    { href: "/admin/catalogs", label: locale === 'bn' ? "ক্যাটালগ" : "Catalogs", icon: BookOpen },
    { href: "/admin/users", label: locale === 'bn' ? "ব্যবহারকারী" : "Users", icon: Users },
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 border-r border-slate-800">
      <div className="p-6">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          Rongdhono Admin
        </h2>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">Administration Portal</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
            <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' 
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'}`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-900" 
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          {locale === 'bn' ? "লগ আউট" : "Logout"}
        </Button>
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between px-2">
          <p className="text-xs text-slate-500">v2.0.0 Pro</p>
          <Link href="/dashboard" className="text-xs text-indigo-400 hover:underline">Exit to Member Portal</Link>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="md:hidden p-4 border-b border-border bg-slate-950 flex items-center justify-between sticky top-0 z-50">
        <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          Admin
        </h2>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-900">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-r-slate-800 bg-slate-950">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden md:block w-72 h-screen sticky top-0">
        {sidebarContent}
      </div>
    </>
  )
}
