'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'

interface ClientSideCountdownProps {
  targetDate: string | null
}

export function ClientSideCountdown({ targetDate }: ClientSideCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!targetDate) return

    const calculate = () => {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft(null)
        return
      }
      const days    = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft({ days, hours, minutes, seconds })
    }

    calculate()
    const timer = setInterval(calculate, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (!mounted || !targetDate || !timeLeft) return null

  return (
    <div className="flex items-center gap-1 font-mono text-xs text-white/70">
      <span className="font-bold text-white">{timeLeft.days}d</span>
      <span className="opacity-50">·</span>
      <span className="font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
      <span className="opacity-50">:</span>
      <span className="font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
      <span className="opacity-50">:</span>
      <span className="font-bold text-white">{String(timeLeft.seconds).padStart(2, '0')}</span>
      <span className="ml-1 opacity-50">until opening</span>
    </div>
  )
}
