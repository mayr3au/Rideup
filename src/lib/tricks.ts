/** Point d'entrée historique : tout est désormais défini par sport dans sports.ts. */
export {
  TRICKS,
  trickById,
  tricksFor,
  errorLabel,
  errorsFor,
  LEVEL_LABELS,
  LEVEL_ORDER,
  type Level,
  type Trick,
} from "./sports";

import { LEVEL_LABELS, LEVEL_ORDER } from "./sports";

export const LEVELS = LEVEL_ORDER.map((id) => ({ id, label: LEVEL_LABELS[id] }));
