'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validation/auth'
import toast from 'react-hot-toast'

// Zod + react-hook-form の実装例
export default function AuthFormExample() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      // ここで実際の認証処理を行う
      toast.success('ログインしました')
    } catch (error) {
      toast.error('ログインに失敗しました')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          メールアドレス
        </label>
        <input
          {...register('email')}
          id="email"
          type="email"
          className="w-full px-4 py-3 rounded-xl border border-white/10 bg-bjj-bg text-bjj-text focus:border-bjj-accent focus:outline-none"
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          パスワード
        </label>
        <input
          {...register('password')}
          id="password"
          type="password"
          className="w-full px-4 py-3 rounded-xl border border-white/10 bg-bjj-bg text-bjj-text focus:border-bjj-accent focus:outline-none"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '処理中...' : 'ログイン'}
      </button>
    </form>
  )
}