-- RIDE'UP — schéma complet
-- Supabase : SQL Editor → coller ce fichier → Run. Puis exécuter supabase/seed_spots.sql.

-- ═════════════════════════ Profils ═════════════════════════
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  level text check (level in ('debutant', 'intermediaire', 'avance', 'expert')),
  discipline text,
  stance text check (stance in ('regular', 'goofy')),
  weight_kg integer check (weight_kg between 25 and 200),
  quiver text,                       -- texte libre, ex. "9 m, 12 m, twin-tip 138"
  goals text,
  home_label text,                   -- ville ou spot de départ
  home_lat double precision,
  home_lng double precision,
  radius_km integer not null default 100 check (radius_km between 5 and 2000),
  wind_alerts boolean not null default true,
  onboarded boolean not null default false,
  -- Champs gérés uniquement par le serveur (webhook Stripe / admin)
  plan text not null default 'free' check (plan in ('free', 'progress', 'elite')),
  plan_override text check (plan_override in ('progress', 'elite')), -- accès offert par l'admin
  subscription_status text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profil : lecture propriétaire" on public.profiles
  for select using (auth.uid() = id);
create policy "profil : modification propriétaire" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- L'utilisateur ne peut modifier QUE ces colonnes (ni le plan, ni is_admin).
revoke update on public.profiles from authenticated, anon;
grant update (full_name, level, discipline, stance, weight_kg, quiver, goals,
              home_label, home_lat, home_lng, radius_km, wind_alerts, onboarded)
  on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ═════════════════════════ Réglages des offres (éditables dans l'admin) ═════════════════════════
create table if not exists public.plan_settings (
  plan text primary key check (plan in ('free', 'progress', 'elite')),
  monthly_analyses integer not null,      -- pour 'free' : total à vie (essai)
  monthly_coach_messages integer not null,
  updated_at timestamptz not null default now()
);

alter table public.plan_settings enable row level security;
create policy "offres : lecture publique" on public.plan_settings for select using (true);

insert into public.plan_settings (plan, monthly_analyses, monthly_coach_messages) values
  ('free', 1, 10),
  ('progress', 20, 300),
  ('elite', 60, 600)
on conflict (plan) do nothing;

-- ═════════════════════════ Progression ═════════════════════════
create table if not exists public.trick_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  trick_id text not null,
  status text not null check (status in ('en-cours', 'valide')),
  updated_at timestamptz not null default now(),
  primary key (user_id, trick_id)
);
alter table public.trick_progress enable row level security;
create policy "progression : propriétaire" on public.trick_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Programme de progression personnalisé (Elite), généré par l'IA
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists programs_user on public.programs (user_id, created_at desc);
alter table public.programs enable row level security;
create policy "programmes : lecture propriétaire" on public.programs
  for select using (auth.uid() = user_id);

-- ═════════════════════════ Chat coach ═════════════════════════
create table if not exists public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists coach_messages_user on public.coach_messages (user_id, created_at);
alter table public.coach_messages enable row level security;
create policy "messages : lecture propriétaire" on public.coach_messages
  for select using (auth.uid() = user_id);
create policy "messages : suppression propriétaire" on public.coach_messages
  for delete using (auth.uid() = user_id);

-- ═════════════════════════ Analyses vidéo ═════════════════════════
create table if not exists public.video_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  trick text,
  notes text,
  video_path text,
  clip_hash text,                   -- SHA-256 du fichier, calculé dans le navigateur
  seg_start numeric(7, 2) not null default 0,
  seg_end numeric(7, 2) not null default 0,
  depth text not null default 'standard' check (depth in ('standard', 'approfondie')),
  cache_key text,                   -- empreinte clip + passage + figure + profondeur
  reused_from uuid references public.video_analyses (id) on delete set null,
  counted boolean not null default true, -- false = réutilisée ou en échec : hors quota
  status text not null default 'en-attente' check (status in ('en-attente', 'en-cours', 'termine', 'erreur')),
  result jsonb,
  error text,
  model text,
  cost_usd numeric(10, 5),
  created_at timestamptz not null default now()
);
create index if not exists video_analyses_user on public.video_analyses (user_id, created_at desc);
create index if not exists video_analyses_cache on public.video_analyses (user_id, cache_key);
alter table public.video_analyses enable row level security;
create policy "analyses : lecture propriétaire" on public.video_analyses
  for select using (auth.uid() = user_id);
create policy "analyses : suppression propriétaire" on public.video_analyses
  for delete using (auth.uid() = user_id);

