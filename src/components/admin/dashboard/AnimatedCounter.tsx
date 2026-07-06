'use client'

import { useEffect, useRef } from 'react'

export function AnimatedCounter({ target }: { target: number }) {
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!spanRef.current) return
    const duration = 1200
    const start = performance.now()
    
    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // cubic ease out
      
      if (spanRef.current) {
        spanRef.current.textContent = String(Math.round(target * eased))
      }
      
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    
    requestAnimationFrame(step)
  }, [target])

  return <span ref={spanRef}>0</span>
}
