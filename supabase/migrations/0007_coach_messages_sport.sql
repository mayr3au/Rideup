-- Coach IA : une discussion par sport.
-- Supabase : SQL Editor → coller ce fichier → Run.
alter table public.coach_messages add column if not exists sport text;

-- Les anciens messages rejoignent la discussion du sport actif du rider
update public.coach_messages m
set sport = coalesce(p.sport, 'kitesurf')
from public.profiles p
where p.id = m.user_id and m.sport is null;

create index if not exists coach_messages_user_sport on public.coach_messages (user_id, sport, created_at);
