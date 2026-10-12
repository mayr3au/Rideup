-- Base de départ du Spot Finder. Coordonnées et orientations approximatives :
-- à vérifier et ajuster depuis l'admin (Admin → Spots).
-- sea_bearing = direction plage → large (0 = le large est au nord, 90 = à l'est…).
-- Un vent qui vient de cette direction est onshore ; de la direction opposée, offshore.

insert into public.spots (id, name, country, region, lat, lng, sea_bearing, water, min_level, notes) values
-- France — Méditerranée
('almanarre', 'L''Almanarre', 'France', 'Var', 43.060, 6.130, 250, 'chop', 'debutant', 'Grand spot de Hyères, fréquenté l''été : zones réglementées.'),
('leucate-la-franqui', 'Leucate – La Franqui', 'France', 'Aude', 42.915, 3.032, 90, 'chop', 'intermediaire', 'Tramontane forte et rafaleuse, dérive vers le large.'),
('gruissan-chicane', 'Gruissan – La Chicane', 'France', 'Aude', 43.106, 3.105, 100, 'flat', 'debutant', 'Plan d''eau protégé.'),
('saint-pierre-la-mer', 'Saint-Pierre-la-Mer', 'France', 'Aude', 43.183, 3.191, 110, 'chop', 'intermediaire', null),
('carnon', 'Carnon', 'France', 'Hérault', 43.545, 3.990, 160, 'chop', 'debutant', null),
('napoleon', 'Plage Napoléon', 'France', 'Bouches-du-Rhône', 43.365, 4.870, 180, 'chop', 'debutant', 'Mistral side-off : prudence.'),
('beauduc', 'Beauduc', 'France', 'Camargue', 43.393, 4.585, 180, 'flat', 'intermediaire', 'Accès par piste.'),
('saintes-maries', 'Les Saintes-Maries-de-la-Mer', 'France', 'Camargue', 43.448, 4.420, 180, 'chop', 'debutant', null),
-- France — Manche / Mer du Nord
('wissant', 'Wissant', 'France', 'Pas-de-Calais', 50.887, 1.664, 315, 'vagues', 'intermediaire', 'Marées et courants importants.'),
('wimereux', 'Wimereux', 'France', 'Pas-de-Calais', 50.770, 1.605, 280, 'vagues', 'intermediaire', null),
('berck', 'Berck-sur-Mer', 'France', 'Pas-de-Calais', 50.402, 1.560, 270, 'chop', 'debutant', 'Grande plage, idéale à marée basse.'),
('malo-les-bains', 'Malo-les-Bains', 'France', 'Nord', 51.050, 2.410, 340, 'chop', 'debutant', null),
('merville', 'Merville-Franceville', 'France', 'Calvados', 49.290, -0.200, 0, 'chop', 'debutant', null),
('saint-malo-sillon', 'Saint-Malo – Le Sillon', 'France', 'Ille-et-Vilaine', 48.655, -1.998, 330, 'chop', 'intermediaire', 'Digue derrière la plage.'),
-- France — Atlantique
('sainte-barbe', 'Plouharnel – Sainte-Barbe', 'France', 'Morbihan', 47.590, -3.150, 260, 'vagues', 'intermediaire', null),
('la-torche', 'La Torche', 'France', 'Finistère', 47.835, -4.350, 260, 'vagues', 'avance', 'Vagues puissantes.'),
('la-baule', 'La Baule', 'France', 'Loire-Atlantique', 47.270, -2.380, 200, 'chop', 'debutant', 'Restrictions l''été.'),
('sables-olonne', 'Les Sables-d''Olonne', 'France', 'Vendée', 46.490, -1.790, 220, 'chop', 'intermediaire', null),
('lacanau', 'Lacanau', 'France', 'Gironde', 45.000, -1.205, 270, 'vagues', 'avance', 'Shore break fréquent.'),
-- Espagne
('tarifa-los-lances', 'Tarifa – Los Lances', 'Espagne', 'Andalousie', 36.025, -5.625, 200, 'chop', 'intermediaire', 'Levante rafaleux et side-off.'),
('tarifa-valdevaqueros', 'Tarifa – Valdevaqueros', 'Espagne', 'Andalousie', 36.065, -5.690, 200, 'chop', 'intermediaire', null),
('sant-pere-pescador', 'Sant Pere Pescador', 'Espagne', 'Catalogne', 42.190, 3.110, 90, 'chop', 'debutant', null),
('riumar', 'Riumar – Delta de l''Èbre', 'Espagne', 'Catalogne', 40.725, 0.875, 110, 'flat', 'debutant', null),
('sotavento', 'Sotavento', 'Espagne', 'Fuerteventura', 28.140, -14.230, 120, 'flat', 'debutant', 'Lagune à marée haute.'),
('flag-beach', 'Flag Beach', 'Espagne', 'Fuerteventura', 28.735, -13.865, 90, 'chop', 'intermediaire', null),
('el-medano', 'El Médano', 'Espagne', 'Tenerife', 28.045, -16.535, 140, 'chop', 'intermediaire', null),
('famara', 'Famara', 'Espagne', 'Lanzarote', 29.115, -13.560, 330, 'vagues', 'avance', 'Courants forts.'),
('pozo-izquierdo', 'Pozo Izquierdo', 'Espagne', 'Gran Canaria', 27.820, -15.420, 100, 'vagues', 'avance', 'Vent très fort l''été.'),
-- Portugal
('guincho', 'Guincho', 'Portugal', 'Lisbonne', 38.730, -9.475, 280, 'vagues', 'avance', 'Nortada puissante, courants.'),
('fonte-da-telha', 'Fonte da Telha', 'Portugal', 'Lisbonne', 38.570, -9.195, 260, 'chop', 'intermediaire', null),
('viana-cabedelo', 'Viana do Castelo – Cabedelo', 'Portugal', 'Minho', 41.675, -8.835, 270, 'vagues', 'intermediaire', null),
-- Italie / Grèce
('lo-stagnone', 'Lo Stagnone', 'Italie', 'Sicile', 37.860, 12.465, 270, 'flat', 'debutant', 'Lagune peu profonde.'),
('prasonisi', 'Prasonisi', 'Grèce', 'Rhodes', 35.885, 27.765, 270, 'flat', 'intermediaire', 'Côté flat à l''ouest, vagues à l''est.'),
('mikri-vigla', 'Mikri Vigla', 'Grèce', 'Naxos', 37.030, 25.380, 280, 'chop', 'intermediaire', 'Meltemi l''été.'),
('pounda', 'Pounda', 'Grèce', 'Paros', 37.020, 25.100, 110, 'chop', 'intermediaire', null),
('marmari', 'Marmari', 'Grèce', 'Kos', 36.890, 27.200, 0, 'chop', 'intermediaire', null),
-- Benelux / Allemagne / Danemark
('zandvoort', 'Zandvoort', 'Pays-Bas', 'Hollande-Septentrionale', 52.370, 4.525, 280, 'chop', 'intermediaire', null),
('scheveningen', 'Scheveningen', 'Pays-Bas', 'Hollande-Méridionale', 52.110, 4.270, 300, 'chop', 'intermediaire', null),
('brouwersdam', 'Brouwersdam', 'Pays-Bas', 'Zélande', 51.765, 3.850, 290, 'chop', 'debutant', 'Côté lac plat selon le vent.'),
('workum', 'Workum', 'Pays-Bas', 'Frise', 52.980, 5.425, 250, 'flat', 'debutant', 'IJsselmeer, eau douce.'),
('knokke', 'Knokke', 'Belgique', 'Flandre', 51.355, 3.290, 320, 'chop', 'debutant', null),
('oostende', 'Ostende', 'Belgique', 'Flandre', 51.235, 2.920, 320, 'chop', 'intermediaire', null),
('st-peter-ording', 'Sankt Peter-Ording', 'Allemagne', 'Schleswig-Holstein', 54.320, 8.600, 270, 'chop', 'debutant', 'Immense plage.'),
('fehmarn-gruener-brink', 'Fehmarn – Grüner Brink', 'Allemagne', 'Schleswig-Holstein', 54.520, 11.185, 10, 'flat', 'debutant', null),
('klitmoller', 'Klitmøller', 'Danemark', 'Jutland', 57.040, 8.490, 310, 'vagues', 'avance', 'Cold Hawaii.'),
('hvide-sande', 'Hvide Sande – Fjord', 'Danemark', 'Jutland', 56.000, 8.135, 90, 'flat', 'debutant', 'Fjord de Ringkøbing.'),
-- Royaume-Uni
('camber-sands', 'Camber Sands', 'Royaume-Uni', 'Sussex', 50.930, 0.795, 170, 'chop', 'debutant', null),
('hayling', 'Hayling Island', 'Royaume-Uni', 'Hampshire', 50.785, -0.990, 180, 'chop', 'intermediaire', null),
('rhosneigr', 'Rhosneigr', 'Royaume-Uni', 'Pays de Galles', 53.225, -4.520, 230, 'vagues', 'intermediaire', null),
-- Afrique / Moyen-Orient
('dakhla-lagune', 'Dakhla – Lagune', 'Maroc', 'Dakhla', 23.835, -15.810, 100, 'flat', 'debutant', 'Vent régulier presque toute l''année.'),
('essaouira', 'Essaouira', 'Maroc', 'Essaouira', 31.500, -9.765, 250, 'chop', 'intermediaire', null),
('el-gouna', 'El Gouna', 'Égypte', 'Mer Rouge', 27.400, 33.680, 90, 'flat', 'debutant', null),
('soma-bay', 'Soma Bay', 'Égypte', 'Mer Rouge', 26.855, 33.990, 100, 'flat', 'debutant', null),
('paje', 'Paje', 'Tanzanie', 'Zanzibar', -6.265, 39.540, 90, 'flat', 'debutant', 'Lagon praticable selon la marée.'),
('le-morne', 'Le Morne', 'Maurice', 'Sud-Ouest', -20.455, 57.320, 220, 'flat', 'intermediaire', 'One Eye : vagues pour experts.'),
('bloubergstrand', 'Bloubergstrand', 'Afrique du Sud', 'Le Cap', -33.810, 18.465, 230, 'vagues', 'intermediaire', null),
-- Amériques / Asie / Pacifique
('cumbuco', 'Cumbuco', 'Brésil', 'Ceará', -3.630, -38.730, 20, 'chop', 'debutant', 'Lagunes de Cauipe à proximité.'),
('jericoacoara', 'Jericoacoara', 'Brésil', 'Ceará', -2.795, -40.515, 350, 'chop', 'intermediaire', null),
('cabarete', 'Cabarete', 'République dominicaine', 'Puerto Plata', 19.755, -70.410, 10, 'vagues', 'intermediaire', null),
('kanaha', 'Kanaha', 'États-Unis', 'Maui', 20.900, -156.440, 0, 'vagues', 'intermediaire', 'Zones réglementées.'),
('mui-ne', 'Mui Ne', 'Viêt Nam', 'Binh Thuan', 10.950, 108.290, 150, 'vagues', 'intermediaire', null)
on conflict (id) do nothing;

-- Spots de vent qui marchent aussi en surf quand il y a de la houle
update public.spots set sports = '{kitesurf,wingfoil,foil,surf}'
where id in ('lacanau', 'la-torche', 'sainte-barbe', 'famara', 'klitmoller', 'guincho', 'wissant');

-- Spots de surf (houle). Coordonnées et orientations approximatives, à vérifier dans Admin → Spots.
insert into public.spots (id, name, country, region, lat, lng, sea_bearing, water, min_level, sports, notes) values
('hossegor-graviere', 'Hossegor – La Gravière', 'France', 'Landes', 43.672, -1.443, 270, 'vagues', 'avance', '{surf}', 'Beach break puissant et creux.'),
('seignosse-bourdaines', 'Seignosse – Les Bourdaines', 'France', 'Landes', 43.700, -1.440, 270, 'vagues', 'intermediaire', '{surf}', null),
('capbreton', 'Capbreton – La Piste', 'France', 'Landes', 43.640, -1.451, 270, 'vagues', 'intermediaire', '{surf}', null),
('mimizan', 'Mimizan', 'France', 'Landes', 44.213, -1.300, 270, 'vagues', 'debutant', '{surf}', 'Plage surveillée l''été.'),
('biscarrosse', 'Biscarrosse Plage', 'France', 'Landes', 44.446, -1.255, 270, 'vagues', 'debutant', '{surf}', null),
('anglet-cavaliers', 'Anglet – Les Cavaliers', 'France', 'Pays basque', 43.520, -1.530, 290, 'vagues', 'intermediaire', '{surf}', null),
('biarritz-cote-basques', 'Biarritz – Côte des Basques', 'France', 'Pays basque', 43.478, -1.567, 290, 'vagues', 'debutant', '{surf}', 'Idéale pour apprendre à marée basse.'),
('guethary-parlementia', 'Guéthary – Parlementia', 'France', 'Pays basque', 43.430, -1.610, 310, 'vagues', 'avance', '{surf}', 'Vague de récif, grosse houle.'),
('siouville', 'Siouville-Hague', 'France', 'Manche', 49.560, -1.850, 270, 'vagues', 'intermediaire', '{surf}', null),
('zarautz', 'Zarautz', 'Espagne', 'Pays basque', 43.285, -2.170, 0, 'vagues', 'debutant', '{surf}', null),
('mundaka', 'Mundaka', 'Espagne', 'Pays basque', 43.408, -2.700, 330, 'vagues', 'avance', '{surf}', 'Gauche de rivière mythique, réservée aux confirmés.'),
('peniche-supertubos', 'Peniche – Supertubos', 'Portugal', 'Centre', 39.343, -9.360, 220, 'vagues', 'avance', '{surf}', 'Beach break très creux.'),
('baleal', 'Baleal', 'Portugal', 'Centre', 39.374, -9.338, 20, 'vagues', 'debutant', '{surf}', null),
('ericeira-ribeira', 'Ericeira – Ribeira d''Ilhas', 'Portugal', 'Lisbonne', 38.988, -9.420, 280, 'vagues', 'intermediaire', '{surf}', null),
('taghazout-anchor', 'Taghazout – Anchor Point', 'Maroc', 'Agadir', 30.545, -9.710, 270, 'vagues', 'avance', '{surf}', 'Droite de pointe, en hiver.'),
('imsouane', 'Imsouane – La Baie', 'Maroc', 'Agadir', 30.840, -9.820, 200, 'vagues', 'debutant', '{surf}', 'Longue droite douce.'),
('canggu', 'Canggu – Batu Bolong', 'Indonésie', 'Bali', -8.659, 115.130, 220, 'vagues', 'intermediaire', '{surf}', null),
('kuta-bali', 'Kuta Beach', 'Indonésie', 'Bali', -8.718, 115.168, 250, 'vagues', 'debutant', '{surf}', null),
('uluwatu', 'Uluwatu', 'Indonésie', 'Bali', -8.815, 115.087, 240, 'vagues', 'avance', '{surf}', 'Récif, réservé aux confirmés.')
on conflict (id) do nothing;

-- Téléskis nautiques (wakeboard) : à ajouter depuis Admin → Spots en cochant « Wakeboard ».
