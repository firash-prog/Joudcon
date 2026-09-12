import { supabasePublic } from '@/lib/supabase';
export default async function sitemap() {
  const sb = supabasePublic();
  const base = 'https://joudcon.com';
  const [{ data: pages }, { data: services }, { data: projects }] = await Promise.all([
    sb.from('pages').select('key').eq('status', 'published'),
    sb.from('services').select('slug').eq('status', 'published'),
    sb.from('projects').select('slug').eq('status', 'published'),
  ]);
  const langs = ['en', 'ar'];
  const urls: any[] = [];
  for (const l of langs) {
    for (const p of pages ?? []) urls.push({ url: `${base}/${l}${p.key === 'home' ? '' : '/' + p.key}`, changeFrequency: 'weekly' });
    for (const s of services ?? []) urls.push({ url: `${base}/${l}/services/${s.slug}` });
    for (const p of projects ?? []) urls.push({ url: `${base}/${l}/projects/${p.slug}` });
  }
  return urls;
}
