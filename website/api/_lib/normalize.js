const LD_KM = 384400; // 1 lunar distance, in kilometers

/**
 * Flattens NASA's date-keyed NeoWs `feed` response into a single array of
 * normalized asteroid objects, sorted by miss distance (closest first).
 *
 * Only the first close_approach_data entry is used -- the feed endpoint
 * returns one approach per asteroid per request window, which is exactly
 * the "this week's pass" we care about.
 */
export function normalizeFeed(neoData) {
  const asteroids = [];
  const byDate = neoData.near_earth_objects || {};

  for (const dateKey of Object.keys(byDate)) {
    for (const obj of byDate[dateKey]) {
      const approach = obj.close_approach_data && obj.close_approach_data[0];
      if (!approach) continue;

      const missKm = parseFloat(approach.miss_distance.kilometers);
      const diameter = obj.estimated_diameter.meters;

      asteroids.push({
        id: obj.id,
        name: obj.name.replace(/[()]/g, ''),
        jplUrl: obj.nasa_jpl_url,
        absoluteMagnitude: obj.absolute_magnitude_h,
        diameterMeters: {
          min: diameter.estimated_diameter_min,
          max: diameter.estimated_diameter_max,
        },
        isHazardous: obj.is_potentially_hazardous_asteroid,
        approachDate: new Date(approach.epoch_date_close_approach).toISOString(),
        approachEpoch: approach.epoch_date_close_approach,
        velocityKmS: parseFloat(approach.relative_velocity.kilometers_per_second),
        missDistanceKm: missKm,
        missDistanceLD: missKm / LD_KM,
        orbitingBody: approach.orbiting_body,
      });
    }
  }

  asteroids.sort((a, b) => a.missDistanceLD - b.missDistanceLD);
  return asteroids;
}
