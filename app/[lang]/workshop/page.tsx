import { supabasePublic, mediaUrl } from '@/lib/supabase';
import { t, Lang } from '@/lib/types';
import { Contours } from '@/components/site/Motifs';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export default async function Workshop({ params }: { params: { lang: string } }) {
  const lang = (params.lang === 'ar' ? 'ar' : 'en') as Lang;
  const sb = supabasePublic();
  const { data: w } = await sb.from('workshop').select('*, hero_asset:media_assets!hero(path)').eq('id', 1).eq('status', 'published').single();
  if (!w) notFound();
  const caps = (w.capabilities ?? []) as string[];
  return (
    <div>
      <section className="relative pt-48 pb-24 overflow-hidden" style={{ background: 'var(--ink)', color: '#F5F4F8' }}>
        <Contours className="absolute pointer-events-none opacity-60" />
        <div className="max-w-4xl mx-auto px-6 relative">
          <div className="kicker">{lang === 'ar' ? 'الورشة' : 'In-house production'}</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5">{t(w, 'title', lang)}</h1>
          <p className="max-w-2xl text-[#C9C7D6] text-lg whitespace-pre-line">{t(w, 'description', lang)}</p>
        </div>
      </section>
      {w.hero_asset?.path && (
        <div className="max-w-5xl mx-auto px-6 -mt-12 relative">
          <img src={mediaUrl(w.hero_asset.path, 1400) ?? undefined} alt=""
            className="rounded-2xl shadow-2xl w-full object-cover aspect-[21/9]" />
        </div>
      )}
      <section className="py-24 max-w-4xl mx-auto px-6">
        <h2 className="text-2xl font-extrabold mb-8">{lang === 'ar' ? 'القدرات' : 'Capabilities'}</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {caps.map((c, i) => (
            <div key={i} className="card p-5 text-sm font-bold text-center">&#9672; {c}</div>
          ))}
        </div>
      </section>
    </div>
  );
}
