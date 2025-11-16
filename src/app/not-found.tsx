import Link from 'next/link'
import { Button } from '@/components/ui'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="card">
          <h1 className="text-6xl mb-4">404</h1>
          <h2 className="mb-4">PAGE NOT FOUND</h2>
          <p className="font-mono mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/">
            <Button>GO HOME</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
