import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AuthDialog from '../AuthDialog'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'
// import { useRouter } from 'next/navigation'

// モック
jest.mock('@/hooks/useAuth')
jest.mock('@/contexts/LanguageContext')
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signInWithOAuth: jest.fn(),
      getSession: jest.fn(),
    },
  },
}))

const mockSignIn = jest.fn()
const mockSignUp = jest.fn()
const mockPush = jest.fn()
const mockUseRouter = jest.fn()

// Supabaseのモックを取得
const { supabase } = require('@/lib/supabase/client')

describe('AuthDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    ;(useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      signUp: mockSignUp,
    })
    
    // Supabaseのモックをリセット
    supabase.auth.signInWithPassword.mockReset()
    supabase.auth.signUp.mockReset()
    supabase.auth.signInWithOAuth.mockReset()
    supabase.auth.getSession.mockReset()
    
    // デフォルトのモック実装
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { email: 'test@example.com' }, session: {} },
      error: null,
    })
    supabase.auth.getSession.mockResolvedValue({
      data: { session: {} },
      error: null,
    })
    
    ;(useLanguage as jest.Mock).mockReturnValue({
      t: {
        auth: {
          login: 'ログイン',
          signup: '新規登録',
          email: 'メールアドレス',
          password: 'パスワード',
          emailPlaceholder: 'you@example.com',
          passwordPlaceholder: '••••••••',
          processing: '処理中...',
          or: 'または',
          googleLogin: 'Googleでログイン',
          noAccount: 'アカウントをお持ちでない方は',
          hasAccount: 'すでにアカウントをお持ちの方は',
          loginSuccess: 'ログインしました',
          signupSuccess: '確認メールを送信しました',
          invalidCredentials: 'メールアドレスまたはパスワードが正しくありません',
          userAlreadyExists: 'このメールアドレスは既に登録されています',
          loginFailed: 'ログインに失敗しました',
          signupFailed: '登録に失敗しました',
        },
      },
      locale: 'ja',
      language: 'ja',
    })
    
    // useRouterのモックはjest.setup.jsで設定済み
  })

  it('ログインモードで表示される', () => {
    render(<AuthDialog isOpen={true} onClose={jest.fn()} initialMode="login" />)
    
    expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument()
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument()
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument()
  })

  it('サインアップモードに切り替えられる', () => {
    render(<AuthDialog isOpen={true} onClose={jest.fn()} initialMode="login" />)
    
    const switchButton = screen.getByText('新規登録')
    fireEvent.click(switchButton)
    
    expect(screen.getAllByText('新規登録').length).toBeGreaterThan(1)
  })

  it('ログインフォームを送信できる', async () => {
    const onClose = jest.fn()
    
    render(<AuthDialog isOpen={true} onClose={onClose} initialMode="login" />)
    
    const emailInput = screen.getByLabelText('メールアドレス')
    const passwordInput = screen.getByLabelText('パスワード')
    const submitButton = screen.getByRole('button', { name: 'ログイン' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('閉じるボタンでモーダルを閉じられる', () => {
    const onClose = jest.fn()
    render(<AuthDialog isOpen={true} onClose={onClose} initialMode="login" />)
    
    const closeButton = screen.getByRole('button', { name: '' })
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalled()
  })
})