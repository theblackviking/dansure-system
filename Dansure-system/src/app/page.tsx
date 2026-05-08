import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export default function Home() {
  const token = cookies().get('token')?.value
  const user = token ? verifyToken(token) : null
  if (user) redirect('/dashboard')
  else redirect('/login')
}
