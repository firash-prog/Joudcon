"use client";
import { useEffect, useState } from 'react';
import { sbBrowser } from '@/lib/supabase-browser';
import { useAdminLang } from '@/lib/admin-i18n';

const STATUSES = ['new', 'read', 'in_progress', 'completed', 'spam'];

export default function LeadsAdmin() {
  const sb = sbBrowser();
  const { t } = useAdminLang();
  const [leads, setLeads] = useState<any[]>([]); const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState<any | null>(null); const [note, setNote] = useState('');

  const load = async () => {
    const { data } = await sb.from('leads').select('*, lead_notes(*)').order('created_at', { ascending: false }).limit(200);
    setLeads(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (l: any, status: string) => {
    await sb.from('leads').update({ status, is_read: status !== 'new' }).eq('id', l.id);
    load(); if (open?.id === l.id) setOpen({ ...open, status });
  };
  const addNote = async () => {
    if (!note.trim()) return;
    const { data: { user } } = await sb.auth.getUser();
    await sb.from('lead_notes').insert({ lead_id: open.id, body: note, author: user?.id });
    setNote(''); load();
  };
  const download = async (l: any) => {
    const { data } = await sb.storage.from('lead-attachments').createSignedUrl(l.attachment_path, 120);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };
  const csv = () => {
    const head = ['name', 'company', 'email', 'phone', 'event_type', 'location', 'event_date', 'attendance', 'message', 'status', 'created_at'];
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = leads.map(l => head.map(h => esc(l[h])).join(','));
    const blob = new Blob([`${head.join(',')}\n${rows.join('\n')}`], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'leads.csv'; a.click();
  };

  const stLbl: any = { new: t.stNew, read: t.stRead, in_progress: t.stInProgress, completed: t.stCompleted, spam: t.stSpam };
  const shown = leads.filter(l => filter === 'all' || l.status === filter);
  const badge: any = { new: '#F9AE40', read: '#6E6C7B', in_progress: '#1f6feb', completed: '#1a7f37', spam: '#B0483A' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold">{t.leads} ({leads.filter(l => l.status === 'new').length} {t.stNew})</h1>
        <button onClick={csv} className="btn btn-ghost !py-2 text-xs">{t.exportCsv}</button>
      </div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className="px-4 py-2 rounded-full border text-xs trk font-bold"
            style={{ background: filter === s ? 'var(--amber)' : '#fff', borderColor: 'var(--line)' }}>{s === 'all' ? t.all : stLbl[s]}</button>
        ))}
      </div>
      <div className="card divide-y" style={{ borderColor: 'var(--line)' }}>
        {shown.map(l => (
          <button key={l.id} onClick={() => setOpen(l)}
            className="w-full text-start px-5 py-4 flex items-center gap-3 flex-wrap hover:bg-black/[.02]">
            <span className={`w-2 h-2 rounded-full ${l.is_read ? 'bg-transparent' : ''}`} style={{ background: l.is_read ? 'transparent' : 'var(--amber)' }} />
            <span className="font-bold flex-1 min-w-[140px]">{l.name} <span className="font-normal text-[#6E6C7B]">· {l.company}</span></span>
            <span className="text-xs text-[#6E6C7B] hidden md:inline">{l.event_type} · {new Date(l.created_at).toLocaleDateString()}</span>
            <span className="text-[10px] trk px-2.5 py-1 rounded-full text-white font-bold" style={{ background: badge[l.status] }}>{stLbl[l.status]}</span>
          </button>
        ))}
        {shown.length === 0 && <div className="px-5 py-12 text-center text-sm text-[#6E6C7B]">{t.noEnq}</div>}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end" onClick={() => setOpen(null)}>
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5">
              <h2 className="font-extrabold text-lg">{open.name}</h2>
              <button onClick={() => setOpen(null)} className="text-2xl leading-none" aria-label="Close">×</button>
            </div>
            <div className="text-sm space-y-1.5 mb-5">
              <div><b>{open.company}</b> · {open.email} · {open.phone}</div>
              <div className="text-[#6E6C7B]">{open.event_type} · {open.location} · {open.event_date} · {open.attendance} {t.guests}</div>
              {open.attachment_path && <button onClick={() => download(open)} className="text-xs text-[#1f6feb] hover:underline">{t.downloadAtt}</button>}
            </div>
            <p className="bg-[var(--paper)] rounded-xl p-4 text-sm mb-6 whitespace-pre-line">{open.message}</p>
            <div className="flex gap-2 mb-8 flex-wrap">
              {STATUSES.map(s => (
                <button key={s} onClick={() => setStatus(open, s)}
                  className="px-3 py-1.5 rounded-full border text-xs font-bold"
                  style={{ background: open.status === s ? badge[s] : '#fff', color: open.status === s ? '#fff' : '#6E6C7B', borderColor: 'var(--line)' }}>{s === 'all' ? t.all : stLbl[s]}</button>
              ))}
            </div>
            <h3 className="font-bold text-sm mb-3">{t.internalNotes}</h3>
            <div className="space-y-2 mb-4">
              {(open.lead_notes ?? []).map((n: any) => (
                <div key={n.id} className="text-sm bg-[var(--paper)] rounded-lg p-3">{n.body}
                  <div className="text-[10px] text-[#6E6C7B] mt-1">{new Date(n.created_at).toLocaleString()}</div></div>))}
            </div>
            <div className="flex gap-2">
              <input value={note} onChange={e => setNote(e.target.value)} placeholder={t.notePh} className="flex-1 p-2.5 rounded-[10px] border-[1.5px]" />
              <button onClick={addNote} className="btn btn-amber !py-2">{t.addNote}</button>
            </div>
          </div>
        </div>)}
    </div>
  );
}
