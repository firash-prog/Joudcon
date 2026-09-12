import Link from 'next/link';
export default function Footer({ lang, settings, branding, pages, logo }: any) {
  const s = settings ?? {};
  return (
    <footer style={{ background: 'var(--ink)', color: '#C9C7D6' }} className="py-14 mt-0">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-sm">
        <div>
          {logo ? <img src={logo} alt="Joudcon" className="h-7 mb-4" /> :
            <b className="tracking-[.3em] text-[#F5F4F8]">JOUDCON</b>}
          <p className="mt-3 max-w-xs">{lang === 'ar' ? 'كل تجربة لها هوية فريدة. نحن نصنعها.' : 'Every experience has a unique identity. We create it.'}</p>
        </div>
        <div>
          <div className="trk mb-4" style={{ color: 'var(--amber)' }}>{lang === 'ar' ? 'روابط' : 'Navigate'}</div>
          {(pages as any[]).map(p => (
            <Link key={p.key} href={`/${lang}${p.key === 'home' ? '' : '/' + p.key}`} className="block py-1 hover:text-white">
              {lang === 'ar' ? p.title_ar : p.title_en}</Link>
          ))}
        </div>
        <div>
          <div className="trk mb-4" style={{ color: 'var(--amber)' }}>{lang === 'ar' ? 'تواصل' : 'Contact'}</div>
          <p>{lang === 'ar' ? s.address_ar : s.address_en}</p>
          <p className="mt-2">{(s.emails ?? []).join(' · ')}</p>
          <p className="mt-2">{lang === 'ar' ? s.hours_ar : s.hours_en}</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 mt-10 pt-6 text-xs" style={{ borderTop: '1px solid #33323E' }}>
        © {new Date().getFullYear()} {s.company_en ?? 'Joudcon'}. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
      </div>
    </footer>
  );
}
