import { createClient } from '@/lib/supabase/server';
import { createNotification } from '@/actions/notifications';
import { revalidatePath } from 'next/cache';

/**
 * Evaluates the status of an exhibition based on its configured dates and the current time.
 */
export function evaluateExhibitionStatus(exhibition: any): string {
  const now = new Date();
  const start = exhibition.exhibition_start ? new Date(exhibition.exhibition_start) : null;
  const end = exhibition.exhibition_end ? new Date(exhibition.exhibition_end) : null;

  if (exhibition.status === 'draft') return 'draft';
  if (exhibition.status === 'archived') return 'archived'; // Archived remains Archived forever

  // Pseudo logic:
  // if status == Upcoming: if today >= exhibition_start_date -> automatically transition to Ongoing
  // if status == Ongoing: if today > exhibition_end_date -> automatically transition to Archived
  
  if (exhibition.status === 'upcoming') {
    if (start && now >= start) {
      if (end && now > end) {
        return 'archived';
      }
      return 'ongoing';
    }
    return 'upcoming';
  }

  if (exhibition.status === 'ongoing') {
    if (end && now > end) {
      return 'archived';
    }
    return 'ongoing';
  }

  // Fallback / legacy status values
  if (end && now > end) return 'archived';
  if (start && now >= start) return 'ongoing';
  return exhibition.status || 'upcoming';
}

/**
 * Lazy Server-Side Evaluation: Checks an exhibition's expected status vs its current database status.
 * If there is a mismatch, it updates the database, dispatches notifications, and invalidates caches.
 */
export async function syncExhibitionLifecycle(exhibition: any, supabase: any) {
  if (!exhibition || exhibition.status === 'draft' || exhibition.status === 'archived') return exhibition;

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

      // Revalidate Next.js caches!
      try {
        const locales = ['en', 'bn'];
        locales.forEach(loc => {
          revalidatePath(`/${loc}`);
          revalidatePath(`/${loc}/exhibitions`);
          revalidatePath(`/${loc}/exhibitions/${data.id}`);
          revalidatePath(`/${loc}/catalogs`);
          revalidatePath(`/${loc}/admin/exhibitions`);
          revalidatePath(`/${loc}/admin/exhibitions/${data.id}`);
        });

        // Query catalogs for this exhibition to revalidate catalog detail page cache
        const { data: catalogs } = await supabase
          .from('catalogs')
          .select('id')
          .eq('exhibition_id', data.id);
        
        if (catalogs) {
          catalogs.forEach((cat: any) => {
            locales.forEach(loc => {
              revalidatePath(`/${loc}/catalogs/${cat.id}`);
            });
          });
        }
      } catch (err) {
        console.error('[Lifecycle Sync] Revalidation failed:', err);
      }

      return data;
    }
  }

  return exhibition;
}

/**
 * Batch synchronization of all active exhibition lifecycles.
 * Queries ONLY exhibitions that require state transitions based on today's date.
 */
export async function batchSyncExhibitions(supabase: any) {
  const now = new Date().toISOString();

  // Find exhibitions that need transition
  const { data: toOngoing } = await supabase
    .from('exhibitions')
    .select('id, status, exhibition_start, exhibition_end')
    .eq('status', 'upcoming')
    .lte('exhibition_start', now);

  const { data: toArchived } = await supabase
    .from('exhibitions')
    .select('id, status, exhibition_start, exhibition_end')
    .eq('status', 'ongoing')
    .lt('exhibition_end', now);

  const candidates = [...(toOngoing || []), ...(toArchived || [])];
  if (candidates.length === 0) return;

  for (const exh of candidates) {
    await syncExhibitionLifecycle(exh, supabase);
  }
}

/**
 * Fetches the currently featured exhibition and ensures its lifecycle status is synchronized.
 * Priority: manually featured → any active (non-draft, non-archived) exhibition → most recent archived.
 */
export async function getFeaturedExhibition() {
  const supabase = await createClient();

  // Run a quick batch sync first to ensure database consistency before fetching
  await batchSyncExhibitions(supabase).catch(err => console.error('[Featured Exhibition] batchSync failed:', err));

  // 1. Try manually featured first
  let { data: featured } = await supabase
    .from('exhibitions')
    .select('*')
    .eq('is_featured', true)
    .neq('is_deleted', true)
    .limit(1)
    .maybeSingle();

  if (!featured) {
    // 2. Fallback: Latest Ongoing Exhibition (order by exhibition_start DESC)
    const { data: ongoing } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('status', 'ongoing')
      .neq('is_deleted', true)
      .order('exhibition_start', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    featured = ongoing;
  }

  if (!featured) {
    // 3. Fallback: Nearest Upcoming Exhibition (order by exhibition_start ASC)
    const { data: upcoming } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('status', 'upcoming')
      .neq('is_deleted', true)
      .order('exhibition_start', { ascending: true, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    featured = upcoming;
  }

  if (!featured) {
    // 4. Last resort: Most Recently Archived Exhibition (order by exhibition_start DESC)
    const { data: archived } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('status', 'archived')
      .neq('is_deleted', true)
      .order('exhibition_start', { ascending: false, nullsFirst: false })
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
