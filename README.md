# RIDE'UP

Plateforme de coaching de glisse (kitesurf, wingfoil, foil, surf, wakeboard au téléski) : vidéos des figures analysées par de vrais coachs, suivi de progression, coach conversationnel IA, cours et Spot Finder.

### Multi-sport
Toute la logique propre à chaque sport (phases d'une figure, erreurs, roadmap de figures, matériel, niveaux, type de spot) est dans `src/lib/sports.ts`. Un rider peut pratiquer plusieurs sports, avec un niveau et un matériel par sport (`profiles.sports`, `levels`, `gear`) ; le sélecteur en haut de l'appli change le sport actif. Les analyses, la progression, le programme et le coach sont filtrés par sport. Le « foil » désigne le kitefoil.

**Stack :** Next.js 15 (App Router) · Supabase (auth, Postgres, stockage) · Stripe (abonnements) · Claude d'Anthropic (coach conversationnel, programmes) · Open-Meteo (vent) · Leaflet + OpenStreetMap (carte) · Resend (alertes e-mail) · Vercel.

## Fonctionnement

### Analyse vidéo par un coach
1. Le rider importe sa vidéo, **sélectionne le passage de sa figure (30 s max)**, choisit la figure et écrit ce qu'il a voulu faire et sa question (`analyse-uploader.tsx`).
2. Le quota est réservé, la vidéo part dans le stockage privé `clips`, puis l'analyse entre dans la **file des coachs** (statut `en-attente`). Les coachs du sport sont prévenus par e-mail. Un envoi raté n'est pas décompté ; tant qu'aucun coach ne l'a prise, le rider peut retirer sa vidéo et récupérer son analyse.
3. Dans l'**Espace coach** (`/espace-coach`), un coach prend la vidéo (`en-cours`), la regarde avec le profil du rider et ses derniers retours, puis remplit le rapport : note, résumé, phases, erreurs classées dans la **taxonomie fixe** (`errorsFor` dans `src/lib/sports.ts`), points forts, exercices, priorité de la prochaine session, alerte sécurité. Il peut aussi la rendre à la file.
4. À la publication (`termine`), le rider reçoit un e-mail ; erreurs et figure alimentent sa progression comme avant.
5. Les riders **Elite passent en priorité** (retour annoncé sous 24 h, contre 72 h). Délais dans `REVIEW_DELAY_HOURS` (`src/lib/plans.ts`).

**Coachs :** dans **Admin → Utilisateurs**, coche « Coach » et les sports qu'il analyse (aucun coché = tous). L'admin a toujours accès à l'espace coach.

### Progression
Erreurs récurrentes (et leur tendance en Elite), priorités pour la prochaine session, suivi figure par figure (tentatives, meilleure note, courbe en Elite), roadmap de 15 figures, programme personnalisé de 3 à 5 sessions (Elite, 1 par 24 h), coach conversationnel qui connaît l'historique.

### Spot Finder (Progress et Elite)
Pour chaque spot du sport actif dans le rayon choisi, sur 7 jours, avec carte :
- **kite, wing, foil** : vent heure par heure, orientation (onshore, side, offshore), créneau ridable selon le niveau, le poids et le matériel, taille d'aile conseillée ;
- **surf** : houle (hauteur, période, direction via Open-Meteo Marine) et vent (offshore = vagues propres), fourchette de vagues selon le niveau ;
- **wakeboard** : téléskis nautiques avec météo (pluie, orage, température).

Logique dans `src/lib/wind.ts`. Spots favoris ; alertes par e-mail pour Elite (tâche quotidienne `vercel.json`). Chaque spot a une liste `sports` ; les téléskis s'ajoutent dans **Admin → Spots** (plan d'eau « Lac », sport Wakeboard).

La page publique **/week-end** classe les spots par sport : vent prévu pour kite, wing et foil, houle pour le surf.

### Formules
- **Essai** : 1 analyse et 10 messages au coach (réglable).
- **Progress, 14,99 €** : 2 vidéos analysées par un coach par mois (retour sous 72 h), coach IA, historique, progression, Spot Finder.
- **Elite, 29,99 €** : 6 vidéos analysées par un coach par mois, en priorité (retour sous 24 h), évolution des erreurs, programme personnalisé, alertes vent.

## Mise en route

### 1. Supabase
1. Crée un projet (région Europe).
2. **SQL Editor** : exécute les migrations de `supabase/migrations/` dans l'ordre (0001 à 0004), puis `supabase/seed_spots.sql` (61 spots de vent et 19 spots de surf ; pas de téléski).
3. **Authentication → URL Configuration** : *Site URL* = l'URL du site, et ajoute `https://TON-DOMAINE/auth/callback` (et `http://localhost:3000/auth/callback`) dans *Redirect URLs*.
4. **Project Settings → API** : URL, clé `anon`, clé `service_role`.
5. Inscris-toi sur le site, puis **Table Editor → profiles** : passe `is_admin` à `true` sur ton compte.

> Les coordonnées et orientations des spots sont approximatives : vérifie-les et corrige-les dans **Admin → Spots** avant le lancement.

### 2. Stripe
1. **Product catalog** : « RIDE'UP Progress » à 14,99 €/mois et « RIDE'UP Elite » à 29,99 €/mois. Note les deux `price_…`.
2. **Settings → Billing → Customer portal** : active la résiliation, le changement de formule (entre ces deux prix) et la mise à jour de la carte.
3. **Developers → Webhooks** : endpoint `https://TON-DOMAINE/api/stripe/webhook`, événements `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.

### 3. Autres services
- **Anthropic** : clé API sur console.anthropic.com.
- **Open-Meteo** : gratuit pour tester. Son usage gratuit est réservé au non commercial : prends une clé payante avant de lancer le site payant.
- **Resend** (alertes Elite) : clé API et domaine d'envoi vérifié.

### 4. Variables d'environnement
Copie `.env.example` en `.env.local`, remplis tout, et mets les mêmes variables dans **Vercel → Settings → Environment Variables** (avec un `CRON_SECRET` aléatoire).

### 5. Lancer
```bash
npm install
npm run dev
```
Paiements en local : `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

### 6. Déployer
Importe le repo dans Vercel, ajoute les variables, déploie, puis mets à jour les URL Supabase et le webhook Stripe avec le domaine final. La tâche d'alertes vent est déclarée dans `vercel.json`.

## Avant la mise en ligne
- Compléter les champs surlignés dans `/mentions-legales`, `/cgu`, `/confidentialite` et faire relire les pages légales.
- Vérifier les spots (coordonnées, orientation, réglementation locale).
- Passer Stripe en mode live, prendre la clé Open-Meteo commerciale, personnaliser les e-mails Supabase et brancher un SMTP.
- Tester l'analyse avec de vraies vidéos de chaque niveau et ajuster les consignes dans `src/lib/ai.ts` si besoin.

## Structure
```
src/
  app/(site)/        public : accueil, tarifs, cours, week-end, auth, légal
  app/(app)/         espace membre : dashboard, analyse, historique, progression, coach, spots, profil, compte, admin
  app/api/           analyses, coach, checkout, portail, webhook Stripe, cron alertes vent
  lib/               ai (prompts + coûts), plans, usage (quotas), progress, wind (Spot Finder), weather, frames (vidéo)
  components/        UI (découpe vidéo, carte, formulaires…)
supabase/            schéma SQL et spots de départ
```
