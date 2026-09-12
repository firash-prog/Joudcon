-- JOUDCON CMS schema (run first)
create extension if not exists pgcrypto;

create type publish_status as enum ('draft','published','archived');
create type lead_status as enum ('new','read','in_progress','completed','spam');
create type user_role as enum ('super_admin','admin','editor','media_manager');

-- ---------- auth profiles ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, role user_role not null default 'editor',
  created_at timestamptz not null default now()
);

create or replace function public.has_role(roles text[]) returns boolean
language sql stable security definer set search_path=public as $$
  select exists(select 1 from profiles where id = auth.uid() and role = any(roles));
$$;

create or replace function public.touch() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- media ----------
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'media', path text not null unique,
  original_filename text, mime text not null, size_bytes bigint not null,
  width int, height int, alt_en text, alt_ar text,
  derivatives jsonb not null default '{}',
  uploaded_by uuid references profiles(id), deleted_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.media_usage (
  id bigint generated always as identity primary key,
  asset_id uuid not null references media_assets(id) on delete cascade,
  entity_type text not null, entity_id text not null, field text not null,
  unique(entity_type,entity_id,field,asset_id)
);
create or replace view public.media_with_usage as
  select m.*, (select count(*) from media_usage u where u.asset_id=m.id) as usage_count
  from media_assets m where m.deleted_at is null;

-- ---------- content modules ----------
create table public.pages (id bigint generated always as identity primary key,
  key text not null unique, title_en text, title_ar text, status publish_status not null default 'published');

create table public.page_sections (id bigint generated always as identity primary key,
  page_id bigint not null references pages(id) on delete cascade,
  section_key text not null, data jsonb not null default '{}',
  sort_order int not null default 0, is_visible boolean not null default true,
  unique(page_id, section_key));

create table public.services (id bigint generated always as identity primary key,
  slug text not null unique, name_en text not null, name_ar text,
  short_en text, short_ar text, detail_en text, detail_ar text,
  icon text, image uuid references media_assets(id), video_path text,
  capabilities jsonb not null default '[]', process_en text, process_ar text,
  status publish_status not null default 'draft', sort_order int not null default 0,
  created_by uuid references profiles(id), created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), published_at timestamptz);

create table public.projects (id bigint generated always as identity primary key,
  slug text not null unique, name_en text not null, name_ar text, client text,
  location_en text, location_ar text, year int, category text, event_type text,
  summary_en text, summary_ar text, description_en text, description_ar text,
  objective_en text, objective_ar text, scope_en text, scope_ar text,
  creative_approach_en text, creative_approach_ar text, production_en text, production_ar text,
  fabrication_en text, fabrication_ar text, logistics_en text, logistics_ar text,
  installation_en text, installation_ar text, outcome_en text, outcome_ar text,
  featured_image uuid references media_assets(id), video_path text, video_poster uuid references media_assets(id),
  is_featured boolean not null default false, status publish_status not null default 'draft',
  sort_order int not null default 0, created_by uuid references profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  published_at timestamptz);

create table public.project_gallery (id bigint generated always as identity primary key,
  project_id bigint not null references projects(id) on delete cascade,
  asset_id uuid not null references media_assets(id) on delete cascade,
  sort_order int not null default 0, caption_en text, caption_ar text);

create table public.clients (id bigint generated always as identity primary key,
  name text not null, logo uuid references media_assets(id), website text,
  is_featured boolean not null default false, is_visible boolean not null default true,
  alt_en text, alt_ar text, sort_order int not null default 0);

