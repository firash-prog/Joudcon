import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sb = supabaseAdmin();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/admin/login');
  const { data: profile } = await sb.from('profiles').select('role,full_name').eq('id', user.id).single();
  return <AdminShell user={{ email: user.email, name: profile?.full_name, role: profile?.role }}>{children}</AdminShell>;
}
