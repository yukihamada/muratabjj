'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

export default function AuthErrorHandler() {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const authError = searchParams.get('auth_error')
    
    if (authError) {
      let errorMessage = ''
      
      switch (authError) {
        case 'no_code':
          errorMessage = '認証コードが見つかりません。もう一度ログインしてください。'
          break
        case 'no_session':
          errorMessage = 'セッションの作成に失敗しました。もう一度ログインしてください。'
          break
        case 'access_denied':
          errorMessage = 'アクセスが拒否されました。'
          break
        case 'invalid_request':
          errorMessage = '無効なリクエストです。'
          break
        case 'server_error':
          errorMessage = 'サーバーエラーが発生しました。しばらく待ってから再度お試しください。'
          break
        default:
          // URLデコードされたエラーメッセージを表示
          errorMessage = decodeURIComponent(authError).replace(/_/g, ' ')
      }
      
      toast.error(errorMessage, {
        duration: 6000,
        icon: '⚠️'
      })
      
      // URLからauth_errorパラメーターを削除
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete('auth_error')
      const newUrl = window.location.pathname + (newSearchParams.toString() ? `?${newSearchParams.toString()}` : '')
      window.history.replaceState({}, '', newUrl)
    }
  }, [searchParams])
  
  return null
}