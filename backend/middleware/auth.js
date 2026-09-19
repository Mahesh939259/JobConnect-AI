const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

const authenticateUser = async (req, res, next) => {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token missing.',
    });
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token. User does not exist.',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid or expired token.',
      error: err.message,
    });
  }
};

// Optional auth - if token exists and is valid, set req.user; otherwise proceed without error
const optionalAuth = async (req, res, next) => {
  let token = null;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next();

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');
    if (user && !user.isSuspended) {
      req.user = user;
    }
  } catch {
    // Ignore invalid token on public routes
  }
  next();
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}]. Your current role is '${req.user.role}'.`,
      });
    }

    next();
  };
};

module.exports = { authenticateUser, optionalAuth, requireRole };
