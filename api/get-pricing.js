// Get pricing configuration endpoint (reads from Vercel KV or returns null to use static file)
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Try to load from Vercel Edge Config if available (better for config data)
    if (process.env.EDGE_CONFIG) {
      try {
        const { get } = await import('@vercel/edge-config');
        const pricing = await get('pricing');
        
        if (pricing) {
          return res.status(200).json({ 
            pricing,
            source: 'edge-config'
          });
        }
      } catch (edgeError) {
        console.log('Edge Config not available:', edgeError);
      }
    }

    // If no Edge Config or no data in Edge Config, return null to indicate static file should be used
    return res.status(200).json({ 
      pricing: null,
      source: 'static'
    });
  } catch (error) {
    console.error('Get pricing error:', error);
    return res.status(200).json({ 
      pricing: null,
      source: 'static'
    });
  }
}

