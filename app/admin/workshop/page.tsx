"use client";
import { useEffect, useState } from 'react';
import { sbBrowser } from '@/lib/supabase-browser';
import LangField from '@/components/admin/LangField';
import MediaPicker from '@/components/admin/MediaPicker';
import { useAdminLang } from '@/lib/admin-i18n';

const pub = (p: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${p}`;
const inp = 'w-full p-3 rounded-[10px] border-[1.5px] bg-white';

export default function WorkshopAdmin() {
  const sb = sbBrowser();
  const { t } = useAdminLang();
  const [w, setW] = useState<any>({ capabilities: [] });
  const [heroPrev, setHeroPrev] = useState('');
  const [picker, setPicker] = useState(false);
  const [saved, setSaved] = useState('');

  useEffect(() => {
    sb.from('workshop').select('*, hero_asset:media_assets!hero(path)').eq('id', 1).single()
      .then(({ data }) => { if (data) { setW(data); setHeroPrev(data.hero_asset?.path ?? ''); } });
  }, []);

  const save = async () => {
    setSaved('saving');
    const { hero_asset, hero_path, ...rest } = w; // strip join artifacts
    const { error } = await sb.from('workshop').upsert({ ...rest, id: 1 });
    setSaved(error ? 'error' : 'saved');
    setTimeout(() => setSaved(''), 2500);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold mb-2">{t.workshop}</h1>
      <p className="text-sm text-[#6E6C7B] mb-8">{t.wsDesc}</p>
      <div className="card p-6 space-y-4">
        <LangField label={t.title} value={{ en: w.title_en, ar: w.title_ar }}
          onChange={v => setW({ ...w, title_en: v.en, title_ar: v.ar })} />
        <LangField label={t.description} textarea value={{ en: w.description_en, ar: w.description_ar }}
          onChange={v => setW({ ...w, description_en: v.en, description_ar: v.ar })} />
        <div className="field"><label>{t.capabilities} <span className="normal-case tracking-normal text-[#6E6C7B]">{t.onePerLine}</span></label>
          <textarea rows={5} className={inp} value={(w.capabilities ?? []).join('\n')}
            onChange={e => setW({ ...w, capabilities: e.target.value.split('\n').filter(Boolean) })} /></div>
        <div className="field"><label>{t.heroImage}</label>
          <div className="flex items-center gap-3 flex-wrap">
            <button type="button" onClick={() => setPicker(true)} className="btn btn-ghost !py-2 !px-4 text-xs">
              {w.hero ? t.changeImage : t.selectImage}</button>
            {heroPrev && <img src={pub(heroPrev)} alt="" className="h-12 rounded-lg object-cover" />}
            {w.hero && <button type="button" className="text-xs text-red-600" onClick={() => { setW({ ...w, hero: null }); setHeroPrev(''); }}>{t.remove}</button>}
          </div></div>
        <LangField label={t.ctaLabel} value={{ en: w.cta_en, ar: w.cta_ar }}
          onChange={v => setW({ ...w, cta_en: v.en, cta_ar: v.ar })} />
        <div className="field"><label>{t.status}</label>
          <select className={inp} value={w.status ?? 'draft'} onChange={e => setW({ ...w, status: e.target.value })}>
            <option value="draft">{t.optDraft}</option><option value="published">{t.optPublished}</option><option value="archived">{t.optArchived}</option>
          </select></div>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button onClick={save} className="btn btn-amber" disabled={saved === 'saving'}>
          {saved === 'saving' ? t.saving : saved === 'saved' ? t.saved : saved === 'error' ? t.error : t.saveWs}</button>
        {saved === 'saved' && <a href="/en/workshop" target="_blank" className="text-sm text-[#1f6feb] hover:underline">{t.viewPage}</a>}
      </div>
      {picker && (
        <MediaPicker onClose={() => setPicker(false)} onPick={(asset) => {
          setW({ ...w, hero: asset.id }); setHeroPrev(asset.path); setPicker(false);
        }} />)}
    </div>
  );
}
