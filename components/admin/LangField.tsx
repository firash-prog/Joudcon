"use client";
import { useState } from 'react';

// Bilingual EN | العربية editor pair. Values stored as { en, ar } object.
export default function LangField({ label, value, onChange, textarea }: {
  label: string; value: { en?: string; ar?: string }; onChange: (v: { en?: string; ar?: string }) => void; textarea?: boolean;
}) {
  const [tab, setTab] = useState<'en' | 'ar'>('en');
  const cls = 'w-full p-3 rounded-[10px] border-[1.5px] bg-white';
  return (
    <div className="field">
      <div className="flex items-center justify-between mb-1.5">
        <label className="!mb-0">{label}</label>
        <div className="flex rounded-lg overflow-hidden border text-xs" style={{ borderColor: 'var(--line)' }}>
          {[['en', 'ENGLISH'], ['ar', 'العربية']].map(([k, lbl]) => (
            <button key={k} type="button" onClick={() => setTab(k as any)}
              className="px-3 py-1.5 font-bold"
              style={{ background: tab === k ? 'var(--amber)' : '#fff', color: tab === k ? 'var(--ink)' : '#6E6C7B' }}>
              {lbl}</button>
          ))}
        </div>
      </div>
      {textarea
        ? <textarea dir={tab === 'ar' ? 'rtl' : 'ltr'} rows={4} className={cls} value={value?.[tab] ?? ''} onChange={e => onChange({ ...value, [tab]: e.target.value })} />
        : <input dir={tab === 'ar' ? 'rtl' : 'ltr'} className={cls} value={value?.[tab] ?? ''} onChange={e => onChange({ ...value, [tab]: e.target.value })} />}
    </div>
  );
}
