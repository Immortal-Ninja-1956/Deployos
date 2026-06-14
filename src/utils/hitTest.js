/**
 * Performs hit testing against a list of asteroid dot positions.
 * Returns the index of the hit asteroid, or -1 if none was hit.
 * 
 * @param {number} x - Target x coordinate.
 * @param {number} y - Target y coordinate.
 * @param {Array} dotPositions - Array of dot positions ({ x, y, hitRadius, asteroid }).
 * @param {number} [hitRadius] - Optional override for the hit radius.
 * @returns {number} The index of the hit asteroid, or -1 if none.
 */
export function hitTestAsteroids(x, y, dotPositions, hitRadius) {
  return dotPositions.findIndex((dot) => {
    const radius = hitRadius !== undefined && hitRadius !== null ? hitRadius : dot.hitRadius;
    return Math.hypot(dot.x - x, dot.y - y) <= radius;
  });
}
