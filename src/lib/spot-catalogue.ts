/**
 * Catalogue de spots fourni avec le site. Admin → Spots → « Importer le catalogue » ajoute ceux qui manquent
 * (sans toucher aux spots existants). Même contenu que supabase/migrations/0003_more_spots.sql.
 * Coordonnées et orientations approximatives, à affiner depuis l'admin.
 */
export type CatalogueSpot = {
  id: string;
  name: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
  sea_bearing: number;
  water: "flat" | "chop" | "vagues";
  min_level: "debutant" | "intermediaire" | "avance";
  notes: string | null;
};

export const SPOT_CATALOGUE: CatalogueSpot[] = [
  { id: "cagnes-hippodrome", name: "Cagnes-sur-Mer – Hippodrome", country: "France", region: "Alpes-Maritimes", lat: 43.652, lng: 7.163, sea_bearing: 150, water: "chop", min_level: "intermediaire", notes: "Plage de galets. Renseigne-toi sur les périodes autorisées en été." },
  { id: "antibes-salis", name: "Antibes – La Salis", country: "France", region: "Alpes-Maritimes", lat: 43.569, lng: 7.128, sea_bearing: 90, water: "chop", min_level: "intermediaire", notes: "Fonctionne surtout par vent d'est. Baigneurs nombreux en été." },
  { id: "mandelieu-napoule", name: "Mandelieu – La Napoule", country: "France", region: "Alpes-Maritimes", lat: 43.52, lng: 6.945, sea_bearing: 160, water: "chop", min_level: "intermediaire", notes: null },
  { id: "frejus-base-nature", name: "Fréjus – Base Nature", country: "France", region: "Var", lat: 43.418, lng: 6.752, sea_bearing: 160, water: "chop", min_level: "debutant", notes: "Grande plage, écoles sur place." },
  { id: "saint-aygulf", name: "Saint-Aygulf", country: "France", region: "Var", lat: 43.397, lng: 6.725, sea_bearing: 150, water: "chop", min_level: "intermediaire", notes: null },
  { id: "hyeres-capte", name: "Hyères – La Capte", country: "France", region: "Var", lat: 43.062, lng: 6.153, sea_bearing: 100, water: "chop", min_level: "debutant", notes: "Côté est de la presqu'île de Giens, par vent d'est." },
  { id: "hyeres-ayguade", name: "Hyères – L'Ayguade", country: "France", region: "Var", lat: 43.105, lng: 6.175, sea_bearing: 120, water: "chop", min_level: "debutant", notes: null },
  { id: "six-fours-brusc", name: "Six-Fours – Le Brusc", country: "France", region: "Var", lat: 43.073, lng: 5.803, sea_bearing: 200, water: "chop", min_level: "intermediaire", notes: null },
  { id: "marseille-pointe-rouge", name: "Marseille – Pointe Rouge", country: "France", region: "Bouches-du-Rhône", lat: 43.243, lng: 5.369, sea_bearing: 250, water: "chop", min_level: "intermediaire", notes: "Par mistral, réservé aux riders confirmés." },
  { id: "carro", name: "Martigues – Carro", country: "France", region: "Bouches-du-Rhône", lat: 43.33, lng: 5.04, sea_bearing: 230, water: "vagues", min_level: "avance", notes: "Spot de vagues, rochers." },
  { id: "sete-lido", name: "Sète – Lido", country: "France", region: "Hérault", lat: 43.37, lng: 3.64, sea_bearing: 140, water: "chop", min_level: "debutant", notes: "Longue plage entre mer et étang." },
  { id: "palavas", name: "Palavas-les-Flots", country: "France", region: "Hérault", lat: 43.525, lng: 3.935, sea_bearing: 160, water: "chop", min_level: "debutant", notes: null },
  { id: "grande-motte", name: "La Grande-Motte", country: "France", region: "Hérault", lat: 43.555, lng: 4.075, sea_bearing: 170, water: "chop", min_level: "debutant", notes: null },
  { id: "espiguette", name: "Le Grau-du-Roi – L'Espiguette", country: "France", region: "Gard", lat: 43.49, lng: 4.14, sea_bearing: 190, water: "chop", min_level: "debutant", notes: "Grande plage sauvage. Tramontane offshore : prudence." },
  { id: "barcares", name: "Le Barcarès", country: "France", region: "Pyrénées-Orientales", lat: 42.79, lng: 3.04, sea_bearing: 90, water: "chop", min_level: "intermediaire", notes: "Tramontane offshore : réservé aux riders confirmés." },
  { id: "canet", name: "Canet-en-Roussillon", country: "France", region: "Pyrénées-Orientales", lat: 42.7, lng: 3.04, sea_bearing: 90, water: "chop", min_level: "intermediaire", notes: null },
  { id: "piantarella", name: "Bonifacio – Piantarella", country: "France", region: "Corse-du-Sud", lat: 41.38, lng: 9.22, sea_bearing: 110, water: "flat", min_level: "debutant", notes: "Lagon peu profond, eau turquoise." },
  { id: "porto-pollo", name: "Porto-Pollo", country: "France", region: "Corse-du-Sud", lat: 41.71, lng: 8.8, sea_bearing: 250, water: "chop", min_level: "intermediaire", notes: null },
];
