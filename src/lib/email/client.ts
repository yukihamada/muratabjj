import { Resend } from 'resend'

// Initialize Resend only if API key is available
let resend: Resend | null = null

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY)
}

export default resend

// Email sending function with error handling
export async function sendEmail({
  to,
  subject,
  react,
  text,
}: {
  to: string | string[]
  subject: string
  react?: React.ReactElement
  text?: string
}) {
  // Check if resend is initialized
  if (!resend) {
    console.warn('Resend API key not configured. Email sending is disabled.')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Murata BJJ <noreply@muratabjj.com>',
      to,
      subject,
      react,
      text,
    })

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}