import { supabasePublic, rawMediaUrl } from '@/lib/supabase';
import { Lang } from '@/lib/types';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';

// SEO from CMS: home seo_meta + branding favicon/OG image
export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang = (params.lang === 'ar' ? 'ar' : 'en') as Lang;
  const sb = supabasePublic();
  const [{ data: seo }, { data: brand }] = await Promise.all([
    sb.from('seo_meta').select('*').eq('page_key', 'home').single(),
    sb.from('branding_settings').select('*').eq('id', 1).single(),
  ]);
  return {
    title: (lang === 'ar' ? seo?.title_ar ?? seo?.title_en : seo?.title_en) ?? 'Joudcon',
    description: lang === 'ar' ? seo?.description_ar ?? seo?.description_en : seo?.description_en,
    icons: brand?.favicon_path ? { icon: rawMediaUrl('branding', brand.favicon_path)! } : undefined,
    openGraph: { images: brand?.social_image_path ? [rawMediaUrl('branding', brand.social_image_path)!] : undefined },
  };
}

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: { lang: string } }) {
  const lang = (params.lang === 'ar' ? 'ar' : 'en') as Lang;
  const sb = supabasePublic();
  const [{ data: settings }, { data: branding }, { data: navPages }] = await Promise.all([
    sb.from('site_settings').select('*').eq('id', 1).single(),
    sb.from('branding_settings').select('*').eq('id', 1).single(),
    sb.from('pages').select('key,title_en,title_ar').eq('status', 'published'),
  ]);
  const other = lang === 'en' ? 'ar' : 'en';
  return (
    <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Header lang={lang} other={other} pages={navPages ?? []}
        logo={rawMediaUrl('branding', lang === 'ar' ? (branding?.light_logo_path ?? branding?.primary_logo_path) : branding?.primary_logo_path)} />
      <main>{children}</main>
      <Footer lang={lang} settings={settings} branding={branding} pages={navPages ?? []}
        logo={rawMediaUrl('branding', branding?.footer_logo_path ?? branding?.primary_logo_path)} />
    </div>
  );
}
