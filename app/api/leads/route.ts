import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { createHash } from 'crypto';

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp',
  'application/pdf': '.pdf', 'video/mp4': '.mp4',
};

export async function POST(req: NextRequest) {
  try {
    const ipHash = createHash('sha256').update(req.headers.get('x-forwarded-for') ?? 'unknown').digest('hex');
    const svc = supabaseService();

    // rate limit: 5 per 10 min per IP
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await svc.from('lead_rate').select('*', { count: 'exact', head: true })
      .eq('ip', ipHash).gte('created_at', since);
    if ((count ?? 0) >= 5)
      return NextResponse.json({ error: 'Too many requests. Please try later.' }, { status: 429 });

    const body = await req.json();
    const { name, email, message, company, phone, event_type, location, event_date, attendance } = body ?? {};
    if (!name?.trim() || !email?.trim() || !message?.trim())
      return NextResponse.json({ error: 'Name, email and message are required.' }, { status: 400 });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return NextResponse.json({ error: 'Invalid email.' }, { status: 400 });
    if (body?.website) return NextResponse.json({ ok: true }); // honeypot: pretend success, drop

    const { data: lead, error } = await svc.from('leads').insert({
      name: name.trim().slice(0, 200), company: company?.slice(0, 200), email: email.trim().slice(0, 200),
      phone: phone?.slice(0, 40), event_type: event_type?.slice(0, 100), location: location?.slice(0, 200),
      event_date: event_date || null, attendance: Number(attendance) || null, message: message.trim().slice(0, 5000),
    }).select('id').single();
    if (error) throw error;

    await svc.from('lead_rate').insert({ ip: ipHash });
    return NextResponse.json({ lead_id: lead.id });
  } catch (e) {
    console.error('lead submit', e);
    return NextResponse.json({ error: 'Submission failed. Please try again.' }, { status: 500 });
  }
}
