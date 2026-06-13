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
    color: '#FF5C5C',
    glow: 'rgba(255, 92, 92, 0.45)',
  },
  watch: {
    label: 'Watch',
    color: '#FF9F40',
    glow: 'rgba(255, 159, 64, 0.4)',
  },
  notable: {
    label: 'Notable',
    color: '#FFD23F',
    glow: 'rgba(255, 210, 63, 0.35)',
  },
  routine: {
    label: 'Routine',
    color: '#4ADE80',
    glow: 'rgba(74, 222, 128, 0.3)',
  },
};
