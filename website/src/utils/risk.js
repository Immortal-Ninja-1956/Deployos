/**
 * Classifies an asteroid's risk tier from its NASA-provided hazard flag,
 * miss distance (in lunar distances) and size.
 *
 * This is intentionally conservative and is a *monitoring* classification,
 * not a prediction of impact. NASA's own "Potentially Hazardous Asteroid"
 * flag already accounts for size + distance thresholds at the orbital level;
 * the "watch" / "notable" tiers below are NearMiss-specific framing on top
 * of that, meant to help a non-expert understand "is this one worth a
 * second look" at a glance.
 */
export function computeRisk({ isHazardous, missDistanceLD, diameterMax }) {
  if (isHazardous) return 'hazardous';
  if (missDistanceLD < 10 && diameterMax > 50) return 'watch';
  if (missDistanceLD < 20) return 'notable';
  return 'routine';
}

export const RISK_META = {
  hazardous: {
    label: 'Hazardous',
    riskKey: 'hazardous',
  },
  watch: {
    label: 'Watch',
    riskKey: 'watch',
  },
  notable: {
    label: 'Notable',
    riskKey: 'notable',
  },
  routine: {
    label: 'Routine',
    riskKey: 'routine',
  },
};
