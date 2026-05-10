'use client'

import { useState } from 'react'

export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false)

  return submitted ? (
    <div className="mt-10 max-w-md mx-auto text-center">
      <p className="font-serif text-xl text-gold">Merci !</p>
      <p className="text-sm text-ivory/70 mt-2">
        Vous êtes inscrit à notre newsletter mensuelle.
      </p>
    </div>
  ) : (
    <>
      <form
        className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        onSubmit={(e) => {
          e.preventDefault()
          // Newsletter signup à brancher en V1.5 (Brevo / Resend Audiences)
          setSubmitted(true)
        }}
      >
        <input
          type="email"
          required
          placeholder="votre@email.com"
          aria-label="Adresse email"
          className="flex-1 px-4 py-3 bg-ivory text-ink text-sm placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <button type="submit" className="btn-gold whitespace-nowrap">
          S&apos;inscrire
        </button>
      </form>
      <p className="mt-3 text-xs text-ivory/50">
        Inscription gratuite. Pas de spam, jamais.
      </p>
    </>
  )
}
