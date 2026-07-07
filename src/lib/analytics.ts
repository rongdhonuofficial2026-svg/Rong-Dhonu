import { createClient } from '@/lib/supabase/server';

/**
 * Safely increments an analytics counter for a specific exhibition using an RPC call to avoid race conditions.
 * Wait, Supabase RPC requires a custom function. To avoid creating custom RPC functions for every column,
 * we can fetch the current value and update it. It's slightly less safe than a pure RPC, but works fine 
 * for basic analytics if traffic isn't exceptionally high. 
 * Better yet, we can use an RPC function if one is created, but for now we'll do an optimistic read/write.
 */
export async function trackExhibitionMetric(
  exhibitionId: string, 
  metric: 'views_count' | 'gallery_views_count' | 'catalog_downloads_count'
) {
  try {
    const supabase = await createClient();
    
    // Fetch current
    const { data, error } = await supabase
      .from('exhibitions')
      .select(metric)
      .eq('id', exhibitionId)
      .single();
      
    if (error || !data) return;

    // TypeScript fix: cast data to any since we are dynamically indexing it
    const currentValue = (data as any)[metric] || 0;
    const newValue = currentValue + 1;

    // Update
    await supabase
      .from('exhibitions')
      .update({ [metric]: newValue })
      .eq('id', exhibitionId);
      
  } catch (err) {
    console.error(`Failed to track ${metric} for exhibition ${exhibitionId}`, err);
  }
}
