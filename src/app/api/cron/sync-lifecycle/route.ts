import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { batchSyncExhibitions } from '@/lib/exhibition-lifecycle';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !isVercelCron) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    await batchSyncExhibitions(supabase);
    return NextResponse.json({ success: true, message: 'Exhibition lifecycles synchronized.' });
  } catch (error: any) {
    console.error('[Cron Lifecycle Sync] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
