import { supabaseAdmin } from '@/lib/supabase';
import DashboardClient from '@/components/admin/DashboardClient';

async function count(sb: any, table: string, eq?: [string, any]) {
  let q = sb.from(table).select('*', { count: 'exact', head: true });
  if (eq) q = q.eq(eq[0], eq[1]);
  const { count } = await q; return count ?? 0;
}

export default async function Dashboard() {
  const sb = supabaseAdmin();
  const [projects, drafts, services, media, newLeads, unread, activity] = await Promise.all([
    count(sb, 'projects'), count(sb, 'projects', ['status', 'draft']),
    count(sb, 'services'), count(sb, 'media_assets'),
    count(sb, 'leads', ['status', 'new']), count(sb, 'leads', ['is_read', false]),
    sb.from('activity_logs').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(8),
  ]);
  return <DashboardClient counts={{ projects, drafts, services, media, newLeads, unread }} activity={activity.data ?? []} />;
}
