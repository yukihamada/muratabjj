import { Metadata } from 'next'
import Signup from '@/components/Signup'

export const metadata: Metadata = {
  title: 'Sign Up - Murata BJJ',
  description: 'Create your free account to start learning BJJ with Murata BJJ.',
}

export default function SignupPage() {
  return <Signup />
}