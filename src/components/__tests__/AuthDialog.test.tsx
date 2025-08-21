import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AuthDialog from '../AuthDialog'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'
// import { useRouter } from 'next/navigation'

// モック
jest.mock('@/hooks/useAuth')
jest.mock('@/contexts/LanguageContext')

const mockSignIn = jest.fn()
const mockSignUp = jest.fn()
const mockPush = jest.fn()
const mockUseRouter = jest.fn()

describe('AuthDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    ;(useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      signUp: mockSignUp,
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
    
    expect(screen.getByText('ログイン')).toBeInTheDocument()
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
    mockSignIn.mockResolvedValue(undefined)
    const onClose = jest.fn()
    
    render(<AuthDialog isOpen={true} onClose={onClose} initialMode="login" />)
    
    const emailInput = screen.getByLabelText('メールアドレス')
    const passwordInput = screen.getByLabelText('パスワード')
    const submitButton = screen.getByRole('button', { name: 'ログイン' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(onClose).toHaveBeenCalled()
      // expect(mockPush).toHaveBeenCalledWith('/dashboard')
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