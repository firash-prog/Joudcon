import { supabasePublic } from '@/lib/supabase';
import { t, Lang } from '@/lib/types';
import { notFound } from 'next/navigation';
export const revalidate = 60;
export default async function ProjectDetail({ params }: { params: { lang: string; slug: string } }) {
  const lang = (params.lang === 'ar' ? 'ar' : 'en') as Lang;
  const sb = supabasePublic();
  const { data: p } = await sb.from('projects').select('*').eq('slug', params.slug).eq('status', 'published').single();
  if (!p) notFound();
  const blocks = ['objective','scope','creative_approach','production','fabrication','logistics','installation','outcome'];
  return (
    <article className="pt-40 pb-24 max-w-3xl mx-auto px-6">
      <div className="trk text-xs text-[#6E6C7B]">{p.category} · {p.client} · {p.year} · {t(p, 'location', lang)}</div>
      <h1 className="text-4xl font-extrabold my-3">{t(p, 'name', lang)}</h1>
      <p className="text-xl text-[#6E6C7B] mb-10">{t(p, 'summary', lang)}</p>
      {blocks.map(b => t(p, b, lang) ? (
        <section key={b} className="mb-8">
          <h2 className="trk text-sm mb-2" style={{ color: 'var(--amber)' }}>{b.replace(/_/g, ' ')}</h2>
          <p className="whitespace-pre-line">{t(p, b, lang)}</p>
        </section>
      ) : null)}
    </article>
  );
}
