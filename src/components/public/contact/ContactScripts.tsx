'use client'

import { useEffect } from 'react'

export function ContactScripts() {
  useEffect(() => {
    // Reveal on scroll animation observer
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in')
          io.unobserve(e.target)
        }
      })
    }, { threshold: 0.12 })
    
    document.querySelectorAll('.reveal').forEach(el => io.observe(el))

    // Magnetic buttons effect
    const handleMouseMove = (e: MouseEvent, btn: HTMLElement) => {
      const r = btn.getBoundingClientRect()
      const x = (e.clientX - r.left - r.width / 2) * 0.25
      const y = (e.clientY - r.top - r.height / 2) * 0.25
      btn.style.transform = `translate(${x}px, ${y}px)`
    }

    const handleMouseLeave = (btn: HTMLElement) => {
      btn.style.transform = 'translate(0,0)'
    }

    const magneticElements = document.querySelectorAll('.magnetic')
    const magneticListeners: Array<{ el: HTMLElement; mouseMove: (e: MouseEvent) => void; mouseLeave: () => void }> = []

    magneticElements.forEach(el => {
      const btn = el as HTMLElement
      const mouseMoveListener = (e: MouseEvent) => handleMouseMove(e, btn)
      const mouseLeaveListener = () => handleMouseLeave(btn)
      
      btn.addEventListener('mousemove', mouseMoveListener)
      btn.addEventListener('mouseleave', mouseLeaveListener)
      
      magneticListeners.push({
        el: btn,
        mouseMove: mouseMoveListener,
        mouseLeave: mouseLeaveListener
      })
    })

    // Inquiry type selector tabs switching
    const tabs = document.querySelectorAll('.inquiry-type')
    const handleTabClick = (e: Event) => {
      tabs.forEach(t => t.classList.remove('active'))
      const target = e.currentTarget as HTMLElement
      target.classList.add('active')
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', handleTabClick)
    })

    // Cleanup listeners on unmount
    return () => {
      io.disconnect()
      magneticListeners.forEach(({ el, mouseMove, mouseLeave }) => {
        el.removeEventListener('mousemove', mouseMove)
        el.removeEventListener('mouseleave', mouseLeave)
      })
      tabs.forEach(tab => {
        tab.removeEventListener('click', handleTabClick)
      })
    }
  }, [])

  return null
}
