// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log('Auth middleware - Headers:', req.headers.authorization ? 'Present' : 'Missing');
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.log('❌ Auth middleware - No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('✓ Auth middleware - User authenticated:', decoded.email || decoded.name || decoded._id);
    next();
  } catch (err) {
    console.log('❌ Auth middleware - Invalid token:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};
