/**
 * Generates relative vertex coordinates and irregularities for a procedurally
 * shaped asteroid polygon based on its unique ID seed.
 */
export function generateAsteroidShape(id, numVertices) {
  const seed = parseInt(id.replace(/[^0-9]/g, '').slice(-3)) || 100;
  const numPoints = numVertices !== undefined && numVertices !== null ? numVertices : (7 + (seed % 5)); // 7 to 11 vertices
  const points = [];

  for (let j = 0; j <= numPoints; j++) {
    const angleOffset = (j / numPoints) * Math.PI * 2;
    // Irregular rocky shape factor
    const factor = 0.75 + Math.abs(Math.sin(j * 1.7 + seed)) * 0.35;
    points.push({ angleOffset, factor });
  }

  return points;
}
