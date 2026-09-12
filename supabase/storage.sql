-- JOUDCON storage (run second)
insert into storage.buckets (id,name,public) values ('media','media',true) on conflict do nothing;
insert into storage.buckets (id,name,public) values ('branding','branding',true) on conflict do nothing;
insert into storage.buckets (id,name,public) values ('lead-attachments','lead-attachments',false) on conflict do nothing;

-- public read of media + branding
create policy "pub read media" on storage.objects for select to anon,authenticated
  using (bucket_id in ('media','branding'));
-- authenticated uploads with safe extensions (MIME re-checked in app layer too)
create policy "staff upload media" on storage.objects for insert to authenticated
  with check (bucket_id in ('media','branding')
    and public.has_role(array['super_admin','admin','editor','media_manager'])
    and lower(name) ~* '\\.(png|jpe?g|webp|avif|mp4|webm|mov|pdf)$');
create policy "staff update media" on storage.objects for update to authenticated
  using (bucket_id in ('media','branding') and public.has_role(array['super_admin','admin','editor','media_manager']));
create policy "staff delete media" on storage.objects for delete to authenticated
  using (bucket_id in ('media','branding') and public.has_role(array['super_admin','admin','editor','media_manager']));

-- lead attachments: anon may upload ONLY into a folder named after a fresh lead uuid
create policy "anon lead attach" on storage.objects for insert to anon
  with check (bucket_id='lead-attachments'
    and split_part(name,'/',1) in (select id::text from leads where created_at > now() - interval '2 hours'));
create policy "staff read lead attach" on storage.objects for select to authenticated
  using (bucket_id='lead-attachments');
