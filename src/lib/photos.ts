/** Photos Unsplash (licence Unsplash : usage commercial libre, sans attribution obligatoire). */
const u = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const PHOTOS = {
  heroJump: u("1667323567346-ea4048f36c58"), // rider en l'air, gros plan
  splash: u("1578060124065-41f863eb9ebe"), // rider qui envoie une gerbe d'eau
  waves: u("1632990848833-2e7007adb204"), // rider dans les vagues
  blue: u("1601900957092-ae3e67b47b03"), // rider sur mer bleue
  sunset: u("1627068477565-3a66d5f76d5e"), // kites au coucher de soleil
  wing: u("1777897161531-5fdeec1e9a4c"), // wing foil
};
