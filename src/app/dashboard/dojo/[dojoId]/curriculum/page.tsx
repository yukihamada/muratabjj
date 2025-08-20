'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import DashboardNav from '@/components/DashboardNav'
import { BookOpen, Plus, Edit2, Trash2, GripVertical, Video, FileText, Target } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const translations = {
  ja: {
    title: 'カリキュラム管理',
    createCurriculum: '新しいカリキュラム',
    curriculumName: 'カリキュラム名',
    description: '説明',
    beltLevel: '対象帯',
    create: '作成',
    cancel: 'キャンセル',
    save: '保存',
    delete: '削除',
    edit: '編集',
    addItem: 'アイテムを追加',
    selectType: 'タイプを選択',
    video: '動画',
    flow: 'フロー',
    assignment: '課題',
    noCurriculums: 'カリキュラムがありません',
    createFirst: '最初のカリキュラムを作成してください',
    deleteConfirm: 'このカリキュラムを削除しますか？',
    white: '白帯',
    blue: '青帯',
    purple: '紫帯',
    brown: '茶帯',
    black: '黒帯',
    all: 'すべて',
  },
  en: {
    title: 'Curriculum Management',
    createCurriculum: 'New Curriculum',
    curriculumName: 'Curriculum Name',
    description: 'Description',
    beltLevel: 'Target Belt',
    create: 'Create',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    addItem: 'Add Item',
    selectType: 'Select Type',
    video: 'Video',
    flow: 'Flow',
    assignment: 'Assignment',
    noCurriculums: 'No curriculums found',
    createFirst: 'Create your first curriculum',
    deleteConfirm: 'Delete this curriculum?',
    white: 'White Belt',
    blue: 'Blue Belt',
    purple: 'Purple Belt',
    brown: 'Brown Belt',
    black: 'Black Belt',
    all: 'All',
  },
  pt: {
    title: 'Gestão de Currículo',
    createCurriculum: 'Novo Currículo',
    curriculumName: 'Nome do Currículo',
    description: 'Descrição',
    beltLevel: 'Faixa Alvo',
    create: 'Criar',
    cancel: 'Cancelar',
    save: 'Salvar',
    delete: 'Excluir',
    edit: 'Editar',
    addItem: 'Adicionar Item',
    selectType: 'Selecionar Tipo',
    video: 'Vídeo',
    flow: 'Fluxo',
    assignment: 'Tarefa',
    noCurriculums: 'Nenhum currículo encontrado',
    createFirst: 'Crie seu primeiro currículo',
    deleteConfirm: 'Excluir este currículo?',
    white: 'Faixa Branca',
    blue: 'Faixa Azul',
    purple: 'Faixa Roxa',
    brown: 'Faixa Marrom',
    black: 'Faixa Preta',
    all: 'Todos',
  },
}

const belts = ['white', 'blue', 'purple', 'brown', 'black', 'all']

interface CurriculumItem {
  id: string
  type: 'video' | 'flow' | 'assignment'
  item_id: string
  order_index: number
  title?: string
}

