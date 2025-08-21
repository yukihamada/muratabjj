'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

interface AuthDialogProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'signup'
}

export default function AuthDialog({ isOpen, onClose, initialMode = 'login' }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { signIn, signUp } = useAuth()
  const router = useRouter()
  const { t, locale } = useLanguage()

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      // モーダルを開いた時にモードを設定（フォームはリセットしない）
      setMode(initialMode)
    } else {
      // モーダルを閉じた時にローディング状態をリセット
      setLoading(false)
    }
  }, [isOpen, initialMode])

  // モーダルを閉じる時にフォームをリセット
  const handleClose = () => {
    setEmail('')
    setPassword('')
    setLoading(false) // ローディング状態もリセット
    onClose()
  }

  if (!mounted || !isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'login') {
        await signIn(email, password)
        toast.success(t.auth.loginSuccess || 'ログインしました')
        handleClose() // onClose()の代わりにhandleClose()を使用
        // ログイン成功後、ダッシュボードへリダイレクト
        router.push('/dashboard')
      } else {
        await signUp(email, password)
        toast.success(t.auth.signupSuccess || '確認メールを送信しました')
        handleClose() // onClose()の代わりにhandleClose()を使用
      }
    } catch (error: any) {
      console.error('Authentication error:', error)
      // エラーメッセージを表示（フォームはリセットしない）
      if (error.message?.includes('Invalid login credentials')) {
        toast.error(t.auth.invalidCredentials || 'メールアドレスまたはパスワードが正しくありません')
      } else if (error.message?.includes('User already registered')) {
        toast.error(t.auth.userAlreadyExists || 'このメールアドレスは既に登録されています')
      } else if (error.message?.includes('Supabaseが設定されていません')) {
        toast.error('認証サービスが設定されていません。管理者にお問い合わせください。')
      } else if (error.message?.includes('Network request failed')) {
        toast.error('ネットワークエラーが発生しました。接続を確認してください。')
      } else {
        toast.error(error.message || (mode === 'login' ? t.auth.loginFailed || 'ログインに失敗しました' : t.auth.signupFailed || '登録に失敗しました'))
      }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) throw error
    } catch (error: any) {
      console.error('Google OAuth error:', error)
      toast.error(t.auth.googleLoginFailed)
    }
  }

  const dialogContent = (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md animate-scale-in mt-20 mb-8">
        <div className="card-gradient border border-white/10 rounded-bjj p-6 bg-bjj-bg2 shadow-2xl">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-bjj-muted hover:text-bjj-text transition-colors"
          >
            <X size={20} />
          </button>

          {/* Title */}
          <h2 className="text-2xl font-bold mb-6">
            {mode === 'login' ? t.auth.login : t.auth.signup}
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                {t.auth.email}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-bjj-bg text-bjj-text focus:border-bjj-accent focus:outline-none"
                placeholder={t.auth.emailPlaceholder}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                {t.auth.password}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-bjj-bg text-bjj-text focus:border-bjj-accent focus:outline-none"
                placeholder={t.auth.passwordPlaceholder}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.auth.processing : mode === 'login' ? t.auth.login : t.auth.signup}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-bjj-bg2 px-2 text-bjj-muted">{t.auth.or}</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            onClick={signInWithGoogle}
            className="w-full btn-ghost flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t.auth.googleLogin}
          </button>

          {/* Switch mode */}
          <p className="text-center text-sm text-bjj-muted mt-6">
            {mode === 'login' ? (
              <>
                {t.auth.noAccount}{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-bjj-accent hover:underline"
                >
                  {t.auth.signup}
                </button>
              </>
            ) : (
              <>
                {t.auth.hasAccount}{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-bjj-accent hover:underline"
                >
                  {t.auth.login}
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )

  return createPortal(dialogContent, document.body)
}