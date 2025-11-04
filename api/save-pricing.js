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

    // In Vercel, we can't write to filesystem directly
    // So we'll need to use a database or external storage
    // For now, return success and log (in production, use Vercel KV, MongoDB, etc.)
    
    console.log('Pricing update received:', Object.keys(pricing));
    
    // TODO: Save to Vercel KV or database for persistence
    // Example with Vercel KV:
    // const kv = new Redis(process.env.KV_REST_API_URL, process.env.KV_REST_API_TOKEN);
    // await kv.set('pricing', JSON.stringify(pricing));

    return res.status(200).json({ 
      success: true,
      message: 'Pricing saved (Note: Requires Vercel KV or database for persistence)' 
    });
  } catch (error) {
    console.error('Save error:', error);
    return res.status(500).json({ error: 'Failed to save pricing' });
  }
}