export default function CurriculumManagementPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const dojoId = params.dojoId as string
  const t = translations[language as keyof typeof translations]
  
  const [curriculums, setCurriculums] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCurriculum, setSelectedCurriculum] = useState<any>(null)
  const [curriculumItems, setCurriculumItems] = useState<CurriculumItem[]>([])
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [availableItems, setAvailableItems] = useState<any>({ videos: [], flows: [] })
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    belt_level: 'white',
  })

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    fetchCurriculums()
    fetchAvailableItems()
  }, [user, dojoId])

  async function fetchCurriculums() {
    try {
      const { data, error } = await supabase
        .from('curriculums')
        .select('*')
        .eq('dojo_id', dojoId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCurriculums(data || [])
    } catch (error) {
      console.error('Error fetching curriculums:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchAvailableItems() {
    try {
      // Fetch videos
      const { data: videos } = await supabase
        .from('videos')
        .select('id, title_ja, title_en, title_pt')
        .eq('is_published', true)

      // Fetch flows
      const { data: flows } = await supabase
        .from('flows')
        .select('id, title')
        .or(`created_by.eq.${user!.id},is_public.eq.true`)

      setAvailableItems({
        videos: videos || [],
        flows: flows || [],
      })
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  async function fetchCurriculumItems(curriculumId: string) {
    try {
      const { data, error } = await supabase
        .from('curriculum_items')
        .select('*')
        .eq('curriculum_id', curriculumId)
        .order('order_index')

      if (error) throw error

      // Fetch item details
      const itemsWithDetails = await Promise.all((data || []).map(async (item) => {
        let title = ''
        
        if (item.item_type === 'video') {
          const { data: video } = await supabase
            .from('videos')
            .select('title_ja, title_en, title_pt')
            .eq('id', item.item_id)
            .single()
          
          if (video) {
            title = video[`title_${language}`] || video.title_ja
          }
        } else if (item.item_type === 'flow') {
          const { data: flow } = await supabase
            .from('flows')
            .select('title')
            .eq('id', item.item_id)
            .single()
          
          if (flow) {
            title = flow.title
          }
        }

        return { ...item, title }
      }))

      setCurriculumItems(itemsWithDetails)
    } catch (error) {
      console.error('Error fetching curriculum items:', error)
    }
  }

  async function createCurriculum(e: React.FormEvent) {
    e.preventDefault()

    try {
      const { data, error } = await supabase
        .from('curriculums')
        .insert({
          dojo_id: dojoId,
          title: formData.title,
          description: formData.description,
          belt_level: formData.belt_level,
          created_by: user!.id,
        })
        .select()
        .single()

      if (error) throw error

      toast.success(language === 'ja' ? 'カリキュラムを作成しました' : 
                   language === 'en' ? 'Curriculum created successfully' : 
                   'Currículo criado com sucesso')
      
      setShowCreateModal(false)
      setFormData({ title: '', description: '', belt_level: 'white' })
      fetchCurriculums()
    } catch (error) {
      console.error('Error creating curriculum:', error)
      toast.error(language === 'ja' ? '作成に失敗しました' : 
                  language === 'en' ? 'Failed to create curriculum' : 
                  'Falha ao criar currículo')
    }
  }

  async function deleteCurriculum(curriculumId: string) {
    if (!confirm(t.deleteConfirm)) return

    try {
      const { error } = await supabase
        .from('curriculums')
        .delete()
        .eq('id', curriculumId)

      if (error) throw error

      toast.success(language === 'ja' ? '削除しました' : 
                   language === 'en' ? 'Deleted successfully' : 
                   'Excluído com sucesso')
      
      fetchCurriculums()
      setSelectedCurriculum(null)
      setCurriculumItems([])
    } catch (error) {
      console.error('Error deleting curriculum:', error)
      toast.error(language === 'ja' ? '削除に失敗しました' : 
                  language === 'en' ? 'Failed to delete' : 
                  'Falha ao excluir')
    }
  }

  async function addItemToCurriculum(itemType: string, itemId: string) {
    if (!selectedCurriculum) return

    try {
      const newOrder = curriculumItems.length
      
      const { error } = await supabase
        .from('curriculum_items')
        .insert({
          curriculum_id: selectedCurriculum.id,
          item_type: itemType,
          item_id: itemId,
          order_index: newOrder,
        })

      if (error) throw error

      toast.success(language === 'ja' ? 'アイテムを追加しました' : 
                   language === 'en' ? 'Item added successfully' : 
                   'Item adicionado com sucesso')
      
      setShowAddItemModal(false)
      fetchCurriculumItems(selectedCurriculum.id)
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error(language === 'ja' ? '追加に失敗しました' : 
                  language === 'en' ? 'Failed to add item' : 
                  'Falha ao adicionar item')
    }
  }

  async function removeItemFromCurriculum(itemId: string) {
    try {
      const { error } = await supabase
        .from('curriculum_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      if (selectedCurriculum) {
        fetchCurriculumItems(selectedCurriculum.id)
      }
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error(language === 'ja' ? '削除に失敗しました' : 
                  language === 'en' ? 'Failed to remove item' : 
                  'Falha ao remover item')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bjj-bg">
        <DashboardNav />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bjj-bg">
      <DashboardNav />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <Link href="/dashboard/dojo" className="text-bjj-muted hover:text-bjj-text mb-2 inline-block">
                ← Back to Dojos
              </Link>
              <h1 className="text-3xl font-bold">{t.title}</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t.createCurriculum}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Curriculum List */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-xl font-semibold mb-4">Curriculums</h2>
              
              {curriculums.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-bjj-muted mx-auto mb-2" />
                  <p className="text-bjj-muted">{t.noCurriculums}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {curriculums.map((curriculum) => (
                    <button
                      key={curriculum.id}
                      onClick={() => {
                        setSelectedCurriculum(curriculum)
                        fetchCurriculumItems(curriculum.id)
                      }}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        selectedCurriculum?.id === curriculum.id
                          ? 'bg-bjj-accent/20 border border-bjj-accent'
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{curriculum.title}</h3>
                          <p className="text-sm text-bjj-muted mt-1">
                            {t[curriculum.belt_level as keyof typeof t] || curriculum.belt_level}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteCurriculum(curriculum.id)
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Curriculum Details */}
            <div className="lg:col-span-2">
              {selectedCurriculum ? (
                <div className="card-gradient border border-white/10 rounded-bjj p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedCurriculum.title}</h2>
                      {selectedCurriculum.description && (
                        <p className="text-bjj-muted mt-2">{selectedCurriculum.description}</p>
                      )}
                      <span className="inline-block mt-2 px-3 py-1 bg-bjj-accent/20 text-bjj-accent rounded-full text-sm">
                        {t[selectedCurriculum.belt_level as keyof typeof t] || selectedCurriculum.belt_level}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowAddItemModal(true)}
                      className="btn-ghost flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {t.addItem}
                    </button>
                  </div>

                  {/* Curriculum Items */}
                  <div className="space-y-3">
                    {curriculumItems.length === 0 ? (
                      <p className="text-center text-bjj-muted py-8">
                        No items added yet
                      </p>
                    ) : (
                      curriculumItems.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                        >
                          <GripVertical className="w-5 h-5 text-bjj-muted cursor-move" />
                          
                          <div className="flex-1 flex items-center gap-3">
                            {item.type === 'video' && <Video className="w-5 h-5 text-purple-400" />}
                            {item.type === 'flow' && <Target className="w-5 h-5 text-blue-400" />}
                            {item.type === 'assignment' && <FileText className="w-5 h-5 text-green-400" />}
                            
                            <span className="font-medium">{item.title || 'Untitled'}</span>
                          </div>

                          <span className="text-sm text-bjj-muted">#{index + 1}</span>
                          
                          <button
                            onClick={() => removeItemFromCurriculum(item.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="card-gradient border border-white/10 rounded-bjj p-12 text-center">
                  <BookOpen className="w-16 h-16 text-bjj-muted mx-auto mb-4" />
                  <p className="text-bjj-muted">Select a curriculum to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Curriculum Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-bjj-bg2 rounded-bjj p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{t.createCurriculum}</h2>
            
            <form onSubmit={createCurriculum} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.curriculumName} <span className="text-bjj-accent">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-bjj-bg border border-white/10 rounded-bjj focus:border-bjj-accent focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.description}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-bjj-bg border border-white/10 rounded-bjj focus:border-bjj-accent focus:outline-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.beltLevel}
                </label>
                <select
                  value={formData.belt_level}
                  onChange={(e) => setFormData({ ...formData, belt_level: e.target.value })}
                  className="w-full px-4 py-2 bg-bjj-bg border border-white/10 rounded-bjj focus:border-bjj-accent focus:outline-none"
                >
                  {belts.map(belt => (
                    <option key={belt} value={belt}>
                      {t[belt as keyof typeof t]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({ title: '', description: '', belt_level: 'white' })
                  }}
                  className="btn-ghost"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {t.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-bjj-bg2 rounded-bjj p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{t.addItem}</h2>
            
            {/* Videos */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-400" />
                {t.video}
              </h3>
              <div className="grid gap-2">
                {availableItems.videos.map((video: any) => (
                  <button
                    key={video.id}
                    onClick={() => addItemToCurriculum('video', video.id)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors"
                  >
                    {video[`title_${language}`] || video.title_ja}
                  </button>
                ))}
              </div>
            </div>

            {/* Flows */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                {t.flow}
              </h3>
              <div className="grid gap-2">
                {availableItems.flows.map((flow: any) => (
                  <button
                    key={flow.id}
                    onClick={() => addItemToCurriculum('flow', flow.id)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors"
                  >
                    {flow.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowAddItemModal(false)}
                className="btn-ghost"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}