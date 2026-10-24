const jwt = require('jsonwebtoken');
const { getAdminUsers } = require('../utils/dataStore');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const admins = getAdminUsers();
  const adminRecord = admins.find(
    (a) => a.id === req.user.adminId || a.userId === req.user.userId
  );

  if (!adminRecord && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  req.admin = adminRecord || { role: 'superadmin' };
  next();
};

const signToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

module.exports = { authenticateToken, requireAdmin, signToken, JWT_SECRET };
