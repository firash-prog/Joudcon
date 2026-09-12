import { supabasePublic, mediaUrl, rawMediaUrl } from '@/lib/supabase';
import { t, Lang } from '@/lib/types';
import { Contours, ProcessPath } from '@/components/site/Motifs';
import ContactForm from '@/components/site/ContactForm';
import Link from 'next/link';

export const revalidate = 60; // ISR: publish → live within 60s, no stale cache

export default async function Home({ params }: { params: { lang: string } }) {
  const lang = (params.lang === 'ar' ? 'ar' : 'en') as Lang;
  const sb = supabasePublic();
  const [home, sections, services, projects, stages, stats, clients] = await Promise.all([
    sb.from('pages').select('id').eq('key', 'home').single(),
    sb.from('page_sections').select('*'),
    sb.from('services').select('*').eq('status', 'published').order('sort_order'),
    // BUGFIX: join featured_image UUID → media_assets.path so cards render real images
    sb.from('projects').select('*, fi:media_assets!featured_image(path)').eq('status', 'published').order('sort_order'),
    sb.from('process_stages').select('*').eq('is_visible', true).order('sort_order'),
    sb.from('statistics').select('*').eq('is_visible', true).order('sort_order'),
    sb.from('clients').select('*').eq('is_visible', true).order('sort_order'),
  ]);
  const sec = (k: string) => sections.data?.find(s => s.page_id === home.data?.id && s.section_key === k)?.data ?? {};
  const hero = sec('hero'), about = sec('about'), cta = sec('cta');

  // Resolve hero media (stored as asset UUIDs / storage paths) → real URLs
  let heroImgPath: string | null = null;
  if (hero.image_asset) {
    const { data: ma } = await sb.from('media_assets').select('path').eq('id', hero.image_asset).single();
    heroImgPath = ma?.path ?? null;
  }

  return (<>
    {/* HERO */}
    <section className="min-h-[92vh] flex items-center relative overflow-hidden" style={{ background: 'var(--ink)', color: '#F5F4F8' }}>
      {hero.video_path
        ? <video className="absolute inset-0 w-full h-full object-cover opacity-40" src={rawMediaUrl('media', hero.video_path) ?? undefined}
            poster={heroImgPath ? (mediaUrl(heroImgPath, 1600) ?? undefined) : undefined}
            autoPlay={hero.motion_enabled !== false} muted loop playsInline />
        : heroImgPath && <img src={mediaUrl(heroImgPath, 1920) ?? undefined} alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40" />}
      <Contours className="absolute pointer-events-none" />
      <div className="max-w-6xl mx-auto px-6 relative py-32">
        <div className="kicker">{lang === 'ar' ? hero.kicker_ar : hero.kicker_en}</div>
        <h1 className="font-extrabold leading-[1.05]" style={{ fontSize: 'clamp(34px,6vw,72px)' }}>
          {lang === 'ar' ? hero.headline_ar : hero.headline_en}</h1>
        <p className="max-w-xl my-6 text-[#C9C7D6]">{lang === 'ar' ? hero.sub_ar : hero.sub_en}</p>
        <div className="flex gap-4 flex-wrap">
          <Link href={hero.cta1_url ?? '#contact'} className="btn btn-amber">{lang === 'ar' ? hero.cta1_ar : hero.cta1_en} →</Link>
          <Link href={hero.cta2_url ?? '#projects'} className="btn btn-ghost">{lang === 'ar' ? hero.cta2_ar : hero.cta2_en}</Link>
        </div>
      </div>
    </section>

    {/* ABOUT / TIMELINE */}
    <section className="py-24" id="about">
      <div className="max-w-6xl mx-auto px-6">
        <div className="kicker">{lang === 'ar' ? 'من نحن' : 'Who we are'}</div>
        <h2 className="text-4xl font-extrabold mb-4">{lang === 'ar' ? about.title_ar : about.title_en}</h2>
        <p className="text-[#6E6C7B] max-w-2xl mb-14">{lang === 'ar' ? about.body_ar : about.body_en}</p>
        <div className="grid md:grid-cols-3 gap-6">
          {(about.milestones ?? []).map((m: any) => (
            <div key={m.year} className="card p-7">
              <div className="text-3xl font-extrabold" style={{ color: 'var(--amber)' }}>{m.year}</div>
              <h3 className="font-bold mt-2 mb-1">{lang === 'ar' ? m.title_ar : m.title_en}</h3>
              <p className="text-sm text-[#6E6C7B]">{lang === 'ar' ? m.body_ar : m.body_en}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* SERVICES */}
    <section className="py-24" id="services" style={{ background: '#fff', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="kicker">{lang === 'ar' ? 'ماذا نقدم' : 'What we do'}</div>
        <h2 className="text-4xl font-extrabold mb-14">{lang === 'ar' ? 'خدماتنا' : 'Our services'}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {(services.data ?? []).map(s => (
            <Link key={s.id} href={`/${lang}/services/${s.slug}`} className="card p-7 block no-underline" style={{ color: 'inherit' }}>
              <h3 className="font-bold text-lg mb-2">{t(s, 'name', lang)}</h3>
              <p className="text-sm text-[#6E6C7B]">{t(s, 'short', lang)}</p>
              <div className="trk text-xs mt-5" style={{ color: 'var(--amber)' }}>{lang === 'ar' ? 'اكتشف ←' : 'Explore →'}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* FEATURED PROJECTS */}
    <section className="py-24" id="projects">
      <div className="max-w-6xl mx-auto px-6">
        <div className="kicker">{lang === 'ar' ? 'أعمالنا' : 'Our work'}</div>
        <h2 className="text-4xl font-extrabold mb-14">{lang === 'ar' ? 'مشاريع مميزة' : 'Featured projects'}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {(projects.data ?? []).filter((p: any) => p.is_featured).map(p => (
            <Link key={p.id} href={`/${lang}/projects/${p.slug}`} className="card block no-underline" style={{ color: 'inherit' }}>
              <div className="aspect-[16/9] bg-[#EFEEF3] overflow-hidden">
                {p.fi?.path && <img src={mediaUrl(p.fi.path, 900) ?? undefined} alt=""
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]" />}
              </div>
              <div className="p-6">
                <div className="trk text-xs text-[#6E6C7B]">{p.category} · {p.client} · {p.year}</div>
                <h3 className="font-bold text-lg mt-2">{t(p, 'name', lang)}</h3>
                <p className="text-sm text-[#6E6C7B] mt-1">{t(p, 'summary', lang)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* STATS */}
    {(stats.data ?? []).length > 0 && (
      <section className="py-16" style={{ background: 'var(--ink)', color: '#F5F4F8' }}>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.data!.map(s => (
            <div key={s.id}>
              <div className="text-4xl font-extrabold" style={{ color: 'var(--amber)' }}>{s.value}{s.suffix}</div>
              <div className="trk text-xs mt-2 text-[#C9C7D6]">{t(s, 'label', lang)}</div>
            </div>
          ))}
        </div>
      </section>
    )}

    {/* PROCESS */}
    <section className="py-24" style={{ background: '#fff', borderTop: '1px solid var(--line)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="kicker">{lang === 'ar' ? 'كيف نعمل' : 'How we work'}</div>
        <h2 className="text-4xl font-extrabold mb-14">{lang === 'ar' ? 'من الفكرة إلى التجربة' : 'Idea to experience'}</h2>
        <ProcessPath stages={(stages.data ?? []).map(s => ({ name: t(s, 'name', lang) }))} />
      </div>
    </section>

    {/* CLIENTS */}
    {(clients.data ?? []).length > 0 && (
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="trk text-xs text-[#6E6C7B] mb-8">{lang === 'ar' ? 'عملاؤنا' : 'Trusted by'}</div>
          <div className="flex flex-wrap justify-center gap-10 items-center">
            {clients.data!.map(c => (
              <span key={c.id} className="font-bold text-xl text-[#6E6C7B]">{c.name}</span>
            ))}
          </div>
        </div>
      </section>
    )}

    {/* CTA + CONTACT */}
    <section className="py-24" id="contact" style={{ background: 'var(--ink)', color: '#F5F4F8' }}>
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-extrabold mb-2">{lang === 'ar' ? cta.title_ar : cta.title_en}</h2>
        <p className="text-[#C9C7D6] mb-10">{lang === 'ar' ? cta.body_ar : cta.body_en}</p>
        <ContactForm lang={lang} />
      </div>
    </section>
  </>);
}
