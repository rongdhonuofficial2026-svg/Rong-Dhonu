import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testCascade() {
  console.log('Testing exhibition deletion cascade...');

  // 1. Create a dummy exhibition
  const { data: exh, error: exhErr } = await supabase.from('exhibitions').insert([{
    theme_en: 'Test Exhibition for Cascade',
    theme_bn: 'টেস্ট',
    exhibition_start: '2026-01-01',
    exhibition_end: '2026-12-31',
    registration_start: '2026-01-01',
    submission_end: '2026-12-31',
    year: 2026,
    status: 'draft',
    is_deleted: true
  }]).select('id').single();

  if (exhErr) {
    console.error('Failed to create exhibition:', exhErr);
    return;
  }
  console.log('Created dummy exhibition:', exh.id);

  // 1.5 Create a dummy profile
  const { data: profile, error: profErr } = await supabase.from('profiles').insert([{
    id: '00000000-0000-0000-0000-000000000000', // Need an actual UUID or just omit id to auto-generate
    full_name_en: 'Test User',
    full_name_bn: 'Test User',
    phone: '1234567890',
    role: 'artist'
  }]).select('id').single();

  let artist_id = null;
  if (profile) artist_id = profile.id;
  if (!profile) {
    // If it fails (maybe UUID required), just fetch an existing one
    const { data: anyProf } = await supabase.from('profiles').select('id').limit(1).single();
    if (anyProf) artist_id = anyProf.id;
  }

  // 2. Create dependent records
  if (artist_id) {
    const { error: artErr } = await supabase.from('artworks').insert([{
      exhibition_id: exh.id,
      artist_id,
      title_en: 'Test Artwork',
      title_bn: 'Test Artwork',
      medium_en: 'Oil',
      medium_bn: 'Oil',
      materials_en: 'Canvas',
      materials_bn: 'Canvas',
      dimensions: '10x10',
      status: 'approved'
    }]);
    if (artErr) console.error('Error inserting artwork:', artErr);
    else console.log('Created dependent artwork');

    const { error: partErr } = await supabase.from('exhibition_participants').insert([{
      exhibition_id: exh.id,
      artist_id,
      status: 'approved'
    }]);
    if (partErr) console.error('Error inserting participant:', partErr);
    else console.log('Created dependent participant');
  }

  // 3. Delete exhibition
  console.log('Attempting to permanently delete exhibition...');
  const { error: delErr } = await supabase.from('exhibitions').delete().eq('id', exh.id);

  if (delErr) {
    console.error('DELETION FAILED! Cascade might be missing:', delErr);
    return;
  }
  console.log('Deletion successful!');

  // 4. Verify cascade
  const { count: artCount } = await supabase.from('artworks').select('*', { count: 'exact', head: true }).eq('exhibition_id', exh.id);
  const { count: partCount } = await supabase.from('exhibition_participants').select('*', { count: 'exact', head: true }).eq('exhibition_id', exh.id);

  if (artCount === 0 && partCount === 0) {
    console.log('SUCCESS: All dependent records were successfully cascaded!');
  } else {
    console.error(`FAILED: Orphaned records detected. Artworks: ${artCount}, Participants: ${partCount}`);
  }
}

testCascade();
