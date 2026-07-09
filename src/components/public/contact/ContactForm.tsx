'use client'

import { useState, useRef } from 'react'
import { submitInquiry } from '@/actions/public/contact'
import { toast } from 'sonner'

interface ContactFormProps {
  locale: string
}

type InquiryType = 'General Inquiry' | 'Artist Application' | 'Gallery Visit' | 'Acquisition'

export function ContactForm({ locale }: ContactFormProps) {
  const isBn = locale === 'bn'
  
  // Tabs config
  const tabOptions: Array<{ key: InquiryType; labelEn: string; labelBn: string }> = [
    { key: 'General Inquiry', labelEn: 'General Inquiry', labelBn: 'সাধারণ অনুসন্ধান' },
    { key: 'Artist Application', labelEn: 'Artist Application', labelBn: 'শিল্পী আবেদন' },
    { key: 'Gallery Visit', labelEn: 'Gallery Visit', labelBn: 'গ্যালারি পরিদর্শন' },
    { key: 'Acquisition', labelEn: 'Acquisition', labelBn: 'আহরণ' }
  ]

  const [activeTab, setActiveTab] = useState<InquiryType>('General Inquiry')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Validation errors
  const [errors, setErrors] = useState<{ name?: string; email?: string; subject?: string; message?: string }>({})

  // Refs for focus management
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const subjectRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setErrors({})
    const newErrors: typeof errors = {}

    // Basic client-side validation
    if (!name.trim()) {
      newErrors.name = isBn ? 'নাম আবশ্যক।' : 'Name is required.'
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = isBn ? 'সঠিক ইমেল ঠিকানা লিখুন।' : 'Invalid email address.'
    }
    if (!subject.trim()) {
      newErrors.subject = isBn ? 'বিষয় আবশ্যক।' : 'Subject is required.'
    }
    if (!message.trim() || message.trim().length < 10) {
      newErrors.message = isBn ? 'বার্তা অত্যন্ত ১০টি অক্ষরে হতে হবে।' : 'Message must be at least 10 characters.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      // Focus management: Shift focus to the first invalid input
      if (newErrors.name) nameRef.current?.focus()
      else if (newErrors.email) emailRef.current?.focus()
      else if (newErrors.subject) subjectRef.current?.focus()
      else if (newErrors.message) messageRef.current?.focus()
      return
    }

    setLoading(true)
    const activeTabLabel = isBn 
      ? tabOptions.find(t => t.key === activeTab)?.labelBn || activeTab 
      : activeTab

    try {
      const res = await submitInquiry(locale, {
        inquiryType: activeTabLabel,
        name,
        email,
        subject,
        message
      })

      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success(isBn ? 'অনুসন্ধান সফলভাবে পাঠানো হয়েছে!' : 'Inquiry submitted successfully!')
        // Clear the form fields but preserve active tab
        setName('')
        setEmail('')
        setSubject('')
        setMessage('')
      }
    } catch {
      toast.error(isBn ? 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।' : 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTabKeyDown = (e: React.KeyboardEvent, key: InquiryType) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setActiveTab(key)
    }
  }

  return (
    <div className="form-card reveal in" style={{ opacity: 1, transform: 'none' }}>
      <div className="form-eyebrow">{isBn ? "অনুসন্ধান ও অর্জন" : "Inquiries & Acquisitions"}</div>
      <h2>{isBn ? "আমাদের একটি বার্তা পাঠান" : "Send a Message"}</h2>
      <p>
        {isBn 
          ? "প্রদর্শনী বিবরণ, ব্যক্তিগত প্রদর্শনী, বা শিল্পকর্ম অর্জনের জন্য, দয়া করে নিচে আপনার বিবরণ দিন এবং আমাদের কিউরেটরিয়াল দল আপনাকে সহায়তা করবে।" 
          : "For exhibition details, private viewings, or artwork acquisitions, please leave your details below and our curatorial team will assist you."}
      </p>

      <div className="inquiry-types" role="tablist" aria-label={isBn ? "অনুসন্ধানের ধরণ" : "Inquiry Types"}>
        {tabOptions.map((tab) => {
          const tabLabel = isBn ? tab.labelBn : tab.labelEn
          const isActive = activeTab === tab.key
          return (
            <span
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              onKeyDown={(e) => handleTabKeyDown(e, tab.key)}
              onClick={() => setActiveTab(tab.key)}
              className={`inquiry-type ${isActive ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
            >
              {tabLabel}
            </span>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="field-row">
          <div className="field">
            <label htmlFor="inquiry_name">{isBn ? "সম্পূর্ণ নাম" : "Full Name"}</label>
            <input 
              ref={nameRef}
              id="inquiry_name"
              type="text" 
              placeholder={isBn ? "যেমন: জেন ডো" : "e.g. Jane Doe"} 
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name_error" : undefined}
              required 
            />
            {errors.name && (
              <span id="name_error" style={{ color: 'var(--color-crimson)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                {errors.name}
              </span>
            )}
          </div>
          <div className="field">
            <label htmlFor="inquiry_email">{isBn ? "ইমেইল ঠিকানা" : "Email Address"}</label>
            <input 
              ref={emailRef}
              id="inquiry_email"
              type="email" 
              placeholder="jane@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email_error" : undefined}
              required 
            />
            {errors.email && (
              <span id="email_error" style={{ color: 'var(--color-crimson)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                {errors.email}
              </span>
            )}
          </div>
        </div>
        <div className="field" style={{ marginBottom: errors.subject ? '10px' : '30px' }}>
          <label htmlFor="inquiry_subject">{isBn ? "অনুসন্ধানের বিষয়" : "Subject of Inquiry"}</label>
          <input 
            ref={subjectRef}
            id="inquiry_subject"
            type="text" 
            placeholder={isBn ? "আমরা আপনাকে কীভাবে সাহায্য করতে পারি?" : "How can we assist you?"} 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={loading}
            aria-invalid={!!errors.subject}
            aria-describedby={errors.subject ? "subject_error" : undefined}
            required
          />
          {errors.subject && (
            <span id="subject_error" style={{ color: 'var(--color-crimson)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
              {errors.subject}
            </span>
          )}
        </div>
        <div className="field" style={{ marginBottom: '8px' }}>
          <label htmlFor="inquiry_message">{isBn ? "বার্তা" : "Message"}</label>
          <textarea 
            ref={messageRef}
            id="inquiry_message"
            rows={4} 
            placeholder={isBn ? "অনুগ্রহ করে আপনার অনুসন্ধানের বিবরণ শেয়ার করুন..." : "Please share the details of your inquiry…"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "message_error" : undefined}
            required
          ></textarea>
          {errors.message && (
            <span id="message_error" style={{ color: 'var(--color-crimson)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
              {errors.message}
            </span>
          )}
        </div>
        <div className="form-submit">
          <button type="submit" className="btn btn-paper magnetic" disabled={loading}>
            {loading ? (isBn ? 'পাঠানো হচ্ছে...' : 'Submitting...') : (isBn ? "অনুসন্ধান জমা দিন →" : "Submit Inquiry →")}
          </button>
        </div>
      </form>
    </div>
  )
}
