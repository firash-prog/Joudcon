"use client";
import { useEffect, useState } from 'react';
import { sbBrowser } from '@/lib/supabase-browser';
import Uploader from './Uploader';
import { useAdminLang } from '@/lib/admin-i18n';

const pub = (p: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${p}`;

// Modal: pick from Media Library or upload from device. Returns asset id.
export default function MediaPicker({ onPick, onClose }: { onPick: (asset: any) => void; onClose: () => void }) {
  const { t } = useAdminLang();
  const [items, setItems] = useState<any[]>([]); const [q, setQ] = useState('');
  const load = async () => {
    const { data } = await sbBrowser().from('media_with_usage').select('*').order('created_at', { ascending: false }).limit(100);
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => i.original_filename?.toLowerCase().includes(q.toLowerCase()) || i.path.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--line)' }}>
          <b>{t.selectMedia}</b>
          <div className="flex items-center gap-3">
            <Uploader bucket="media" accept="image/*,video/mp4,.pdf" onUploaded={() => load()} label={t.upl} />
            <button onClick={onClose} aria-label="Close" className="text-xl leading-none">×</button>
          </div>
        </div>
        <div className="p-4 border-b" style={{ borderColor: 'var(--line)' }}>
          <input placeholder={t.search} value={q} onChange={e => setQ(e.target.value)} className="w-full p-2.5 rounded-[10px] border-[1.5px]" />
        </div>
        <div className="p-4 grid grid-cols-3 sm:grid-cols-5 gap-3 overflow-y-auto">
          {filtered.map(m => (
            <button key={m.id} onClick={() => onPick(m)} className="card !rounded-lg overflow-hidden text-start">
              <div className="aspect-square bg-[#EFEEF3] flex items-center justify-center overflow-hidden">
                {m.mime?.startsWith('image/')
                  ? <img src={pub(m.path)} alt="" className="w-full h-full object-cover" loading="lazy" />
                  : <span className="text-xs text-[#6E6C7B]">{m.mime?.split('/')[1] ?? 'file'}</span>}
              </div>
              <div className="p-2 text-[10px] truncate">{m.original_filename}</div>
            </button>
          ))}
          {filtered.length === 0 && <div className="col-span-full text-center text-sm text-[#6E6C7B] py-10">{t.noMedia}</div>}
        </div>
      </div>
    </div>
  );
}