create table public.testimonials (id bigint generated always as identity primary key,
  quote_en text, quote_ar text, person text not null, position_en text, position_ar text,
  company text, photo uuid references media_assets(id), related_project bigint references projects(id) on delete set null,
  status publish_status not null default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.statistics (id bigint generated always as identity primary key,
  label_en text not null, label_ar text, value numeric not null default 0, suffix text,
  sort_order int not null default 0, is_visible boolean not null default false);

create table public.process_stages (id bigint generated always as identity primary key,
  key text not null unique, name_en text not null, name_ar text,
  description_en text, description_ar text, sort_order int not null default 0,
  is_visible boolean not null default true);

create table public.workshop (id int primary key default 1 check (id=1),
  title_en text, title_ar text, description_en text, description_ar text,
  capabilities jsonb not null default '[]', cta_en text, cta_ar text,
  hero uuid references media_assets(id), status publish_status not null default 'draft',
  updated_at timestamptz not null default now());

-- ---------- leads ----------
create table public.leads (id uuid primary key default gen_random_uuid(),
  name text not null, company text, email text not null, phone text,
  event_type text, location text, event_date date, attendance int, message text,
  attachment_path text, status lead_status not null default 'new', is_read boolean not null default false,
  created_at timestamptz not null default now());
create table public.lead_notes (id bigint generated always as identity primary key,
  lead_id uuid not null references leads(id) on delete cascade,
  body text not null, author uuid references profiles(id), created_at timestamptz not null default now());
create table public.lead_rate (ip text not null, created_at timestamptz not null default now());

-- ---------- site config ----------
create table public.branding_settings (id int primary key default 1 check (id=1),
  primary_logo_path text, dark_logo_path text, light_logo_path text,
  favicon_path text, social_image_path text, footer_logo_path text,
  updated_by uuid references profiles(id), updated_at timestamptz not null default now());

create table public.site_settings (id int primary key default 1 check (id=1),
  company_en text, company_ar text, address_en text, address_ar text,
  phones jsonb not null default '[]', emails jsonb not null default '[]',
  whatsapp text, hours_en text, hours_ar text, social jsonb not null default '{}',
  maps_url text, updated_at timestamptz not null default now());

create table public.seo_meta (page_key text primary key,
  title_en text, title_ar text, description_en text, description_ar text,
  og_image uuid references media_assets(id), canonical text, noindex boolean not null default false);

create table public.redirects (from_path text primary key, to_path text not null, status_code int not null default 301);

-- ---------- logs ----------
create table public.activity_logs (id bigint generated always as identity primary key,
  actor uuid, action text not null, entity_type text not null, entity_id text,
  summary jsonb not null default '{}', created_at timestamptz not null default now());

create table public.revisions (id bigint generated always as identity primary key,
  entity_type text not null, entity_id text not null, data jsonb not null,
  modified_by uuid, modified_at timestamptz not null default now());

-- ---------- triggers ----------
create or replace function public.log_activity() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  insert into activity_logs(actor,action,entity_type,entity_id,summary)
  values (auth.uid(), TG_OP, TG_TABLE_NAME,
    coalesce((to_jsonb(NEW)->>'id'),(to_jsonb(OLD)->>'id')),
    jsonb_build_object('old', case when TG_OP in ('UPDATE','DELETE') then to_jsonb(OLD) end,
                       'new', case when TG_OP in ('INSERT','UPDATE') then to_jsonb(NEW) end));
  return coalesce(NEW,OLD);
end $$;

create or replace function public.save_revision() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  insert into revisions(entity_type,entity_id,data,modified_by)
  values (TG_TABLE_NAME, OLD.id::text, to_jsonb(OLD), auth.uid());
  return new;
end $$;

create or replace function public.set_published() returns trigger language plpgsql as $$
begin
  if new.status='published' and (old is null or old.status is distinct from 'published')
     and new.published_at is null then new.published_at = now(); end if;
  return new; end $$;

create or replace function public.delete_media_asset(p_asset uuid, p_force boolean)
returns void language plpgsql security definer set search_path=public as $$
declare n int;
begin
  if not has_role(array['super_admin','admin','media_manager']) then raise exception 'forbidden'; end if;
  select count(*) into n from media_usage where asset_id = p_asset;
  if n > 0 and not p_force then raise exception 'ASSET_IN_USE:%', n; end if;
  delete from media_assets where id = p_asset;
end $$;

-- apply triggers
do $$ declare t text; begin
  foreach t in array array['services','projects','clients','testimonials','workshop'] loop
    execute format('create trigger %I_touch before update on public.%I for each row execute function touch()', t, t);
    execute format('create trigger %I_pub before insert or update on public.%I for each row execute function set_published()', t, t);
    execute format('create trigger %I_act after insert or update or delete on public.%I for each row execute function log_activity()', t, t);
    execute format('create trigger %I_rev before update on public.%I for each row execute function save_revision()', t, t);
  end loop;
end $$;
create trigger leads_act after insert or update on public.leads for each row execute function log_activity();
create trigger branding_act after insert or update on public.branding_settings for each row execute function log_activity();

-- ---------- RLS ----------
alter table profiles enable row level security;
alter table media_assets enable row level security; alter table media_usage enable row level security;
alter table pages enable row level security; alter table page_sections enable row level security;
alter table services enable row level security; alter table projects enable row level security;
alter table project_gallery enable row level security; alter table clients enable row level security;
alter table testimonials enable row level security; alter table statistics enable row level security;
alter table process_stages enable row level security; alter table workshop enable row level security;
alter table leads enable row level security; alter table lead_notes enable row level security; alter table lead_rate enable row level security;
alter table branding_settings enable row level security; alter table site_settings enable row level security;
alter table seo_meta enable row level security; alter table redirects enable row level security;
alter table activity_logs enable row level security; alter table revisions enable row level security;

-- public reads (published/visible only)
create policy "pub pages" on pages for select using (status='published');
create policy "pub sections" on page_sections for select using (is_visible and page_id in (select id from pages where status='published'));
create policy "pub services" on services for select using (status='published');
create policy "pub projects" on projects for select using (status='published');
create policy "pub gallery" on project_gallery for select using (project_id in (select id from projects where status='published'));
create policy "pub clients" on clients for select using (is_visible);
create policy "pub testimonials" on testimonials for select using (status='published');
create policy "pub stats" on statistics for select using (is_visible);
create policy "pub stages" on process_stages for select using (is_visible);
create policy "pub workshop" on workshop for select using (status='published');
create policy "pub media meta" on media_assets for select using (deleted_at is null);
create policy "pub branding" on branding_settings for select using (true);
create policy "pub settings" on site_settings for select using (true);
create policy "pub seo" on seo_meta for select using (not noindex);
create policy "pub redirects" on redirects for select using (true);

-- authenticated writers (role-checked)
create policy "staff media read" on media_assets for select to authenticated using (true);
create policy "staff media write" on media_assets for insert to authenticated with check (uploaded_by = auth.uid());
create policy "staff media upd" on media_assets for update to authenticated using (has_role(array['super_admin','admin','editor','media_manager']));
create policy "staff media use" on media_usage for all to authenticated using (has_role(array['super_admin','admin','editor'])) with check (has_role(array['super_admin','admin','editor']));

create policy "staff content" on services for all to authenticated using (has_role(array['super_admin','admin','editor'])) with check (has_role(array['super_admin','admin','editor']));
create policy "staff projects" on projects for all to authenticated using (has_role(array['super_admin','admin','editor'])) with check (has_role(array['super_admin','admin','editor']));
create policy "staff gallery" on project_gallery for all to authenticated using (has_role(array['super_admin','admin','editor'])) with check (has_role(array['super_admin','admin','editor']));
create policy "staff clients" on clients for all to authenticated using (has_role(array['super_admin','admin','editor'])) with check (has_role(array['super_admin','admin','editor']));
create policy "staff testimonials" on testimonials for all to authenticated using (has_role(array['super_admin','admin','editor'])) with check (has_role(array['super_admin','admin','editor']));
create policy "staff stats" on statistics for all to authenticated using (has_role(array['super_admin','admin','editor'])) with check (has_role(array['super_admin','admin','editor']));
create policy "staff stages" on process_stages for all to authenticated using (has_role(array['super_admin','admin','editor'])) with check (has_role(array['super_admin','admin','editor']));
create policy "staff pages" on pages for all to authenticated using (has_role(array['super_admin','admin'])) with check (has_role(array['super_admin','admin']));
create policy "staff sections" on page_sections for all to authenticated using (has_role(array['super_admin','admin'])) with check (has_role(array['super_admin','admin']));
create policy "staff workshop" on workshop for all to authenticated using (has_role(array['super_admin','admin','editor'])) with check (has_role(array['super_admin','admin','editor']));
create policy "staff branding" on branding_settings for all to authenticated using (has_role(array['super_admin','admin'])) with check (has_role(array['super_admin','admin']));
create policy "staff settings" on site_settings for all to authenticated using (has_role(array['super_admin','admin'])) with check (has_role(array['super_admin','admin']));
create policy "staff seo" on seo_meta for all to authenticated using (has_role(array['super_admin','admin'])) with check (has_role(array['super_admin','admin']));
create policy "staff redirects" on redirects for all to authenticated using (has_role(array['super_admin','admin'])) with check (has_role(array['super_admin','admin']));

-- leads: no public access at all (server route uses service role)
create policy "staff leads" on leads for select to authenticated using (has_role(array['super_admin','admin']));
create policy "staff leads upd" on leads for update to authenticated using (has_role(array['super_admin','admin'])) with check (has_role(array['super_admin','admin']));
create policy "staff lead notes" on lead_notes for all to authenticated using (has_role(array['super_admin','admin'])) with check (has_role(array['super_admin','admin']));
create policy "staff logs" on activity_logs for select to authenticated using (has_role(array['super_admin','admin']));
create policy "staff revisions" on revisions for select to authenticated using (has_role(array['super_admin','admin','editor']));
create policy "self profile" on profiles for select to authenticated using (id = auth.uid() or has_role(array['super_admin','admin']));
create policy "admin profiles" on profiles for update to authenticated using (has_role(array['super_admin'])) with check (has_role(array['super_admin']));
