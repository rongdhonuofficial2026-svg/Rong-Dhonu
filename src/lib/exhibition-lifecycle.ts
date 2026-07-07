import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Evaluates the status of an exhibition based on its configured dates and the current time.
 */
export function evaluateExhibitionStatus(exhibition: any): string {
  const now = new Date();
  const start = exhibition.exhibition_start ? new Date(exhibition.exhibition_start) : null;
  const end = exhibition.exhibition_end ? new Date(exhibition.exhibition_end) : null;

  if (exhibition.status === 'draft') return 'draft';

  // If the end date has passed, it is archived
  if (end && now > end) {
    return 'archived';
  }

  // If the start date has passed, it is ongoing
  if (start && now >= start) {
    return 'ongoing';
  }

  // Otherwise, if it's published, it's upcoming
  return 'upcoming';
}

import { createNotification } from '@/actions/notifications';

/**
 * Lazy Server-Side Evaluation: Checks an exhibition's expected status vs its current database status.
 * If there is a mismatch, it updates the database and triggers cache revalidation.
 */
export async function syncExhibitionLifecycle(exhibition: any, supabase: any) {
  if (!exhibition || exhibition.status === 'draft') return exhibition;

  const expectedStatus = evaluateExhibitionStatus(exhibition);

  if (expectedStatus !== exhibition.status) {
    const { data, error } = await supabase
      .from('exhibitions')
      .update({ status: expectedStatus })
      .eq('id', exhibition.id)
      .select()
      .single();

    if (!error && data) {
      // Trigger global notification if it transitioned to 'ongoing'
      if (expectedStatus === 'ongoing') {
        const titleEn = `The exhibition "${data.theme_en}" has officially started!`;
        const titleBn = `"${data.theme_bn || data.theme_en}" প্রদর্শনী শুরু হয়েছে!`;
        
        // Use user_id = null or a special mechanism to broadcast, 
        // For now we'll fetch all active members and committee and send them a notification
        // Note: In a massive scale app this should be a queue, but here it's fine for the scope.
        const { data: users } = await supabase.from('profiles').select('id').in('role', ['member', 'committee', 'admin']);
        if (users) {
          for (const u of users) {
            await createNotification(u.id, 'new_exhibition', titleEn, titleBn, {
              subject: `Rongdhonu: Exhibition Started`,
              html: `<p>The exhibition <strong>${data.theme_en}</strong> is now ongoing! Visit the gallery to see the artworks.</p>`,
              category: 'notify_new_exhibition',
            }).catch(e => console.error(e));
          }
        }
      }

      // Revalidate relevant paths since the status changed automatically
      revalidatePath('/', 'layout');
      revalidatePath('/[locale]/(public)/exhibitions', 'page');
      revalidatePath('/[locale]/(admin)/admin/exhibitions', 'page');
      return data;
    }
  }

  return exhibition;
}

/**
 * Fetches the currently featured exhibition and ensures its lifecycle status is synchronized.
 * If no exhibition is featured, falls back to the most relevant one (ongoing -> upcoming).
 */
export async function getFeaturedExhibition() {
  const supabase = await createClient();

  // Try to find the manually featured exhibition first
  let { data: featured } = await supabase
    .from('exhibitions')
    .select('*')
    .eq('is_featured', true)
    .single();

  if (!featured) {
    // Fallback: Find the most recent ongoing exhibition
    const { data: ongoing } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('status', 'ongoing')
      .order('exhibition_start', { ascending: false })
      .limit(1)
      .single();
    
    featured = ongoing;
  }

  if (!featured) {
    // Fallback: Find the next upcoming exhibition
    const { data: upcoming } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('status', 'upcoming')
      .order('exhibition_start', { ascending: true })
      .limit(1)
      .single();
    
    featured = upcoming;
  }

  if (featured) {
    // Lazy evaluation to transition states if needed
    featured = await syncExhibitionLifecycle(featured, supabase);
  }

  return featured;
}

/**
 * Determines if registration is currently open for a given exhibition.
 */
export function isRegistrationOpen(exhibition: any): boolean {
  if (!exhibition) return false;
  if (exhibition.status === 'draft' || exhibition.status === 'archived') return false;

  const now = new Date();
  const start = exhibition.registration_start ? new Date(exhibition.registration_start) : null;
  const end = exhibition.submission_end ? new Date(exhibition.submission_end) : null;

  if (!start || !end) return false;

  return now >= start && now <= end;
}

/**
 * Determines if the gallery/catalog can be accessed publicly.
 */
export function isGalleryUnlocked(exhibition: any): boolean {
  if (!exhibition) return false;
  return exhibition.status === 'ongoing' || exhibition.status === 'archived';
}
