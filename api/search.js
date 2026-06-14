import { sizeLabel } from '../src/utils/sizeLabel.js';

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const query = req.query.q;
  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    // 1. Hit SBDB API to find matches
    const sbdbUrl = `https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=${encodeURIComponent(query)}&phys-par=1`;
    const sbdbRes = await fetch(sbdbUrl);
    
    // HTTP 300 (Multiple Choices) is returned when a query matches multiple objects.
    if (!sbdbRes.ok && sbdbRes.status !== 300) {
      return res.status(sbdbRes.status).json({ error: `JPL SBDB API error: ${sbdbRes.status}` });
    }

    const sbdbData = await sbdbRes.json();

    // Case A: No matches found
    if (sbdbData.message && sbdbData.message.includes('not found')) {
      return res.status(200).json({ type: 'empty', results: [] });
    }

    // Case B: Multiple matches (ambiguous)
    if (sbdbData.list) {
      return res.status(200).json({
        type: 'list',
        results: sbdbData.list.map(item => ({
          name: item.name,
          des: item.pdes
        }))
      });
    }

    // Case C: Single exact match
    if (sbdbData.object) {
      const obj = sbdbData.object;
      const des = obj.des;
      const spkid = obj.spkid;
      const isNEO = Boolean(obj.neo);
      const isPHA = Boolean(obj.pha);

      // Parse physical parameters
      const H = sbdbData.phys_par?.find(p => p.name === 'H')?.value;
      const diameterKm = sbdbData.phys_par?.find(p => p.name === 'diameter')?.value;
      const diameterM = diameterKm ? parseFloat(diameterKm) * 1000 : null;

      // Determine size estimation metadata
      let diameterMin = diameterM || 0;
      let diameterMax = diameterM || 0;
      if (!diameterM && H) {
        // Simple astronomical conversion from H (magnitude) to approximate size in meters
        const dEst = Math.pow(10, (6.259 - parseFloat(H)) / 5) * 1000;
        diameterMin = Math.round(dEst * 0.7);
        diameterMax = Math.round(dEst * 1.3);
      }

      // 2. Fetch Close-Approach Data (CAD) for this specific designation
      const cadUrl = `https://ssd-api.jpl.nasa.gov/cad.api?des=${encodeURIComponent(des)}&date-min=1950-01-01&date-max=2150-01-01&dist-max=0.5`;
      const cadRes = await fetch(cadUrl);
      let approach = null;

      if (cadRes.ok) {
        const cadData = await cadRes.json();
        if (cadData.data && cadData.data.length > 0) {
          const nowMs = Date.now();
          let bestDiff = Infinity;
          let bestApproach = null;

          cadData.data.forEach(row => {
            const jd = parseFloat(row[2]);
            const epoch = (jd - 2440587.5) * 86400 * 1000;
            const diff = Math.abs(epoch - nowMs);
            if (diff < bestDiff) {
              bestDiff = diff;
              bestApproach = {
                cd: row[3],
                jd: jd,
                dist: parseFloat(row[4]),
                v_rel: parseFloat(row[7])
              };
            }
          });
          approach = bestApproach;
        }
      }

      const AU_KM = 149597870.7;
      const AU_LD = 389.17237;

      const missDistanceKm = approach ? approach.dist * AU_KM : parseFloat(sbdbData.orbit?.moid || 0.05) * AU_KM;
      const missDistanceLD = approach ? approach.dist * AU_LD : parseFloat(sbdbData.orbit?.moid || 0.05) * AU_LD;
      const velocityKmS = approach ? approach.v_rel : 15.0;
      const approachEpoch = approach ? (approach.jd - 2440587.5) * 86400 * 1000 : Date.now();

      // Determine custom risk level
      let riskLevel = 'routine';
      if (isPHA) riskLevel = 'hazardous';
      else if (isNEO && missDistanceLD < 8.2) riskLevel = 'watch';
      else if (isNEO && missDistanceLD < 20) riskLevel = 'notable';

      // Resolve size reference classification using our unified utility
      const sizeRefObj = sizeLabel(diameterMax);

      // Map to normalized schema
      const asteroid = {
        id: spkid,
        name: obj.fullname || obj.shortname,
        isHazardous: isPHA,
        diameterMeters: {
          min: Math.round(diameterMin),
          max: Math.round(diameterMax)
        },
        missDistanceLD: missDistanceLD,
        missDistanceKm: missDistanceKm,
        velocityKmS: velocityKmS,
        approachEpoch: approachEpoch,
        absoluteMagnitude: H ? parseFloat(H) : 20.0,
        riskLevel: riskLevel,
        sizeRef: sizeRefObj,
        jplUrl: `https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${encodeURIComponent(des)}`
      };

      return res.status(200).json({
        type: 'match',
        asteroid
      });
    }

    return res.status(500).json({ error: 'Unexpected JPL SBDB response format' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to search NASA JPL database', detail: error.message });
  }
}
