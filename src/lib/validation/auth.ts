import { z } from 'zod'

// 認証関連のバリデーションスキーマ
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(6, 'パスワードは6文字以上で入力してください')
    .max(100, 'パスワードは100文字以下で入力してください'),
})

export const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(6, 'パスワードは6文字以上で入力してください')
    .max(100, 'パスワードは100文字以下で入力してください')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'パスワードは大文字・小文字・数字を含む必要があります'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
})

export const profileUpdateSchema = z.object({
  full_name: z.string().min(1, '名前を入力してください').max(100),
  belt_rank: z.enum(['white', 'blue', 'purple', 'brown', 'black']).optional(),
  stripes: z.number().min(0).max(4).optional(),
  weight_class: z.string().optional(),
  preferred_position: z.string().optional(),
  years_training: z.number().min(0).optional(),
})

// 型のエクスポート
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>