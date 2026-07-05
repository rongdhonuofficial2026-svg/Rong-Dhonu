'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const profileSchema = z.object({
  full_name_en: z.string().min(2),
  full_name_bn: z.string().optional(),
  bio_en: z.string().optional(),
  bio_bn: z.string().optional(),
  phone: z.string().optional(),
  instagram_url: z.string().url().optional().or(z.literal('')),
  website_url: z.string().url().optional().or(z.literal('')),
  notify_email: z.boolean().optional(),
  notify_in_app: z.boolean().optional(),
  notify_exhibition_announcements: z.boolean().optional(),
  notify_deadline_reminders: z.boolean().optional(),
  notify_artwork_updates: z.boolean().optional(),
})

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Unauthorized' }
  }

  const rawData = {
    full_name_en: formData.get('full_name_en') as string,
    full_name_bn: formData.get('full_name_bn') as string,
    bio_en: formData.get('bio_en') as string,
    bio_bn: formData.get('bio_bn') as string,
    phone: formData.get('phone') as string,
    instagram_url: formData.get('instagram_url') as string,
    website_url: formData.get('website_url') as string,
    notify_email: formData.get('notify_email') === 'true',
    notify_in_app: formData.get('notify_in_app') === 'true',
    notify_exhibition_announcements: formData.get('notify_exhibition_announcements') === 'true',
    notify_deadline_reminders: formData.get('notify_deadline_reminders') === 'true',
    notify_artwork_updates: formData.get('notify_artwork_updates') === 'true',
  }

  const validatedFields = profileSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return { error: 'Invalid fields', details: validatedFields.error.flatten().fieldErrors }
  }

  const { error } = await supabase
    .from('profiles')
    .update(validatedFields.data)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/[locale]/dashboard/profile', 'page')
  return { success: true }
}
