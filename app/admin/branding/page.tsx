"use client";
import { useEffect, useState } from 'react';
import { sbBrowser } from '@/lib/supabase-browser';
import Uploader from '@/components/admin/Uploader';
import { useAdminLang } from '@/lib/admin-i18n';

const SLOTS = [
  ['primary_logo_path', 'slotPrimary'],
  ['dark_logo_path', 'slotDark'],
  ['light_logo_path', 'slotLight'],
  ['favicon_path', 'slotFav'],
  ['social_image_path', 'slotOg'],
  ['footer_logo_path', 'slotFooter'],
] as const;
const pub = (p: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/branding/${p}`;

export default function BrandingAdmin() {
  const sb = sbBrowser();
  const [row, setRow] = useState<any>({}); const [saved, setSaved] = useState('');
  const { t } = useAdminLang();
  useEffect(() => { sb.from('branding_settings').select('*').eq('id', 1).single().then(({ data }) => setRow(data ?? {})); }, []);

  const save = async () => {
    setSaved('saving');
    const { data: { user } } = await sb.auth.getUser();
    const { error } = await sb.from('branding_settings').upsert({ ...row, id: 1, updated_by: user?.id });
    setSaved(error ? 'error' : 'saved');
    setTimeout(() => setSaved(''), 2500);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold mb-2">{t.branding}</h1>
      <p className="text-sm text-[#6E6C7B] mb-8">{t.brandingDesc}</p>
      <div className="grid sm:grid-cols-2 gap-5 mb-8">
        {SLOTS.map(([key, label]) => (
          <div key={key} className="card p-5">
            <div className="font-bold text-sm mb-3">{t[label]}</div>
            <div className="h-24 rounded-xl bg-[var(--paper)] border flex items-center justify-center mb-3 overflow-hidden"
              style={{ borderColor: 'var(--line)', background: key === 'dark_logo_path' ? 'var(--ink)' : 'var(--paper)' }}>
              {row[key] ? <img src={pub(row[key])} alt="" className="max-h-16 max-w-[85%] object-contain" /> :
                <span className="text-xs text-[#6E6C7B]">{t.noFile}</span>}
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <Uploader bucket="branding" accept="image/png,image/jpeg,image/webp"
                label={row[key] ? t.replace : t.upl} onUploaded={(path) => setRow({ ...row, [key]: path })} />
              {row[key] && <button className="text-xs text-red-600" onClick={() => setRow({ ...row, [key]: null })}>{t.remove}</button>}
            </div>
          </div>
        ))}
      </div>
      <button onClick={save} className="btn btn-amber" disabled={saved === 'saving'}>
        {saved === 'saving' ? t.saving : saved === 'saved' ? t.saved : saved === 'error' ? t.error : t.saveBranding}</button>
    </div>
  );
}
