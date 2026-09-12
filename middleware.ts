import { NextRequest, NextResponse } from 'next/server';

const LOCALES = ['en', 'ar'];
const SKIP = ['/api', '/admin', '/_next', '/sitemap.xml', '/robots.txt', '/favicon.ico'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (SKIP.some(p => pathname.startsWith(p))) return NextResponse.next();

  // Root: detect best locale → redirect, remember choice
  if (pathname === '/') {
    const saved = req.cookies.get('joudcon_lang')?.value;
    const al = (req.headers.get('accept-language') ?? '').toLowerCase();
    const locale = saved && LOCALES.includes(saved) ? saved : al.startsWith('ar') ? 'ar' : 'en';
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }

  // Persist explicit locale choice (header toggle links)
  const seg = pathname.split('/')[1];
  if (LOCALES.includes(seg)) {
    const res = NextResponse.next();
    res.cookies.set('joudcon_lang', seg, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|admin).*)'],
};
