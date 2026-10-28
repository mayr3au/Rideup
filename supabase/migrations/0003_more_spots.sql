-- Spots supplémentaires : Côte d'Azur, Var, Provence, Languedoc, Roussillon, Corse.
-- Coordonnées et orientations approximatives, à affiner depuis Admin → Spots.
-- sea_bearing = direction plage → large. Un vent qui vient de cette direction est onshore.
-- Sans effet sur les spots déjà présents (on conflict do nothing).

insert into public.spots (id, name, country, region, lat, lng, sea_bearing, water, min_level, notes) values
-- Côte d'Azur
('cagnes-hippodrome', 'Cagnes-sur-Mer – Hippodrome', 'France', 'Alpes-Maritimes', 43.652, 7.163, 150, 'chop', 'intermediaire', 'Plage de galets. Renseigne-toi sur les périodes autorisées en été.'),
('antibes-salis', 'Antibes – La Salis', 'France', 'Alpes-Maritimes', 43.569, 7.128, 90, 'chop', 'intermediaire', 'Fonctionne surtout par vent d''est. Baigneurs nombreux en été.'),
('mandelieu-napoule', 'Mandelieu – La Napoule', 'France', 'Alpes-Maritimes', 43.520, 6.945, 160, 'chop', 'intermediaire', null),
('frejus-base-nature', 'Fréjus – Base Nature', 'France', 'Var', 43.418, 6.752, 160, 'chop', 'debutant', 'Grande plage, écoles sur place.'),
('saint-aygulf', 'Saint-Aygulf', 'France', 'Var', 43.397, 6.725, 150, 'chop', 'intermediaire', null),
-- Var
('hyeres-capte', 'Hyères – La Capte', 'France', 'Var', 43.062, 6.153, 100, 'chop', 'debutant', 'Côté est de la presqu''île de Giens, par vent d''est.'),
('hyeres-ayguade', 'Hyères – L''Ayguade', 'France', 'Var', 43.105, 6.175, 120, 'chop', 'debutant', null),
('six-fours-brusc', 'Six-Fours – Le Brusc', 'France', 'Var', 43.073, 5.803, 200, 'chop', 'intermediaire', null),
-- Provence
('marseille-pointe-rouge', 'Marseille – Pointe Rouge', 'France', 'Bouches-du-Rhône', 43.243, 5.369, 250, 'chop', 'intermediaire', 'Par mistral, réservé aux riders confirmés.'),
('carro', 'Martigues – Carro', 'France', 'Bouches-du-Rhône', 43.330, 5.040, 230, 'vagues', 'avance', 'Spot de vagues, rochers.'),
-- Languedoc
('sete-lido', 'Sète – Lido', 'France', 'Hérault', 43.370, 3.640, 140, 'chop', 'debutant', 'Longue plage entre mer et étang.'),
('palavas', 'Palavas-les-Flots', 'France', 'Hérault', 43.525, 3.935, 160, 'chop', 'debutant', null),
('grande-motte', 'La Grande-Motte', 'France', 'Hérault', 43.555, 4.075, 170, 'chop', 'debutant', null),
('espiguette', 'Le Grau-du-Roi – L''Espiguette', 'France', 'Gard', 43.490, 4.140, 190, 'chop', 'debutant', 'Grande plage sauvage. Tramontane offshore : prudence.'),
-- Roussillon
('barcares', 'Le Barcarès', 'France', 'Pyrénées-Orientales', 42.790, 3.040, 90, 'chop', 'intermediaire', 'Tramontane offshore : réservé aux riders confirmés.'),
('canet', 'Canet-en-Roussillon', 'France', 'Pyrénées-Orientales', 42.700, 3.040, 90, 'chop', 'intermediaire', null),
-- Corse
('piantarella', 'Bonifacio – Piantarella', 'France', 'Corse-du-Sud', 41.380, 9.220, 110, 'flat', 'debutant', 'Lagon peu profond, eau turquoise.'),
('porto-pollo', 'Porto-Pollo', 'France', 'Corse-du-Sud', 41.710, 8.800, 250, 'chop', 'intermediaire', null)
on conflict (id) do nothing;
