import { auth } from '@/auth'
// import LoginForm from '@/components/login-form'
import SigninForm from '@/components/sign-in'
import { Session } from '@/lib/types'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const session = (await auth()) as Session

  if (session) {
    redirect('/')
  }

  return (
    <main className="flex flex-col p-4">
      {/* <LoginForm /> */}
      <SigninForm />
    </main>
  )
}
