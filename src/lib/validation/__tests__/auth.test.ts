import { loginSchema, signupSchema, profileUpdateSchema } from '../auth'

describe('Auth Validation', () => {
  describe('loginSchema', () => {
    it('有効な入力を受け入れる', () => {
      const validInput = {
        email: 'test@example.com',
        password: 'password123',
      }
      
      const result = loginSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('無効なメールアドレスを拒否する', () => {
      const invalidInput = {
        email: 'invalid-email',
        password: 'password123',
      }
      
      const result = loginSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('有効なメールアドレスを入力してください')
      }
    })

    it('短すぎるパスワードを拒否する', () => {
      const invalidInput = {
        email: 'test@example.com',
        password: '12345',
      }
      
      const result = loginSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('パスワードは6文字以上で入力してください')
      }
    })
  })

  describe('signupSchema', () => {
    it('有効な入力を受け入れる', () => {
      const validInput = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      }
      
      const result = signupSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('パスワードが一致しない場合を拒否する', () => {
      const invalidInput = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password456',
      }
      
      const result = signupSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('パスワードが一致しません')
      }
    })

    it('パスワードポリシーを満たさない場合を拒否する', () => {
      const invalidInput = {
        email: 'test@example.com',
        password: 'password',
        confirmPassword: 'password',
      }
      
      const result = signupSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('パスワードは大文字・小文字・数字を含む必要があります')
      }
    })
  })

  describe('profileUpdateSchema', () => {
    it('有効な入力を受け入れる', () => {
      const validInput = {
        full_name: '山田太郎',
        belt_rank: 'blue' as const,
        stripes: 2,
        weight_class: 'フェザー級',
        preferred_position: 'クローズドガード',
        years_training: 3,
      }
      
      const result = profileUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('部分的な更新を受け入れる', () => {
      const partialInput = {
        full_name: '山田太郎',
      }
      
      const result = profileUpdateSchema.safeParse(partialInput)
      expect(result.success).toBe(true)
    })

    it('無効な帯を拒否する', () => {
      const invalidInput = {
        full_name: '山田太郎',
        belt_rank: 'invalid' as any,
      }
      
      const result = profileUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })
  })
})