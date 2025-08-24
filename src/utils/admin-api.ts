import { supabase } from '@/lib/supabase/client'

export async function adminFetch(url: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('No authentication session')
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${session.access_token}`,
  }

  return fetch(url, {
    ...options,
    headers,
  })
}