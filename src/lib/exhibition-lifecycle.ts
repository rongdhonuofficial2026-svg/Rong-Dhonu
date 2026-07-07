import { createClient } from '@/lib/supabase/server';

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

      return data;
    }
  }

  return exhibition;
}

/**
 * Fetches the currently featured exhibition and ensures its lifecycle status is synchronized.
 * Priority: manually featured → any active (non-draft, non-archived) exhibition → most recent archived.
 */
export async function getFeaturedExhibition() {
  const supabase = await createClient();

  // 1. Try manually featured first
  let { data: featured } = await supabase
    .from('exhibitions')
    .select('*')
    .eq('is_featured', true)
    .neq('is_deleted', true)
    .limit(1)
    .maybeSingle();

  if (!featured) {
    // 2. Fallback: any active exhibition (all non-draft, non-archived statuses)
    //    Ordered by priority: ongoing > submission_open > upcoming > registration_open > etc.
    const { data: active } = await supabase
      .from('exhibitions')
      .select('*')
      .not('status', 'in', '("draft","archived")')
      .neq('is_deleted', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    featured = active;
  }

  if (!featured) {
    // 3. Last resort: most recent archived (show something rather than nothing)
    const { data: archived } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('status', 'archived')
      .neq('is_deleted', true)
      .order('exhibition_end', { ascending: false })
      .limit(1)
      .maybeSingle();

    featured = archived;
  }

  if (featured) {
    // Lazy sync: only auto-advance status for ongoing/upcoming/archived transitions
    // Do NOT override manually set statuses like submission_open, reviewing, published
    const autoSyncStatuses = ['ongoing', 'upcoming', 'archived']
    if (autoSyncStatuses.includes(featured.status)) {
      featured = await syncExhibitionLifecycle(featured, supabase);
    }
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
