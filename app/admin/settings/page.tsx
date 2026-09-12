"use client";
import { useEffect, useState } from 'react';
import { sbBrowser } from '@/lib/supabase-browser';
import LangField from '@/components/admin/LangField';
import { useAdminLang } from '@/lib/admin-i18n';

export default function SettingsAdmin() {
  const sb = sbBrowser();
  const [s, setS] = useState<any>({}); const [msg, setMsg] = useState('');
  const { t } = useAdminLang();
  useEffect(() => { sb.from('site_settings').select('*').eq('id', 1).single().then(({ data }) => setS(data ?? {})); }, []);
  const save = async () => {
    const { error } = await sb.from('site_settings').upsert({ ...s, id: 1 });
    setMsg(error ? error.message : t.saved); setTimeout(() => setMsg(''), 2500);
  };
  const list = (v: any) => (v ?? []).join(', ');
  const arr = (v: string) => v.split(',').map(x => x.trim()).filter(Boolean);
  const inp = 'w-full p-3 rounded-[10px] border-[1.5px] bg-white';

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold mb-6">{t.settings}</h1>
      <div className="space-y-4">
        <LangField label={t.company} value={{ en: s.company_en, ar: s.company_ar }} onChange={v => setS({ ...s, company_en: v.en, company_ar: v.ar })} />
        <LangField label={t.address} value={{ en: s.address_en, ar: s.address_ar }} onChange={v => setS({ ...s, address_en: v.en, address_ar: v.ar })} />
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="field"><label>{t.emailsLbl}</label>
            <input className={inp} value={list(s.emails)} onChange={e => setS({ ...s, emails: arr(e.target.value) })} /></div>
          <div className="field"><label>{t.phonesLbl}</label>
            <input className={inp} value={list(s.phones)} onChange={e => setS({ ...s, phones: arr(e.target.value) })} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="field"><label>{t.whatsapp}</label>
            <input className={inp} value={s.whatsapp ?? ''} onChange={e => setS({ ...s, whatsapp: e.target.value })} /></div>
          <div className="field"><label>{t.mapsLbl}</label>
            <input className={inp} value={s.maps_url ?? ''} onChange={e => setS({ ...s, maps_url: e.target.value })} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="field"><label>{t.hoursEnLbl}</label>
            <input className={inp} value={s.hours_en ?? ''} onChange={e => setS({ ...s, hours_en: e.target.value })} /></div>
          <div className="field"><label>{t.hoursArLbl}</label>
            <input dir="rtl" className={inp} value={s.hours_ar ?? ''} onChange={e => setS({ ...s, hours_ar: e.target.value })} /></div>
        </div>
        <div className="field"><label>{t.socialLbl}</label>
          <textarea rows={3} className={inp} value={typeof s.social === 'object' ? JSON.stringify(s.social) : '{}'}
            onChange={e => { try { setS({ ...s, social: JSON.parse(e.target.value) }); } catch { setS({ ...s, social: e.target.value }); } }} /></div>
      </div>
      <div className="mt-8 flex items-center gap-4">
        <button onClick={save} className="btn btn-amber">{t.saveSettings}</button>
        {msg && <span className="text-sm text-[#1a7f37]">{msg}</span>}
      </div>
    </div>
  );
}
