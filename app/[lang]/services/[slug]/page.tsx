import { supabasePublic } from '@/lib/supabase';
import { t, Lang } from '@/lib/types';
import { notFound } from 'next/navigation';
export const revalidate = 60;
export default async function ServiceDetail({ params }: { params: { lang: string; slug: string } }) {
  const lang = (params.lang === 'ar' ? 'ar' : 'en') as Lang;
  const { data: s } = await supabasePublic().from('services').select('*').eq('slug', params.slug).eq('status', 'published').single();
  if (!s) notFound();
  const caps = (s.capabilities ?? []) as string[];
  return (
    <article className="pt-40 pb-24 max-w-3xl mx-auto px-6">
      <h1 className="text-4xl font-extrabold mb-4">{t(s, 'name', lang)}</h1>
      <p className="text-xl text-[#6E6C7B] mb-8">{t(s, 'short', lang)}</p>
      <div className="max-w-none whitespace-pre-line">{t(s, 'detail', lang)}</div>
      {caps.length > 0 && (
        <ul className="mt-8 grid sm:grid-cols-2 gap-2 list-none">
          {caps.map((c, i) => <li key={i} className="card p-4 text-sm">◈ {c}</li>)}
        </ul>
      )}
    </article>
  );
}
