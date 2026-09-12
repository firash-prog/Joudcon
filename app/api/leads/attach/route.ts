import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

// Registers an uploaded attachment path onto its lead. Path is server-verified.
export async function POST(req: NextRequest) {
  try {
    const { lead_id, path } = await req.json();
    if (!lead_id || !path || typeof path !== 'string') return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    if (!path.startsWith(`${lead_id}/`) || path.includes('..'))
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    if (path.length > 300 || !/\.(jpe?g|png|webp|pdf|mp4)$/i.test(path))
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });

    const svc = supabaseService();
    const { data: lead } = await svc.from('leads').select('id').eq('id', lead_id).single();
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    const { error } = await svc.from('leads').update({ attachment_path: path }).eq('id', lead_id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('lead attach', e);
    return NextResponse.json({ error: 'Attach failed' }, { status: 500 });
  }
}
