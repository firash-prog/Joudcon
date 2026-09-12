"use client";
import { useState } from 'react';
import { sbBrowser } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { useAdminLang } from '@/lib/admin-i18n';

export default function Login() {
  const { lang, set, t } = useAdminLang();
  const [email, setEmail] = useState(''); const [pw, setPw] = useState('');
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const { error } = await sbBrowser().auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) setErr(t.invalidCred);
    else { router.replace('/admin'); router.refresh(); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--ink)' }}
      dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
      <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 1200 900" fill="none" aria-hidden="true">
        <rect width="1200" height="900" fill="#22212B"/>
        <g stroke="#AEACBF" strokeOpacity=".12" strokeWidth="1.5">
          <path d="M900,420 A80,80 0 1 1 980,500"/><path d="M900,360 A140,140 0 1 1 1040,500"/>
          <path d="M900,300 A200,200 0 1 1 1100,500"/><path d="M900,240 A260,260 0 1 1 1160,500"/>
          <path d="M900,180 A320,320 0 1 1 1220,500"/>
        </g>
        <path d="M380,445 A320,320 0 0 1 640,185" stroke="#F9AE40" strokeOpacity=".5" strokeWidth="2"/>
      </svg>
      <form onSubmit={submit} className="relative bg-white rounded-2xl shadow-2xl p-10 w-[380px]">
        <div className="text-center mb-8">
          <div className="font-extrabold tracking-[.35em] text-xl">JOUDCON</div>
          <div className="trk text-xs text-[#6E6C7B] mt-1">{t.contentMgmt}</div>
        </div>
        <label className="field block mb-4"><span className="text-xs trk text-[#6E6C7B]">{t.email}</span>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1" autoComplete="username" /></label>
        <label className="field block mb-6"><span className="text-xs trk text-[#6E6C7B]">{t.password}</span>
          <input type="password" required value={pw} onChange={e => setPw(e.target.value)} className="mt-1" autoComplete="current-password" /></label>
        <button className="btn btn-amber w-full" disabled={busy}>{busy ? '…' : t.signin}</button>
        {err && <p className="text-red-600 text-sm mt-4 text-center">{err}</p>}
        <div className="text-center mt-5">
          <button type="button" onClick={() => set(lang === 'ar' ? 'en' : 'ar')} className="text-xs text-[#6E6C7B] hover:underline">{t.langBtn}</button>
        </div>
      </form>
    </div>
  );
}
