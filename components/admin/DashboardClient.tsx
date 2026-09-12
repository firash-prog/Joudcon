"use client";
import Link from 'next/link';
import { useAdminLang } from '@/lib/admin-i18n';

export default function DashboardClient({ counts, activity }: any) {
  const { t } = useAdminLang();
  const cards = [
    [t.projects, counts.projects, '/admin/projects'],
    [t.draftProjects, counts.drafts, '/admin/projects'],
    [t.services, counts.services, '/admin/services'],
    [t.mediaFiles, counts.media, '/admin/media'],
    [t.newEnq, counts.newLeads, '/admin/leads'],
    [t.unreadEnq, counts.unread, '/admin/leads'],
  ];
  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">{t.dashboard}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
        {cards.map(([label, n, href]) => (
          <Link key={label as string} href={href as string} className="card p-5 no-underline block" style={{ color: 'inherit' }}>
            <div className="text-3xl font-extrabold" style={{ color: 'var(--amber)' }}>{n as number}</div>
            <div className="text-xs trk text-[#6E6C7B] mt-1">{label as string}</div>
          </Link>
        ))}
      </div>
      <div className="flex gap-3 flex-wrap mb-10">
        <Link href="/admin/projects" className="btn btn-amber">{t.quickProject}</Link>
        <Link href="/admin/media" className="btn btn-ghost">{t.quickMedia}</Link>
        <Link href="/en" target="_blank" className="btn btn-ghost">{t.viewSite}</Link>
      </div>
      <h2 className="font-bold mb-4">{t.recentActivity}</h2>
      <div className="card divide-y" style={{ borderColor: 'var(--line)' }}>
        {(activity ?? []).map((a: any) => (
          <div key={a.id} className="px-5 py-3 text-sm flex justify-between gap-4">
            <span><b>{a.profiles?.full_name ?? '—'}</b> · {a.action} · {a.entity_type} #{a.entity_id}</span>
            <span className="text-xs text-[#6E6C7B] whitespace-nowrap">{new Date(a.created_at).toLocaleString()}</span>
          </div>
        ))}
        {activity?.length === 0 && <div className="px-5 py-8 text-center text-sm text-[#6E6C7B]">{t.noActivity}</div>}
      </div>
    </div>
  );
}
