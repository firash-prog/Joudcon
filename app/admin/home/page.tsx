"use client";
import { useEffect, useState } from 'react';
import { sbBrowser } from '@/lib/supabase-browser';
import LangField from '@/components/admin/LangField';
import MediaPicker from '@/components/admin/MediaPicker';
import { useAdminLang } from '@/lib/admin-i18n';

const pub = (p: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${p}`;
const inp = 'w-full p-3 rounded-[10px] border-[1.5px] bg-white';

// Structured editor for the home page's hero / about / CTA sections (page_sections rows).
export default function HomeEditor() {
  const sb = sbBrowser();
  const { t } = useAdminLang();
  const [ids, setIds] = useState<any>({});
  const [hero, setHero] = useState<any>({});
  const [about, setAbout] = useState<any>({});
  const [cta, setCta] = useState<any>({});
  const [heroImgPrev, setHeroImgPrev] = useState('');
  const [picker, setPicker] = useState(false);
  const [saved, setSaved] = useState<any>({});

  useEffect(() => { load(); }, []);
  async function load() {
    const { data: home } = await sb.from('pages').select('id').eq('key', 'home').single();
    if (!home) return;
    const { data: secs } = await sb.from('page_sections').select('*').eq('page_id', home.id);
    const map: any = {}, idMap: any = {};
    (secs ?? []).forEach((s: any) => { map[s.section_key] = s.data; idMap[s.section_key] = s.id; });
    setHero(map.hero ?? {}); setAbout(map.about ?? { milestones: [] }); setCta(map.cta ?? {}); setIds(idMap);
    if (map.hero?.image_asset) {
      const { data: ma } = await sb.from('media_assets').select('path').eq('id', map.hero.image_asset).single();
      setHeroImgPrev(ma?.path ?? '');
    }
  }

  async function save(key: string, data: any) {
    setSaved((s: any) => ({ ...s, [key]: 'saving' }));
    const { error } = await sb.from('page_sections').update({ data }).eq('id', ids[key]);
    setSaved((s: any) => ({ ...s, [key]: error ? 'error' : 'saved' }));
    setTimeout(() => setSaved((s: any) => ({ ...s, [key]: '' })), 2500);
  }

  const setL = (setter: any, obj: any, key: string) => (v: { en?: string; ar?: string }) =>
    setter({ ...obj, [`${key}_en`]: v.en, [`${key}_ar`]: v.ar });

  const ms = about.milestones ?? [];
  const setMs = (next: any[]) => setAbout({ ...about, milestones: next });

  const SaveBtn = ({ k }: { k: string }) => (
    <button onClick={() => save(k, k === 'hero' ? hero : k === 'about' ? about : cta)} className="btn btn-amber" disabled={saved[k] === 'saving'}>
      {saved[k] === 'saving' ? t.saving : saved[k] === 'saved' ? t.saved : saved[k] === 'error' ? t.error : t.saveSection}</button>);

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-extrabold">{t.homeTitle}</h1>
      <p className="text-sm text-[#6E6C7B] -mt-6 mb-8">{t.homeDesc}</p>

      {/* HERO */}
      <div className="card p-6">
        <h2 className="font-bold mb-5">{t.hero}</h2>
        <div className="space-y-4">
          <LangField label={t.kicker} value={{ en: hero.kicker_en, ar: hero.kicker_ar }} onChange={setL(setHero, hero, 'kicker')} />
          <LangField label={t.headline} value={{ en: hero.headline_en, ar: hero.headline_ar }} onChange={setL(setHero, hero, 'headline')} />
          <LangField label={t.supporting} textarea value={{ en: hero.sub_en, ar: hero.sub_ar }} onChange={setL(setHero, hero, 'sub')} />
          <div className="field"><label>{t.bgImage}</label>
            <div className="flex items-center gap-3 flex-wrap">
              <button type="button" onClick={() => setPicker(true)} className="btn btn-ghost !py-2 !px-4 text-xs">
                {hero.image_asset ? t.changeImage : t.selectImage}</button>
              {heroImgPrev && <img src={pub(heroImgPrev)} alt="" className="h-12 rounded-lg object-cover" />}
              {hero.image_asset && <button type="button" className="text-xs text-red-600"
                onClick={() => { setHero({ ...hero, image_asset: null }); setHeroImgPrev(''); }}>{t.remove}</button>}
            </div></div>
          <div className="field"><label>{t.bgVideo}</label>
            <input className={inp} value={hero.video_path ?? ''} onChange={e => setHero({ ...hero, video_path: e.target.value })} /></div>
          <label className="flex items-center gap-3 text-sm font-bold cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-[#F9AE40]" checked={hero.motion_enabled !== false}
              onChange={e => setHero({ ...hero, motion_enabled: e.target.checked })} />
            {t.motion}</label>
          <div className="grid sm:grid-cols-2 gap-4">
            <LangField label={t.primaryBtn} value={{ en: hero.cta1_en, ar: hero.cta1_ar }} onChange={setL(setHero, hero, 'cta1')} />
            <div className="field"><label>{t.primaryUrl}</label>
              <input className={inp} value={hero.cta1_url ?? ''} onChange={e => setHero({ ...hero, cta1_url: e.target.value })} /></div>
            <LangField label={t.secondaryBtn} value={{ en: hero.cta2_en, ar: hero.cta2_ar }} onChange={setL(setHero, hero, 'cta2')} />
            <div className="field"><label>{t.secondaryUrl}</label>
              <input className={inp} value={hero.cta2_url ?? ''} onChange={e => setHero({ ...hero, cta2_url: e.target.value })} /></div>
          </div>
        </div>
        <div className="mt-6"><SaveBtn k="hero" /></div>
      </div>

      {/* ABOUT / TIMELINE */}
      <div className="card p-6">
        <h2 className="font-bold mb-5">{t.aboutSec}</h2>
        <div className="space-y-4">
          <LangField label={t.sectionTitle} value={{ en: about.title_en, ar: about.title_ar }} onChange={setL(setAbout, about, 'title')} />
          <LangField label={t.sectionBody} textarea value={{ en: about.body_en, ar: about.body_ar }} onChange={setL(setAbout, about, 'body')} />
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs trk text-[#6E6C7B]">{t.milestones} ({ms.length})</label>
              <button type="button" className="btn btn-ghost !py-1.5 !px-3 text-xs"
                onClick={() => setMs([...ms, { year: String(new Date().getFullYear()), title_en: '', title_ar: '', body_en: '', body_ar: '' }])}>
                {t.addMilestone}</button>
            </div>
            {ms.map((m: any, i: number) => (
              <div key={i} className="border rounded-xl p-4 mb-3 space-y-3" style={{ borderColor: 'var(--line)' }}>
                <div className="flex items-center gap-3">
                  <input className={`${inp} !w-28`} value={m.year ?? ''} placeholder={t.year}
                    onChange={e => { const n = [...ms]; n[i] = { ...m, year: e.target.value }; setMs(n); }} />
                  <span className="text-xs text-[#6E6C7B] flex-1">#{i + 1}</span>
                  <button type="button" className="text-red-600 text-xs"
                    onClick={() => setMs(ms.filter((_: any, j: number) => j !== i))}>{t.remove}</button>
                </div>
                <LangField label={t.msTitle} value={{ en: m.title_en, ar: m.title_ar }}
                  onChange={v => { const n = [...ms]; n[i] = { ...m, title_en: v.en, title_ar: v.ar }; setMs(n); }} />
                <LangField label={t.msDesc} textarea value={{ en: m.body_en, ar: m.body_ar }}
                  onChange={v => { const n = [...ms]; n[i] = { ...m, body_en: v.en, body_ar: v.ar }; setMs(n); }} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6"><SaveBtn k="about" /></div>
      </div>

      {/* CTA */}
      <div className="card p-6">
        <h2 className="font-bold mb-5">{t.ctaSec}</h2>
        <div className="space-y-4">
          <LangField label={t.ctaTitle} value={{ en: cta.title_en, ar: cta.title_ar }} onChange={setL(setCta, cta, 'title')} />
          <LangField label={t.ctaBody} value={{ en: cta.body_en, ar: cta.body_ar }} onChange={setL(setCta, cta, 'body')} />
          <LangField label={t.ctaButton} value={{ en: cta.button_en, ar: cta.button_ar }} onChange={setL(setCta, cta, 'button')} />
          <div className="field"><label>{t.ctaUrl}</label>
            <input className={inp} value={cta.url ?? ''} onChange={e => setCta({ ...cta, url: e.target.value })} /></div>
        </div>
        <div className="mt-6"><SaveBtn k="cta" /></div>
      </div>

      {picker && (
        <MediaPicker onClose={() => setPicker(false)} onPick={(asset) => {
          setHero({ ...hero, image_asset: asset.id }); setHeroImgPrev(asset.path); setPicker(false);
        }} />)}
    </div>
  );
}
