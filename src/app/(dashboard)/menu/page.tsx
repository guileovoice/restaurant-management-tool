'use client'

import { useEffect, useState, useRef } from 'react'
import Papa from 'papaparse'
import { Plus, Sparkles, Search, SlidersHorizontal, Upload } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { MenuItemCard } from '@/components/menu/MenuItemCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useRestaurantStore } from '@/lib/stores/restaurantStore'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'react-hot-toast'
import { MenuItem } from '@/lib/types'

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'

export default function MenuPage() {
  const { menu, menuTotalCount, fetchMenu, addMenuItem, updateMenuItem, deleteMenuItem, bulkAddMenuItems } = useRestaurantStore()
  const [activeCategory, setActiveCategory] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 50
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Modal / Form state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [available, setAvailable] = useState(true)
  const [popular, setPopular] = useState(false)
  const [preparationTime, setPreparationTime] = useState('5')
  const [allergens, setAllergens] = useState('')

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    fetchMenu(currentPage, pageSize)
  }, [fetchMenu, currentPage])

  if (!isMounted) {
    return null // Prevent hydration mismatch on initial render
  }

  // Because of server-side pagination, categories are limited to the current page unless fetched completely. 
  // For a fully robust category filter, you would move filtering to the server, but for now we map what we have.
  const categories = ['All', ...Array.from(new Set(menu.map(item => item.category)))]

  const filteredItems = menu.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          if (results.data && results.data.length > 0) {
            await bulkAddMenuItems(results.data)
            toast.success(`Successfully imported ${results.data.length} menu items!`)
          } else {
            toast.error("No valid data found in the CSV.")
          }
        } catch (error) {
          toast.error("Failed to import menu items.")
          console.error(error)
        } finally {
          setIsUploading(false)
          if (fileInputRef.current) fileInputRef.current.value = ''
        }
      },
      error: (err) => {
        toast.error("Error parsing CSV file")
        console.error(err)
        setIsUploading(false)
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price || !category) {
      toast.error('Please fill in all required fields.')
      return
    }

    const itemData = {
      name,
      description,
      price: parseFloat(price) || 0,
      category,
      imageUrl: imageUrl || undefined,
      available,
      popular,
      preparationTime: parseInt(preparationTime) || 5,
      allergens: allergens ? allergens.split(',').map(s => s.trim()).filter(Boolean) : []
    }

    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, itemData)
        toast.success('Menu item updated successfully!')
      } else {
        const newId = 'm_' + Date.now()
        await addMenuItem({
          id: newId,
          tenantId: '',
          ...itemData
        })
        toast.success('Menu item added successfully!')
      }
      setIsAddEditOpen(false)
      setEditingItem(null)
    } catch (err) {
      console.error(err)
      toast.error('An error occurred.')
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Menu Management" 
        subtitle={`Showing ${menu.length} items of ${menuTotalCount} total.`}
        actions={
          <div className="flex flex-wrap gap-3">
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            <Button 
              variant="outline" 
              className="border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <span className="flex items-center gap-2">Importing...</span>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import from CSV
                </>
              )}
            </Button>
            <Button 
              className="bg-primary hover:bg-primary-dark text-white gap-2 font-semibold"
              onClick={() => {
                setEditingItem(null)
                setName('')
                setDescription('')
                setPrice('')
                setCategory('Pães & Salgados')
                setImageUrl('')
                setAvailable(true)
                setPopular(false)
                setPreparationTime('5')
                setAllergens('')
                setIsAddEditOpen(true)
              }}
            >
              <Plus className="w-4 h-4" />
              Add Menu Item
            </Button>
          </div>
        }
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface p-4 rounded-xl border border-border">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger className="w-full md:w-[200px] bg-surface2 border-border h-10 text-xs font-bold uppercase tracking-widest text-text-primary">
              <SelectValue placeholder="Category: All" />
            </SelectTrigger>
            <SelectContent className="bg-surface border-border">
              {categories.map(category => (
                <SelectItem 
                  key={category} 
                  value={category}
                  className="text-xs font-bold uppercase tracking-widest text-text-primary focus:bg-primary focus:text-white"
                >
                  {category === 'All' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input 
              placeholder="Search items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-surface2 border-border h-10" 
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10 border-border bg-surface2 text-text-muted">
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <MenuItemCard 
            key={item.id} 
            item={item} 
            onEdit={(item) => {
              setEditingItem(item)
              setName(item.name)
              setDescription(item.description)
              setPrice(item.price.toString())
              setCategory(item.category)
              setImageUrl(item.imageUrl || '')
              setAvailable(item.available)
              setPopular(item.popular || false)
              setPreparationTime((item.preparationTime || 5).toString())
              setAllergens(item.allergens?.join(', ') || '')
              setIsAddEditOpen(true)
            }}
            onToggle={async (id, checked) => {
              await updateMenuItem(id, { available: checked })
              toast.success('Availability updated!')
            }}
            onDelete={async (id) => {
              if (confirm('Are you sure you want to delete this menu item?')) {
                await deleteMenuItem(id)
                toast.success('Item deleted successfully!')
              }
            }}
          />
        ))}
        {filteredItems.length === 0 && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-surface/30">
            <div className="w-16 h-16 bg-surface2 rounded-full flex items-center justify-center mb-4 text-text-muted">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">No items found</h3>
            <p className="text-text-muted text-center max-w-xs">
              We couldn't find any items matching your current filters. Try adjusting your search or category.
            </p>
            <Button variant="link" className="mt-4 text-primary" onClick={() => {setSearchQuery(''); setActiveCategory('All')}}>
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      {menuTotalCount > pageSize && (
        <div className="flex items-center justify-between pt-4 border-t border-border mt-8">
          <div className="text-sm text-text-muted">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, menuTotalCount)} of {menuTotalCount} items
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-border bg-surface text-text-primary hover:bg-surface2"
            >
              Previous
            </Button>
            <div className="text-sm font-semibold text-text-primary px-2">
              Page {currentPage} of {Math.ceil(menuTotalCount / pageSize)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(menuTotalCount / pageSize), p + 1))}
              disabled={currentPage === Math.ceil(menuTotalCount / pageSize)}
              className="border-border bg-surface text-text-primary hover:bg-surface2"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent className="bg-surface border-border max-w-md text-text-primary">
          <DialogHeader>
            <DialogTitle className="text-text-primary text-xl font-bold">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-text-primary text-xs font-semibold uppercase tracking-wider">Name *</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Coxinha" 
                className="bg-surface2 border-border text-text-primary"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="price" className="text-text-primary text-xs font-semibold uppercase tracking-wider">Price ($) *</Label>
                <Input 
                  id="price" 
                  type="number" 
                  step="0.01"
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  placeholder="4.50" 
                  className="bg-surface2 border-border text-text-primary"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="category" className="text-text-primary text-xs font-semibold uppercase tracking-wider">Category *</Label>
                <Input 
                  id="category" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  placeholder="Pães & Salgados" 
                  className="bg-surface2 border-border text-text-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="description" className="text-text-primary text-xs font-semibold uppercase tracking-wider">Description</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Delicious savory pastry..." 
                className="bg-surface2 border-border min-h-[80px] text-text-primary"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="imageUrl" className="text-text-primary text-xs font-semibold uppercase tracking-wider">Image URL</Label>
              <Input 
                id="imageUrl" 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
                placeholder="https://example.com/image.jpg" 
                className="bg-surface2 border-border text-text-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="preparationTime" className="text-text-primary text-xs font-semibold uppercase tracking-wider">Prep Time (mins)</Label>
                <Input 
                  id="preparationTime" 
                  type="number" 
                  value={preparationTime} 
                  onChange={(e) => setPreparationTime(e.target.value)} 
                  className="bg-surface2 border-border text-text-primary"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="allergens" className="text-text-primary text-xs font-semibold uppercase tracking-wider">Allergens (comma separated)</Label>
                <Input 
                  id="allergens" 
                  value={allergens} 
                  onChange={(e) => setAllergens(e.target.value)} 
                  placeholder="Gluten, Dairy" 
                  className="bg-surface2 border-border text-text-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-surface2 rounded-lg border border-border">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-text-primary">Popular Item</span>
                <span className="text-[10px] text-text-muted">Display a Flame badge on the menu</span>
              </div>
              <Switch checked={popular} onCheckedChange={setPopular} />
            </div>

            <div className="flex items-center justify-between p-3 bg-surface2 rounded-lg border border-border">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-text-primary">Available for Orders</span>
                <span className="text-[10px] text-text-muted">Toggle visibility in client portals</span>
              </div>
              <Switch checked={available} onCheckedChange={setAvailable} />
            </div>

            <DialogFooter className="mt-6 flex gap-2">
              <Button type="button" variant="outline" className="border-border text-text-primary" onClick={() => setIsAddEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary-dark text-white font-bold">
                {editingItem ? 'Save Changes' : 'Create Item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
