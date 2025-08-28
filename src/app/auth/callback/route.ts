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
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Server-side cookie setting will be handled in the response
          },
          remove(name: string, options: any) {
            // Server-side cookie removal will be handled in the response
          },
        },
      }
    )

    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('[Auth Callback Route] Code exchange error:', exchangeError)
        return NextResponse.redirect(
          new URL(`/?auth_error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
        )
      }

      // Successful authentication, redirect to dashboard
      const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
      
      // Set cookies from Supabase auth
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Set auth cookies
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          path: '/',
        }
        
        response.cookies.set('sb-access-token', session.access_token, cookieOptions)
        response.cookies.set('sb-refresh-token', session.refresh_token, cookieOptions)
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