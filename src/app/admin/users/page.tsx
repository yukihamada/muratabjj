'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import DashboardNav from '@/components/DashboardNav'
import { 
  Users, 
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Crown,
  Mail,
  Calendar,
  Shield,
  Edit,
  Trash2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja, enUS, ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  full_name?: string
  belt?: string
  stripes?: number
  role: string
  is_coach?: boolean
  subscription_plan?: string
  subscription_status?: string
  created_at: string
  last_sign_in_at?: string
}

export default function AdminUsers() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/dashboard')
      return
    }
    
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin, loading, router])

  useEffect(() => {
    // Filter users based on search term and role filter
    let filtered = users
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (filterRole !== 'all') {
      if (filterRole === 'admin') {
        filtered = filtered.filter(user => user.role === 'admin')
      } else if (filterRole === 'coach') {
        filtered = filtered.filter(user => user.is_coach)
      } else if (filterRole === 'pro') {
        filtered = filtered.filter(user => 
          user.subscription_plan === 'pro' || user.subscription_plan === 'dojo'
        )
      }
    }
    
    setFilteredUsers(filtered)
  }, [users, searchTerm, filterRole])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        toast.error('ユーザー一覧の取得に失敗しました')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('エラーが発生しました')
    } finally {
      setLoadingUsers(false)
    }
  }

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      })

      if (response.ok) {
        toast.success('ユーザー権限を更新しました')
        fetchUsers()
        setShowUserModal(false)
      } else {
        toast.error('権限更新に失敗しました')
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('エラーが発生しました')
    }
  }

  const toggleCoachStatus = async (userId: string, isCoach: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_coach: !isCoach }),
      })

      if (response.ok) {
        toast.success(`コーチ権限を${!isCoach ? '付与' : '削除'}しました`)
        fetchUsers()
      } else {
        toast.error('権限変更に失敗しました')
      }
    } catch (error) {
      console.error('Error toggling coach status:', error)
      toast.error('エラーが発生しました')
    }
  }

  const getBeltColor = (belt: string) => {
    const colors = {
      white: 'bg-gray-200 text-gray-800',
      blue: 'bg-blue-500 text-white',
      purple: 'bg-purple-500 text-white',
      brown: 'bg-amber-600 text-white',
      black: 'bg-gray-900 text-white'
    }
    return colors[belt as keyof typeof colors] || 'bg-gray-200 text-gray-800'
  }

  const getSubscriptionColor = (plan: string, status: string) => {
    if (status !== 'active') return 'bg-red-500/20 text-red-400'
    
    const colors = {
      free: 'bg-gray-500/20 text-gray-400',
      pro: 'bg-purple-500/20 text-purple-400',
      dojo: 'bg-blue-500/20 text-blue-400'
    }
    return colors[plan as keyof typeof colors] || 'bg-gray-500/20 text-gray-400'
  }

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-bjj-bg">
        <DashboardNav />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bjj-bg">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-bjj-accent" />
              <h1 className="text-3xl font-bold">ユーザー管理</h1>
            </div>
            <p className="text-bjj-muted">全ユーザーの管理・権限設定</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bjj-muted w-5 h-5" />
              <input
                type="text"
                placeholder="ユーザーを検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-bjj focus:border-bjj-accent focus:outline-none"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bjj-muted w-5 h-5" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white/5 border border-white/10 rounded-bjj focus:border-bjj-accent focus:outline-none appearance-none"
              >
                <option value="all">すべて</option>
                <option value="admin">管理者</option>
                <option value="coach">コーチ</option>
                <option value="pro">有料会員</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm text-bjj-muted">
            <span>総ユーザー数: {users.length}</span>
            <span>表示中: {filteredUsers.length}</span>
            <span>コーチ: {users.filter(u => u.is_coach).length}</span>
            <span>有料会員: {users.filter(u => u.subscription_plan && u.subscription_plan !== 'free').length}</span>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {loadingUsers ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bjj-accent"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-bjj-muted mx-auto mb-4" />
              <p className="text-bjj-muted">ユーザーが見つかりません</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="card-gradient border border-white/10 rounded-bjj p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {user.full_name || 'Unknown'}
                      </h3>
                      
                      {/* Role badges */}
                      {user.role === 'admin' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                      {user.is_coach && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                          <Crown className="w-3 h-3" />
                          Coach
                        </span>
                      )}
                      
                      {/* Belt */}
                      {user.belt && (
                        <span className={`px-2 py-1 rounded-full text-xs ${getBeltColor(user.belt)}`}>
                          {user.belt.toUpperCase()}
                          {user.stripes ? ` (${user.stripes})` : ''}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-bjj-muted mb-2">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-bjj-muted" />
                        <span className="text-bjj-muted">
                          登録: {formatDistanceToNow(new Date(user.created_at), { locale: ja, addSuffix: true })}
                        </span>
                      </div>
                      
                      {user.subscription_plan && (
                        <span className={`px-2 py-1 rounded-full text-xs ${getSubscriptionColor(user.subscription_plan, user.subscription_status || '')}`}>
                          {user.subscription_plan.toUpperCase()}
                          {user.subscription_status !== 'active' && ` (${user.subscription_status})`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCoachStatus(user.id, user.is_coach || false)}
                      className={`p-2 rounded-lg transition-colors ${
                        user.is_coach 
                          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                          : 'bg-white/10 text-bjj-muted hover:bg-white/20'
                      }`}
                      title={`${user.is_coach ? 'コーチ権限を削除' : 'コーチ権限を付与'}`}
                    >
                      <Crown className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedUser(user)
                        setShowUserModal(true)
                      }}
                      className="p-2 bg-white/10 text-bjj-muted hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* User Detail Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-bjj-bg2 border border-white/10 rounded-bjj p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                ユーザー詳細: {selectedUser.full_name || selectedUser.email}
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-bjj-muted">メールアドレス</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-bjj-muted">現在の権限</p>
                  <p className="font-medium">
                    {selectedUser.role === 'admin' && 'Administrator'}
                    {selectedUser.is_coach && ' / Coach'}
                    {!selectedUser.role || selectedUser.role === 'user' ? 'User' : ''}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-bjj-muted">サブスクリプション</p>
                  <p className="font-medium">
                    {selectedUser.subscription_plan || 'Free'} 
                    {selectedUser.subscription_status && ` (${selectedUser.subscription_status})`}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 btn-ghost"
                >
                  閉じる
                </button>
                <button
                  onClick={() => toggleCoachStatus(selectedUser.id, selectedUser.is_coach || false)}
                  className="flex-1 btn-primary"
                >
                  {selectedUser.is_coach ? 'コーチ削除' : 'コーチ権限付与'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}