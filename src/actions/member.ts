'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { profileUpdateSchema } from "@/lib/validations/schemas"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Unauthorized' }
  }

  const rawData = {
    full_name_en: formData.get('full_name_en') as string,
    full_name_bn: (formData.get('full_name_bn') as string) || undefined,
    bio_en: (formData.get('bio_en') as string) || undefined,
    bio_bn: (formData.get('bio_bn') as string) || undefined,
    phone: (formData.get('phone') as string) || undefined,
    instagram_url: (formData.get('instagram_url') as string) || undefined,
    website_url: (formData.get('website_url') as string) || undefined,
    notify_email: formData.get('notify_email') === 'true',
    notify_in_app: formData.get('notify_in_app') === 'true',
    notify_exhibition_announcements: formData.get('notify_exhibition_announcements') === 'true',
    notify_deadline_reminders: formData.get('notify_deadline_reminders') === 'true',
    notify_artwork_updates: formData.get('notify_artwork_updates') === 'true',
  }

  const validatedFields = profileUpdateSchema.safeParse(rawData)

  if (!validatedFields.success) {
    const firstError = validatedFields.error.issues[0]
    return { error: `${firstError.path.join('.')}: ${firstError.message}` }
  }

  const { error } = await supabase
    .from('profiles')
    .update(validatedFields.data)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/en/dashboard/profile`)
  revalidatePath(`/bn/dashboard/profile`)
  revalidatePath(`/en/artists`)
  revalidatePath(`/bn/artists`)

  return { success: true }
}

export async function uploadAvatar(avatarUrl: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Unauthorized' }
  }

  // Validate it is a valid URL
  try {
    new URL(avatarUrl)
  } catch {
    return { error: 'Invalid avatar URL.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  // Revalidate everywhere profile pictures are shown
  revalidatePath(`/en/dashboard/profile`)
  revalidatePath(`/bn/dashboard/profile`)
  revalidatePath(`/en/artists`)
  revalidatePath(`/bn/artists`)
  revalidatePath(`/en`)
  revalidatePath(`/bn`)
  revalidatePath(`/en/gallery`)
  revalidatePath(`/bn/gallery`)

  return { success: true }
}

export async function deleteAvatar() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/en/dashboard/profile`)
  revalidatePath(`/bn/dashboard/profile`)

  return { success: true }
}
