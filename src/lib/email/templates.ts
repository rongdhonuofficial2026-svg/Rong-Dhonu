export function emailLayout(contentHtml: string): string {
  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; background-color: #F8F5F0; padding: 40px 20px; color: #1E1A16; line-height: 1.6; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FDFBF7; border: 1px solid #DCCFAE; padding: 40px; border-radius: 4px; box-shadow: 0 4px 20px rgba(30,26,22,0.04);">
        <div style="border-bottom: 1px solid #DCCFAE; padding-bottom: 20px; margin-bottom: 30px; text-align: center;">
          <h1 style="color: #B4233A; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">Rongdhono</h1>
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #5C5347;">Artists' Collective</span>
        </div>
        ${contentHtml}
        <div style="border-top: 1px solid #DCCFAE; margin-top: 30px; padding-top: 20px; font-size: 11px; color: #5C5347; text-align: center;">
          <p>© 2026 Rongdhono Artists' Collective. All rights reserved.</p>
          <p>Opposite Rabindra Bhavan, Gorabazar, Berhampore, West Bengal, India</p>
        </div>
      </div>
    </div>
  `
}

export interface InquiryEmailPayload {
  inquiryType: string
  name: string
  email: string
  subject: string
  message: string
}

export function adminInquiryTemplate(payload: InquiryEmailPayload): string {
  return emailLayout(`
    <h2 style="color: #1E1A16; font-size: 18px; margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #EFE6D2; padding-bottom: 10px;">New Contact Inquiry Received</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr>
        <td style="padding: 8px 0; font-size: 13px; color: #5C5347; width: 140px; font-weight: 600;">Inquiry Type:</td>
        <td style="padding: 8px 0; font-size: 14px; color: #1E1A16;">${payload.inquiryType}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-size: 13px; color: #5C5347; font-weight: 600;">Full Name:</td>
        <td style="padding: 8px 0; font-size: 14px; color: #1E1A16;">${payload.name}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-size: 13px; color: #5C5347; font-weight: 600;">Email Address:</td>
        <td style="padding: 8px 0; font-size: 14px; color: #1E1A16;"><a href="mailto:${payload.email}" style="color: #B4233A; text-decoration: none;">${payload.email}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-size: 13px; color: #5C5347; font-weight: 600;">Subject:</td>
        <td style="padding: 8px 0; font-size: 14px; color: #1E1A16; font-weight: 600;">${payload.subject}</td>
      </tr>
    </table>
    <div style="background-color: #FDFDFD; border-left: 3px solid #B4233A; padding: 15px 20px; margin-top: 20px; border-radius: 2px;">
      <p style="margin: 0; font-size: 13px; font-weight: 600; color: #5C5347; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;">Message Details:</p>
      <p style="margin: 0; font-size: 14px; color: #1E1A16; white-space: pre-wrap; line-height: 1.6;">${payload.message}</p>
    </div>
  `)
}

export function userAutoReplyTemplate(name: string, subject: string, locale: string): string {
  const isBn = locale === 'bn'
  const title = isBn ? 'যোগাযোগের জন্য ধন্যবাদ' : 'Inquiry Received'
  const greeting = isBn ? `প্রিয় ${name},` : `Dear ${name},`
  const bodyText = isBn
    ? `রংধনু আর্টিস্টস কালেক্টিভে যোগাযোগ করার জন্য আপনাকে ধন্যবাদ। আমরা <b>"${subject}"</b> বিষয়ে আপনার অনুসন্ধান বার্তাটি পেয়েছি। আমাদের কিউরেটরিয়াল দল খুব শীঘ্রই আপনার বার্তার উত্তর দেবে।`
    : `Thank you for contacting Rongdhono. We have received your inquiry regarding <b>"${subject}"</b> and our curatorial team will respond to you personally shortly.`
  const supportText = isBn
    ? 'আপনাকে আরও সাহায্য করতে পারলে আমরা আনন্দিত হব।'
    : 'We look forward to connecting with you.'

  return emailLayout(`
    <h2 style="color: #1E1A16; font-size: 18px; margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #EFE6D2; padding-bottom: 10px;">${title}</h2>
    <p style="font-size: 15px; color: #1E1A16; margin-bottom: 15px; font-weight: 600;">${greeting}</p>
    <p style="font-size: 14px; color: #1E1A16; margin-bottom: 20px; line-height: 1.7;">${bodyText}</p>
    <p style="font-size: 14px; color: #5C5347; font-style: italic; margin-top: 30px;">${supportText}</p>
  `)
}

export function newsletterWelcomeTemplate(locale: string): string {
  const isBn = locale === 'bn'
  const title = isBn ? 'নিউজলেটারে আপনাকে স্বাগতম' : 'Welcome to Rongdhono'
  const bodyText = isBn
    ? 'রংধনু আর্টিস্টস কালেক্টিভ নিউজলেটারে সফলভাবে সাবস্ক্রাইব করার জন্য আপনাকে ধন্যবাদ। এখন থেকে আপনি আসন্ন বার্ষিক প্রদর্শনী, সদস্য শিল্পীদের খবর, ক্যাটালগ প্রকাশ এবং অন্যান্য সব খবরাখবর সবার আগে আপনার ইনবক্সে পেয়ে যাবেন।'
    : 'You have successfully subscribed to receive Rongdhono exhibition announcements, artist highlights, catalog releases, and upcoming events.'
  const closing = isBn
    ? 'রংধনুর সাথে সংযুক্ত থাকার জন্য ধন্যবাদ!'
    : 'Thank you for joining our community!'

  return emailLayout(`
    <h2 style="color: #1E1A16; font-size: 18px; margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #EFE6D2; padding-bottom: 10px;">${title}</h2>
    <p style="font-size: 14px; color: #1E1A16; margin-bottom: 20px; line-height: 1.75;">${bodyText}</p>
    <p style="font-size: 14px; color: #B4233A; font-weight: 600; margin-top: 30px;">${closing}</p>
  `)
}

export function newsletterAdminNotification(email: string, sourcePage: string, locale: string): string {
  return emailLayout(`
    <h2 style="color: #1E1A16; font-size: 18px; margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #EFE6D2; padding-bottom: 10px;">New Newsletter Subscriber</h2>
    <p style="font-size: 14px; color: #1E1A16; margin-bottom: 15px;">A visitor has subscribed to the Rongdhono newsletter.</p>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #FDFDFD; padding: 15px; border: 1px solid #EFE6D2;">
      <tr>
        <td style="padding: 8px 12px; font-size: 13px; color: #5C5347; font-weight: 600; width: 120px;">Email:</td>
        <td style="padding: 8px 12px; font-size: 14px; color: #1E1A16; font-weight: 600;">${email}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; font-size: 13px; color: #5C5347; font-weight: 600;">Source Widget:</td>
        <td style="padding: 8px 12px; font-size: 14px; color: #1E1A16; text-transform: capitalize;">${sourcePage}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; font-size: 13px; color: #5C5347; font-weight: 600;">Locale:</td>
        <td style="padding: 8px 12px; font-size: 14px; color: #1E1A16; text-transform: uppercase;">${locale}</td>
      </tr>
    </table>
  `)
}
