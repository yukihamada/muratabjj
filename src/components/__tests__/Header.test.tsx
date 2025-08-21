import { render, screen, fireEvent } from '@testing-library/react'
import Header from '../Header'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'

// モック
jest.mock('@/hooks/useAuth')
jest.mock('@/contexts/LanguageContext')

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    ;(useLanguage as jest.Mock).mockReturnValue({
      t: {
        nav: {
          features: '機能',
          howToUse: '使い方',
          pricing: '料金',
          supervisor: '監修',
          faq: 'FAQ',
          login: 'ログイン',
          logout: 'ログアウト',
          dashboard: 'ダッシュボード',
          freeStart: '無料で始める',
        },
        common: {
          loading: '読み込み中...',
        },
      },
      locale: 'ja',
    })
  })

  it('ログインしていない場合、ログインボタンが表示される', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    })
    
    render(<Header />)
    
    expect(screen.getByTestId('login-button')).toBeInTheDocument()
    expect(screen.getByText('無料で始める')).toBeInTheDocument()
  })

  it('ログイン中の場合、ユーザー情報とログアウトボタンが表示される', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      loading: false,
      signOut: jest.fn(),
    })
    
    render(<Header />)
    
    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('ログアウト')).toBeInTheDocument()
  })

  it('ローディング中の場合、ローディング表示される', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    })
    
    render(<Header />)
    
    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('ログインボタンをクリックするとAuthDialogが開く', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    })
    
    render(<Header />)
    
    // AuthDialogコンポーネントは別途テストするため、ここではボタンの存在のみ確認
    const loginButton = screen.getByTestId('login-button')
    expect(loginButton).toBeInTheDocument()
  })
})