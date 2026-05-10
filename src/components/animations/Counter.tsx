'use client'

import { useEffect, useRef, useState } from 'react'

interface CounterProps {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
  /** Format avec espaces (12 000 au lieu de 12000) */
  format?: boolean
  className?: string
}

/**
 * Compteur qui anime de 0 a `end` quand l'element entre dans le viewport.
 * Respecte prefers-reduced-motion (affichage instantane).
 */
export function Counter({
  end,
  duration = 1500,
  prefix = '',
  suffix = '',
  format = true,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || started) return

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          obs.disconnect()
          if (reduce) {
            setValue(end)
            return
          }
          const start = performance.now()
          const tick = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setValue(Math.round(end * eased))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.4 },
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [end, duration, started])

  const display = format
    ? new Intl.NumberFormat('fr-FR').format(value)
    : String(value)

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}
