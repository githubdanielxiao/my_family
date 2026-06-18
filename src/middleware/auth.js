const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'family-tree-secret-key-2026';

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: '未提供认证令牌'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: '无效或过期的令牌',
      details: err.message
    });
  }
}

module.exports = authMiddleware;
