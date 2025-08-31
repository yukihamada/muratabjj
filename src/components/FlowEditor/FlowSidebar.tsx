'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Filter, ChevronRight, Plus, Layers, GitBranch, Shield, Swords } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'

const categoryIcons = {
  guard: Shield,
  sweep: GitBranch,
  submission: Swords,
  pass: Layers,
  position: Layers,
  escape: Shield,
}

type Technique = {
  id: string
  name: string
  name_ja?: string
  name_pt?: string
  category: string
  belt: string
  difficulty: number
  video_id?: string
  position?: string
  type?: string
}

type FlowSidebarProps = {
  onDragStart: (event: React.DragEvent, technique: Technique) => void
  onAddNode: (technique: Technique) => void
}

export function FlowSidebar({ onDragStart, onAddNode }: FlowSidebarProps) {
  const { language } = useLanguage()
  const [techniques, setTechniques] = useState<Technique[]>([])
  const [filteredTechniques, setFilteredTechniques] = useState<Technique[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedBelt, setSelectedBelt] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])

  const filterTechniques = useCallback(() => {
    let filtered = techniques

    if (searchQuery) {
      filtered = filtered.filter(t => {
        const name = language === 'ja' && t.name_ja ? t.name_ja : 
                    language === 'pt' && t.name_pt ? t.name_pt : 
                    t.name
        return name.toLowerCase().includes(searchQuery.toLowerCase())
      })
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }

    if (selectedBelt !== 'all') {
      filtered = filtered.filter(t => t.belt === selectedBelt)
    }

    setFilteredTechniques(filtered)
  }, [techniques, searchQuery, selectedCategory, selectedBelt, language])

  useEffect(() => {
    loadTechniques()
  }, [])

  useEffect(() => {
    filterTechniques()
  }, [filterTechniques])

  async function loadTechniques() {
    try {
      const { data, error } = await supabase
        .from('techniques')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error

      setTechniques(data || [])
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data?.map((t: any) => t.category) || [])] as string[]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error loading techniques:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTechniqueName = (technique: Technique) => {
    if (language === 'ja' && technique.name_ja) return technique.name_ja
    if (language === 'pt' && technique.name_pt) return technique.name_pt
    return technique.name
  }

  const belts = ['white', 'blue', 'purple', 'brown', 'black']
  const beltColors = {
    white: 'bg-white',
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    brown: 'bg-amber-700',
    black: 'bg-black',
  }

  return (
    <div className="h-full flex flex-col bg-bjj-bg2 border-r border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-bold mb-3">Techniques</h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bjj-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search techniques..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:border-bjj-accent focus:outline-none"
          />
        </div>
        
        {/* Filters */}
        <div className="space-y-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:border-bjj-accent focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          
          {/* Belt Filter */}
          <select
            value={selectedBelt}
            onChange={(e) => setSelectedBelt(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:border-bjj-accent focus:outline-none"
          >
            <option value="all">All Belts</option>
            {belts.map(belt => (
              <option key={belt} value={belt}>
                {belt.charAt(0).toUpperCase() + belt.slice(1)} Belt
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Techniques List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-bjj-accent border-t-transparent rounded-full mx-auto" />
          </div>
        ) : filteredTechniques.length === 0 ? (
          <div className="text-center py-8 text-bjj-muted">
            No techniques found
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTechniques.map((technique) => {
              const Icon = categoryIcons[technique.category as keyof typeof categoryIcons] || Layers
              return (
                <div
                  key={technique.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, technique)}
                  className="group p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-bjj-accent/50 rounded-lg cursor-move transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/10 rounded-lg group-hover:bg-bjj-accent/20 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">
                        {getTechniqueName(technique)}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-bjj-muted">
                        <span className={`w-3 h-3 rounded-full ${beltColors[technique.belt as keyof typeof beltColors]}`} />
                        <span>{technique.category}</span>
                        {technique.position && (
                          <>
                            <ChevronRight className="w-3 h-3" />
                            <span>{technique.position}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onAddNode(technique)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-bjj-accent rounded transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      {/* Quick Add Section */}
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-bjj-muted text-center">
          Drag techniques to canvas or click + to add
        </p>
      </div>
    </div>
  )
}