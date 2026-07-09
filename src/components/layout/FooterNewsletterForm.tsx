'use client'

import { useState, useRef } from 'react'
import { subscribeToNewsletter } from '@/actions/public/newsletter'
import { toast } from 'sonner'

export function FooterNewsletterForm({ locale }: { locale: string }) {
  const isBn = locale === 'bn'
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setError('')
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError(isBn ? 'সঠিক ইমেল ঠিকানা লিখুন।' : 'Invalid email address.')
      inputRef.current?.focus()
      return
    }

    setLoading(true)
    try {
      const res = await subscribeToNewsletter({
        email,
        sourcePage: 'footer',
        locale
      })

      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success(isBn ? 'নিউজলেটার সাবস্ক্রিপশন সফল হয়েছে!' : 'Subscribed successfully!')
        setEmail('')
      }
    } catch {
      toast.error(isBn ? 'একটি ত্রুটি ঘটেছে।' : 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ position: 'relative', width: '100%' }}>
        <input 
          ref={inputRef}
          type="email" 
          placeholder="you@email.com" 
          aria-label={isBn ? 'ইমেল ঠিকানা' : 'Email Address'}
          aria-invalid={!!error}
          aria-describedby={error ? "footer_email_error" : undefined}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required 
        />
        {error && (
          <span id="footer_email_error" style={{ color: '#ff6b6b', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            {error}
          </span>
        )}
      </div>
      <button 
        type="submit" 
        className="btn btn-gold btn-sm magnetic" 
        style={{ width: '100%', marginTop: '10px' }} 
        disabled={loading}
      >
        {loading ? (isBn ? 'সাবস্ক্রাইব করা হচ্ছে...' : 'Subscribed...') : (isBn ? 'সাবস্ক্রাইব করুন' : 'Subscribe')}
      </button>
    </form>
  )
}
