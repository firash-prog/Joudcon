"use client";
import { useState } from 'react';

export default function ContactForm({ lang }: { lang: 'en' | 'ar' }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const L: any = {
    en: { name: 'Name', email: 'Email', phone: 'Phone', type: 'Event type', date: 'Event date', msg: 'Message',
          send: 'Send Enquiry', ok: 'Received. We will reply within one business day.',
          err: 'Please check the highlighted fields.', file: 'Attachment (optional)' },
    ar: { name: 'الاسم', email: 'البريد الإلكتروني', phone: 'الجوال', type: 'نوع الفعالية', date: 'تاريخ الفعالية',
          msg: 'رسالتك', send: 'أرسل الاستفسار', ok: 'تم الاستلام. سنرد خلال يوم عمل.',
          err: 'يرجى مراجعة الحقول المحددة.', file: 'مرفق (اختياري)' },
  }[lang];

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = Object.fromEntries(f.entries());
    setState('sending'); setMsg('');
    try {
      const r = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      const file = (f.get('file') as File);
      if (file && file.size > 0) { // upload attachment directly to storage, then register it
        const up = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/lead-attachments/${j.lead_id}/${Date.now()}-${file.name}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`, 'Content-Type': file.type },
          body: file,
        });
        if (up.ok) await fetch('/api/leads/attach', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead_id: j.lead_id, path: `${j.lead_id}/${Date.now()}-${file.name}` }) });
      }
      setState('done'); setMsg(L.ok); (e.target as HTMLFormElement).reset();
    } catch (err: any) { setState('error'); setMsg(err.message ?? L.err); }
  }

  const input = 'w-full p-3 rounded-[10px] border-[1.5px] text-inherit bg-white';
  return (
    <form onSubmit={submit} className="grid md:grid-cols-2 gap-5 text-[var(--ink)]">
      <input name="name" required placeholder={L.name} className={input} />
      <input name="email" type="email" required placeholder={L.email} className={input} />
      <input name="phone" placeholder={L.phone} className={input} />
      <input name="event_type" placeholder={L.type} className={input} />
      <input name="event_date" type="date" aria-label={L.date} className={input} />
      <input name="company" placeholder={lang === 'ar' ? 'الشركة' : 'Company'} className={input} />
      <textarea name="message" required rows={4} placeholder={L.msg} className={`${input} md:col-span-2`} />
      {/* honeypot */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <label className="md:col-span-2 text-xs text-[#6E6C7B]">{L.file}
        <input name="file" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,.mp4" className="block mt-1 text-sm" />
      </label>
      <div className="md:col-span-2">
        <button className="btn btn-amber" disabled={state === 'sending'}>{state === 'sending' ? '…' : L.send}</button>
        {msg && <span className={`ms-4 text-sm ${state === 'done' ? 'text-green-600' : 'text-red-600'}`}>{msg}</span>}
      </div>
    </form>
  );
}
