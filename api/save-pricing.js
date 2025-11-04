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

    // Save to Vercel Edge Config via REST API
    // Edge Config updates require Vercel API token
    if (process.env.EDGE_CONFIG && process.env.VERCEL_ACCESS_TOKEN) {
      try {
        // Extract Edge Config ID from connection string
        // Format: https://edge-config.vercel.com/ecfg_xxx or ecfg_xxx@...
        let configId = process.env.EDGE_CONFIG;
        if (configId.includes('ecfg_')) {
          configId = configId.split('ecfg_')[1].split('@')[0].split('/')[0];
        }

        const updateUrl = `https://api.vercel.com/v1/edge-config/${configId}/items`;
        
        const response = await fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            items: [{
              operation: 'upsert',
              key: 'pricing',
              value: pricing
            }]
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Edge Config update failed: ${errorText}`);
        }
        
        return res.status(200).json({ 
          success: true,
          message: 'Prijzen opgeslagen in Edge Config' 
        });
      } catch (edgeError) {
        console.error('Edge Config error:', edgeError);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to save to Edge Config: ' + edgeError.message 
        });
      }
    } else {
      // Fallback: return success but note that it needs Edge Config setup
      console.log('Pricing update received (Edge Config not configured):', Object.keys(pricing));
      return res.status(200).json({ 
        success: true,
        message: 'Prijzen ontvangen. Configureer Edge Config en VERCEL_ACCESS_TOKEN voor persistente opslag. Zie README voor instructies.' 
      });
    }
  } catch (error) {
    console.error('Save error:', error);
    return res.status(500).json({ error: 'Failed to save pricing' });
  }
}

