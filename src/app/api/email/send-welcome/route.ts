import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/client'
import WelcomeEmail from '@/components/emails/WelcomeEmail'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get user details
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('user_id', userId)
      .single()

    const { data: { user } } = await supabase.auth.admin.getUserById(userId)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const firstName = profile?.full_name?.split(' ')[0] || 'ユーザー'
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`

    const result = await sendEmail({
      to: user.email!,
      subject: 'Murata BJJへようこそ！',
      react: WelcomeEmail({ userFirstName: firstName, loginUrl }),
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}