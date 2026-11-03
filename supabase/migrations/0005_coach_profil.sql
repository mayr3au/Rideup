-- Profil public du coach : diplôme et courte présentation, affichés au rider avec son retour.
alter table public.profiles
  add column if not exists coach_diploma text,  -- ex. « BPJEPS kitesurf », « DEJEPS surf »
  add column if not exists coach_bio text;      -- une ou deux phrases
-- Pas de grant : renseignés par l'admin (service_role).
