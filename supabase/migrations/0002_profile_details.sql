-- Profil rider détaillé par sport : discipline, quiver structuré (foil complet), auto-évaluation.
-- {"kitesurf": {"discipline": "freeride", "quiver": {...}, "evaluation": {...}}, ...}
alter table public.profiles
  add column if not exists details jsonb not null default '{}'::jsonb;

grant update (details) on public.profiles to authenticated;
