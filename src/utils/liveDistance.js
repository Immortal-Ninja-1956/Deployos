/**
 * Approximates an asteroid's current distance from Earth, given its
 * miss distance and relative velocity at the moment of closest approach.
 *
 * This is a linear approximation around the closest-approach point
 * (distance = missDistance + |secondsFromApproach| * velocity) -- it is
 * NOT orbitally accurate, but it produces a smooth, believable,
 * second-by-second "closing" or "departing" counter, which is what the
 * live demo needs.
 */
export function currentDistanceKm(asteroid, nowMs) {
  const secondsFromApproach = (asteroid.approachEpoch - nowMs) / 1000;
  return asteroid.missDistanceKm + Math.abs(secondsFromApproach) * asteroid.velocityKmS;
}

/**
 * Human-readable "in 5 hours" / "3 days ago" style label for an
 * asteroid's closest-approach time relative to `now`.
 */
export function timeLabel(epochMs, nowMs) {
  const diffMs = epochMs - nowMs;
  const absHours = Math.abs(diffMs) / 3.6e6;
  const absDays = absHours / 24;

  let value;
  let unit;
  if (absDays >= 1) {
    value = absDays;
    unit = 'day';
  } else {
    value = absHours;
    unit = 'hour';
  }

  const rounded = value < 10 ? Math.round(value * 10) / 10 : Math.round(value);
  const suffix = `${unit}${rounded === 1 ? '' : 's'}`;

  return diffMs >= 0 ? `in ${rounded} ${suffix}` : `${rounded} ${suffix} ago`;
}
