const jwt = require('jsonwebtoken');

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

const verifySupabaseToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('🔐 Incoming Auth Header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or malformed Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET, { algorithms: ['HS256'] });

    console.log('✅ Token verified! Decoded user:', decoded);

    req.user = {
      email: decoded.email,
      id: decoded.sub,
    };

    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = verifySupabaseToken;
