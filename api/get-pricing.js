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
    // Try to load from Vercel KV if available
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const kv = await import('@vercel/kv');
        const pricing = await kv.default.get('pricing');
        
        if (pricing) {
          return res.status(200).json({ 
            pricing,
            source: 'kv'
          });
        }
      } catch (kvError) {
        console.log('KV not available:', kvError);
      }
    }

    // If no KV or no data in KV, return null to indicate static file should be used
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

