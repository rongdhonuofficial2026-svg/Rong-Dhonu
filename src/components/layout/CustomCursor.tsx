'use client'

import { useEffect, useState } from 'react'

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseLeaveWindow = () => {
      setIsVisible(false)
    }

    const handleMouseEnter = () => {
      setIsHovered(true)
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
    }

    const handleMagneticMove = (e: MouseEvent) => {
      const el = e.currentTarget as HTMLElement
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left - r.width / 2) * 0.25
      const y = (e.clientY - r.top - r.height / 2) * 0.25
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }

    const handleMagneticLeave = (e: MouseEvent) => {
      const el = e.currentTarget as HTMLElement
      el.style.transform = 'translate3d(0, 0, 0)'
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeaveWindow)

    // Reveal-on-scroll Intersection Observer
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in')
          io.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })

    // Select all links and/or elements for hover growth & magnetic effects
    const addListeners = () => {
      const interactives = document.querySelectorAll('a, button, [role="button"], .magnetic')
      interactives.forEach((el) => {
        el.addEventListener('mouseenter', handleMouseEnter)
        el.addEventListener('mouseleave', handleMouseLeave)
      })

      const magnetics = document.querySelectorAll('.magnetic')
      magnetics.forEach((el) => {
        el.addEventListener('mousemove', handleMagneticMove as any)
        el.addEventListener('mouseleave', handleMagneticLeave as any)
      })

      const reveals = document.querySelectorAll('.reveal')
      reveals.forEach((el) => io.observe(el))
    }

    addListeners()

    // Re-bind listeners on dynamic mutations (e.g. page changes)
    const observer = new MutationObserver(addListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeaveWindow)
      observer.disconnect()
      
      const interactives = document.querySelectorAll('a, button, [role="button"], .magnetic')
      interactives.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })

      const magnetics = document.querySelectorAll('.magnetic')
      magnetics.forEach((el) => {
        el.removeEventListener('mousemove', handleMagneticMove as any)
        el.removeEventListener('mouseleave', handleMagneticLeave as any)
      })
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div
      className={`cursor hidden md:block ${isHovered ? 'grow' : ''}`}
      style={{
        transform: `translate3d(calc(${position.x}px - 50%), calc(${position.y}px - 50%), 0)`,
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 10000,
        willChange: 'transform'
      }}
    />
  )
}
