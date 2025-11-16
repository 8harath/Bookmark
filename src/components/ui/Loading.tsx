export function Loading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="border-4 border-black border-t-white w-12 h-12 rounded-full animate-spin" />
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading />
    </div>
  )
}
