import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="mb-8 text-shadow-brutal">BOOKMARK REMINDER</h1>
        <p className="text-xl mb-12 max-w-2xl mx-auto">
          Save bookmarks with smart reminders. Never forget great content again.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/auth/signup" className="btn">
            GET STARTED
          </Link>
          <Link href="/auth/login" className="btn bg-white text-black hover:bg-black hover:text-white">
            LOGIN
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card">
            <h3 className="mb-4">📚 SAVE CONTENT</h3>
            <p className="text-sm normal-case font-mono">
              One-click bookmark saving via browser extension or web dashboard
            </p>
          </div>
          <div className="card">
            <h3 className="mb-4">⏰ GET REMINDERS</h3>
            <p className="text-sm normal-case font-mono">
              Customizable email reminders to revisit your saved bookmarks
            </p>
          </div>
          <div className="card">
            <h3 className="mb-4">🎯 BUILD HABITS</h3>
            <p className="text-sm normal-case font-mono">
              Turn saved content into learning habits with regular engagement
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
