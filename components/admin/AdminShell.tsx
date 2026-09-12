"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { sbBrowser } from '@/lib/supabase-browser';
import { useAdminLang } from '@/lib/admin-i18n';

const MENU: [keyof import('@/lib/admin-i18n').AdminDict, string][] = [
  ['dashboard', '/admin'],
  ['home', '/admin/home'],
  ['projects', '/admin/projects'],
  ['services', '/admin/services'],
  ['media', '/admin/media'],
  ['clients', '/admin/clients'],
  ['testimonials', '/admin/testimonials'],
  ['statistics', '/admin/statistics'],
  ['process', '/admin/process'],
  ['workshop', '/admin/workshop'],
  ['leads', '/admin/leads'],
  ['branding', '/admin/branding'],
  ['settings', '/admin/settings'],
];

export default function AdminShell({ user, children }: any) {
  const pathname = usePathname(); const router = useRouter();
  const [open, setOpen] = useState(false);
  const { lang, set, t } = useAdminLang();
  async function logout() { await sbBrowser().auth.signOut(); router.replace('/admin/login'); router.refresh(); }

  const LangToggle = () => (
    <button onClick={() => set(lang === 'ar' ? 'en' : 'ar')}
      className="px-3 py-1.5 rounded-full border text-xs font-bold"
      style={{ borderColor: 'var(--line)' }} aria-label="Switch language">
      {t.langBtn}
    </button>
  );

  const Nav = () => (
    <nav className="flex flex-col gap-1">
      {MENU.map(([key, href]) => {
        const active = href === '/admin' ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} onClick={() => setOpen(false)}
            className={`relative px-4 py-2.5 rounded-lg text-sm transition ${active ? 'bg-[#F9AE40]/15 font-bold' : 'hover:bg-black/5'}`}
            style={{ color: active ? 'var(--amber)' : 'inherit' }}>
            {active && <span className="absolute start-0 top-2 bottom-2 w-1 rounded-full" style={{ background: 'var(--amber)' }} />}
            <span className="ms-2">{t[key]}</span>
          </Link>
        );
      })}
    </nav>
  );

  // dir="rtl" on the shared wrapper mirrors the flex order (sidebar moves to the
  // right) and flips every logical utility (start/end, ms/me, text-start…).
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--paper)' }} dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
      <aside className="hidden lg:flex w-60 flex-col border-e bg-white p-4" style={{ borderColor: 'var(--line)' }}>
        <div className="px-3 py-4 mb-2 flex items-center justify-between">
          <div>
            <div className="font-extrabold tracking-[.3em]">JOUDCON</div>
            <div className="trk text-[10px] text-[#6E6C7B]">{t.adminCms}</div>
          </div>
          <LangToggle />
        </div>
        <Nav />
        <div className="mt-auto pt-4 border-t text-sm" style={{ borderColor: 'var(--line)' }}>
          <div className="px-3 text-xs text-[#6E6C7B] truncate">{user?.name ?? user?.email}</div>
          <div className="px-3 text-[10px] trk text-[#6E6C7B]">{user?.role}</div>
          <button onClick={logout} className="mt-3 w-full text-start px-3 py-2 rounded-lg hover:bg-black/5 text-sm">{t.signout}</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden flex items-center justify-between p-3 bg-white border-b" style={{ borderColor: 'var(--line)' }}>
          <button onClick={() => setOpen(!open)} aria-label="Menu" className="p-2">☰</button>
          <b className="tracking-[.3em]">JOUDCON</b>
          <div className="flex items-center gap-2">
            <LangToggle />
            <button onClick={logout} className="text-sm text-[#6E6C7B]">{t.signout}</button>
          </div>
        </div>
        {open && <div className="lg:hidden bg-white border-b p-3" style={{ borderColor: 'var(--line)' }}><Nav /></div>}
        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
