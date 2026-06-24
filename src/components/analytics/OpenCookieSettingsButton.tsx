'use client'

export function OpenCookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined') {
          const fn = (window as Window & { openCookieSettings?: () => void })
            .openCookieSettings
          fn?.()
        }
      }}
      className="inline-flex items-center gap-2 bg-ink text-ivory px-5 py-2.5 text-sm font-medium hover:bg-gold-dark transition-colors"
    >
      Modifier mes préférences cookies
    </button>
  )
}
