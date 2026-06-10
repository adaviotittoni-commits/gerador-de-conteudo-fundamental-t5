export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-primary">
            Stitch AI
          </h1>
          <p className="mt-2 font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
            Content Suite
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
