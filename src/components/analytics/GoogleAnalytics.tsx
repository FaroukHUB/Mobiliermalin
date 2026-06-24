'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { CONSENT_EVENT, type ConsentState } from './CookieConsent'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  useEffect(() => {
    if (!id) return
    const onConsent = (e: Event) => {
      const detail = (e as CustomEvent<ConsentState>).detail
      if (!detail || typeof window.gtag !== 'function') return
      window.gtag('consent', 'update', {
        analytics_storage: detail.analytics ? 'granted' : 'denied',
        ad_storage: detail.marketing ? 'granted' : 'denied',
        ad_user_data: detail.marketing ? 'granted' : 'denied',
        ad_personalization: detail.marketing ? 'granted' : 'denied',
      })
    }
    window.addEventListener(CONSENT_EVENT, onConsent)
    return () => window.removeEventListener(CONSENT_EVENT, onConsent)
  }, [id])

  if (!id) return null

  return (
    <>
      <Script id="ga-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            wait_for_update: 500
          });
          gtag('set', 'ads_data_redaction', true);
          gtag('set', 'url_passthrough', true);
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          gtag('js', new Date());
          gtag('config', '${id}', { anonymize_ip: true });
        `}
      </Script>
    </>
  )
}
