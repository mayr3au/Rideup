-- RIDE'UP — schéma initial
-- À exécuter dans Supabase : SQL Editor → coller → Run (ou `supabase db push`).

-- ───────────────────────── Profils ─────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  level text check (level in ('debutant', 'intermediaire', 'avance', 'expert')),
  discipline text,
  stance text check (stance in ('regular', 'goofy')),
  home_spot text,
  quiver text,
  goals text,
  onboarded boolean not null default false,
  -- Champs gérés uniquement par le serveur (webhook Stripe)
  plan text not null default 'free' check (plan in ('free', 'standard', 'premium')),
  subscription_status text,
  current_period_end timestamptz,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profil lisible par son propriétaire"
  on public.profiles for select using (auth.uid() = id);

create policy "profil modifiable par son propriétaire"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- L'utilisateur ne peut modifier QUE ces colonnes (pas le plan, pas is_admin).
revoke update on public.profiles from authenticated, anon;
grant update (full_name, level, discipline, stance, home_spot, quiver, goals, onboarded)
  on public.profiles to authenticated;

-- Création automatique du profil à l'inscription
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
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────── Progression des figures ─────────────────────────
create table if not exists public.trick_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  trick_id text not null,
  status text not null check (status in ('en-cours', 'valide')),
  updated_at timestamptz not null default now(),
  primary key (user_id, trick_id)
);

alter table public.trick_progress enable row level security;

create policy "progression : accès propriétaire"
  on public.trick_progress for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ───────────────────────── Chat coach ─────────────────────────
create table if not exists public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists coach_messages_user_created on public.coach_messages (user_id, created_at);

alter table public.coach_messages enable row level security;

create policy "messages lisibles par le propriétaire"
  on public.coach_messages for select using (auth.uid() = user_id);
create policy "messages supprimables par le propriétaire"
  on public.coach_messages for delete using (auth.uid() = user_id);
-- Les insertions passent par l'API (service_role) pour garder le décompte fiable.

-- ───────────────────────── Analyses vidéo ─────────────────────────
create table if not exists public.video_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  trick text,
  notes text,
  video_path text,
  status text not null default 'en-attente' check (status in ('en-attente', 'termine', 'erreur')),
  result jsonb,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists video_analyses_user_created on public.video_analyses (user_id, created_at desc);

alter table public.video_analyses enable row level security;

create policy "analyses lisibles par le propriétaire"
  on public.video_analyses for select using (auth.uid() = user_id);
create policy "analyses supprimables par le propriétaire"
  on public.video_analyses for delete using (auth.uid() = user_id);

-- ───────────────────────── Stockage des clips ─────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('clips', 'clips', false, 104857600, array['video/mp4', 'video/quicktime', 'video/webm'])
on conflict (id) do nothing;

-- Chaque utilisateur range ses clips dans un dossier à son id : clips/<user_id>/...
create policy "clips : upload dans son dossier"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'clips' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "clips : lecture de son dossier"
  on storage.objects for select to authenticated
  using (bucket_id = 'clips' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "clips : suppression de son dossier"
  on storage.objects for delete to authenticated
  using (bucket_id = 'clips' and (storage.foldername(name))[1] = auth.uid()::text);
