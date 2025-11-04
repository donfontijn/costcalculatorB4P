// Save pricing configuration endpoint for Vercel Serverless Functions
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple token check (in production, use proper JWT validation)
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { pricing } = body;
    
    // Validate pricing data
    if (!pricing || typeof pricing !== 'object') {
      return res.status(400).json({ error: 'Invalid pricing data' });
    }

    // Save to Vercel KV if available, otherwise use localStorage fallback (client-side)
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      // Vercel KV storage
      const kv = await import('@vercel/kv');
      await kv.default.set('pricing', pricing);
      return res.status(200).json({ 
        success: true,
        message: 'Prijzen opgeslagen in Vercel KV' 
      });
    } else {
      // Fallback: return success but note that it needs KV setup
      console.log('Pricing update received (KV not configured):', Object.keys(pricing));
      return res.status(200).json({ 
        success: true,
        message: 'Prijzen ontvangen. Configureer Vercel KV voor persistente opslag. Zie README voor instructies.' 
      });
    }
  } catch (error) {
    console.error('Save error:', error);
    return res.status(500).json({ error: 'Failed to save pricing' });
  }
}

