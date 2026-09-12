import { supabasePublic } from '@/lib/supabase';
import { t, Lang } from '@/lib/types';
import Link from 'next/link';
export const revalidate = 60;
export default async function Services({ params }: { params: { lang: string } }) {
  const lang = (params.lang === 'ar' ? 'ar' : 'en') as Lang;
  const { data } = await supabasePublic().from('services').select('*').eq('status', 'published').order('sort_order');
  return (
    <section className="pt-40 pb-24 max-w-6xl mx-auto px-6">
      <h1 className="text-4xl font-extrabold mb-12">{lang === 'ar' ? 'خدماتنا' : 'Services'}</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {(data ?? []).map(s => (
          <Link key={s.id} href={`/${lang}/services/${s.slug}`} className="card p-7 block no-underline" style={{ color: 'inherit' }}>
            <h3 className="font-bold text-lg mb-2">{t(s, 'name', lang)}</h3>
            <p className="text-sm text-[#6E6C7B]">{t(s, 'short', lang)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
