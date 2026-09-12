"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header({ lang, other, pages, logo }: any) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    fn(); window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  const nav: Record<string, string> = { home: lang === 'ar' ? 'الرئيسية' : 'Home', services: lang === 'ar' ? 'خدماتنا' : 'Services', projects: lang === 'ar' ? 'مشاريعنا' : 'Projects', workshop: lang === 'ar' ? 'الورشة' : 'Workshop', contact: lang === 'ar' ? 'اتصل بنا' : 'Contact' };
  return (
    <header className="fixed top-0 inset-x-0 z-50 transition-all"
      style={{ background: scrolled ? 'rgba(250,250,252,.88)' : 'transparent', backdropFilter: scrolled ? 'blur(12px)' : 'none', boxShadow: scrolled ? '0 1px 0 var(--line)' : 'none', padding: scrolled ? '10px 0' : '18px 0' }}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <Link href={`/${lang}`}>{logo
          ? <img src={logo} alt="Joudcon" className="h-8" />
          : <span className="font-bold tracking-[.3em] text-lg" style={{ color: scrolled ? 'var(--ink)' : '#fff' }}>JOUDCON</span>}
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          {(pages as any[]).filter(p => nav[p.key]).map(p => (
            <Link key={p.key} href={`/${lang}${p.key === 'home' ? '' : '/' + p.key}`}
              className="navlink" style={{ color: scrolled ? 'var(--ink)' : '#fff' }}>{nav[p.key]}</Link>
          ))}
          <Link href={`/${other}`} className="navlink" style={{ color: 'var(--amber)' }}>
            {other === 'ar' ? 'العربية' : 'EN'}</Link>
          <Link href={`/${lang}/contact`} className="btn btn-amber">{lang === 'ar' ? 'ابدأ مشروعك' : 'Start a Project'}</Link>
        </nav>
      </div>
    </header>
  );
}
