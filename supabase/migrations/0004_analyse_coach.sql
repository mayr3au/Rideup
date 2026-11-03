-- Analyse vidéo par un vrai coach (remplace l'analyse IA, photo et vidéo).
-- Le rider envoie un passage de sa vidéo ; un coach RIDE'UP le prend dans sa file et rédige le retour.

-- ═════════════════════════ Coachs ═════════════════════════
alter table public.profiles
  add column if not exists is_coach boolean not null default false,
  add column if not exists coach_sports text[] not null default '{}'; -- vide = tous les sports
-- Pas de grant : seul l'admin (service_role) peut nommer un coach.

-- ═════════════════════════ Analyses ═════════════════════════
-- envoi      : la vidéo part depuis le téléphone du rider
-- en-attente : dans la file des coachs
-- en-cours   : un coach l'a prise
-- termine    : retour du coach publié
-- erreur     : envoi raté ou annulée (quota rendu)
alter table public.video_analyses drop constraint if exists video_analyses_status_check;
update public.video_analyses set status = 'erreur', counted = false, error = coalesce(error, 'Interrompue')
  where status in ('en-attente', 'en-cours');
alter table public.video_analyses
  add constraint video_analyses_status_check
  check (status in ('envoi', 'en-attente', 'en-cours', 'termine', 'erreur'));
alter table public.video_analyses alter column status set default 'envoi';

alter table public.video_analyses
  add column if not exists coach_id uuid references auth.users (id) on delete set null,
  add column if not exists submitted_at timestamptz,  -- arrivée dans la file (vidéo reçue)
  add column if not exists claimed_at timestamptz,    -- prise en charge par le coach
  add column if not exists reviewed_at timestamptz,   -- retour publié
  add column if not exists priority boolean not null default false; -- Elite : passe devant dans la file

create index if not exists video_analyses_queue
  on public.video_analyses (status, priority desc, submitted_at)
  where status in ('en-attente', 'en-cours');

-- ═════════════════════════ Quotas ═════════════════════════
-- Un humain regarde chaque vidéo : 2 analyses par mois en Progress, 6 en Elite (réglable dans Admin → Offres).
update public.plan_settings set monthly_analyses = 2, updated_at = now() where plan = 'progress';
update public.plan_settings set monthly_analyses = 6, updated_at = now() where plan = 'elite';
