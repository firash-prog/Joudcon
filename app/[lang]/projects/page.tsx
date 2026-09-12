import { supabasePublic } from '@/lib/supabase';
import { t, Lang } from '@/lib/types';
import Link from 'next/link';
export const revalidate = 60;
export default async function Projects({ params }: { params: { lang: string } }) {
  const lang = (params.lang === 'ar' ? 'ar' : 'en') as Lang;
  const { data } = await supabasePublic().from('projects').select('*').eq('status', 'published').order('sort_order');
  return (
    <section className="pt-40 pb-24 max-w-6xl mx-auto px-6">
      <h1 className="text-4xl font-extrabold mb-12">{lang === 'ar' ? 'مشاريعنا' : 'Projects'}</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {(data ?? []).map(p => (
          <Link key={p.id} href={`/${lang}/projects/${p.slug}`} className="card p-7 block no-underline" style={{ color: 'inherit' }}>
            <div className="trk text-xs text-[#6E6C7B]">{p.category} · {p.client} · {p.year}</div>
            <h3 className="font-bold text-lg mt-2">{t(p, 'name', lang)}</h3>
            <p className="text-sm text-[#6E6C7B] mt-1">{t(p, 'summary', lang)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