-- Erreurs détectées, codifiées : sert au suivi des erreurs récurrentes
create table if not exists public.analysis_errors (
  id bigint generated always as identity primary key,
  analysis_id uuid not null references public.video_analyses (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  trick_id text,
  code text not null,
  created_at timestamptz not null default now()
);
create index if not exists analysis_errors_user on public.analysis_errors (user_id, created_at desc);
alter table public.analysis_errors enable row level security;
create policy "erreurs : lecture propriétaire" on public.analysis_errors
  for select using (auth.uid() = user_id);

-- ═════════════════════════ Consommation (quotas) ═════════════════════════
-- Registre géré uniquement par le serveur : supprimer une analyse ou effacer le chat
-- ne rend pas de quota. Une analyse en échec retire sa ligne (côté serveur).
create table if not exists public.usage_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('analyse', 'coach')),
  ref uuid,                         -- id de l'analyse concernée
  created_at timestamptz not null default now()
);
create index if not exists usage_events_user on public.usage_events (user_id, kind, created_at);
alter table public.usage_events enable row level security; -- aucune policy : service_role seulement

-- Réserve une unité de quota de façon atomique (verrou par utilisateur : pas de course possible).
create or replace function public.reserve_usage(p_user uuid, p_kind text, p_limit integer, p_since timestamptz, p_ref uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare used integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user::text || p_kind, 0));
  select count(*) into used from public.usage_events
    where user_id = p_user and kind = p_kind and (p_since is null or created_at >= p_since);
  if used >= p_limit then
    return false;
  end if;
  insert into public.usage_events (user_id, kind, ref) values (p_user, p_kind, p_ref);
  return true;
end;
$$;
revoke all on function public.reserve_usage(uuid, text, integer, timestamptz, uuid) from public, anon, authenticated;
grant execute on function public.reserve_usage(uuid, text, integer, timestamptz, uuid) to service_role;

-- ═════════════════════════ Dépenses IA (lecture admin uniquement) ═════════════════════════
create table if not exists public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  kind text not null check (kind in ('analyse', 'coach', 'programme')),
  model text not null,
  input_tokens integer not null,
  output_tokens integer not null,
  cost_usd numeric(10, 5) not null,
  created_at timestamptz not null default now()
);
create index if not exists ai_usage_created on public.ai_usage (created_at desc);
alter table public.ai_usage enable row level security; -- aucune policy : service_role seulement

-- ═════════════════════════ Spots ═════════════════════════
create table if not exists public.spots (
  id text primary key,                     -- slug
  name text not null,
  country text not null,
  region text,
  lat double precision not null,
  lng double precision not null,
  sea_bearing integer not null check (sea_bearing between 0 and 359), -- direction plage → large, en degrés
  water text not null default 'chop' check (water in ('flat', 'chop', 'vagues')),
  min_level text not null default 'debutant' check (min_level in ('debutant', 'intermediaire', 'avance')),
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.spots enable row level security;
create policy "spots : lecture publique" on public.spots for select using (active);

create table if not exists public.favorite_spots (
  user_id uuid not null references auth.users (id) on delete cascade,
  spot_id text not null references public.spots (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, spot_id)
);
alter table public.favorite_spots enable row level security;
create policy "favoris : propriétaire" on public.favorite_spots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Alertes vent déjà envoyées (évite les doublons)
create table if not exists public.wind_alerts_sent (
  user_id uuid not null references auth.users (id) on delete cascade,
  spot_id text not null references public.spots (id) on delete cascade,
  day date not null,
  sent_at timestamptz not null default now(),
  primary key (user_id, spot_id, day)
);
alter table public.wind_alerts_sent enable row level security;

-- ═════════════════════════ Stockage des clips ═════════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('clips', 'clips', false, 209715200, array['video/mp4', 'video/quicktime', 'video/webm'])
on conflict (id) do nothing;

drop policy if exists "clips : upload dans son dossier" on storage.objects;
drop policy if exists "clips : lecture de son dossier" on storage.objects;
drop policy if exists "clips : suppression de son dossier" on storage.objects;

-- Upload autorisé uniquement pour un clip rattaché à une analyse réservée par l'utilisateur.
create policy "clips : upload dans son dossier" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'clips'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.video_analyses va
      where va.video_path = name and va.user_id = auth.uid() and va.status in ('en-attente', 'en-cours', 'termine')
    )
  );
create policy "clips : lecture de son dossier" on storage.objects for select to authenticated
  using (bucket_id = 'clips' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "clips : suppression de son dossier" on storage.objects for delete to authenticated
  using (bucket_id = 'clips' and (storage.foldername(name))[1] = auth.uid()::text);
