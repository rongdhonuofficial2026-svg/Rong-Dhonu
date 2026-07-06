'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, Edit2, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import type { Database } from '@/types/database'
import { createGalleryCategory, updateGalleryCategory, deleteGalleryCategory, reorderGalleryCategories } from '@/actions/admin/gallery-categories'

type Category = Database['public']['Tables']['gallery_categories']['Row']

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isAdding, setIsAdding] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  
  // New Category State
  const [newNameEn, setNewNameEn] = useState('')
  const [newNameBn, setNewNameBn] = useState('')
  const [newSlug, setNewSlug] = useState('')

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNameEn, setEditNameEn] = useState('')
  const [editNameBn, setEditNameBn] = useState('')
  const [editSlug, setEditSlug] = useState('')

  const handleAdd = async () => {
    if (!newNameEn || !newNameBn) {
      toast.error('English and Bengali names are required')
      return
    }

    setLoadingId('new')
    const res = await createGalleryCategory({
      name_en: newNameEn,
      name_bn: newNameBn,
      slug: newSlug || newNameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      sort_order: categories.length + 1
    })

    if (res.success && res.data) {
      setCategories([...categories, res.data])
      setNewNameEn('')
      setNewNameBn('')
      setNewSlug('')
      setIsAdding(false)
      toast.success('Category created')
    } else {
      toast.error(res.error || 'Failed to create category')
    }
    setLoadingId(null)
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditNameEn(cat.name_en)
    setEditNameBn(cat.name_bn)
    setEditSlug(cat.slug)
  }

  const saveEdit = async (id: string) => {
    setLoadingId(id)
    const res = await updateGalleryCategory(id, {
      name_en: editNameEn,
      name_bn: editNameBn,
      slug: editSlug
    })

    if (res.success && res.data) {
      setCategories(categories.map(c => c.id === id ? res.data : c))
      setEditingId(null)
      toast.success('Category updated')
    } else {
      toast.error(res.error || 'Failed to update category')
    }
    setLoadingId(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    
    setLoadingId(id)
    const res = await deleteGalleryCategory(id)
    if (res.success) {
      setCategories(categories.filter(c => c.id !== id))
      toast.success('Category deleted')
    } else {
      toast.error(res.error || 'Failed to delete category')
    }
    setLoadingId(null)
  }

  // Simple move up/down instead of drag/drop for quick implementation
  const move = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === categories.length - 1) return

    const newCategories = [...categories]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    // Swap
    const temp = newCategories[index]
    newCategories[index] = newCategories[targetIndex]
    newCategories[targetIndex] = temp

    // Update sort_orders locally
    newCategories.forEach((c, i) => c.sort_order = i + 1)
    setCategories(newCategories)

    // Save to DB
    await reorderGalleryCategories(newCategories.map(c => ({ id: c.id, sort_order: c.sort_order || 0 })))
  }

  return (
    <div className="space-y-6">
      
      {!isAdding && (
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      )}

      {isAdding && (
        <div className="bg-muted/10 border border-border/50 p-4 rounded-xl space-y-4 max-w-2xl">
          <h3 className="font-medium">New Category</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Name (English) *</label>
              <Input value={newNameEn} onChange={e => setNewNameEn(e.target.value)} placeholder="e.g. Artwork" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Name (Bengali) *</label>
              <Input value={newNameBn} onChange={e => setNewNameBn(e.target.value)} placeholder="e.g. শিল্পকর্ম" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Slug (Optional - auto-generated from English name)</label>
              <Input value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder="e.g. artwork" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={loadingId === 'new'}>
              {loadingId === 'new' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Save
            </Button>
          </div>
        </div>
      )}

      <div className="bg-background border border-border/40 rounded-2xl overflow-hidden max-w-4xl shadow-sm">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border/40 bg-muted/5 font-medium text-sm text-muted-foreground">
          <div className="col-span-1">Order</div>
          <div className="col-span-3">English</div>
          <div className="col-span-3">Bengali</div>
          <div className="col-span-3">Slug</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-border/30">
          {categories.map((cat, index) => (
            <div key={cat.id} className="grid grid-cols-12 gap-4 p-4 items-center group hover:bg-muted/5 transition-colors">
              <div className="col-span-1 flex flex-col gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => move(index, 'up')} disabled={index === 0}>▲</Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => move(index, 'down')} disabled={index === categories.length - 1}>▼</Button>
              </div>
              
              {editingId === cat.id ? (
                <>
                  <div className="col-span-3">
                    <Input value={editNameEn} onChange={e => setEditNameEn(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="col-span-3">
                    <Input value={editNameBn} onChange={e => setEditNameBn(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="col-span-3">
                    <Input value={editSlug} onChange={e => setEditSlug(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="col-span-2 flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditingId(null)} className="h-8 w-8 text-muted-foreground hover:text-rose-500">
                      <X className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => saveEdit(cat.id)} disabled={loadingId === cat.id} className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                      {loadingId === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-3 font-medium">{cat.name_en}</div>
                  <div className="col-span-3">{cat.name_bn}</div>
                  <div className="col-span-3 text-sm text-muted-foreground">{cat.slug}</div>
                  <div className="col-span-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(cat)} className="h-8 w-8 text-muted-foreground hover:text-accent">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} disabled={loadingId === cat.id} className="h-8 w-8 text-muted-foreground hover:text-rose-500">
                      {loadingId === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
          {categories.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No categories found. Create one to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
