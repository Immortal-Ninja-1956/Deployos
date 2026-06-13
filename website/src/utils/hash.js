/**
 * Deterministic hash from an asteroid's NASA id to an angle in radians.
 * Used so each asteroid gets a stable, evenly-distributed position on
 * the radial approach map without needing real orbital elements.
 */
export function hashToAngle(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0; // keep as 32-bit int
  }
  const degrees = Math.abs(hash) % 360;
  return (degrees * Math.PI) / 180;
}
