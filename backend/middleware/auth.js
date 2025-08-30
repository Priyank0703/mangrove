const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Middleware to check if user has required role(s)
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (Array.isArray(roles)) {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: `Access denied. Required roles: ${roles.join(', ')}` 
        });
      }
    } else {
      if (req.user.role !== roles) {
        return res.status(403).json({ 
          message: `Access denied. Required role: ${roles}` 
        });
      }
    }

    next();
  };
};

// Middleware to check if user can edit their own resource or has admin privileges
const canEditResource = (resourceUserIdField = 'reporter') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Admin roles can edit any resource
    if (['ngo', 'government'].includes(req.user.role)) {
      return next();
    }

    // Users can only edit their own resources
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    if (resourceUserId && resourceUserId.toString() === req.user._id.toString()) {
      return next();
    }

    res.status(403).json({ message: 'Access denied. You can only edit your own resources.' });
  };
};

// Middleware to check if user can view resource (public or own)
const canViewResource = (resourceUserIdField = 'reporter') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Admin roles can view any resource
    if (['ngo', 'government', 'researcher'].includes(req.user.role)) {
      return next();
    }

    // Users can view their own resources
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    if (resourceUserId && resourceUserId.toString() === req.user._id.toString()) {
      return next();
    }

    // Check if resource is public
    if (req.resource && req.resource.isPublic) {
      return next();
    }

    res.status(403).json({ message: 'Access denied. Resource is private.' });
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  canEditResource,
  canViewResource
};
