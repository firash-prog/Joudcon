"use client";
import { useEffect, useState } from 'react';
import { sbBrowser } from '@/lib/supabase-browser';
import LangField from './LangField';
import MediaPicker from './MediaPicker';
import { useAdminLang } from '@/lib/admin-i18n';

export type Field = {
  key: string; label: string;
  type: 'text' | 'textarea' | 'langtext' | 'number' | 'bool' | 'select' | 'media' | 'gallery' | 'jsonlist';
  options?: string[]; required?: boolean; hint?: string;
};

const langVal = (row: any, key: string) => ({ en: row[`${key}_en`] ?? '', ar: row[`${key}_ar`] ?? '' });
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9\u0621-\u064a]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || `item-${Date.now()}`;

export default function ResourceManager({ table, title, fields, orderBy = 'sort_order', searchable = 'name_en' }: {
  table: string; title: string; fields: Field[]; orderBy?: string; searchable?: string;
}) {
  const sb = sbBrowser();
  const { t } = useAdminLang();
  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [saved, setSaved] = useState<'clean' | 'dirty' | 'saving' | 'saved' | 'error'>('clean');
  const [toasts, setToasts] = useState<{ id: number; msg: string; kind: 'ok' | 'err' }[]>([]);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [galleryPick, setGalleryPick] = useState(false);

  const toast = (msg: string, kind: 'ok' | 'err' = 'ok') => {
    const id = Date.now(); setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };
  const load = async () => {
    const { data, error } = await sb.from(table).select('*').order(orderBy);
    if (error) toast(error.message, 'err'); else setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  function blank() {
    const r: any = { status: 'draft', sort_order: (rows.length + 1) };
    fields.forEach(f => { if (f.type === 'bool') r[f.key] = false; if (f.type === 'jsonlist' || f.type === 'gallery') r[f.key] = []; });
    return r;
  }
  function edit(row?: any) { setEditing(row ? { ...row } : blank()); setSaved('clean'); }
  function touch() { setSaved('dirty'); }

  function setLang(key: string, v: { en?: string; ar?: string }) {
    setEditing((e: any) => ({ ...e, [`${key}_en`]: v.en, [`${key}_ar`]: v.ar })); touch();
  }

  async function save() {
    if (!editing) return;
    const missing = fields.find(f => f.required && f.type !== 'langtext' && !editing[f.key]);
    const missingLang = fields.find(f => f.required && f.type === 'langtext' && !editing[`${f.key}_en`]?.trim());
    if (missing || missingLang) { toast(`"${(missing ?? missingLang)!.label}" is required.`, 'err'); return; }
    setSaved('saving');
    const payload = { ...editing };
    if (!payload.slug && (payload.name_en || payload.title_en)) payload.slug = slugify(payload.name_en ?? payload.title_en);
    if (payload.id) delete payload.created_at;
    const { error } = await sb.from(table).upsert(payload);
    if (error) { setSaved('error'); toast(error.message, 'err'); return; }
    setSaved('saved'); toast(`${title.slice(0, -1)} saved.`);
    setEditing(null); await load();
  }

  async function duplicate(row: any) {
    const copy = { ...row }; delete copy.id; delete copy.created_at; delete copy.published_at; delete copy.updated_at;
    copy.status = 'draft'; copy.sort_order = (row.sort_order ?? 0) + 1;
    if (copy.slug) copy.slug = `${copy.slug}-copy`;
    const { error } = await sb.from(table).insert(copy);
    error ? toast(error.message, 'err') : (toast('Duplicated as draft.'), load());
  }

  async function togglePublish(row: any) {
    const next = row.status === 'published' ? 'draft' : 'published';
    const { error } = await sb.from(table).update({ status: next }).eq('id', row.id);
    error ? toast(error.message, 'err') : (toast(next === 'published' ? 'Published.' : 'Unpublished.'), load());
  }

  async function remove(row: any) {
    const label = row.name_en ?? row.title_en ?? row.slug ?? `#${row.id}`;
    if (!confirm(`Delete "${label}"? This can be restored from database backup only.`)) return;
    const { error } = await sb.from(table).delete().eq('id', row.id);
    error ? toast(error.message, 'err') : (toast('Deleted.'), load());
  }

  async function move(row: any, dir: -1 | 1) {
    const idx = rows.findIndex(r => r.id === row.id);
    const swap = rows[idx + dir]; if (!swap) return;
    await sb.from(table).update({ sort_order: swap.sort_order }).eq('id', row.id);
    await sb.from(table).update({ sort_order: row.sort_order }).eq('id', swap.id);
    load();
  }

  const inputCls = 'w-full p-3 rounded-[10px] border-[1.5px] bg-white';
  const display = (row: any) => row.name_en ?? row.title_en ?? row.label_en ?? row.slug ?? `#${row.id}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <button onClick={() => edit()} className="btn btn-amber">{t.add}</button>
      </div>

      {/* List */}
      <div className="card divide-y" style={{ borderColor: 'var(--line)' }}>
        {rows.map(r => (
          <div key={r.id} className="px-5 py-3.5 flex items-center gap-3 flex-wrap">
            <span className="font-bold flex-1 min-w-[160px]">{display(r)}</span>
            <span className="text-xs text-[#6E6C7B] hidden sm:inline">{r.slug}</span>
            <button onClick={() => togglePublish(r)}
              className="text-[11px] trk px-3 py-1.5 rounded-full border font-bold"
              style={{ color: r.status === 'published' ? '#1a7f37' : '#6E6C7B', borderColor: r.status === 'published' ? '#1a7f37' : 'var(--line)' }}>
              {r.status === 'published' ? t.live : r.status === 'archived' ? t.archived : t.draft}</button>
            <div className="flex gap-1">
              <button onClick={() => move(r, -1)} className="p-2 hover:bg-black/5 rounded" aria-label="Move up">↑</button>
              <button onClick={() => move(r, 1)} className="p-2 hover:bg-black/5 rounded" aria-label="Move down">↓</button>
              <button onClick={() => edit(r)} className="p-2 hover:bg-black/5 rounded text-sm">{t.edit}</button>
              <button onClick={() => duplicate(r)} className="p-2 hover:bg-black/5 rounded text-sm">{t.dup}</button>
              <button onClick={() => remove(r)} className="p-2 hover:bg-black/5 rounded text-sm text-red-600">{t.del}</button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="px-5 py-12 text-center text-sm text-[#6E6C7B]">—</div>}
      </div>

      {/* Editor drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end" onClick={() => setEditing(null)}>
          <div className="bg-white w-full max-w-xl h-full overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-extrabold text-lg">{editing.id ? t.edit : t.add} — {title}</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs trk" style={{
                  color: saved === 'saving' ? 'var(--amber)' : saved === 'saved' ? '#1a7f37' : saved === 'error' ? '#B0483A' : saved === 'dirty' ? '#B0483A' : '#6E6C7B' }}>
                  {saved === 'saving' ? 'SAVING…' : saved === 'saved' ? 'SAVED' : saved === 'error' ? 'ERROR' : saved === 'dirty' ? 'UNSAVED' : ''}</span>
                <button onClick={() => setEditing(null)} aria-label="Close" className="text-2xl leading-none">×</button>
              </div>
            </div>

            <div className="space-y-4">
              {fields.map(f => {
                if (f.type === 'langtext') return <LangField key={f.key} label={f.label} textarea value={langVal(editing, f.key)} onChange={v => setLang(f.key, v)} />;
                if (f.type === 'textarea') return (
                  <div key={f.key} className="field"><label>{f.label}</label>
                    <textarea rows={3} className={inputCls} value={editing[f.key] ?? ''} onChange={e => { setEditing({ ...editing, [f.key]: e.target.value }); touch(); }} /></div>);
                if (f.type === 'number') return (
                  <div key={f.key} className="field"><label>{f.label}</label>
                    <input type="number" className={inputCls} value={editing[f.key] ?? ''} onChange={e => { setEditing({ ...editing, [f.key]: e.target.value === '' ? null : Number(e.target.value) }); touch(); }} /></div>);
                if (f.type === 'bool') return (
                  <label key={f.key} className="flex items-center gap-3 text-sm font-bold cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-[#F9AE40]" checked={!!editing[f.key]} onChange={e => { setEditing({ ...editing, [f.key]: e.target.checked }); touch(); }} />
                    {f.label}</label>);
                if (f.type === 'select') return (
                  <div key={f.key} className="field"><label>{f.label}</label>
                    <select className={inputCls} value={editing[f.key] ?? ''} onChange={e => { setEditing({ ...editing, [f.key]: e.target.value }); touch(); }}>
                      <option value="">—</option>{f.options!.map(o => <option key={o} value={o}>{o}</option>)}</select></div>);
                if (f.type === 'media') {
                  const assetId = editing[f.key];
                  return (
                    <div key={f.key} className="field"><label>{f.label}</label>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setPickerFor(f.key)} className="btn btn-ghost !py-2 !px-4 text-xs">
                          {assetId ? t.selectMedia + ' ✓' : t.selectMedia}</button>
                        {assetId && <span className="text-xs text-[#6E6C7B] truncate max-w-[180px]">{assetId}</span>}
                        {assetId && <button type="button" className="text-xs text-red-600" onClick={() => { setEditing({ ...editing, [f.key]: null }); touch(); }}>Remove</button>}
                      </div></div>);
                }
                if (f.type === 'gallery') {
                  const ids: string[] = editing[f.key] ?? [];
                  return (
                    <div key={f.key} className="field"><label>{f.label} ({ids.length})</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {ids.map((id, i) => (
                          <span key={i} className="text-xs bg-black/5 rounded px-2 py-1 flex items-center gap-1">{String(id).slice(0, 8)}…
                            <button type="button" onClick={() => { const n = [...ids]; n.splice(i, 1); setEditing({ ...editing, [f.key]: n }); touch(); }} className="text-red-600">×</button>
                            {i > 0 && <button type="button" onClick={() => { const n = [...ids]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; setEditing({ ...editing, [f.key]: n }); touch(); }}>←</button>}
                          </span>))}
                      </div>
                      <button type="button" className="btn btn-ghost !py-2 !px-4 text-xs" onClick={() => setGalleryPick(true)}>+ Add from library</button>
                    </div>);
                }
                if (f.type === 'jsonlist') {
                  const arr: string[] = editing[f.key] ?? [];
                  return (
                    <div key={f.key} className="field"><label>{f.label} <span className="normal-case tracking-normal text-[#6E6C7B]">(one per line)</span></label>
                      <textarea rows={3} className={inputCls} value={arr.join('\n')}
                        onChange={e => { setEditing({ ...editing, [f.key]: e.target.value.split('\n').filter(Boolean) }); touch(); }} /></div>);
                }
                return (
                  <div key={f.key} className="field"><label>{f.label}{f.hint && <span className="ms-2 text-[#6E6C7B] normal-case tracking-normal">{f.hint}</span>}</label>
                    <input className={inputCls} value={editing[f.key] ?? ''} onChange={e => { setEditing({ ...editing, [f.key]: e.target.value }); touch(); }} /></div>);
              })}
            </div>

            <div className="sticky bottom-0 bg-white pt-5 pb-2 flex gap-3 mt-8 border-t" style={{ borderColor: 'var(--line)' }}>
              <button onClick={save} disabled={saved === 'saving'} className="btn btn-amber flex-1">{saved === 'saving' ? t.saving : editing.status === 'published' ? t.saved + ' · ' + t.save : t.save}</button>
              <button onClick={() => { setEditing({ ...editing, status: 'published' }); setTimeout(save, 0); }} className="btn btn-ghost">{t.publish}</button>
            </div>
          </div>
        </div>
      )}

      {pickerFor && (
        <MediaPicker onClose={() => setPickerFor(null)} onPick={(asset) => {
          setEditing((e: any) => ({ ...e, [pickerFor]: asset.id })); touch(); setPickerFor(null);
        }} />)}
      {galleryPick && (
        <MediaPicker onClose={() => setGalleryPick(false)} onPick={(asset) => {
          setEditing((e: any) => ({ ...e, [fields.find(f => f.type === 'gallery')!.key]: [...((e[fields.find(f => f.type === 'gallery')!.key]) ?? []), asset.id] }));
          touch(); setGalleryPick(false);
        }} />)}

      {/* Toasts */}
      <div className="fixed bottom-5 end-5 z-[60] space-y-2">
        {toasts.map(t => (
          <div key={t.id} className="px-4 py-3 rounded-xl shadow-lg text-sm text-white"
            style={{ background: t.kind === 'ok' ? '#1a7f37' : '#B0483A' }}>{t.msg}</div>))}
      </div>
    </div>
  );
}
