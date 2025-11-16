'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from '@/utils/auth'
import { Button } from '@/components/ui/Button'

interface HeaderProps {
  user?: {
    email?: string
  } | null
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="border-b-4 border-black bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center">
            <h1 className="text-2xl font-bold">📚 BOOKMARK REMINDER</h1>
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard" className="font-mono hover:underline">
                  DASHBOARD
                </Link>
                <Link href="/settings" className="font-mono hover:underline">
                  SETTINGS
                </Link>
                <span className="font-mono text-sm">{user.email}</span>
                <Button variant="secondary" onClick={handleSignOut} className="text-sm px-4 py-2">
                  LOGOUT
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="font-mono hover:underline">
                  LOGIN
                </Link>
                <Link href="/auth/signup">
                  <Button className="text-sm px-4 py-2">GET STARTED</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
