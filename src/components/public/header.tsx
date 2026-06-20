import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-10 bg-hero shadow-sm">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 flex items-center">
        <Link
          href="/"
          className="font-heading text-xl font-semibold tracking-tight flex-shrink-0 min-w-0 text-[oklch(0.97_0.008_60)]"
        >
          eResource
        </Link>
      </div>
    </header>
  )
}
