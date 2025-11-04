// Admin authentication endpoint for Vercel Serverless Functions
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Handle both parsed and string body formats (Vercel can do either)
    let body;
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      body = req.body || {};
    }
    
    const { password } = body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Debug logging (remove in production)
    console.log('Login attempt - password provided:', !!password);
    console.log('Admin password set:', !!adminPassword);

    if (!password) {
      return res.status(400).json({ 
        success: false,
        error: 'Password is required' 
      });
    }

    if (password === adminPassword) {
      // Generate a simple token (in production, use JWT)
      const token = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64');
      
      return res.status(200).json({ 
        success: true, 
        token 
      });
    } else {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid password' 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(400).json({ 
      success: false,
      error: 'Invalid request: ' + error.message 
    });
  }
}

