'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface RevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  /** Distance en pixels du slide-up. Defaut: 8 (sobre) */
  offset?: number
  /** Quand on entre dans le viewport (0..1) */
  threshold?: number
  /** Garde l'animation au-dessus du fold (1ere section visible immediatement) */
  immediate?: boolean
  as?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer'
}

export function Reveal({
  children,
  className,
  delay = 0,
  offset = 8,
  threshold = 0.12,
  immediate = false,
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(immediate)

  useEffect(() => {
    if (immediate) return

    const node = ref.current
    if (!node) return

    // Respecte la preference utilisateur "reduce-motion"
    if (typeof window !== 'undefined') {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) {
        setVisible(true)
        return
      }
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' },
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [threshold, immediate])

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        'transition-[transform,opacity] duration-700 ease-out motion-reduce:transition-none',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0',
        className,
      )}
      style={{
        transitionDelay: `${delay}ms`,
        transform: visible ? 'translateY(0)' : `translateY(${offset}px)`,
      }}
    >
      {children}
    </Tag>
  )
}
