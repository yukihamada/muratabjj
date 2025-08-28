import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  
  if (error) {
    console.error('[Auth Callback Route] OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    )
  }

  if (code) {
    try {
      // Create response object first to capture cookies
      const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
      
      // Create Supabase client with proper cookie handling
      const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              // Properly set cookies in the response
              response.cookies.set({
                name,
                value,
                ...options,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                path: '/',
              })
            },
            remove(name: string, options: any) {
              // Properly remove cookies from the response
              response.cookies.delete({
                name,
                ...options,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                path: '/',
              })
            },
          },
        }
      )

      // Exchange code for session - this will automatically set cookies
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('[Auth Callback Route] Code exchange error:', exchangeError)
        return NextResponse.redirect(
          new URL(`/?auth_error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
        )
      }

      // Verify session was created
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error('[Auth Callback Route] Session error:', sessionError || 'No session created')
        return NextResponse.redirect(
          new URL(`/?auth_error=${encodeURIComponent('セッションの作成に失敗しました')}`, requestUrl.origin)
        )
      }
      
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('[Auth Callback Route] Session successfully created for user:', session.user.email)
      }
      
      return response
    } catch (error: any) {
      console.error('[Auth Callback Route] Unexpected error:', error)
      return NextResponse.redirect(
        new URL(`/?auth_error=${encodeURIComponent(error.message || 'unknown_error')}`, requestUrl.origin)
      )
    }
  }

  // No code parameter
  return NextResponse.redirect(
    new URL('/?auth_error=no_code', requestUrl.origin)
  )
}