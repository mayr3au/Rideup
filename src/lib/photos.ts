import type { SportId } from "./sports";

/** Photos Unsplash (licence Unsplash : usage commercial libre, sans attribution obligatoire). */
const u = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const PHOTOS = {
  heroJump: u("1667323567346-ea4048f36c58"), // kitesurfeur en l'air, gros plan
  splash: u("1578060124065-41f863eb9ebe"), // kitesurfeur qui envoie une gerbe d'eau
  waves: u("1632990848833-2e7007adb204"), // kitesurfeur dans les vagues
  blue: u("1601900957092-ae3e67b47b03"), // kitesurfeur sur mer bleue
  sunset: u("1627068477565-3a66d5f76d5e"), // kites au coucher de soleil
  wing: u("1777897161531-5fdeec1e9a4c"), // wingfoil
  surfBarrel: u("1502680390469-be75c86b636f"), // surfeur dans le tube
  surfBoard: u("1502933691298-84fc14542831"), // pieds sur une planche de surf
  wakeCable: u("1752170053218-5f05ccfbee4e"), // wakeboard au téléski, kicker
  wakeAir: u("1666032234128-abc3e45bd1dc"), // wakeboarder en l'air
};

/** Photo représentative de chaque sport. Le foil n'a pas encore de photo dédiée. */
export const SPORT_PHOTOS: Record<SportId, string> = {
  kitesurf: PHOTOS.splash,
  wingfoil: PHOTOS.wing,
  foil: PHOTOS.blue,
  surf: PHOTOS.surfBarrel,
  wakeboard: PHOTOS.wakeCable,
};
