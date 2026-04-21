const AppError = require('../utils/AppError');

/**
 * Grants full access to admins, blocks non-admin roles entirely.
 * Use on routes that are admin-only (e.g. bulk operations).
 */
const adminOnly = (req, res, next) => {
  if (req.role !== 'admin') {
    return next(new AppError('Access Denied: admin role required.', 403));
  }
  next();
};

/**
 * Allows both admin and member to proceed.
 * Ownership enforcement for mutating operations happens in the service layer.
 */
const memberOrAdmin = (req, res, next) => {
  if (!['admin', 'member'].includes(req.role)) {
    return next(new AppError('Access Denied: insufficient role.', 403));
  }
  next();
};

module.exports = { adminOnly, memberOrAdmin };
