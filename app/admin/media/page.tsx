"use client";
import { useEffect, useState } from 'react';
import { sbBrowser } from '@/lib/supabase-browser';
import Uploader from '@/components/admin/Uploader';
import { useAdminLang } from '@/lib/admin-i18n';

const pub = (p: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${p}`;

export default function MediaAdmin() {
  const sb = sbBrowser();
  const { t } = useAdminLang();
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState(''); const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'doc'>('all');
  const [preview, setPreview] = useState<any | null>(null);
  const [renaming, setRenaming] = useState<any | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string; kind: 'ok' | 'err' }[]>([]);
  const toast = (msg: string, kind: 'ok' | 'err' = 'ok') => {
    const id = Date.now(); setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  const load = async () => {
    const { data } = await sb.from('media_with_usage').select('*').order('created_at', { ascending: false }).limit(300);
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const kindOf = (m: string) => m?.startsWith('image/') ? 'image' : m?.startsWith('video/') ? 'video' : 'doc';
  const filtered = items.filter(i =>
    (filter === 'all' || kindOf(i.mime) === filter) &&
    (i.original_filename?.toLowerCase().includes(q.toLowerCase()) || i.path.toLowerCase().includes(q.toLowerCase())));

  async function remove(m: any) {
    const { data, error: rpcErr } = await sb.rpc('delete_media_asset', { p_asset: m.id, p_force: false });
    if (rpcErr?.message?.startsWith('ASSET_IN_USE')) {
      const n = rpcErr.message.split(':')[1];
      if (!confirm(`This file is used in ${n} places. Delete anyway? Links will break.`)) return;
      const { error } = await sb.rpc('delete_media_asset', { p_asset: m.id, p_force: true });
      if (error) { toast(error.message, 'err'); return; }
    } else if (rpcErr) { toast(rpcErr.message, 'err'); return; }
    const { data: sess } = await sb.auth.getSession();
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/media/${encodeURI(m.path)}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${sess.session?.access_token}` },
    }).catch(() => {});
    toast('File deleted.'); load();
  }

  async function saveRename() {
    const { error } = await sb.from('media_assets').update({
      original_filename: renaming.original_filename, alt_en: renaming.alt_en, alt_ar: renaming.alt_ar,
    }).eq('id', renaming.id);
    error ? toast(error.message, 'err') : (toast('Updated.'), setRenaming(null), load());
  }

  const copy = (m: any) => { navigator.clipboard?.writeText(pub(m.path)); toast('URL copied.'); };
  const fmt = (b: number) => b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold">{t.media}</h1>
        <Uploader bucket="media" accept="image/*,video/mp4,.pdf" onUploaded={() => { toast('Uploaded.'); load(); }} label={t.upl} />
      </div>
      <div className="flex gap-3 mb-6 flex-wrap">
        <input placeholder={t.search} value={q} onChange={e => setQ(e.target.value)} className="p-2.5 rounded-[10px] border-[1.5px] flex-1 min-w-[200px]" />
        {['all', 'image', 'video', 'doc'].map(f => (
          <button key={f} onClick={() => setFilter(f as any)}
            className="px-4 py-2 rounded-full border text-xs trk font-bold"
            style={{ background: filter === f ? 'var(--amber)' : '#fff', borderColor: 'var(--line)' }}>{f.toUpperCase()}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {filtered.map(m => (
          <div key={m.id} className="card !rounded-lg overflow-hidden">
            <button className="aspect-square bg-[#EFEEF3] w-full flex items-center justify-center overflow-hidden" onClick={() => setPreview(m)}>
              {kindOf(m.mime) === 'image'
                ? <img src={pub(m.path)} alt={m.alt_en ?? ''} className="w-full h-full object-cover" loading="lazy" />
                : <span className="text-xs text-[#6E6C7B] trk">{kindOf(m.mime)}</span>}
            </button>
            <div className="p-2">
              <div className="text-[11px] truncate font-bold">{m.original_filename ?? m.path}</div>
              <div className="text-[10px] text-[#6E6C7B]">{fmt(m.size_bytes)} · {m.width ?? '?'}×{m.height ?? '?'} · used {m.usage_count}×</div>
              <div className="flex gap-2 mt-1.5 text-[10px]">
                <button onClick={() => copy(m)} className="text-[#6E6C7B] hover:underline">{t.copyUrl}</button>
                <button onClick={() => setRenaming({ ...m })} className="text-[#6E6C7B] hover:underline">{t.editFile}</button>
                <button onClick={() => remove(m)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl p-4 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            {kindOf(preview.mime) === 'image'
              ? <img src={pub(preview.path)} alt="" className="max-h-[60vh] w-full object-contain rounded-xl" />
              : <video src={pub(preview.path)} controls className="max-h-[60vh] w-full rounded-xl" />}
            <div className="text-xs text-[#6E6C7B] mt-3">{preview.path} · {preview.mime} · {fmt(preview.size_bytes)}</div>
          </div>
        </div>)}

      {renaming && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setRenaming(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4">Edit file</h3>
            <label className="field block mb-3"><span className="text-xs trk text-[#6E6C7B]">Filename</span>
              <input className="w-full p-2.5 rounded-[10px] border-[1.5px] mt-1" value={renaming.original_filename ?? ''} onChange={e => setRenaming({ ...renaming, original_filename: e.target.value })} /></label>
            <label className="field block mb-3"><span className="text-xs trk text-[#6E6C7B]">Alt text EN</span>
              <input className="w-full p-2.5 rounded-[10px] border-[1.5px] mt-1" value={renaming.alt_en ?? ''} onChange={e => setRenaming({ ...renaming, alt_en: e.target.value })} /></label>
            <label className="field block mb-5"><span className="text-xs trk text-[#6E6C7B]">Alt text AR</span>
              <input dir="rtl" className="w-full p-2.5 rounded-[10px] border-[1.5px] mt-1" value={renaming.alt_ar ?? ''} onChange={e => setRenaming({ ...renaming, alt_ar: e.target.value })} /></label>
            <div className="flex gap-3">
              <button onClick={saveRename} className="btn btn-amber flex-1">Save</button>
              <button onClick={() => setRenaming(null)} className="btn btn-ghost">Cancel</button>
            </div>
          </div>
        </div>)}

      <div className="fixed bottom-5 end-5 z-[60] space-y-2">
        {toasts.map(t => <div key={t.id} className="px-4 py-3 rounded-xl shadow-lg text-sm text-white"
          style={{ background: t.kind === 'ok' ? '#1a7f37' : '#B0483A' }}>{t.msg}</div>)}
      </div>
    </div>
  );
}
