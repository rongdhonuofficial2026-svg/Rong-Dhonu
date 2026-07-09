import { z } from 'zod'

// ── Common ────────────────────────────────────────────────────────────────────

export const uuidSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    'Invalid ID format'
  )

// Safe text preprocessor: strip whitespace and null bytes before validation
const st = (maxLen: number, msg?: string) =>
  z.preprocess(
    (val) => (typeof val === 'string' ? val.trim().replace(/\0/g, '') : val),
    z.string().max(maxLen, msg ?? `Must be under ${maxLen} characters`)
  )

// Optional safe text (allows undefined/empty string)
const stOpt = (maxLen: number) =>
  z.preprocess(
    (val) => (typeof val === 'string' ? val.trim().replace(/\0/g, '') : val),
    z.string().max(maxLen).optional()
  )

// ── Artwork Moderation ────────────────────────────────────────────────────────

export const moderateArtworkSchema = z.object({
  artworkId: uuidSchema,
  status: z.enum(['approved', 'rejected', 'changes_requested']),
  feedback: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim().replace(/\0/g, '') : val),
    z.string().max(2000, 'Feedback must be under 2000 characters').optional()
  ),
})

// ── Artwork Submission ────────────────────────────────────────────────────────

export const artworkSubmissionSchema = z.object({
  title_en: st(200, 'English title must be under 200 characters').and(
    z.string().min(2, 'English title is required')
  ),
  title_bn: stOpt(200),
  description_en: stOpt(3000),
  description_bn: stOpt(3000),
  medium_en: stOpt(200),
  medium_bn: stOpt(200),
  width: z.number().positive().max(10000).optional(),
  height: z.number().positive().max(10000).optional(),
  framed: z.boolean().optional(),
  price: stOpt(50),
  main_image_url: z.string().url('Invalid image URL').optional(),
  exhibitionId: z.union([uuidSchema, z.literal('')]).optional(),
})

// ── Catalog Management ────────────────────────────────────────────────────────

export const catalogSchema = z.object({
  exhibition_id: uuidSchema,
  year: z.number().int().min(1900).max(2100),
  title_en: st(200, 'English title must be under 200 characters'),
  title_bn: stOpt(200),
  description_en: stOpt(3000),
  description_bn: stOpt(3000),
  pdf_url: z.string().url('Invalid PDF URL'),
  cover_image_url: z.string().url('Invalid cover image URL').optional().nullable(),
  language: z.enum(['en', 'bn', 'bilingual']).default('bilingual'),
  version: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : v),
    z.string().max(20).default('1.0')
  ),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  change_notes: stOpt(1000),
  uploaded_by: z.union([uuidSchema, z.null()]).optional(),
})

// ── Profile Update ────────────────────────────────────────────────────────────

export const profileUpdateSchema = z.object({
  full_name_en: st(100, 'English name must be under 100 characters'),
  full_name_bn: stOpt(100),
  bio_en: stOpt(2000),
  bio_bn: stOpt(2000),
  phone: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : v),
    z
      .string()
      .regex(/^\+?[\d\s\-().]{0,20}$/, 'Invalid phone format')
      .optional()
  ),
  instagram_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  website_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  notify_email: z.boolean().optional(),
  notify_in_app: z.boolean().optional(),
  notify_exhibition_announcements: z.boolean().optional(),
  notify_deadline_reminders: z.boolean().optional(),
  notify_artwork_updates: z.boolean().optional(),
})

export const contactInquirySchema = z.object({
  inquiryType: z.enum([
    'General Inquiry', 'Artist Application', 'Gallery Visit', 'Acquisition',
    'সাধারণ অনুসন্ধান', 'শিল্পী আবেদন', 'গ্যালারি পরিদর্শন', 'আহরণ'
  ]),
  name: z.string().trim().min(2, 'Name is required').max(200, 'Name must be under 200 characters'),
  email: z.string().trim().email('Invalid email address'),
  subject: z.string().trim().min(3, 'Subject is required').max(200, 'Subject must be under 200 characters'),
  message: z.string().trim().min(10, 'Message is required').max(5000, 'Message must be under 5000 characters'),
})

export const newsletterSubscriptionSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  sourcePage: z.enum(['homepage', 'footer', 'contact', 'future expansion']),
  locale: z.string().max(10),
})

