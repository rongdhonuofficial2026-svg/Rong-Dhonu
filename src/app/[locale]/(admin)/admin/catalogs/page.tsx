import { createClient } from '@/lib/supabase/server'
import { Link } from '@/lib/i18n/routing'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash, FileText, Download, CheckCircle, Clock } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function AdminCatalogsPage() {
  const supabase = await createClient()
  const t = await getTranslations('Admin')

  const { data: catalogs, error } = await supabase
    .from('catalogs')
    .select('*, exhibitions(theme_en, year)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalogs (DMS)</h1>
          <p className="text-muted-foreground">Manage official exhibition catalog documents.</p>
        </div>
        <Button asChild>
          <Link href="/admin/catalogs/new">
            <Plus className="mr-2 h-4 w-4" /> Upload Catalog
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Document</th>
                <th className="px-6 py-4 font-medium">Exhibition</th>
                <th className="px-6 py-4 font-medium">Version</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Downloads</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!catalogs || catalogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
                    No catalogs found. Upload a new catalog to get started.
                  </td>
                </tr>
              ) : (
                catalogs.map((cat) => (
                  <tr key={cat.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="font-medium text-base">{cat.title_en}</div>
                      <div className="text-xs text-muted-foreground">{cat.language.toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4">
                      {(cat.exhibitions as any)?.theme_en || 'Unknown'} ({(cat.exhibitions as any)?.year})
                    </td>
                    <td className="px-6 py-4">
                      v{cat.version}
                    </td>
                    <td className="px-6 py-4">
                      {cat.status === 'published' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="w-3.5 h-3.5" /> Published
                        </span>
                      ) : cat.status === 'archived' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                          Archived
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                          <Clock className="w-3.5 h-3.5" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3 text-muted-foreground" />
                        {cat.total_downloads || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/catalogs/${cat.id}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
