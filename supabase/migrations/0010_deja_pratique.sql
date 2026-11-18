-- Audit avant lancement : statut « déjà pratiqué » distinct de « validé ».
-- Utilisé quand un rider déclare un niveau supérieur (onboarding ou rattrapage) :
-- les figures des paliers inférieurs comptent pour la progression des paliers,
-- sans être présentées comme validées (ni rapporter d'XP). Les fondamentaux de
-- sécurité ne sont jamais marqués en bloc.
alter table public.trick_progress drop constraint if exists trick_progress_status_check;
alter table public.trick_progress
  add constraint trick_progress_status_check
  check (status in ('en-cours', 'valide', 'deja-pratique'));
