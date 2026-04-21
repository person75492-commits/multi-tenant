const AppError = require('../utils/AppError');

/**
 * Ensures req.organization_id is present (set by protect middleware).
 * Blocks any request where the JWT org doesn't match a resource's org.
 *
 * Must be used AFTER protect middleware.
 */
const tenantGuard = (req, res, next) => {
  if (!req.organization_id) {
    return next(new AppError('Access Denied: organization context missing.', 403));
  }
  next();
};

/**
 * Factory — call this inside a route handler or service to verify
 * a fetched resource belongs to the requesting user's organization.
 *
 * Usage:
 *   assertOrgOwnership(req, resource.organization_id)
 *
 * Throws 403 if the org IDs don't match.
 */
const assertOrgOwnership = (req, resourceOrgId) => {
  if (!resourceOrgId) {
    throw new AppError('Access Denied.', 403);
  }
  if (resourceOrgId.toString() !== req.organization_id.toString()) {
    throw new AppError('Access Denied.', 403);
  }
};

module.exports = { tenantGuard, assertOrgOwnership };
